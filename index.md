---
layout: default
title: Osobní stránky
---

<style>
body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    line-height: 1.5;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    background-color: #f4f7f9;
    color: #1a1a1b;
}

h1 { text-align: center; margin-bottom: 30px; }
h1 a { color: #007bff; text-decoration: none; font-weight: 800; border-bottom: 2px solid transparent; transition: 0.3s; }
h1 a:hover { border-bottom-color: #007bff; }

details {
    background: #fff;
    margin-bottom: 10px;
    border-radius: 10px;
    border: 1px solid #e1e4e8;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    overflow: hidden;
}

summary {
    padding: 12px 20px;
    font-weight: 600;
    cursor: pointer;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
}

summary:hover { background: #f8f9fa; }
summary::after { content: '▼'; font-size: 0.8em; color: #aaa; transition: 0.3s; }
details[open] summary::after { transform: rotate(180deg); }

.links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 8px;
    padding: 15px 20px 20px;
    background: #ffffff;
    border-top: 1px solid #f0f0f0;
}

.links-grid a {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 5px;
    background: #fdfdfd;
    border: 1px solid #eee;
    border-radius: 6px;
    text-decoration: none;
    color: #444;
    font-size: 0.82em;
    text-align: center;
    min-height: 42px;
    transition: all 0.2s;
}

.links-grid a:hover {
    background: #007bff;
    color: #fff;
    border-color: #007bff;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.subject-heading {
    grid-column: 1 / -1;
    margin: 15px 0 5px;
    font-size: 0.95rem;
    color: #d35400;
    border-bottom: 1px solid #eee;
    padding-bottom: 3px;
}

@media (max-width: 600px) {
    .links-grid { grid-template-columns: 1fr 1fr; padding: 10px; }
    body { padding: 10px; }
}
</style>

<base target="_blank">

# [Osobní stránky](https://github.com/bedjan/bedjan.github.io/blob/main/index.html)
<details open>
<summary>Škola</summary>
<div class="links-grid">
    <a href="https://github.com/bedjan/ucitel/blob/main/rozvrh.md">Rozvrh</a>
    <a href="https://portal.ujep.cz">Stag</a>
    <a href="https://ccv.pf.ujep.cz/kontakty/">Kontakty</a>
    <a href="https://portal.ujep.cz/portal/studium/uchazec/eprihlaska.html">Epřihláška ke studiu</a>
    <a href="http://spcul.atwebpages.com/">SPC UL web</a>
    <a href="https://github.com/bedjan/ucitel">Ucitel</a>
    <a href="https://markdowntohtml.com/">Markdown to html</a>
</div>
</details>

<details>
<summary>Oblíbené</summary>
<div class="links-grid">
    <a href="investice.html">Investice</a>
    <a href="https://app.simplenote.com/">Simplenote</a>
    <a href="https://wttr.in/duchcov">Počasí</a>
    <a href="https://calendar.google.com/calendar/u/0/r?opentasks=1">Tasks</a>
    <a href="https://app.raindrop.io/account/login">Raindrop.io</a>
    <a href="https://uiwjs.github.io/react-md-editor/">Markdown editor</a>
    <a href="https://vault.bitwarden.com/#/vault">Bitwarden</a>
    <a href="http://free-website-translation.com/">Web prekladac</a>
    <a href="https://hackmd.io/?nav=overview">Hackmd</a>
    <a href="https://lastpass.com/?ac=1">Lastpass</a>
    <a href="https://mail.google.com/mail/u/0/#inbox">Gmail</a>
    <a href="https://keep.google.com/#home">Gkeep</a>
    <a href="https://web.whatsapp.com/">Whatsapp</a>
    <a href="https://translate.google.cz/">Gtranslate</a>
    <a href="https://www.facebook.com/">Facebook</a>
    <a href="https://www.instagram.com/">Instagram</a>
    <a href="https://www.youtube.com/">Youtube</a>
    <a href="https://uloz.to">Uloz.to</a>
    <a href="https://prehraj.to/">Prehraj.to</a>
    <a href="https://www.csfd.cz/">Čsfd</a>
    <a href="https://nfa.cz/cz/obchod-a-distribuce/distribuce-v-cr/filmy-do-1964/">Filmy nfa</a>
    <a href="https://uloz.to/folder/dFY1yYQFavz0/name/Yperit-Paradise">Filmy stazeni</a>
    <a href="https://github.com/bedjan/openbox">Openbox</a>
    <a href="https://www.onlineocr.net/">OCR</a>
    <a href="https://vyzivujicitradice.cz/">Zdrava vyziva</a>
    <a href="https://ceskepodcasty.cz/">Podcasty</a>
    <a href="https://lindat.mff.cuni.cz/services/translation/">Matfyz prekladac</a>
    <a href="https://lindat.cz/translation/">Ukrajinsky prekladac</a>
    <a href="https://www.postaonline.cz/trackandtrace">Posta sledovani</a>
    <a href="https://claude.ai/">Claude AI</a>
    <a href="https://www.sledujserialy.io">Sleduj serialy</a>
</div>
</details>

<details>
<summary>TV</summary>
<div class="links-grid">
    <a href="https://rdy.cz/tv">Zkracene tv</a>
    <a href="https://mrkaj.si/">Mrkaj si</a>
    <a href="https://uzi.si/">Uzi si</a>
    <a href="https://www.bombuj.si/">Bombuj</a>
    <a href="https://filmyzadara.cz/">Filmová zadara</a>
    <a href="https://tv.prehraj.me/cs/">Přehraj to</a>
    <a href="https://www.najserialy.io/">Nejseriály</a>
    <a href="https://sledovanitv.cz/">Sledování TV</a>
    <a href="https://www.ivysilani.cz/">Ivysilani</a>
    <a href="https://tv.sosac.tv/cs/">Sosac</a>
</div>
</details>

<details>
<summary>Rádiové Streamy</summary>
<div class="links-grid">
    <a href="https://stream.rcs.revma.com/asn0cmvb938uv">Kiss</a>
    <a href="http://ice.actve.net/fm-evropa2-128">Evropa 2</a>
    <a href="https://stream.rcs.revma.com/3d47nqvb938uv">Radio Beat</a>
    <a href="http://icecast1.play.cz/radio1.mp3">Radio1</a>
    <a href="http://icecast5.play.cz/impuls128.mp3">Radio Impuls</a>
</div>
</details>

<details>
<summary>AI</summary>
<div class="links-grid">
    <a href="https://chatgpt.com/">Chat GPT</a>
    <a href="https://gemini.google.com">Gemini</a>
    <a href="https://claude.ai/">Claude AI</a>
    <a href="https://www.perplexity.ai/">Perplexity</a>
    <a href="https://gamma.app/create">Gamma (Prezentace)</a>
</div>
</details>

<details>
<summary>Předměty</summary>
<div class="links-grid">
    <h3 class="subject-heading">Matematika</h3>
    <a href="https://www.skolasnadhledem.cz/">Škola s nadhledem</a>
    <a href="https://www.geogebra.org/calculator">Geogebra Grafy</a>
    <a href="https://www.matweb.cz/">Matematika polopatě</a>
    <h3 class="subject-heading">Fyzika</h3>
    <a href="https://iqlandia.cz/iqblog/section:22">Iqlandia Fyzika</a>
    <h3 class="subject-heading">Chemie</h3>
    <a href="https://chemicke-vypocty.cz/">Chemické výpočty</a>
</div>
</details>

<details>
<summary>Linux & Programování</summary>
<div class="links-grid">
    <a href="https://www.abclinuxu.cz/">Abclinuxu</a>
    <a href="https://www.root.cz/">Root</a>
    <a href="https://github.com/bedjan/">Můj Github</a>
    <a href="https://itnetwork.cz/">ITnetwork</a>
    <a href="https://dillinger.io/">Markdown editor</a>
</div>
</details>

</div>
