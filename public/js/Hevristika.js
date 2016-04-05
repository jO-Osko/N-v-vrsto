function Hevristika(tockovanje, sirina, visina, v_vrsto) {
    this.tockovanje = tockovanje;
    this.sirina = sirina;
    this.visina = visina;
    this.v_vrsto = v_vrsto;
}

Hevristika.iz_shranjene = function (podatki) {

    return new Hevristika(podatki.tockovanje, podatki.sirina, podatki.visina, podatki.v_vrsto);

};

Hevristika.prototype.kaznuj_globino = function (globina, maximiziramo) {
    // Neumni nacin, linearno
    if(maximiziramo){
        return this.tockovanje.KAZEN_NA_GLOBINO_MAX * 2;
    }else{
        return this.kaznuj_globino(globina, !maximiziramo);
    }
};

Hevristika.prototype.tockuj_zmago = function() {
    return HEVRISTIKA.TOCKOVANJE.ZMAGA;
};

Hevristika.prototype.tockuj_poraz = function() {
    return HEVRISTIKA.TOCKOVANJE.PORAZ;
};

Hevristika.prototype.tockuj_remi = function() {
    return HEVRISTIKA.TOCKOVANJE.REMI;
};

// Pustimo si v razmisleku, da nekoc dodamo, ali je igralec clovek,
// mogoce bi v tem primeru lahko ocenjevali kako drugace (clovek nekatere poteze "ceni" bolj).
Hevristika.prototype.oceni_plosco = function (plosca, trenutni_igralec) {
    var vrednost = 0;
    var ocene = [];
    //združimo ocene od diagonal, vrstic in stolpcov
    ocene = ocene.concat(this.preveri_vrstice(plosca), this.preveri_desno_diagonalo(plosca), this.preveri_levo_diagonalo(plosca), this.preveri_navzdol(plosca));
    for(var i = 0; i < ocene.length; i++){
        if(ocene[i].igralec == trenutni_igralec){//če je ocena od trenutnega igralca prištejemo
            vrednost += ocene[i].dobi_vrednost();
        }
        else{//drugače odštejemo
            vrednost -= ocene[i].dobi_vrednost();
        }
    }

    return vrednost;
};

Hevristika.prototype.preveri_vrstice = function(plosca) {
    var ocene = [];
    for(var vrstica = 0; vrstica<this.visina; vrstica++){
        var prejsni = null;
        var trenutni = null;
        var dolzina = 0;
        var dolzina_vmes = 0;
        for(var i=0; i < this.sirina; i++){
            if(trenutni == IGRALCI.NE_ODIGRANO && plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                continue;
            }
            if(trenutni == null){
                if(plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                    continue;
                }
                else{
                    trenutni = plosca[i][vrstica];
                    dolzina = 1;
                    if(i > 0){
                        prejsni = IGRALCI.NE_ODIGRANO;
                    }
                }
            }
            else{
                if(plosca[i][vrstica] != trenutni &&  (plosca[i][vrstica] != IGRALCI.NE_ODIGRANO || i == this.sirina - 1)){//zaustavitveni pogoj
                    if(prejsni == IGRALCI.NE_ODIGRANO  && dolzina_vmes <= 1){
                        ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                    }
                    
                    else{
                        //ni dovolj v vrsto
                    }
                    prejsni = trenutni;//na novo nastavimo začetne vrednosti
                    trenutni = plosca[i][vrstica];
                    dolzina = 1;
                    dolzina_vmes = 0;
                }
                else{
                    if(plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                        prejsni = IGRALCI.NE_ODIGRANO;
                        dolzina_vmes += 1;

                    }
                    else{
                        dolzina += 1;
                    }
                }
            }
            if(dolzina >=this.v_vrsto - 1){                
                if(prejsni == IGRALCI.NE_ODIGRANO && dolzina_vmes <= 1){                    
                    ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                }
            }
        }
    }
    return ocene;
};

Hevristika.prototype.preveri_desno_diagonalo = function(plosca) {
    //funkcija deluje tako da se sprehodi po število vseh diagonal ki so dolžine vsaj
    //v_vrsto. Za vsako to diagonalo določi začetni in končni stolpec glede na obliko
    //mreže(lahko je pokončna ali vodoravna) ter nato preveri za proste v_vrsto - 1 "verige"
    //na tej diagonali
    //preverja diagonale ki potekajo desno - dol
    var ocene = [];
    var dolzina_vmes = 0;    
    for(var skupno = this.v_vrsto - 1; skupno < this.sirina + this.visina - this.v_vrsto; skupno++){
        if(skupno >= this.visina){
            var zacetna_vrstica = this.visina - 1;
            if(skupno >= this.sirina){
                var koncna_vrstica = skupno - this.sirina + 1;
            }
            else{
                koncna_vrstica = 0;
            }
        }
        else{
            zacetna_vrstica = skupno;
            koncna_vrstica = 0
        }
        var prejsni = null;
        var trenutni = null;
        var dolzina = 0;
        for(var vrstica = zacetna_vrstica; vrstica >= koncna_vrstica; vrstica--){
            var i = skupno - vrstica;
            if(trenutni == IGRALCI.NE_ODIGRANO && plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                continue;
            }            
            if(trenutni == null){
                if(plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                    prejsni = IGRALCI.NE_ODIGRANO;
                    // Nadaljujemo z zanko
                }
                else{

                    trenutni = plosca[i][vrstica];
                    dolzina = 1;
                }
            }
            else{
                if(plosca[i][vrstica] != trenutni &&  (plosca[i][vrstica] != IGRALCI.NE_ODIGRANO || vrstica == koncna_vrstica)){//zaustavitveni pogoj                  
                    if(dolzina >=this.v_vrsto - 1){
                        if(prejsni == IGRALCI.NE_ODIGRANO && dolzina_vmes <= 1){
                            ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                        }
                    }
                    else{
                        //ni dovolj v vrsto
                    }
                    prejsni = trenutni;//na novo nastavimo zacetne vrednosti
                    trenutni = plosca[i][vrstica];
                    dolzina = 1;
                    dolzina_vmes = 0;
                }
                else{
                    if(plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                        prejsni = IGRALCI.NE_ODIGRANO;
                        dolzina_vmes += 1;
                    }
                    else{
                        dolzina += 1;
                    }
                }
            }

            if(vrstica == koncna_vrstica && (dolzina >=this.v_vrsto - 1)){
                if(prejsni == IGRALCI.NE_ODIGRANO && dolzina_vmes <= 1){
                    ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                }
            }

        }
    }
    return ocene;

};

