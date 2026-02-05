---
layout: default
title: Cleamen
---



# Torrent

[Torrent soubory](https://www.dropbox.com/scl/fo/w3x5naidjcghoyhwep3wn/AGoYubQUkgXLRpw30je_hcY?rlkey=pmpgz4soem6w0a59bmspkx8x4&st=59cq3h6d&dl=0)

# Torrent klienti

winget install Deluge.Deluge

winget install qBittorrent.qBittorrent

winget install Transmission.Transmission

winget install PicoTorrent.PicoTorrent

# Ostatní programy

winget install M2Team.NanaZip

winget install Microsoft.PowerToys

winget install FilesCommunity.Files

winget install DropIt.DropIt


# Windows 11 čištění

winget install OandO.ShutUp10

irm christitus.com/win | iex

winget install Win11Debloat

# Kamery 

Pokud hledáte opensource řešení pro Windows 11, které kombinuje FTP server, správu kamer a automatický převod obrazu na klasické formáty, mám pro vás dva jasné vítěze.
1. Agent DVR (Doporučeno)

I když má placené cloudové funkce, jeho jádro je pro lokální použití zdarma a je to v současnosti nejmodernější nástroj.

    Jak to funguje: Program v sobě má zabudovaný vlastní server. Umí přijímat soubory i přímý stream z kamer.

    Převod: Vše ukládá rovnou do standardního MP4 a umí generovat JPG snímky v pravidelných intervalech.

    FTP: Umí fungovat jako cíl pro vaše kamery.

    Webové rozhraní: Má skvělé opensource rozhraní, které běží v prohlížeči (vypadá to jako profesionální dispečink).

    Odkaz: ispyconnect.com

2. FileZilla Server + FFmpeg (Skládačka pro úplnou kontrolu)

Toto je "nejčistší" opensource cesta, pokud chcete pouze ten FTP přenos a převod.

Krok 1: FTP Server Nainstalujte FileZilla Server (opensource). Je mnohem jednodušší a bezpečnější než vestavěné FTP ve Windows. V něm vytvoříte uživatele pro kameru a určíte složku (např. C:\Monitoring).

Krok 2: Automatický převod (FFmpeg) Aby se soubory z kamery (často surové .h264 nebo .mkv) staly čitelnými videi pro váš informační panel, použijte FFmpeg.

Můžete použít tento jednoduchý opensource skript (Batch), který stačí nechat běžet:
Fragment kódu

:loop
for %%i in (C:\Monitoring\*.h264) do (
    ffmpeg -i "%%i" -c copy "C:\Monitoring\Hotovo\%%~ni.mp4"
    del "%%i"
)
timeout /t 30
goto loop

(Tento skript každých 30 vteřin zkontroluje složku, převede nové video na MP4 a původní smaže.)
3. Home Assistant (Nejlepší pro Info Panely)

Pokud to s tím informačním panelem myslíte vážně, doporučuji nainstalovat Home Assistant (lze i na Windows přes VirtualBox nebo Docker).

    Je to největší opensource platforma pro domácí automatizaci.

    Má integraci pro tisíce kamer.

    Umí vše: Přijme obraz z kamery, převede ho, a rovnou vám vytvoří ten informační panel, o kterém jsme mluvili na začátku (včetně času, počasí a ovládání domácnosti).

Moje doporučení:

Pokud chcete jedno kliknutí a hotovo, stáhněte si Agent DVR. Je to robustní, opensource (komunitní verze) a ušetří vám to hodiny nastavování skriptů.

Chcete, abych vám pomohl sepsat přesný postup, jak v Agent DVR nastavit, aby vám ukládal fotky pro ten váš informační panel?
