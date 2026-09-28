#!/bin/bash

# ==============================================================================
# KOMPLEXNÍ KONEČNÝ SKRIPT PRO MX LINUX / UMAX SERVER (VŠECHNA ŘEŠENÍ Z CHATU)
# ==============================================================================

# Kontrola root práv
if [ "$EUID" -ne 0 ]; then
  echo "Chyba: Tento skript musíte spustit jako root (sudo bash mx-server-setup.sh)"
  exit 1
fi

echo "=== 1. Odstranění rsyslogu (ochrana eMMC paměti před zbytečným zápisem) ==="
systemctl stop rsyslog 2>/dev/null
systemctl disable rsyslog 2>/dev/null
apt-get purge -y rsyslog

echo "=== 2. Nastavení systemd-journald do RAM (omezení zápisů na eMMC) ==="
mkdir -p /etc/systemd/journald.conf.d
cat <<EOF > /etc/systemd/journald.conf.d/ram-logging.conf
[Journal]
Storage=volatile
RuntimeMaxUse=64M
EOF
systemctl restart systemd-journald

echo "=== 3. Nastavení swappiness na 10 (agresivnější držení dat v RAM) ==="
sysctl vm.swappiness=10
sed -i '/vm.swappiness/d' /etc/sysctl.conf
echo "vm.swappiness=10" >> /etc/sysctl.conf

echo "=== 4. Konfigurace zRAM na 2GB (komprimovaná swap paměť v RAM) ==="
systemctl unmask zramswap.service 2>/dev/null
systemctl enable zramswap.service 2>/dev/null

cat <<EOF > /etc/default/zramswap
ALGO=lz4
SIZE=2048
PRIORITY=100
EOF

systemctl restart zramswap 2>/dev/null || /etc/init.d/zramswap restart 2>/dev/null

echo "=== 5. Úprava /etc/fstab (noatime, commit=60, /tmp do RAM) ==="
sed -i '/ext4/s/defaults/defaults,noatime,commit=60/' /etc/fstab
sed -i '/ext4/s/errors=remount-ro/noatime,commit=60,errors=remount-ro/' /etc/fstab
sed -i '\# /tmp #d' /etc/fstab
echo "tmpfs   /tmp   tmpfs   defaults,noatime,mode=1777,size=512M   0   0" >> /etc/fstab

mount -o remount / 2>/dev/null
mount -o remount,size=512M /tmp 2>/dev/null

echo "=== 6. Instalace základních nástrojů, SSH, Aria2 a správců disků ==="
apt update && apt install -y openssh-server curl python3-pip hdparm udev aria2 exfat-fuse exfatprogs mediainfo sqlite3 libicu-dev

echo "=== 7. Nastavení automatické aktualizace yt-dlp pro Lyrion Music Server ==="
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
chmod a+rx /usr/local/bin/yt-dlp

cat << 'EOF' > /etc/systemd/system/ytdlp-update.service
[Unit]
Description=Automatická aktualizace yt-dlp pro LMS
After=network.online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/yt-dlp -U
EOF

cat << 'EOF' > /etc/systemd/system/ytdlp-update.timer
[Unit]
Description=Spouští týdenní aktualizaci yt-dlp
Wants=network-online.target

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now ytdlp-update.timer

echo "=== 8. Nastavení pravidelné automatické aktualizace systému (APT) ==="
cat << 'EOF' > /etc/systemd/system/system-update.service
[Unit]
Description=Automatická týdenní aktualizace systémových balíčků
After=network.online.target

[Service]
Type=oneshot
ExecStart=/usr/bin/apt-get update
ExecStart=/usr/bin/apt-get upgrade -y
ExecStart=/usr/bin/apt-get autoremove -y
ExecStart=/usr/bin/apt-get clean
EOF

cat << 'EOF' > /etc/systemd/system/system-update.timer
[Unit]
Description=Spouští týdenní aktualizaci systému
Wants=network-online.target

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now system-update.timer

echo "=== 9. Příprava a formát 1TB disku na ext4 s ochranou proti chybám ==="
umount /dev/sdc1 2>/dev/null
umount /mnt/1TB 2>/dev/null
umount /mnt/extdisk 2>/dev/null
umount -l /media/*/*/ 2>/dev/null

mkfs.ext4 -F -L "1TB" /dev/sdc1

mkdir -p /mnt/1TB
chown -R $SUDO_USER:$SUDO_USER /mnt/1TB

