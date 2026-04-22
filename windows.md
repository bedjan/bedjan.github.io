-----------------
# SÍŤ
-----------------

# 1. Vymazání mezipaměti DNS

ipconfig /flushdns

# 2. Reset rozhraní Winsock

netsh winsock reset

# 3. Reset IP protokolu

netsh int ip reset

# 4. Zakázání protokolu IPv6

Disable-NetAdapterBinding -Name "*" -ComponentID ms_tcpip6 -ErrorAction SilentlyContinue

# 5. Nastavení DNS na Google (8.8.8.8)

$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
foreach ($adapter in $adapters) {
    Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ServerAddresses ("8.8.8.8", "8.8.4.4")
}

# 6. Test kvality připojení (Ztráta paketů)

Write-Host "`n--- SPUSTENO: Testuji stabilitu (cekaj 20 sekund) ---" -ForegroundColor Cyan; ping -n 20 8.8.8.8




-----------------
# WIFI
-----------------

# 1. Kontrola síly signálu

Write-Host "`n--- 1. KONTROLA SÍLY A RYCHLOSTI WI-FI ---" -ForegroundColor Cyan; Write-Host "Sleduj radek 'Signal' (pod 70% je spatne) a 'Receive rate'." -ForegroundColor Gray; netsh wlan show interfaces

# 2. Zjištění adresy modemu a test propustnosti

$gateway = (Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Sort-Object RouteMetric | Select-Object -First 1).NextHop; Write-Host "`n--- 2. TEST SPOJENI K MODEMU ($gateway) ---" -ForegroundColor Cyan; Write-Host "Pokud uvidis 'Ztraceno / Lost > 0', signal k tobe nedoleti v poradku." -ForegroundColor Yellow; ping -n 20 $gateway


# 3. Skenování okolního rušení

Write-Host "`n--- 3. SKENOVÁNÍ OKOLNÍCH SÍTÍ (RUŠENÍ) ---" -ForegroundColor Cyan; Write-Host "Podivej se na 'Channel' (Kanal) u sve site a u sousedu." -ForegroundColor Gray; netsh wlan show networks mode=bssid

# 4. Kontrola chyb v ovladači karty

Write-Host "`n--- 4. STAV SÍŤOVÉ KARTY ---" -ForegroundColor Cyan; Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed; Write-Host "`n--- DIAGNOSTIKA DOKONČENA ---" -ForegroundColor Cyan
