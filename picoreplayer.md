Instalace piCorePlayeru (pCP) je ve srovnání s DietPi osvěžující v tom, že nemusíš do terminálu. Vše se ovládá přes webový prohlížeč. Na tvém Raspberry Pi 3 B+ to poletí jako blesk.

Zde je přesný postup a seznam věcí, které budeš muset vyřešit:
1. Co budeš muset řešit (Příprava)

Než začneš, připrav si tyto věci, ať se nezasekneš:

    SD karta: Stačí ti bohatě 4 GB nebo 8 GB (systém je malinký).

    IP adresa: Musíš vědět, jak se podívat do routeru, jakou adresu tvoje Pi dostalo (nebo použít http://picoreplayer.local).

    YouTube API Key: Ten si vygeneruj v Google Cloud Console. Potřebuješ jen ten jeden dlouhý řetězec znaků (API Key). OAuth (přihlašování) tentokrát vynech, ušetříš si 90 % nervů.

2. Krok za krokem: Instalace
Krok A: Flashování karty

    Stáhni si piCorePlayer 9.x (32-bit) (pro RPi 3 B+ je 32-bit jistota stability).

    Použij Raspberry Pi Imager nebo BalenaEtcher a nahraj image na kartu.

    Tip: Pokud chceš rovnou nastavit Wi-Fi, vytvoř na kartě prázdný soubor wpa_supplicant.conf s tvými údaji (ale kabel je pro server vždycky lepší).

Krok B: První spuštění a nastavení LMS

    Vlož kartu do Pi a zapni ho. Počkej asi 2 minuty.

    Do prohlížeče v PC napiš IP adresu tvého Pi (např. 192.168.1.50).

    Uvidíš rozhraní pCP. Jdi na záložku LMS.

    Klikni na tlačítko Install LMS. Chvíli to potrvá (stahuje se balíček).

    Jakmile je hotovo, klikni na Start LMS.

    Poté klikni na tlačítko Switch to LMS Web Interface (otevře se nové okno na portu 9000).

Krok C: Instalace "vylepšováků" (Material Skin a YouTube)

Tohle je ta nejdůležitější část pro tvůj komfort:

    V LMS klikni vpravo dole na Settings -> záložka Plugins.

    Najdi a zaškrtni Material Skin.

    Najdi a zaškrtni YouTube (od Michaela Hergera).

    Klikni na Apply (LMS se restartuje).

    Teď do prohlížeče zadej http://IP_ADRESA:9000/material/ – a rázem máš moderní, krásné prostředí.

Krok D: Nastavení YouTube API

    V tom novém Material rozhraní jdi do Settings (Ozubené kolečko) -> Player settings -> Server -> Plugins.

    U pluginu YouTube klikni na Settings.

    Najdi pole YouTube API Key a vlož tam svůj kód od Googlu.

    Ulož to.

3. Na co si dát pozor (Záludnosti pCP)

pCP má jednu specifickou věc, která lidi z DietPi mate:

    Zálohování (Backup): pCP běží v RAM. To znamená, že když něco změníš v nastavení samotného piCorePlayeru (třeba jméno sítě nebo zvukovou kartu), musíš v záložce "Main Page" kliknout na Backup. Jinak se po restartu nastavení vrátí do původního stavu.

        Poznámka: Nastavení uvnitř LMS (playlisty, pluginy) se ukládá na kartu automaticky, to zálohovat ručně nemusíš.

    Vypínání: Můžeš ho prostě vytáhnout ze zásuvky. To je ta největší krása.
    
    --------------------------

    Nastavení statické (vlastní) IP adresy přímo v piCorePlayeru je rozumný krok – nechceš, aby se ti adresa po každém restartu routeru změnila a ty jsi musel znovu hledat, kde máš ovládání.

Máš dvě možnosti, jak to udělat. Doporučuji tu první (v pCP), ale zmíním i tu druhou (v routeru).
Metoda 1: Nastavení přímo v rozhraní piCorePlayer

Tento postup uděláš ve webovém prohlížeči poté, co se do pCP poprvé přihlásíš (přes tu automaticky přidělenou adresu).

    V horním menu klikni na záložku Network.

    Sjeď dolů k sekci Interface Setup (u tvého RPi 3 B+ to bude pravděpodobně eth0 pro kabel nebo wlan0 pro Wi-Fi).

    Uvidíš tam položku IP Address Configuration. Přepni ji z "DHCP" na "Static".

    Nyní vyplň následující pole:

        IP Address: Zadej svou vysněnou adresu (např. 192.168.1.50). Pozor: Musí být ze stejného rozsahu jako tvůj router.

        Subnet Mask: Obvykle 255.255.255.0.

        Gateway: Adresa tvého routeru (např. 192.168.1.1).

        DNS Server: Můžeš dát znovu adresu routeru nebo Google DNS: 8.8.8.8.

    Klikni na tlačítko Save.

    DŮLEŽITÉ: pCP tě teď vyzve k restartu. Po restartu už se na starou adresu nedostaneš – musíš do prohlížeče zadat tu novou, kterou jsi právě nastavil.

Metoda 2: Rezervace v routeru (Často lepší volba)

Většina lidí dnes dává přednost tomuto řešení. Necháš pCP nastavený na DHCP, ale v nastavení svého routeru (sekce LAN/DHCP) řekneš: "Tomuto zařízení (podle MAC adresy) dávej vždycky adresu 192.168.1.50".

    Výhoda: Pokud pCP přeneseš k jinému routeru (třeba ke kamarádovi), normálně se připojí. Pokud nastavíš statickou IP "natvrdo" v pCP a pak změníš router, může se stát, že se do něj vůbec nedostaneš.

Na co si dát pozor u piCorePlayeru?

Jak už jsem zmiňoval, pCP běží v RAM. Pokud změníš nastavení v záložce Network, systém si to většinou zapamatuje do konfiguračního souboru, ale pro jistotu:

    Zlaté pravidlo pCP: Po jakékoliv důležité změně v systému (IP adresa, Wi-Fi, zvuková karta) jděte na záložku Main Page a klikněte na velké tlačítko Backup. Tím se změny zapíšou na SD kartu a přežijí i vytažení ze zásuvky.

    ----------------------------------

    Nastavení YouTube v piCorePlayeru (respektive v LMS) je jediný moment, kdy se trochu zapotíš, ale pokud vynecháš to složité přihlašování k účtu (OAuth), je to v podstatě jen o vložení jednoho klíče.

Tady je postup, jak to udělat „na pohodu“:
1. Získání YouTube API klíče (Ten nejdůležitější kousek)

Bez vlastního klíče ti vyhledávání pravděpodobně brzy napíše chybu „403 Forbidden“.

    Jdi na Google Cloud Console.

    Vytvoř si nový projekt (pojmenuj ho třeba „MojeMalina“).

    V menu (vlevo nahoře) najdi APIs & Services -> Library.

    Vyhledej YouTube Data API v3 a klikni na Enable (Povolit).

    Pak jdi na záložku Credentials (Pověření), klikni na + CREATE CREDENTIALS a vyber API Key.

    Tenhle dlouhý kód si zkopíruj.

2. Aktivace pluginu v LMS

    Otevři webové rozhraní tvého serveru (např. http://192.168.1.50:9000).

    Klikni na Settings (vpravo dole) -> záložka Plugins.

    V seznamu „Third Party Plugins“ najdi YouTube (autor Michael Herger). Zaškrtni ho.

    Klikni na Apply vpravo dole. LMS se restartuje.

3. Vložení klíče do nastavení

Jakmile se LMS znovu načte:

    Znovu jdi do Settings -> záložka Plugins.

    Teď už uvidíš YouTube v horní sekci „Active plugins“. Klikni vedle něj na Settings.

    Najdi pole s názvem YouTube API Key.

    Vlož tam ten kód, co jsi si zkopíruj od Googlu.

    Sjeď úplně dolů a klikni na Apply nebo Save.

4. Jak se vyhnout "hororu" s přihlašováním (Odběry)

V nastavení uvidíš i položku "Sign in to YouTube" nebo "Enable Personalization".

    Moje rada: Pokud nutně nepotřebuješ vidět svoje soukromé playlisty, neklikej na to.

    Právě tohle vyžaduje to složité nastavování OAuth 2.0, které ti v DietPi padalo.

    Pro hledání jakékoliv hudby na světě ti stačí jen ten API klíč z kroku 3.

5. Jak to vypadá v praxi?

Až to nastavíš, doporučuji přepnout na rozhraní Material Skin (pokud jsi ho nainstaloval podle předchozího kroku):

    Otevři v prohlížeči: http://IP_ADRESA:9000/material/.

    V levém sloupci uvidíš ikonu YouTube.

    Klikni na ni a uvidíš řádek Search.

    Napiš jméno interpreta a hned se ti vysypou výsledky.

Důležitý tip pro zvuk:

V nastavení YouTube pluginu (tam, kam jsi vkládal API klíč) je také volba "Video Quality / Bitrate".

    Nastav tam "Audio only (highest quality)".

    Tím zajistíš, že tvoje RPi 3 B+ nebude zbytečně stahovat obrazová data, ale vytáhne si z YouTube ten nejlepší zvuk (často v AAC nebo Opus formátu).

Máš už ten API klíč vygenerovaný, nebo se v tom Google rozhraní někde zasekl? (Je to trochu bludiště, klidně se ptej).