UUID=$(blkid -s UUID -o value /dev/sdc1)
if [ -z "$UUID" ]; then
  echo "Chyba: Nepodařilo se zjistit UUID disku!"
  exit 1
fi

sed -i '\|\/dev\/sdc1|d' /etc/fstab
sed -i '\|\/mnt\/extdisk|d' /etc/fstab
sed -i '\|\/mnt\/1TB|d' /etc/fstab
sed -i '\|\/media/|d' /etc/fstab

echo "UUID=$UUID /mnt/1TB ext4 defaults,noatime 0 2" >> /etc/fstab
mount -a

echo "=== 10. Konfigurace Samby pro sdílení disku v síti ==="
if [ ! -f /etc/samba/smb.conf.bak ]; then
  cp /etc/samba/smb.conf /etc/samba/smb.conf.bak
fi

cat << 'EOF' > /etc/samba/smb.conf
[global]
    workgroup = WORKGROUP
    server string = Umax Media Server
    security = user
    map to guest = Bad User
    dns proxy = no

[1TB]
    path = /mnt/1TB
    read only = no
    browsable = yes
    guest ok = yes
    create mask = 0644
    directory mask = 0755
EOF

systemctl restart smbd
systemctl restart nmbd

echo "=== 11. Zákaz uspávání disku (APM) a trvalý zákaz USB autosuspendu ==="
hdparm -B 254 /dev/sdc 2>/dev/null || true

cat << 'EOF' > /etc/udev/rules.d/50-usb-power.rules
ACTION=="add", SUBSYSTEM=="usb", ATTRS{idVendor}=="0bda", ATTRS{idProduct}=="9201", ATTR{power/control}="on"
EOF

udevadm control --reload-rules
udevadm trigger

echo "=== 12. Konfigurace Aria2 (stahovač pro pozadí) ==="
TARGET_DIR="/mnt/1TB/download"
CONF_DIR="/etc/aria2"
mkdir -p "$TARGET_DIR" "$CONF_DIR"
chown -R $SUDO_USER:$SUDO_USER "$TARGET_DIR" "$CONF_DIR"
chmod -R 775 "$TARGET_DIR"

cat <<EOF > "$CONF_DIR/aria2.conf"
dir=$TARGET_DIR
enable-rpc=true
rpc-listen-all=true
rpc-allow-origin-all=true
daemon=false
continue=true
max-concurrent-downloads=5
split=10
min-split-size=10M
log-level=notice
EOF

cat <<EOF > /etc/systemd/system/aria2.service
[Unit]
Description=Aria2c Downloader Service
After=network.target

[Service]
User=$SUDO_USER
ExecStart=/usr/bin/aria2c --conf-path=/etc/aria2/aria2.conf
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now aria2

echo "=== 13. Instalace a konfigurace Chrony (lokální NTP server pro síť) ==="
apt install -y chrony
if [ ! -f /etc/chrony/chrony.conf.bak ]; then
  cp /etc/chrony/chrony.conf /etc/chrony/chrony.conf.bak
fi

cat << 'EOF' > /etc/chrony/chrony.conf
server 0.debian.pool.ntp.org iburst
server 1.debian.pool.ntp.org iburst
server 2.debian.pool.ntp.org iburst
server 3.debian.pool.ntp.org iburst
driftfile /var/lib/chrony/drift
rtcsync
allow 10.0.0.0/24
local stratum 10
logdir /var/log/chrony
EOF

if command -v ufw &> /dev/null; then
  ufw allow 123/udp
fi

systemctl restart chrony
systemctl enable chrony

echo "=== 14. Instalace Tailscale (vzdálený přístup odkudkoliv) ==="
curl -fsSL https://tailscale.com/install.sh | sh

