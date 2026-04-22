-----------------
SÍŤ
-----------------

# 1. Vymazání mezipaměti DNS
# Odstraní staré nebo chybné záznamy o adresách webových stránek.
ipconfig /flushdns

# 2. Reset rozhraní Winsock
# Obnoví základní strukturu síťové komunikace pro aplikace (prohlížeče).
netsh winsock reset

# 3. Reset IP protokolu
# Vrátí nastavení TCP/IP na výchozí hodnoty (opravuje chyby v konfiguraci).
netsh int ip reset

# 4. Zakázání protokolu IPv6
# Vypne IPv6, který ve Windows 11 často způsobuje výpadky u starších modemů.
Disable-NetAdapterBinding -Name "*" -ComponentID ms_tcpip6 -ErrorAction SilentlyContinue

# 5. Nastavení DNS na Google (8.8.8.8)
# Nahradí DNS poskytovatele rychlejšími servery od Googlu pro všechny aktivní karty.
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
foreach ($adapter in $adapters) {
    Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ServerAddresses ("8.8.8.8", "8.8.4.4")
}

# 6. Test kvality připojení (Ztráta paketů)
# Pošle 20 dotazů na internet a ukáže, kolik se jich cestou k modemu ztratilo.
Write-Host "--- SPUSTENO: Sledujte radek Ztraceno / Lost ---" -ForegroundColor Cyan
ping -n 20 8.8.8.8


-----------------
WIFI
-----------------

# 1. Kontrola síly signálu
Write-Host "`n--- 1. KONTROLA SÍLY A RYCHLOSTI WI-FI ---" -ForegroundColor Cyan
Write-Host "Sleduj radek 'Signal' (pod 70% je spatne) a 'Receive rate' (rychlost spojeni)." -ForegroundColor Gray
netsh wlan show interfaces

# 2. Zjištění adresy modemu a test propustnosti (Ping)
Write-Host "`n--- 2. TEST SPOJENÍ MEZI PC A MODEMEM ---" -ForegroundColor Cyan
$gateway = (Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Sort-Object RouteMetric | Select-Object -First 1).NextHop
Write-Host "Tvuj modem ma adresu: $gateway. Ted na nej poslu 20 balicku dat." -ForegroundColor Gray
Write-Host "Pokud uvidis 'Ztraceno / Lost > 0', signal k tobe nedoleti v poradku." -ForegroundColor Yellow
ping -n 20 $gateway

# 3. Skenování okolního rušení
Write-Host "`n--- 3. SKENOVÁNÍ OKOLNÍCH SÍTÍ (RUŠENÍ) ---" -ForegroundColor Cyan
Write-Host "Podivej se na 'Channel' (Kanal) u sve site a u sousedu." -ForegroundColor Gray
Write-Host "Pokud sousedi vysilaji na stejnem cisle, vase Wi-Fi se navzajem 'prekricuji'." -ForegroundColor Yellow
netsh wlan show networks mode=bssid

# 4. Kontrola chyb v ovladači karty
Write-Host "`n--- 4. STAV SÍŤOVÉ KARTY ---" -ForegroundColor Cyan
Write-Host "Pokud je u 'Status' neco jineho nez 'Up', karta ma problem s ovladacem." -ForegroundColor Gray
Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed

Write-Host "`n--- DIAGNOSTIKA DOKONČENA ---" -ForegroundColor Cyan

