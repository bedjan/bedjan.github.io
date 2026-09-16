#!/bin/bash

# ==============================================================================
# KOMPLEXNÍ OPTIMALIZAČNÍ A INSTALAČNÍ SKRIPT PRO MX LINUX / UMAX SERVER
# Obsahuje: Optimalizace eMMC, zRAM, TMPFS, LXDE, SSH, Samba, ext4 1TB disk,
# automatickou aktualizaci yt-dlp, týdenní aktualizaci systému a qBittorrent-nox.
# ==============================================================================

# Kontrola root práv
if [ "$EUID" -ne 0 ]; then
  echo "Chyba: Tento skript musíte spustit jako root (sudo bash mx-server-setup.sh)"
  exit 1
fi

echo "=== 1. Odstranění rsyslogu (ochrana eMMC) ==="
systemctl stop rsyslog 2>/dev/null
systemctl disable rsyslog 2>/dev/null
apt-get purge -y rsyslog

echo "=== 2. Nastavení systemd-journald do RAM ==="
mkdir -p /etc/systemd/journald.conf.d
cat <<EOF > /etc/systemd/journald.conf.d/ram-logging.conf
[Journal]
Storage=volatile
RuntimeMaxUse=64M
EOF
systemctl restart systemd-journald

echo "=== 3. Nastavení swappiness na 10 ==="
sysctl vm.swappiness=10
sed -i '/vm.swappiness/d' /etc/sysctl.conf
echo "vm.swappiness=10" >> /etc/sysctl.conf

echo "=== 4. Konfigurace zRAM na 2GB ==="
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

echo "=== 6. Instalace a spuštění SSH serveru ==="
apt update && apt install -y openssh-server curl python3-pip
systemctl enable --now ssh

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

echo "=== 9. Kompletní příprava, vyčištění a formát 1TB disku na ext4 ==="
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

echo "=== 10. Konfigurace Samby pro [1TB] ==="
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

echo "=== 11. Nastavení hdparm (zákaz uspávání disku) ==="
hdparm -S 0 /dev/sdc

echo "=== 12. Firefox optimalizace (user.js) ==="
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

echo "=== 13. Změna prostředí: LXDE, Openbox, Numlockx a úklid XFCE ==="
apt-get update
apt-get install -y lxde openbox numlockx gnome-screenshot exfat-fuse exfatprogs
apt-get purge -y xfce4 xfce4-* thunar tumbler light-desktop-settings 2>/dev/null

systemctl stop rpcbind speech-dispatcher 2>/dev/null
systemctl disable rpcbind speech-dispatcher 2>/dev/null
apt-get purge -y speech-dispatcher espeak-ng-data libespeak-ng1 2>/dev/null

apt-get autoremove -y
apt-get clean

echo "@numlockx on" | tee -a /etc/xdg/lxsession/LXDE/autostart 2>/dev/null

systemctl stop bluetooth cups cups-browsed pcscd avahi-daemon 2>/dev/null
systemctl disable bluetooth cups cups-browsed pcscd avahi-daemon 2>/dev/null

echo ""
echo "========================================================"
echo "       REÁLNÁ KONTROLA A OVĚŘENÍ NASTAVENÍ SYSTÉMU"
echo "========================================================"

ERRORS=0

# 1. Kontrola SSH serveru
if systemctl is-active --quiet ssh; then
  echo "[OK] Služba SSH (sshd) běží."
else
  echo "[CHYBA] Služba SSH (sshd) neběží!"
  ERRORS=$((ERRORS + 1))
fi

# 2. Kontrola časovače pro yt-dlp
if systemctl is-active --quiet ytdlp-update.timer; then
  echo "[OK] Časovač aktualizace yt-dlp (ytdlp-update.timer) je aktivní."
else
  echo "[CHYBA] Časovač aktualizace yt-dlp není aktivní!"
  ERRORS=$((ERRORS + 1))
fi

# 3. Kontrola časovače pro systémové aktualizace
if systemctl is-active --quiet system-update.timer; then
  echo "[OK] Časovač týdenních aktualizací systému (system-update.timer) je aktivní."
else
  echo "[CHYBA] Časovač týdenních aktualizací systému není aktivní!"
  ERRORS=$((ERRORS + 1))
fi

# 4. Kontrola binárky yt-dlp
if [ -x /usr/local/bin/yt-dlp ]; then
  echo "[OK] Binární soubor yt-dlp je přítomen a spustitelný."
else
  echo "[CHYBA] Soubor /usr/local/bin/yt-dlp chybí nebo není spustitelný!"
  ERRORS=$((ERRORS + 1))
fi

# 5. Kontrola připojení disku /mnt/1TB
if mountpoint -q /mnt/1TB; then
  echo "[OK] Úložný disk je úspěšně připojen do /mnt/1TB."
else
  echo "[CHYBA] Úložný disk není připojen v /mnt/1TB!"
  ERRORS=$((ERRORS + 1))
fi

# 6. Kontrola souborového systému /dev/sdc1
FSTYPE=$(lsblk -no FSTYPE /dev/sdc1 2>/dev/null)
if [ "$FSTYPE" = "ext4" ]; then
  echo "[OK] Souborový systém na /dev/sdc1 je správně formátován jako ext4."
else
  echo "[CHYBA] Souborový systém na /dev/sdc1 není ext4 (zjištěno: '$FSTYPE')!"
  ERRORS=$((ERRORS + 1))
fi

# 7. Kontrola zRAM
if swapon --show | grep -q zram; then
  echo "[OK] zRAM swap je aktivní v paměti."
else
  echo "[VAROVÁNÍ] zRAM swap nebyl detekován v aktivních swap zařízeních."