echo "=== 15. Firefox optimalizace (přesun mezipaměti do RAM) ==="
REAL_USER=$(logname 2>/dev/null || echo $SUDO_USER)
if [ -n "$REAL_USER" ] && [ "$REAL_USER" != "root" ]; then
  USER_HOME=$(eval echo ~$REAL_USER)
  FF_DIR="$USER_HOME/.mozilla/firefox"
  
  if [ -d "$FF_DIR" ]; then
    for profile in "$FF_DIR"/*.default*/ "$FF_DIR"/*default-release*/ "$FF_DIR"/*-esr; do
      if [ -d "$profile" ]; then
        USER_JS="$profile/user.js"
        cat <<EOF > "$USER_JS"
user_pref("browser.cache.disk.enable", false);
user_pref("browser.cache.memory.enable", true);
user_pref("browser.cache.memory.capacity", 153600);
user_pref("browser.sessionstore.interval", 1800000);
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("dom.indexedDB.enabled", false);
user_pref("pragma.synchronous", 0);
user_pref("media.hardware-video-decoding.force-enabled", true);
user_pref("gfx.webrender.all", true);
user_pref("media.ffvpx.enabled", false);
EOF
        chown "$REAL_USER":"$REAL_USER" "$USER_JS"
      fi
    done
  fi
fi

echo "=== 16. Změna prostředí: LXDE, Openbox, Numlockx a odlehčení XFCE ==="
apt-get update
apt-get install -y lxde openbox numlockx gnome-screenshot
apt-get purge -y xfce4 xfce4-* thunar tumbler light-desktop-settings 2>/dev/null
systemctl stop rpcbind speech-dispatcher 2>/dev/null
systemctl disable rpcbind speech-dispatcher 2>/dev/null
apt-get purge -y speech-dispatcher espeak-ng-data libespeak-ng1 2>/dev/null
apt-get autoremove -y
apt-get clean

echo "@numlockx on" | tee -a /etc/xdg/lxsession/LXDE/autostart 2>/dev/null

systemctl stop bluetooth cups cups-browsed pcscd avahi-daemon 2>/dev/null
systemctl disable bluetooth cups cups-browsed pcscd avahi-daemon 2>/dev/null

echo "=== 17. Integrace qBittorrent-nox (Složky, práva a 256MB RAM cache) ==="
mkdir -p /mnt/1TB/Torrents/incomplete
mkdir -p /mnt/1TB/Torrents/complete
mkdir -p /mnt/1TB/Media/Filmy
mkdir -p /mnt/1TB/Media/Hudba
mkdir -p /mnt/1TB/Media/Serioly

chown -R "$REAL_USER":"$REAL_USER" /mnt/1TB
chmod -R 775 /mnt/1TB
chmod -R 777 /mnt/1TB/Torrents

QBT_CONFIG_DIR="/home/$REAL_USER/.config/qBittorrent"
mkdir -p "$QBT_CONFIG_DIR"

cat << EOF > "$QBT_CONFIG_DIR/qBittorrent.conf"
[BitTorrent]
Session\DefaultSavePath=/mnt/1TB/Torrents/complete
Session\IncompleteSavePath=/mnt/1TB/Torrents/incomplete
Session\Queueing\QueueingEnabled=false
Session\AdditionDialogEnabled=false

[Preferences]
DiskCacheSize=256
DiskCacheTTL=60
AsyncIOThreads=4

[LegalNotice]
Accepted=true
EOF

chown -R "$REAL_USER":"$REAL_USER" "/home/$REAL_USER/.config"
systemctl restart qbittorrent-nox@$REAL_USER 2>/dev/null || systemctl restart qbittorrent-nox 2>/dev/null

echo "=== 18. Instalace a nastavení Media Stacku (Jackett, Radarr, Sonarr, Bazarr) ==="

# A) Jackett
if [ ! -d /opt/Jackett ]; then
  wget -O /tmp/jackett.tar.gz $(curl -s https://api.github.com/repos/Jackett/Jackett/releases/latest | grep "browser_download_url.*LinuxAMDx64.tar.gz" | cut -d '"' -f 4)
  tar -xzf /tmp/jackett.tar.gz -C /opt/
  rm /tmp/jackett.tar.gz
  chown -R "$REAL_USER":"$REAL_USER" /opt/Jackett
fi

cat << EOF > /etc/systemd/system/jackett.service
[Unit]
Description=Jackett Daemon
After=network.target

[Service]
User=$REAL_USER
ExecStart=/opt/Jackett/jackett --no-restart
Restart=on-failure
TimeoutStopSec=20

[Install]
WantedBy=multi-user.target
EOF

# B) Radarr[span_1](start_span)[span_1](end_span)
if [ ! -d /opt/Radarr ]; then
  wget -O /tmp/radarr.tar.gz "https://radarr.servarr.com/v1/update/master/updatefile?os=linux&runtime=netcore&arch=x64"
  tar -xzf /tmp/radarr.tar.gz -C /opt/
  rm /tmp/radarr.tar.gz
  chown -R "$REAL_USER":"$REAL_USER" /opt/Radarr
fi

cat << EOF > /etc/systemd/system/radarr.service
[Unit]
Description=Radarr Daemon
After=network.target

[Service]
User=$REAL_USER
ExecStart=/opt/Radarr/Radarr -nobrowser -data=/var/lib/radarr
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

mkdir -p /var/lib/radarr
chown -R "$REAL_USER":"$REAL_USER" /var/lib/radarr

# C) Sonarr[span_2](start_span)[span_2](end_span)
if [ ! -d /opt/Sonarr ]; then
  wget -O /tmp/sonarr.tar.gz "https://services.sonarr.tv/v1/download/master/latest?version=3&os=linux&arch=x64"
  tar -xzf /tmp/sonarr.tar.gz -C /opt/
  rm /tmp/sonarr.tar.gz
  chown -R "$REAL_USER":"$REAL_USER" /opt/Sonarr
fi

cat << EOF > /etc/systemd/system/sonarr.service
[Unit]
Description=Sonarr Daemon
After=network.target

[Service]
User=$REAL_USER
ExecStart=/opt/Sonarr/Sonarr -nobrowser -data=/var/lib/sonarr
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

mkdir -p /var/lib/sonarr
chown -R "$REAL_USER":"$REAL_USER" /var/lib/sonarr

# D) Bazarr[span_3](start_span)[span_3](end_span)
if [ ! -d /opt/Bazarr ]; then
  wget -O /tmp/bazarr.zip "https://github.com/morpheus65535/bazarr/releases/latest/download/bazarr.zip"
  mkdir -p /opt/Bazarr
  unzip -o /tmp/bazarr.zip -d /opt/Bazarr
  rm /tmp/bazarr.zip
  chown -R "$REAL_USER":"$REAL_USER" /opt/Bazarr
fi

cat << EOF > /etc/systemd/system/bazarr.service
[Unit]
Description=Bazarr Daemon
After=network.target

[Service]
User=$REAL_USER
ExecStart=/usr/bin/python3 /opt/Bazarr/bazarr.py --no-update
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now jackett radarr sonarr bazarr

echo "========================================================"
echo "       REÁLNÁ KONTROLA A OVĚŘENÍ NASTAVENÍ SYSTÉMU"
echo "========================================================"

ERRORS=0

systemctl is-active --quiet ssh || { echo "[CHYBA] SSH neběží"; ERRORS=$((ERRORS+1)); }
systemctl is-active --quiet ytdlp-update.timer || { echo "[CHYBA] yt-dlp timer není aktivní"; ERRORS=$((ERRORS+1)); }
systemctl is-active --quiet system-update.timer || { echo "[CHYBA] system-update timer není aktivní"; ERRORS=$((ERRORS+1)); }
mountpoint -q /mnt/1TB || { echo "[CHYBA] Disk není připojen v /mnt/1TB"; ERRORS=$((ERRORS+1)); }
systemctl is-active --quiet smbd || { echo "[CHYBA] Samba neběží"; ERRORS=$((ERRORS+1)); }
systemctl is-active --quiet aria2 || { echo "[CHYBA] Aria2 neběží"; ERRORS=$((ERRORS+1)); }
systemctl is-active --quiet chrony || { echo "[CHYBA] Chrony neběží"; ERRORS=$((ERRORS+1)); }
systemctl is-active --quiet jackett || { echo "[CHYBA] Jackett neběží"; ERRORS=$((ERRORS+1)); }
systemctl is-active --quiet radarr || { echo "[CHYBA] Radarr neběží"; ERRORS=$((ERRORS+1)); }
systemctl is-active --quiet sonarr || { echo "[CHYBA] Sonarr neběží"; ERRORS=$((ERRORS+1)); }
systemctl is-active --quiet bazarr || { echo "[CHYBA] Bazarr neběží"; ERRORS=$((ERRORS+1)); }

echo "========================================================"
if [ $ERRORS -eq 0 ]; then
  echo " HOTOVO! Všechny komponenty, optimalizace i Arr služby"
  echo " byly úspěšně nainstalovány a spusteny."
  echo " Nezapomeňte spustit 'sudo tailscale up' pro dokončení připojení."
  echo " Porty: Jackett (9117), Radarr (7878), Sonarr (8984), Bazarr (6767)"
  echo " Doporučujeme restart systému."
else
  echo " POZOR: Během ověřování bylo nalezeno $ERRORS varování/chyb."
fi
echo "========================================================"
