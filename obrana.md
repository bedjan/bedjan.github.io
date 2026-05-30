# 🛡️ ANTI-MANIPULAČNÍ MANUÁL (Zodpovědnost vs. Manipulace)

```python
class ZodpovednyClovek:
    def __init__(self):
        self.jmeno = "Ty"
        self.je_spolehlivy = True
        self.vlastni_hranice = True

    def zpracuj_pozadavek(self, utok_manipulatora):
        """
        Hlavní rozhodovací logika, jak zůstat zodpovědný,
        ale nenechat se emočně vydírat.
        """
        # DEFINICE HRANIC (Pravidlo 100/0)
        moje_zodpovednost = ["moje_ciny", "moje_slova", "moje_prace", "moje_emoce"]
        cizi_zodpovednost = ["cizi_emoce", "cizi_lenost", "cizi_chyby", "cizi_prokrastinace"]

        if utok_manipulatora.typ in cizi_zodpovednost:
            # TRUE ZODPOVĚDNOST: Chráním svůj kód/čas a házím chybu zpět
            return self.aplikuj_ohranou_desku(utok_manipulatora)
        else:
            # Tohle je reálně moje práce -> vyřeším to
            return "Zpracováno s profi přístupem."

    def aplikuj_ohranou_desku(self, utok):
        """
        Obranný algoritmus proti citovému vydírání.
        Ignoruje toxicitu, neomlouvá se, opakuje jasné NE.
        """
        pocet_pokusu_manipulatora = 0
        vystup_obrany = "Ne, na tento víkend už mám jiné plány."

        while utok.je_aktivni and pocet_pokusu_manipulatora < 3:
            # Manipulátor zkouší páky: "Zklamal jsi mě", "Jsi sobec"
            utok.generuj_vycitky() 
            pocet_pokusu_manipulatora += 1
            
            # Logování obrany - nepouštím si to k tělu, neměním stav
            print(f"[OBRANA] Reaguji klidně: '{vystup_obrany}'")
            
        utok.ukoncit_provoz() # Manipulátor to vzdává a jde otravovat jinam
        return "Hranice úspěšně ubráněna. Žádná vina se nekoná."

# --- DATA PRO ANALÝZU PÁK ---

PAKY_MANIPULATORU = {
    "Paka_1_Umelat_Vina": {
        "symptom": "Nutí tě mít blbý pocit za to, že oni selhali nebo mají špatnou náladu.",
        "obrana": "Snes krátkodobé nepohodlí. Jejich nálada není tvůj projekt."
    },
    "Paka_2_Parazitovani": {
        "symptom": "Udělají práci schválně blbě nebo vůbec, protože vědí, že ty nesneseš pohled na nedodělek.",
        "obrana": "Nech je v tom vykoupat. Nehas požáry, které sami zapálili."
    },
    "Paka_3_Utok_Na_Identitu": {
        "symptom": "Věty typu: 'Myslel jsem, že jsi spolehlivý.' Útočí na tvoje ego.",
        "obrana": "Neargumentuj. Nemusíš jim nic dokazovat."
    }
}