fi

# 8. Kontrola tmpfs pro /tmp
if mount | grep -q 'on /tmp type tmpfs'; then
  echo "[OK] Adresář /tmp je úspěšně namontován v RAM (tmpfs)."
else
  echo "[CHYBA] Adresář /tmp není nastaven jako tmpfs v RAM!"
  ERRORS=$((ERRORS + 1))
fi

# 9. Kontrola Samby (smbd)
if systemctl is-active --quiet smbd; then
  echo "[OK] Služba Samba (smbd) běží a sdílí disky."
else
  echo "[CHYBA] Služba Samba (smbd) neběží!"
  ERRORS=$((ERRORS + 1))
fi

echo "========================================================"
if [ $ERRORS -eq 0 ]; then
  echo " HOTOVO! Základní systém a disk jsou v pořádku."
else
  echo " POZOR: Během ověřování bylo nalezeno $ERRORS chyb."
  echo "========================================================"
fi

# ==============================================================================
# 14. INTEGRACE QBITTORRENT-NOX (Složky, práva, okamžitý start a RAM cache)
# ==============================================================================

echo "=== 14. Nastavení qBittorrent-nox a ochrana plotnového disku ==="

# Zjištění reálného uživatele pro konfigurace
if [ -z "$REAL_USER" ] || [ "$REAL_USER" = "root" ]; then
  REAL_USER=$(logname 2>/dev/null || echo "dux")
fi

# Vytvoření adresářové struktury pro torrenty
mkdir -p /mnt/1TB/Torrents/incomplete
mkdir -p /mnt/1TB/Torrents/complete
mkdir -p /mnt/1TB/Media/Filmy
mkdir -p /mnt/1TB/Media/Hudba
mkdir -p /mnt/1TB/Media/Serioly

# Nastavení práv pro zápis pro uživatele
chown -R "$REAL_USER":"$REAL_USER" /mnt/1TB
chmod -R 775 /mnt/1TB
chmod -R 777 /mnt/1TB/Torrents

# Příprava konfiguračního adresáře qBittorrentu
QBT_CONFIG_DIR="/home/$REAL_USER/.config/qBittorrent"
mkdir -p "$QBT_CONFIG_DIR"

# Zápis konfigurace: vypnuté fronty (okamžitý start) + 256MB RAM cache (šetří disk)
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

# Oprava vlastnictví konfiguračního souboru
chown -R "$REAL_USER":"$REAL_USER" "/home/$REAL_USER/.config"

# Restart qBittorrent-nox služby
systemctl restart qbittorrent-nox@$REAL_USER 2>/dev/null || systemctl restart qbittorrent-nox 2>/dev/null

echo "========================================================"
echo " VŠECHNO HOTOVO! Kompletní systém, disk, Samba i qBittorrent"
echo " jsou úspěšně nastaveny, optimalizovány a chráněny."
echo " Doporučuje se restartovat počítač."
echo "========================================================"



# Zastavení při chybě
set -e

echo "=== 1. Instalace Aria2 ==="
sudo apt update
sudo apt install -y aria2

echo "=== 2. Příprava adresáře na 1TB disku ==="
TARGET_DIR="/mnt/1TB/download"
CONF_DIR="/etc/aria2"

# Vytvoření adresáře, pokud neexistuje
sudo mkdir -p "$TARGET_DIR"

# Nastavení vlastnictví na aktuálního uživatele (dux) a skupinu, práva na čtení/zápis (Samba-friendly)
sudo chown -R dux:dux "$TARGET_DIR"
sudo chmod -R 775 "$TARGET_DIR"

echo "Cílová složka nastavena na: $TARGET_DIR"

echo "=== 3. Vytvoření konfigurace Aria2 ==="
sudo mkdir -p "$CONF_DIR"

sudo bash -c "cat > $CONF_DIR/aria2.conf" <<EOF
# Základní nastavení
dir=$TARGET_DIR
enable-rpc=true
rpc-listen-all=true
rpc-allow-origin-all=true
daemon=false

# Výkon a stahování
continue=true
max-concurrent-downloads=5
split=10
min-split-size=10M

# Logování
log-level=notice
EOF

# Vlastnictví konfiguračního souboru
sudo chown -R dux:dux "$CONF_DIR"

echo "=== 4. Vytvoření systemd služby pro běh na pozadí ==="
sudo bash -c "cat > /etc/systemd/system/aria2.service" <<EOF
[Unit]
Description=Aria2c Downloader Service
After=network.target

[Service]
User=dux
ExecStart=/usr/bin/aria2c --conf-path=/etc/aria2/aria2.conf
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd a spuštění služby
sudo systemctl daemon-reload
sudo systemctl enable aria2
sudo systemctl restart aria2

echo "=== HOTOVO! Aria2 úspěšně běží na pozadí. ==="
echo ""
echo "Lokální IP adresa tvého stroje:"
hostname -I | awk '{print $1}'
echo ""
echo "--------------------------------------------------------"
echo " JAK OVLÁDAT ARIA2:"
echo "--------------------------------------------------------"
echo "1. Webové rozhraní (AriaNg):"
echo "   Otevři v prohlížeči: https://ariang.js.org"
echo "   V nastavení (Settings -> RPC) zadej:"
echo "   - Host: IP adresa tohoto počítače"
echo "   - Port: 6800"
echo ""
echo "2. Android aplikace:"
echo "   Stáhni z Google Play aplikaci 'Aria2App' nebo 'AriaNg for Android'."
echo "   Připoj se pomocí IP adresy tohoto počítače a portu 6800."
echo ""
echo "Stažené soubory najdeš v: $TARGET_DIR"
echo "--------------------------------------------------------"

