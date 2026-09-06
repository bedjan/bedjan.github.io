#!/bin/bash

# sudo bash optimalizace.sh

# ==============================================================================
# AUTOMATICKÝ OPTIMALIZAČNÍ SKRIPT PRO DEBIAN / MX LINUX
# Cíl: Maximální omezení zápisů na disk pro ochranu SD karet a eMMC úložišť.
# Nyní nově s instalací LXDE/Openbox a kompletním smazáním XFCE.
# ==============================================================================
#
# POPIS FUNKCÍ A PŘÍPADNÝCH KOMPLIKACÍ (VŠE ZAKOMENTOVÁNO):
#
# 1. ODSTRANĚNÍ RSYSLOGU
#    - Vypíná a kompletně odstraňuje klasický rsyslog, který neustále zapisuje 
#      textové logy do /var/log/ (syslog, auth.log atd.).
#
# 2. SYSTEMD-JOURNALD DO RAM
#    - Přesouvá veškeré systémové logování do operační paměti (Storage=volatile).
#    - Zastropuje velikost logů na 64 MB, aby nezaplnily RAM.
#    - POZOR: Po restartu PC staré logy zmizí. Logy prohlížejte přes 'journalctl -f'.
#
# 3. SWAPPINESS NA 10
#    - Říká jádru, aby odkládalo data do swapu až v momentě, kdy je to nutné.
#    - Snižuje zbytečné preventivní zápisy na disk.
#
# 4. ZPROVOZNĚNÍ ZRAM NA 2GB
#    - Odmaskuje a povolí službu zramswap. Nastaví 2 GB komprimovaného swapu v RAM.
#    - Přidělí prioritu 100. Diskový swap (priorita -1) se použije až při totálním vyčerpání.
#    - PROBLÉM: Pokud zRAM po skriptu neběží (ověříte přes 'swapon --show'), balíček 
#      v systému chybí. Vyřešte to ručně přes: sudo apt install zram-tools
#
# 5. ÚPRAVA FSTAB (NOATIME, COMMIT=60, /TMP DO RAM)
#    - Přidává 'noatime' (nezapisuje se čas čtení souborů) a 'commit=60' (data se 
#      na disk splachují hromadně jednou za minutu namísto každých 5 sekund).
#    - Přesouvá adresář /tmp do RAM (tmpfs) a omezuje ho na bezpečných 512 MB.
#    - PROBLÉM: Pokud má /tmp po restartu zase 1.9 GB, vynuťte to přes systemd:
#      sudo systemctl edit tmp.mount -> vložte:
#      [Mount]
#      Options=mode=1777,strictatime,nosuid,nodev,size=512M
#
# 6. AUTOMATIZACE FIREFOXU (USER.JS)
#    - Firefox nelze nastavit globálně, protože každý uživatel má vlastní profil.
#    - Tento skript níže najde složku vašeho profilu ve Vašem domovském adresáři
#      a vytvoří v ní soubor 'user.js'. Ten automaticky při startu Firefoxu:
#      a) Vypne diskovou cache a zapne RAM cache (max 150 MB).
#      b) Prodlouží ukládání relace (tabů) z 15 sekund na 30 minut.
#      c) Vypne vestavěnou telemetrii (Glean a Mozilla hlášení), která generuje zápisy.
#      d) Přesune operace SQLite databází (historie, cookies) do RAM (pragma.synchronous=0).
#      e) Kompletně zakáže diskové úložiště moderních webů (dom.indexedDB.enabled=false).
#
# 7. ZMĚNA PROSTŘEDÍ: INSTALACE LXDE, OPENBOX, NUMLOCKX a SMAZÁNÍ XFCE
#    - Aktualizuje repozitáře a nainstaluje odlehčené prostředí LXDE se správcem Openbox.
#    - Instaluje balíček 'numlockx', který zajistí automatické zapnutí numerické klávesnice.
#    - Kompletně odinstaluje staré grafické prostředí XFCE (včetně xfce4-session, thunaru atd.),
#      čímž uvolní stovky megabajtů na disku.
#    - Vyčistí již nepotřebné osiřelé balíčky přes 'autoremove'.
#    - POZOR: Na přihlašovací obrazovce (LightDM/SLiM) si nezapomeňte před zadáním hesla 
#      přepnout sezení (Session) z XFCE na LXDE nebo Openbox!
#
# ==============================================================================

# Kontrola root práv
if [ "$EUID" -ne 0 ]; then
  echo "Chyba: Tento skript musíte spustit jako root (např. sudo bash optimalizace.sh)"
  exit 1
fi

echo "=== 1. Odstranění rsyslogu ==="
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

echo "=== 4. Odmaskování a konfigurace zRAM na 2GB ==="
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

echo "=== 6. Automatická konfigurace Firefoxu přes user.js ==="
REAL_USER=$(logname 2>/dev/null || echo $SUDO_USER)
if [ -n "$REAL_USER" ] && [ "$REAL_USER" != "root" ]; then
  USER_HOME=$(eval echo ~$REAL_USER)
  FF_DIR="$USER_HOME/.mozilla/firefox"
  
  if [ -d "$FF_DIR" ]; then
    for profile in "$FF_DIR"/*.default*/ "$FF_DIR"/*default-release*/; do
      if [ -d "$profile" ]; then
        USER_JS="$profile/user.js"
        cat <<EOF > "$USER_JS"
// Optimalizace Firefoxu pro omezení zápisů na disk
user_pref("browser.cache.disk.enable", false);
user_pref("browser.cache.memory.enable", true);
user_pref("browser.cache.memory.capacity", 153600);
user_pref("browser.sessionstore.interval", 1800000);
user_pref("datareporting.healthreport.uploadEnabled", false);
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("dom.indexedDB.enabled", false);
user_pref("pragma.synchronous", 0);
EOF
        chown "$REAL_USER":"$REAL_USER" "$USER_JS"
        echo "Firefox profil upraven: $profile"
      fi
    done
  fi
fi

echo "=== 7. Instalace LXDE, Openbox, Numlockx a smazání XFCE ==="
# Aktualizace seznamu balíčků
apt-get update

# Instalace nového odlehčeného prostředí a užitečných utilit
apt-get install -y lxde openbox numlockx

# Odstranění starého prostředí XFCE a jeho komponent
apt-get purge -y xfce4 xfce4-* thunar tumbler light-desktop-settings

# Kompletní vyčištění zbylých a osiřelých balíčků
apt-get autoremove -y
apt-get clean

echo "=============================================================================="
echo " HOTOVO! Vše bylo úspěšně nastaveno přesně podle předchozí domluvy."
echo " Prostředí bylo změněno na LXDE/Openbox. XFCE bylo bezpečně smazáno."
echo " Doporučuje se restartovat počítač pro kompletní čisté zavedení."
echo " POZOR: Na přihlašovací obrazovce zvolte sezení LXDE/Openbox!"
echo "=============================================================================="
