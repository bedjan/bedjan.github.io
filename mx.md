#!/bin/bash

# ==============================================================================
# KOMPLEXNÍ OPTIMALIZAČNÍ A INSTALAČNÍ SKRIPT PRO MX LINUX / UMAX SERVER
# Obsahuje: Optimalizace eMMC, zRAM, TMPFS, LXDE, SSH, Samba, ext4 1TB disk
# a automatickou aktualizaci yt-dlp pro Lyrion Music Server s reálnou kontrolou.
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

echo "=== 8. Kompletní příprava, vyčištění a formát 1TB disku na ext4 ==="
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

echo "=== 9. Konfigurace Samby pro [1TB] ==="
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

echo "=== 10. Nastavení hdparm (zákaz uspávání disku) ==="
hdparm -S 0 /dev/sdc

echo "=== 11. Firefox optimalizace (user.js) ==="
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

echo "=== 12. Změna prostředí: LXDE, Openbox, Numlockx a úklid XFCE ==="
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

# 2. Kontrola systemd časovače pro yt-dlp
if systemctl is-active --quiet ytdlp-update.timer; then
  echo "[OK] Časovač aktualizace yt-dlp (ytdlp-update.timer) je aktivní."
else
  echo "[CHYBA] Časovač aktualizace yt-dlp není aktivní!"
  ERRORS=$((ERRORS + 1))
fi

# 3. Kontrola binárky yt-dlp
if [ -x /usr/local/bin/yt-dlp ]; then
  echo "[OK] Binární soubor yt-dlp je přítomen a spustitelný."
else
  echo "[CHYBA] Soubor /usr/local/bin/yt-dlp chybí nebo není spustitelný!"
  ERRORS=$((ERRORS + 1))
fi

# 4. Kontrola připojení disku /mnt/1TB
if mountpoint -q /mnt/1TB; then
  echo "[OK] Úložný disk je úspěšně připojen do /mnt/1TB."
else
  echo "[CHYBA] Úložný disk není připojen v /mnt/1TB!"
  ERRORS=$((ERRORS + 1))
fi

# 5. Kontrola souborového systému /dev/sdc1
FSTYPE=$(lsblk -no FSTYPE /dev/sdc1 2>/dev/null)
if [ "$FSTYPE" = "ext4" ]; then
  echo "[OK] Souborový systém na /dev/sdc1 je správně formátován jako ext4."
else
  echo "[CHYBA] Souborový systém na /dev/sdc1 není ext4 (zjištěno: '$FSTYPE')!"
  ERRORS=$((ERRORS + 1))
fi

# 6. Kontrola zRAM
if swapon --show | grep -q zram; then
  echo "[OK] zRAM swap je aktivní v paměti."
else
  echo "[VAROVÁNÍ] zRAM swap nebyl detekován v aktivních swap zařízeních."
fi

# 7. Kontrola tmpfs pro /tmp
if mount | grep -q 'on /tmp type tmpfs'; then
  echo "[OK] Adresář /tmp je úspěšně namontován v RAM (tmpfs)."
else
  echo "[CHYBA] Adresář /tmp není nastaven jako tmpfs v RAM!"
  ERRORS=$((ERRORS + 1))
fi

# 8. Kontrola Samby (smbd)
if systemctl is-active --quiet smbd; then
  echo "[OK] Služba Samba (smbd) běží a sdílí disky."
else
  echo "[CHYBA] Služba Samba (smbd) neběží!"
  ERRORS=$((ERRORS + 1))
fi

echo "========================================================"
if [ $ERRORS -eq 0 ]; then
  echo " HOTOVO! Všechno todleto máme nastavené a ověřené v pořádku."
  echo " Doporučuje se restartovat počítač."
  echo "========================================================"
else
  echo " POZOR: Během ověřování bylo nalezeno $ERRORS chyb."
  echo " Zkontrolujte výstupy výše a případné problémy opravte."
  echo "========================================================"
  exit 1
fi
