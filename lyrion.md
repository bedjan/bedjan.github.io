-----------------
# piCorePlayer (pCP)
-----------------


[piCorePlayer  pCP](https://lyrion.org/players-and-controllers/picoreplayer/)

# cmdline.txt

```
dwc_otg.fiq_fsm_mask=0xF host=pCP dwc_otg.lpm_enable=0 console=tty1 root=/dev/ram0 rootwait quiet nortc loglevel=3 noembed smsc95xx.turbo_mode=N noswap consoleblank=0 waitusb=2 ip=192.168.0.200:192.168.0.1:192.168.0.1:255.255.255.0 fsck.repair=yes waitusb=10

```




```

dwc_otg.fiq_fsm_mask=0xF host=pCP dwc_otg.lpm_enable=0 console=tty1 root=/dev/ram0 rootwait quiet nortc loglevel=3 noembed smsc95xx.turbo_mode=N noswap consoleblank=0 waitusb=2 ip=10.0.0.250:10.0.0.138:10.0.0.138:255.255.255.0 fsck.repair=yes waitusb=10

```


# Kompletní příručka pro nastavení piCorePlayer & Lyrion (LMS)
Tento manuál vás provede čistou instalací, síťovou konfigurací na IP 192.168.0.200, okamžitým vypnutím Wi-Fi, aktivací USB disku, nastavením zvukového DAC, instalací pluginů a finálním zabezpečením proti výpadkům proudu.

---

## ČÁST 1: Příprava na počítači (Úprava SD karty ve Windows)

Než vložíte SD kartu (32 GB) poprvé do Raspberry Pi, musíte na ní v počítači upravit konfigurační soubory.

### 1. Nastavení statické IP adresy, opravy disku a USB prodlevy
1. Vložte SD kartu do čtečky v PC s Windows.
2. Otevřete disk s SD kartou a najděte textový soubor **`cmdline.txt`**.
3. Klikněte na něj pravým tlačítkem a zvolte *Otevřít v programu -> Poznámkový blok*.
4. Soubor obsahuje pouze **jeden dlouhý řádek**. Na úplný konec tohoto řádku vložte mezeru a doplňte následující parametry (vše v jedné lince, bez zalomení řádku):
   ```text
   ip=192.168.0.200:192.168.0.1:192.168.0.1:255.255.255.0 fsck.repair=yes waitusb=10
   ```
   * **`ip=...`** – Přidělí systému pevnou IP adresu `192.168.0.200`.
   * **`fsck.repair=yes`** – Automaticky opraví soubory při startu, pokud dojde k výpadku proudu.
   * **`waitusb=10`** – Počká 10 sekund, než se po startu připojí a roztočí externí USB disk.
5. Soubor uložte (`Ctrl + S`) a zavřete.

### 2. Okamžité vypnutí Wi-Fi a Bluetooth (Nejnižší HW úroveň)
Aby Wi-Fi vůbec po startu nenabíhala a nerušila kabelové připojení:
1. Na SD kartě vyhledejte a otevřete soubor **`config.txt`** v Poznámkovém bloku.
2. Sjeďte úplně na konec souboru a na **nový řádek** přidejte tyto příkazy:
   ```text
   # Vypnuti integrovane Wi-Fi a Bluetooth po startu
   dtoverlay=disable-wifi
   dtoverlay=disable-bt
   ```
3. Soubor uložte a zavřete.

---

## ČÁST 2: První spuštění a správa přes SSH / Web

1. Vyjměte SD kartu z PC, vložte ji do vypnutého Raspberry Pi.
2. Připojte k Raspberry Pi **síťový kabel (LAN)**, externí **USB disk s hudbou** a váš **zvukový DAC**.
3. Připojte napájení. Počkejte cca 1 minutu.

### 1. Kontrola a vypnutí Wi-Fi přes Příkazovou řádku (SSH)
Pokud preferujete příkazovou řádku, můžete stav Wi-Fi spravovat přímo odtud:
1. Ve Windows stiskněte `Win + R`, napište `cmd` a potvrďte (nebo otevřete program PuTTY).
2. Přihlaste se příkazem: `ssh tc@192.168.0.200` (výchozí heslo je **`piCore`**).
3. Pro jistotu zadejte příkaz pro vypnutí bezdrátových modulů:
   ```bash
   pcp wlan off
   pcp bt off
   pcp backup
   ```

### 2. Nastavení zvukového výstupu (DAC) přes Web
Otevřete prohlížeč na adrese **`http://192.168.0.200`**, sjeďte dolů a zapněte režim **Advanced**.
1. Přepněte se na horní záložku **Squeezelite**.
2. Najděte položku **Audio output device**.
3. V rozevíracím seznamu vyberte váš připojený DAC:
   * Pokud máte *USB DAC*, zvolte možnost obsahující text `USB Audio`.
   * Pokud máte *DAC klobouk (I2S)*, musíte nejprve níže v sekci *Card Type* vybrat přesnou značku (např. HiFiBerry DAC), uložit, restartovat systém a poté jej vybrat jako výstupní zařízení.

### 3. Ochrana SD karty před opotřebením (Přesun Cache na USB)
Lyrion (LMS) neustále zapisuje hudební databázi. Přesuneme tyto zápisy na USB disk, aby SD karta vydržela roky bez záseků.
1. Přepněte se na záložku **LMS**.
2. Vyhledejte nastavení cest pro **LMS Cache** a **LMS Logs**.
3. Změňte výchozí cestu z SD karty na váš připojený USB disk (např. do složky `/mnt/sda1/lms_cache`).
4. Přepněte se na záložku **Tweaks**, najděte položku *Auto-backup* a ujistěte se, že je nastavena na **Disabled** (vypnuto).

---

## ČÁST 3: Konfigurace hudebního serveru Lyrion (LMS)

Do administrace hudebního serveru vstoupíte zadáním adresy: **`http://192.168.0.200:9000`**.

### 1. První průvodce a hudební knihovna
* Nasměrujte průvodce do adresáře vašeho USB disku (složka začíná `/mnt/...`).
* V *Nastavení (Settings) -> Hudební knihovna (Library)* zaškrtněte možnost **Skenovat při startu**. Lyrion při každém zapnutí automaticky projde USB disk a přidá nové skladby.

### 2. Vypnutí zbytečného logování (Zrychlení systému)
1. Jděte do *Nastavení (Settings) -> Rozšířené (Advanced) -> Protokolování (Logging)*.
2. U všech procesů změňte úroveň záznamu z hodnot „Info“ nebo „Debug“ na **Error** nebo **Critical**. Systém přestane neustále zapisovat nepodstatné protokoly na disk.

### 3. Instalace doplňků pro Rádia a Google Nest
1. V pravém dolním rohu klikněte na **Nastavení (Settings)** a přepněte se na záložku **Doplňky (Plugins)**.
2. **Česká a světová rádia:** Zkontrolujte, zda máte zaškrtnutý plugin **TuneIn Radio** nebo vyhledejte **Radio Paradise**.
3. **Google Nest (Chromecast):** Sjeďte dolů do sekce doplňků třetích stran. Vyhledejte a zaškrtněte plugin **Google Cast** (případně *CastBridge*). Tento plugin zajistí, že z Lyrionu můžete streamovat hudbu přímo do reproduktorů Google Nest ve vaší siťové domácnosti.
4. Klikněte na tlačítko **Použít (Apply)** vpravo dole a potvrďte restart Lyrionu na obrazovce.

### 4. Aktivace a nastavení YouTube
Google vyžaduje pro provoz YouTube na externích zařízeních bezplatný vývojářský klíč.

#### Krok A: Získání klíče (na PC)
1. Otevřete v prohlížeči **Google Cloud Console** (://google.com) a přihlaste se k Gmailu.
2. Vytvořte nový projekt (tlačítko *New Project* nahoře), pojmenujte jej např. `MojeLMS`.
3. V horním vyhledávání najděte **YouTube Data API v3** a klikněte na modré tlačítko **Povolit (Enable)**.
4. V levém menu klikněte na **Přihlašovací údaje (Credentials)** -> nahoře na **+ Vytvořit přihlašovací údaje (+ Create Credentials)** -> zvolte **Klíč API (API key)**.
5. Vygenerovaný dlouhý řetězec znaků si zkopírujte.

#### Krok B: Vložení klíče do Lyrionu
1. V rozhraní Lyrionu (`192.168.0.200:9000`) přejděte do *Nastavení -> Doplňky*.
2. Najděte aktivovaný plugin **YouTube** a klikněte vedle něj na **Nastavení (Settings)**.
3. Vložte zkopírovaný kód do kolonky **YouTube API access key**.
4. Níže v nastavení zkontrolujte, že položka *YT-dlp url extractor* je nastavena na možnost **yt-dlp** (zaručuje plynulé přehrávání bez záseků).
5. Klikněte na **Použít (Apply)**.

---

## ČÁST 4: Životně důležitý krok – Ruční záloha systému

Protože piCorePlayer běží v operační paměti RAM, jakékoliv změny provedené ve webovém rozhraní nebo přes SSH se při odpojení od proudu smažou, pokud je neuložíte trvale na SD kartu.

1. Vraťte se do základní administrace na adresu **`http://192.168.0.200`** (nebo v SSH zadejte `pcp backup`).
2. Na hlavní kartě **Main Page** klikněte na velké tlačítko **Backup**.
3. Počkejte cca 10 sekund na potvrzení úspěšného zápisu.

---

## ČÁST 5: Jak vytvořit záložní kopii pro případ havárie

### Metoda A: Záloha konfiguračního souboru přes Windows
1. Vložte SD kartu do PC s Windows.
2. Otevřete složku **`tce/`** na SD kartě a zkopírujte soubor **`mydata.tgz`** (zde jsou uložena veškerá nastavení, klíče a pluginy).
3. Z kořenového adresáře si zkopírujte také soubory **`cmdline.txt`** a **`config.txt`** (obsahují IP adresu a HW zákazy pro Wi-Fi).
4. **Obnova:** Při problémech stačí tyto tři soubory ze zálohy vzít a přepsat jimi ty původní na nové SD kartě.

### Metoda B: Kompletní bitový otisk (Program USBImager)
1. Vložte SD kartu do PC, otevřete USBImager a klikněte na **Read** (Číst). Program uloží kompletní obraz vaší 32GB karty (soubor `.img`) do PC.
2. **Obnova:** Pokud karta selže, vložíte novou prázdnou kartu do PC, v USBImageru vyberete uložený `.img` soubor, kliknete na **Write** (Zapsat) a během minuty máte identicky nastavený systém.
