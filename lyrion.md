-----------------
# piCorePlayer (pCP)
-----------------


[piCorePlayer  pCP](https://lyrion.org/players-and-controllers/picoreplayer/)

# cmdline.txt

```
dwc_otg.fiq_fsm_mask=0xF host=pCP dwc_otg.lpm_enable=0 console=tty1 root=/dev/ram0 rootwait quiet nortc loglevel=3 noembed smsc95xx.turbo_mode=N noswap consoleblank=0 waitusb=2 ip=192.168.0.200:192.168.0.1:192.168.0.1:255.255.255.0 fsck.repair=yes waitusb=10

```


# Kompletní příručka pro nastavení piCorePlayer & Lyrion (LMS)
Tento manuál vás provede čistou instalací, síťovou konfigurací na IP 192.168.0.200, aktivací USB disku, nastavením zvukového DAC, instalací pluginů (YouTube, Google Nest, CZ Rádia) a finálním zabezpečením proti výpadkům proudu.

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

### 2. (Volitelné) Nastavení Wi-Fi před startem
Pokud nebudete připojeni síťovým kabelem, ale přes Wi-Fi:
1. Na SD kartě vyhledejte soubor **`wpa_supplicant.conf.sample`**.
2. Přejmenujte jej na **`wpa_supplicant.conf`**.
3. Otevřete jej v Poznámkovém bloku a v sekci `network={ ... }` upravte parametry:
   * `ssid="Název vaší domácí Wi-Fi"`
   * `psk="Vaše heslo do Wi-Fi"`
4. Soubor uložte a zavřete.

---

## ČÁST 2: První spuštění a nastavení piCorePlayeru

1. Vyjměte SD kartu z PC, vložte ji do vypnutého Raspberry Pi.
2. Připojte k Raspberry Pi váš **externí USB disk s hudbou** a váš **zvukový DAC**.
3. Připojte napájení. Počkejte cca 1 minutu, než systém poprvé nastartuje.
4. Na počítači otevřete webový prohlížeč a zadejte adresu: **`http://192.168.0.200`**.

### 1. Aktivace rozšířeného režimu
* Na úvodní stránce sjeďte úplně dolů a klikněte na tlačítko **Advanced** (nebo Beta). Tím se zpřístupní detailní nastavení hardwaru.

### 2. Nastavení zvukového výstupu (DAC)
1. Přepněte se na horní záložku **Squeezelite**.
2. Najděte položku **Audio output device**.
3. V rozevíracím seznamu vyberte váš připojený DAC:
   * Pokud máte *USB DAC*, zvolte možnost obsahující text `USB Audio`.
   * Pokud máte *DAC klobouk* (I2S nasazený na desce), musíte nejprve níže v sekci *Card Type* vybrat přesnou značku (např. HiFiBerry DAC), uložit, restartovat systém a poté jej vybrat jako výstupní zařízení.

### 3. Ochrana SD karty před opotřebením (Přesun Cache na USB)
Lyrion (LMS) neustále zapisuje hudební databázi. Přesuneme tyto zápisy na USB disk, aby SD karta vydržela roky bez záseků.
1. Přepněte se na záložku **LMS**.
2. Vyhledejte nastavení cest pro **LMS Cache** a **LMS Logs**.
3. Změňte výchozí cestu z SD karty na váš připojený USB disk (např. do složky `/mnt/sda1/lms_cache`).
4. Přepněte se na záložku **Tweaks**, najděte položku *Auto-backup* a ujistěte se, že je nastavena na **Disabled** (vypnuto) – systém nekoná zbytečné zápisy.

---

## ČÁST 3: Konfigurace hudebního serveru Lyrion (LMS)

Do administrace hudebního serveru vstoupíte zadáním adresy: **`http://192.168.0.200:9000`**.

### 1. První průvodce a hudební knihovna
* Při prvním startu vás průvodce vyzve k určení složky s hudbou. Nasměrujte ho do adresáře vašeho USB disku (složka začíná `/mnt/...`).
* V *Nastavení (Settings) -> Hudební knihovna (Library)* zaškrtněte možnost **Skenovat při startu**. Lyrion při každém zapnutí automaticky projde USB disk a přidá nové skladby.

### 2. Vypnutí zbytečného logování (Zrychlení systému)
1. Jděte do *Nastavení (Settings) -> Rozšířené (Advanced) -> Protokolování (Logging)*.
2. U všech procesů změňte úroveň záznamu z hodnot „Info“ nebo „Debug“ na **Error** nebo **Critical**. Systém přestane neustále zapisovat nepodstatné protokoly na disk.

### 3. Instalace doplňků pro Rádia a Google Nest
1. V pravém dolním rohu klikněte na **Nastavení (Settings)** a přepněte se na záložku **Doplňky (Plugins)**.
2. **Česká a světová rádia:** Zkontrolujte, zda máte zaškrtnutý plugin **TuneIn Radio** nebo vyhledejte **Radio Paradise**.
3. **Google Nest (Chromecast):** Sjeďte dolů do sekce doplňků třetích stran. Vyhledejte a zaškrtněte plugin **Google Cast** (případně *CastBridge*). Tento plugin zajistí, že z Lyrionu můžete streamovat hudbu přímo do reproduktorů Google Nest ve vaší síti.
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

Protože piCorePlayer běží v operační paměti RAM, jakékoliv změny provedené ve webovém rozhraní (hesla, pluginy, nastavení DAC) se při odpojení od proudu smažou, pokud je neuložíte trvale na SD kartu.

1. Vraťte se do základní administrace na adresu **`http://192.168.0.200`**.
2. Na hlavní kartě **Main Page** klikněte na velké tlačítko **Backup**.
3. Počkejte cca 10 sekund, než systém napíše, že záloha na SD kartu proběhla úspěšně.

---

## ČÁST 5: Jak vytvořit záložní kopii pro případ havárie

Kdykoliv se systém poškodí, nebo budete chtít konfiguraci přenést na novou SD kartu, využijte tyto metody:

### Metoda A: Záloha konfiguračního souboru (Rychlá)
1. Vložte SD kartu do PC s Windows.
2. Otevřete složku **`tce/`** na SD kartě.
3. Najděte soubor **`mydata.tgz`** (zde jsou uložena veškerá nastavení a pluginy).
4. Tento soubor, společně se souborem **`cmdline.txt`** z kořenového adresáře, si zkopírujte do bezpečné složky v počítači, nebo do nově vytvořené složky na konci téže SD karty (např. `ZALOHA_SYSTEMU`).
5. **Obnova:** Při problémech stačí tyto dva soubory ze zálohy vzít a přepsat jimi ty původní na SD kartě.

### Metoda B: Kompletní bitový otisk (Stoprocentní jistota)
1. Stáhněte si do Windows malý bezplatný program **USBImager**.
2. Vložte SD kartu do PC, otevřete USBImager a klikněte na **Read** (Číst). Program uloží kompletní obraz vaší 32GB karty (soubor `.img`) do PC.
3. **Obnova:** Pokud karta selže, vložíte novou prázdnou kartu do PC, v USBImageru vyberete uložený `.img` soubor, kliknete na **Write** (Zapsat) a během minuty máte identicky nastavený systém bez nutnosti cokoliv klikat znovu.
