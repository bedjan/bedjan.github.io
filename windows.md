-----------------
# SÍŤ
-----------------

# 1. Vymazání mezipaměti DNS
```
ipconfig /flushdns
```
# 2. Reset rozhraní Winsock
```
netsh winsock reset
```
# 3. Reset IP protokolu
```
netsh int ip reset
```
# 4. Zakázání protokolu IPv6
```
Disable-NetAdapterBinding -Name "*" -ComponentID ms_tcpip6 -ErrorAction SilentlyContinue
```
# 5. Nastavení DNS na Google (8.8.8.8)
```
$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
foreach ($adapter in $adapters) {
    Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex -ServerAddresses ("8.8.8.8", "8.8.4.4")
}
```
# 6. Test kvality připojení (Ztráta paketů)
```
Write-Host "`n--- SPUSTENO: Testuji stabilitu (cekaj 20 sekund) ---" -ForegroundColor Cyan; ping -n 20 8.8.8.8
```



-----------------
# WIFI
-----------------

# 1. Kontrola síly signálu
```
Write-Host "`n--- 1. KONTROLA SÍLY A RYCHLOSTI WI-FI ---" -ForegroundColor Cyan; Write-Host "Sleduj radek 'Signal' (pod 70% je spatne) a 'Receive rate'." -ForegroundColor Gray; netsh wlan show interfaces
```
# 2. Zjištění adresy modemu a test propustnosti
```
$gateway = (Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Sort-Object RouteMetric | Select-Object -First 1).NextHop; Write-Host "`n--- 2. TEST SPOJENI K MODEMU ($gateway) ---" -ForegroundColor Cyan; Write-Host "Pokud uvidis 'Ztraceno / Lost > 0', signal k tobe nedoleti v poradku." -ForegroundColor Yellow; ping -n 20 $gateway
```

# 3. Skenování okolního rušení
```
Write-Host "`n--- 3. SKENOVÁNÍ OKOLNÍCH SÍTÍ (RUŠENÍ) ---" -ForegroundColor Cyan; Write-Host "Podivej se na 'Channel' (Kanal) u sve site a u sousedu." -ForegroundColor Gray; netsh wlan show networks mode=bssid
```
# 4. Kontrola chyb v ovladači karty
```
Write-Host "`n--- 4. STAV SÍŤOVÉ KARTY ---" -ForegroundColor Cyan; Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed; Write-Host "`n--- DIAGNOSTIKA DOKONČENA ---" -ForegroundColor Cyan
```
-------
Chyby windows
-------

# 🛠 Záchranný manuál: Oprava chyby 0x7B (Inaccessible Boot Device)

Tento postup je určen pro Windows 10/11 na moderních noteboocích (např. Acer TravelMate, Swift, Lenovo, HP), které využívají NVMe SSD disky a procesory Intel 11. generace a novější.

---

### KROK 1: Kontrola řadiče v BIOSu (VMD Controller)
Nejčastější příčinou je nesoulad mezi nastavením BIOSu a ovladačem ve Windows.

1.  **Vstup do BIOSu:** Při startu opakovaně klikejte na klávesu **F2** (u některých PC **Del** nebo **F10**).
2.  **Zobrazení skrytých voleb:** Na záložce **Main** stiskněte kombinaci **Ctrl + S**. (U Acerů se tím odkryje nastavení VMD).
3.  **Změna režimu:** Najděte položku **VMD Controller**.
    * Pokud je **Enabled**, zkuste ji přepnout na **Disabled**.
    * Pokud je **Disabled**, zkuste ji přepnout na **Enabled**.
4.  **Uložení:** Stiskněte **F10** a potvrďte **Yes**. Pokud Windows nenaběhnou, pokračujte Krokem 2.

---

### KROK 2: Ruční oprava zaváděcích souborů (Příkazový řádek)
Pokud přepnutí v BIOSu nepomohlo, je nutné ručně opravit konfigurační data spouštění (BCD).

1.  **Spuštění CMD:** V modrém menu opravy zvolte:
    * `Odstranit problémy` -> `Upřesnit možnosti` -> `Příkazový řádek`.
2.  **Identifikace disku:** Musíme zjistit, pod jakým písmenem systém vidí váš SSD.
    * Napište `diskpart` a stiskněte **Enter**.
    * Napište `list volume` a stiskněte **Enter**.
    * Najděte největší oddíl (např. 238 GB nebo 475 GB) a podívejte se na písmeno ve sloupci **Ltr** (např. **C**).
    * Napište `exit` a stiskněte **Enter**.
3.  **Vytvoření nových souborů spuštění:**
    * Napište příkaz: `bcdboot C:\Windows /l cs-cz`
    * *(Poznámka: Pokud měl váš disk v předchozím kroku jiné písmeno než C, nahraďte ho).*
4.  **Potvrzení:** Měli byste vidět zprávu: **"Boot files successfully created."**

---

### KROK 3: Finální restart
1.  V příkazovém řádku napište: `wpeutil reboot`.
2.  Pokud notebook stále hází chybu 0x7B, jděte znovu do BIOSu (Krok 1) a přepněte **VMD Controller** do té druhé polohy, než ve které jste právě teď. 

---

### Proč se to stalo?
* **Aktualizace BIOSu:** Resetuje nastavení řadiče disku do továrního stavu (např. zapne VMD), ale Windows byly nainstalovány v opačném režimu.
* **Poškození BCD:** Při nekorektním vypnutí nebo aktualizaci se "mapa", která říká BIOSu, kde leží složka Windows, poškodí. Příkaz `bcdboot` tuto mapu vytvoří znovu "na zelené louce".
