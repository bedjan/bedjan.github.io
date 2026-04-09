# Dietpi

Jakmile malinu s diskem poprvé zapneš, proběhne automatická instalace (uvidíš na obrazovce hodně textu, to je v pořádku). Až se to zastaví a bude to chtít jméno a heslo, postupuj takto:
1. První přihlášení

    Login: root
    Heslo: dietpi
    Poté se tě to zeptá na licenci (potvrď) a nabídne ti to změnu hesla (můžeš nechat stejné nebo změnit).
    Proběhne finální aktualizace a malina se nejspíš restartuje.

2. Výběr programů (Kodi a FTP)
Po restartu a dalším přihlášení se objeví menu DietPi-Launcher. Vyber v něm:

    Software Optimized:
        Sjeď v seznamu dolů a najdi 31 Kodi (označ mezerníkem).
        Najdi 123 ProFTPD (označ mezerníkem – to je tvůj FTP server).
        (Volitelně) Najdi 113 Spotify Connect.
        Potvrď tlačítkem OK dole.
    Zpět v hlavním menu vyber dole Install (tím se vše začne stahovat a instalovat).

3. Nastavení, aby to samo naběhlo do Kodi
Až instalace skončí, vrať se do hlavního menu (nebo napiš dietpi-config) a udělej toto:

    Vyber Auto-Start Options.
    Zvol Kodi.
    Ulož a zvol Reboot (restart).

4. Pevná IP adresa

přes dietpi-config

Co se stane pak?
Malina se restartuje a místo textu na tebe na televizi rovnou vyskočí barevné grafické menu Kodi. Od té chvíle už nepotřebuješ klávesnici (pokud máš TV s ovladačem, co podporuje CEC).
Jak tam dostaneš soubory přes FTP?
Vezmi svůj notebook nebo druhý počítač, který je na stejné Wi-Fi/síti:

    Stáhni si program FileZilla (nebo jakýkoliv FTP klient).
    Jako adresu (Host) napiš IP adresu tvé maliny (uvidíš ji v Kodi v nastavení sítě nebo v menu DietPi při startu).
    Jméno: root, Heslo: dietpi (nebo to, co jsi zvolil).
    A je to! Můžeš na ten 250GB disk sypat filmy z počítače.

------------


------------


V Kodi to funguje podobně jako vypínání počítače. Máte dvě cesty, jak se dostat „zpět“ k systému (do té textové řádky nebo menu DietPi):
1. Ukončení Kodi (přes menu)

    V hlavním menu Kodi klikněte na ikonu Vypnout (Power button).
    Zvolte možnost Ukončit (Exit / Quit).
    Pokud nemáte nastavený automatický restart Kodi, objeví se černá obrazovka s blikajícím kurzorem a nápisem login:.
    Zadejte jméno root a heslo dietpi. Tím jste zpět v systému.

2. Vzdálený přístup (Nejpohodlnější)
Vůbec nemusíte Kodi vypínat, abyste mohli v systému cokoli nastavovat. To je největší výhoda Linuxu:

    Nechte Kodi běžet na televizi (třeba i s puštěným filmem).
    Na svém notebooku nebo mobilu si otevřete Terminál (na Windows program PuTTY nebo jen příkazový řádek).
    Napište: ssh root@IP_ADRESA_MALINY (heslo je dietpi).
    Jste v systému „uvnitř“, zatímco na televizi se dál hýbe Kodi. Můžete instalovat programy, nastavovat FTP nebo disk a Kodi to nijak neovlivní.

3. Nouzová cesta (Klávesnice)
Pokud se Kodi „sekne“ nebo se nemůžete dostat k menu:

    Stiskněte na připojené klávesnici Ctrl + Alt + F2.
    To vás přepne do druhého terminálu (černá obrazovka), kde se můžete přihlásit a systém ovládat, i když Kodi na pozadí dál běží.

   -----------------


   -----------------

   Instalace v DietPi přes SSH je extrémně jednoduchá, protože systém má pro všechno své vlastní „zkratky“, které ti ušetří psaní dlouhých příkazů.
Máš dvě možnosti, jak to udělat:
1. Pohodlná cesta přes menu (Doporučuji)
Když jsi přihlášený přes SSH, napiš tento příkaz:
bash

dietpi-software

Při použití kódu buďte obezřetní.
Otevře se ti to samé modré menu, které jsi viděl při první instalaci.

    Vyber Browse Software.
    Najdi program, který chceš (třeba ten Transmission pro torrenty nebo další servery).
    Označ ho mezerníkem, dej OK a zvol Install.
    DietPi se postará o veškeré závislosti a nastavení za tebe.

2. Rychlá cesta (Přímo z příkazové řádky)
Pokud přesně víš, co chceš, a nechceš se proklikávat menu, DietPi má na to rychlý příkaz:
bash

dietpi-software install [ID-programu]

Při použití kódu buďte obezřetní.
(Například pro FTP server ProFTPD je to dietpi-software install 123).
3. Klasická linuxová cesta
Protože DietPi vychází z Debianu, funguje i klasický způsob, na který jsi zvyklý z jiných Linuxů:
bash

apt update
apt install [název-balíčku]

Při použití kódu buďte obezřetní.
Pozor: Tento způsob používej jen pro menší utility (třeba htop, nano, git). Velké věci jako Kodi nebo servery instaluj raději přes to DietPi menu, protože tam jsou už přednastavené pro výkon Raspberry Pi.
Tři příkazy, které se ti v SSH budou hodit nejvíc:

    dietpi-launcher – Rozcestník ke všemu (nastavení, software, aktualizace).
    dietpi-config – Nastavení hardwaru, sítě, zvuku a disků.
    htop – Ukáže ti přehledně, jak moc je zatížený procesor a kolik RAM žere Kodi (vypneš ho klávesou F10 nebo q).

----------------------
Instalace software
----------------------

    dietpi-software install 31 123 113 91

---------------------
V kodi
--------------------

YTMDesktop / YouTube doplňky: Pokud chceš pouštět hudbu z YouTube, doporučuji v Kodi (které ti poběží na pozadí) nainstalovat doplněk YouTube Music. Ten je dělaný přímo na písničky.