Hevristika.prototype.preveri_levo_diagonalo = function(plosca) {
    //deluje podobno kot preveri_desno_diagonalo le da preverja diagonale
    //ki potekajo v smeri levo - gor
    var ocene = [];
    var zacetek = 0;    
    if(this.sirina > this.visina){
        var tip_igre = 1;
        var prva_meja = this.visina - 1 -  (this.v_vrsto - 1); //zadanemo v zgornji levi  kot
        var druga_meja = this.sirina - 1 - (this.v_vrsto - 1); //zadanemo v spodnji desni  kot
    }
    else{
        prva_meja = this.sirina - 1 - (this._vrsto - 1); //zadanemo v spodnji desni  kot
        druga_meja = this.visina - 1 - (this.v_vrsto - 1);
        tip_igre = -1;
    }

    for(var skupno = zacetek; skupno < this.sirina + this.visina - 1 - 2*(this.v_vrsto - 1); skupno++){
        if(tip_igre == 1){ //sirina > visina
            if(skupno <= prva_meja){
                var zacetni_stolpec = 0;
                var koncni_stolpec = this.v_vrsto - 1 + skupno;
            }
            else if(skupno > prva_meja && skupno < druga_meja){
                zacetni_stolpec = skupno - (this.visina - 1) + this.v_vrsto - 1;
                koncni_stolpec = zacetni_stolpec + this.visina - 1;
            }
            else if(skupno >= druga_meja){
                zacetni_stolpec = skupno - (this.visina - 1) + this.v_vrsto - 1;
                koncni_stolpec = this.sirina - 1;
            }
        }
        else{
            if(skupno <= prva_meja){
                zacetni_stolpec = 0;
                koncni_stolpec = this.v_vrsto - 1 + skupno;
            }
            else if(skupno <= druga_meja){
                zacetni_stolpec = 0;
                koncni_stolpec = this.sirina - 1;
            }
            else{
                zacetni_stolpec = skupno - (this.visina - 1 - this.v_vrsto - 1);
                koncni_stolpec = this.sirina - 1;
            }

        }
        var prejsni = null;
        var trenutni = null;
        var dolzina = 0;
        var dolzina_vmes = 0;
        for(var i = zacetni_stolpec; i <= koncni_stolpec; i++){
            var vrstica = Math.max(this.visina - this.v_vrsto  - skupno + i, 0); //dolocimo vrstico glede na trenutni stolpec            

            if(trenutni == IGRALCI.NE_ODIGRANO && plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                continue;
            }
            if(trenutni == null){
                if(plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                    prejsni = IGRALCI.NE_ODIGRANO;
                    // Nadaljujemo z zanko
                }
                else{

                    trenutni = plosca[i][vrstica];
                    dolzina = 1;
                }
            }
            else{
                if(plosca[i][vrstica] != trenutni &&  (plosca[i][vrstica] != IGRALCI.NE_ODIGRANO || i == koncni_stolpec)){//zaustavitveni pogoj
                    if(prejsni == IGRALCI.NE_ODIGRANO && dolzina_vmes <= 1){
                        ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                    }                    
                    else{
                        //ni dovolj v vrsto
                    }
                    prejsni = trenutni; //na novo nastavimo zacetne vrednosti
                    trenutni = plosca[i][vrstica];
                    dolzina = 1;
                    dolzina_vmes = 0;
                }
                else{
                    if(plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                        prejsni = IGRALCI.NE_ODIGRANO;
                        dolzina_vmes += 1;
                    }
                    else{
                        dolzina += 1;
                    }
                }
            }

            if(dolzina >=this.v_vrsto - 1){
                if(prejsni == IGRALCI.NE_ODIGRANO && dolzina_vmes <= 1){
                    ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                }
            }
        }
    }

    return ocene;

};

Hevristika.prototype.preveri_navzdol = function(plosca) {
    //preveri po stolpcu navzdol za vzorce( v_vrsto - 1 dolge verige)
    var ocene = [];
    for(var stolpec = 0; stolpec < this.sirina; stolpec++){
        var prvi = IGRALCI.NE_ODIGRANO;
        var dolzina = 0;
        if(plosca[stolpec][0] != IGRALCI.NE_ODIGRANO){
            continue; //stolpec je poln
        }
        for(var vrstica = 1; vrstica < this.visina; vrstica++){
            if(plosca[stolpec][vrstica] == IGRALCI.NE_ODIGRANO){
                continue;
            }
            prvi = plosca[stolpec][vrstica];
            for(var i = 0; i<this.v_vrsto; i++){
                if(plosca[stolpec][vrstica + i] == prvi){
                    dolzina += 1;
                }
                else{
                    break;
                }
            }
            if(dolzina == this.v_vrsto - 1){
                ocene.push(new OcenaHevristika(prvi, dolzina));
            }
            break;
        }
    }
    return ocene;
};