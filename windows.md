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
