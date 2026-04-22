<#
.SYNOPSIS
    Diagnostika a oprava síťového připojení ve Windows 11.
    Tento skript řeší ztrátu paketů, DNS chyby a stabilitu Wi-Fi.
#>

Write-Host "--- SPUŠTĚNÍ DIAGNOSTIKY A OPRAVY SÍTĚ ---" -ForegroundColor Cyan

# 1. TEST ZTRÁTY PAKETŮ (Diagnostika)
Write-Host "`n1. Testuji stabilitu připojení (ztráta paketů)..." -ForegroundColor Yellow
$pingTest = ping -n 10 8.8.8.8
$pingTest | Select-String "Lost", "Ztraceno"
Write-Host "Pokud je ztráta > 0%, signál mezi PC a modemem je rušený." -ForegroundColor Gray

# 2. PROČIŠTĚNÍ MEZIPAMĚTI A RESET PROTOKOLŮ (Oprava)
# Co se děje: Vymaže se stará tabulka tras a záznamy DNS, které mohou směřovat na neexistující stránky.
Write-Host "`n2. Čistím mezipaměť DNS a resetuji IP protokoly..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
netsh int ip reset | Out-Null
netsh winsock reset | Out-Null
Write-Host "Hotovo. Síťové protokoly byly vráceny do čistého stavu." -ForegroundColor Green

# 3. NASTAVENÍ RYCHLEJŠÍHO DNS (Oprava)
# Co se děje: Nastavíme DNS od Googlu (8.8.8.8), protože ty od poskytovatele často "zahazují" požadavky.
Write-Host "`n3. Nastavuji Google DNS (8.8.8.8 / 8.8.4.4)..." -ForegroundColor Yellow
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
foreach ($adapter in $adapters) {
    Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ServerAddresses ("8.8.8.8", "8.8.4.4")
}
Write-Host "DNS servery byly aktualizovány pro všechny aktivní karty." -ForegroundColor Green

# 4. VYPNUTÍ ÚSPORY ENERGIE PRO SÍŤOVOU KARTU (Stabilita)
# Co se děje: Zamezí Windows 11, aby vypínaly Wi-Fi kartu při poklesu aktivity.
Write-Host "`n4. Vypínám úsporný režim u síťových adaptérů..." -ForegroundColor Yellow
$wmi = Get-WmiObject -Class MSPower_DeviceEnable -Namespace root\wmi
if ($wmi) {
    $wmi.Enable = $false
    $wmi.Put()
    Write-Host "Úspora energie zakázána." -ForegroundColor Green
} else {
    Write-Host "Tato funkce není přes WMI dostupná, zkontrolujte ručně ve Správci zařízení." -ForegroundColor Gray
}

# 5. ZAKÁZÁNÍ IPv6 (Kompatibilita)
# Co se děje: Starší modemy mají s IPv6 problém, což způsobuje "mrtvá" spojení na některých webech.
Write-Host "`n5. Vypínám IPv6 pro zvýšení stability se staršími modemy..." -ForegroundColor Yellow
Disable-NetAdapterBinding -Name "*" -ComponentID ms_tcpip6 -ErrorAction SilentlyContinue
Write-Host "IPv6 zakázáno." -ForegroundColor Green

Write-Host "`n--- HOTOVO! PRO DOKONČENÍ RESTARTUJ POČÍTAČ ---" -ForegroundColor Cyan -BackgroundColor DarkBlue
