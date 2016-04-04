NESKONCNO = Math.pow(10,9);


function AI(globina, mreza, hevristika, nastavitve){
    this.globina = globina;
    this.maksimizirani_igralec = null;
    this.hevristika = hevristika;
    this.aiMreza = new AIMreza(nastavitve.visina, nastavitve.sirina, mreza, nastavitve.v_vrsto, nastavitve.na_potezi);
    this.algoritem = alphabeta;
    this.algoritem.dodaj_hevristiko(this.hevristika);
    this.algoritem.dodaj_igro(this);
    this.nastavitve = nastavitve; // Za WebWorkerje
}


AI.iz_shranjene = function (podatki) {

    var hevr = Hevristika.iz_shranjene(podatki.hevristika);

    var temp_mreza = AIMreza.iz_shranjene(podatki.aiMreza);

    var temp = new AI(podatki.globina, podatki.aiMreza.mreza, hevr, podatki.nastavitve);
    temp.aiMreza = temp_mreza;
    temp.algoritem = ALGORITMI[podatki.algoritem.id];
    temp.algoritem.dodaj_igro(temp);

    //console.log(temp.aiMreza);

    //console.log("v ai", temp.dobi_trenutnega_igralca());
    //console.log("v ai", temp.aiMreza.na_potezi);

    return temp;

};

function AIMreza(visina, sirina, mreza, v_vrsto, na_potezi, poteze){
    this.visina = visina;
    this.sirina = sirina;
    this.v_vrsto = v_vrsto;
    if(poteze === undefined){
        this.poteze = [];
    }else{
        this.poteze = poteze;
    }
    this.na_potezi = na_potezi;
    this.koncano = STANJE.NE_KONCANO;
    this.zmagovalec = undefined;
    if(mreza === undefined){
        this.mreza = this.naredi_mrezo();
    }else{
        this.mreza = mreza;
    }

}

AIMreza.iz_shranjene = function (podatki) {
    var mreza = new AIMreza(podatki.visina, podatki.sirina, podatki.mreza, podatki.v_vrsto,
        podatki.na_potezi, podatki.poteze);

    mreza.na_potezi = IGRALCI.IGRALCI[mreza.na_potezi.id];

    // Popravimo se mrezo
    var nova_mreza = [];
    for(var i=0; i < mreza.sirina; i++){
        var temp = [];
        nova_mreza.push(temp);
        for(var j = 0; j < mreza.visina; j++){
            temp.push(IGRALCI.IGRALCI[podatki.mreza[i][j].id]);
        }
    }
    mreza.mreza = nova_mreza;

    return mreza;
};

function Hevristika(tockovanje, sirina, visina, v_vrsto){
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


Hevristika.prototype.tockuj_zmago = function(){
    return HEVRISTIKA.TOCKOVANJE.ZMAGA;
};

Hevristika.prototype.tockuj_poraz = function(){
    return HEVRISTIKA.TOCKOVANJE.PORAZ;
};

Hevristika.prototype.tockuj_remi = function(){
    return HEVRISTIKA.TOCKOVANJE.REMI;
};

// Pustimo si v razmisleku, da nekoc dodamo, ali je igralec clovek,
// mogoce bi v tem primeru lahko ocenjevali kako drugace (clovek nekatere poteze "ceni" bolj).
Hevristika.prototype.oceni_plosco = function (plosca, trenutni_igralec) {
    // TODO: Naredi hevristiko
    //return 0;

    var vrednost = 0;
    var ocene = [];
    ocene = ocene.concat(this.preveri_vrstice(plosca), this.preveri_desno_diagonalo(plosca), this.preveri_levo_diagonalo(plosca), this.preveri_navzdol(plosca));
    for(var i = 0; i<ocene.length; i++){
        if(ocene[i].igralec == trenutni_igralec){
            vrednost += ocene[i].dobi_vrednost();
        }
        else{
            vrednost -= ocene[i].dobi_vrednost();
        }
    }

    return vrednost;
};

Hevristika.prototype.preveri_vrstice = function(plosca){
    var ocene = []; 
    for(var vrstica = 0; vrstica<this.visina; vrstica++){       
        var prejsni = null;
        var trenutni = null;
        var dolzina = 0;
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
                if(plosca[i][vrstica] != trenutni &&  (plosca[i][vrstica] != IGRALCI.NE_ODIGRANO || i == this.sirina - 1)){//končamo le če najdemo igralca ki ni trenutni
                    if(dolzina >=this.v_vrsto - 1){
                        if(prejsni == IGRALCI.NE_ODIGRANO){
                            ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                        }                                            
                    }
                    else{
                        //ni dovolj v vrsto
                    }
                    prejsni = trenutni;
                    trenutni = plosca[i][vrstica];
                    dolzina = 1;
                }
                else{
                    if(plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                        prejsni = IGRALCI.NE_ODIGRANO;                        
                    }
                    else{
                        dolzina += 1;
                    }
                }
            }
            if(dolzina >=this.v_vrsto - 1){
                    if(prejsni == IGRALCI.NE_ODIGRANO){
                        ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                    }                                            
            }
        }
    }
    return ocene;
};

Hevristika.prototype.preveri_desno_diagonalo = function(plosca){
    var ocene = [];    
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
                if(plosca[i][vrstica] != trenutni &&  (plosca[i][vrstica] != IGRALCI.NE_ODIGRANO || vrstica == koncna_vrstica)){//končamo le če najdemo igralca ki ni trenutni
                    if(dolzina >=this.v_vrsto - 1){
                        if(prejsni == IGRALCI.NE_ODIGRANO){
                            ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                        }                                            
                    }
                    else{
                        //ni dovolj v vrsto
                    }
                    prejsni = trenutni;
                    trenutni = plosca[i][vrstica];
                    dolzina = 1;
                }
                else{
                    if(plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                        prejsni = IGRALCI.NE_ODIGRANO;                        
                    }
                    else{                        
                        dolzina += 1;
                    }
                }
            }
            
            if(vrstica == koncna_vrstica && (dolzina >=this.v_vrsto - 1)){
                    if(prejsni == IGRALCI.NE_ODIGRANO){
                        ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                    }                                            
            }            
            
        }
    }
    return ocene;
    
};
Hevristika.prototype.preveri_levo_diagonalo = function(plosca){
    //funkcija deluje tako da se sprehodi po število vseh diagonal ki so dolžine vsaj
    //v_vrsto. Za vsako to diagonalo določi začetni in končni stolpec glede na obliko
    //mreže(lahko je pokončna ali vodoravna) ter nato preveri za proste v_vrsto - 1 "verige"
    //na tej diagonali
    
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
        for(var i = zacetni_stolpec; i <= koncni_stolpec; i++){           
            var vrstica = Math.max(this.visina - this.v_vrsto  - skupno + i, 0); //določimo vrstico glede na trenutni stolpec
            //console.log(i, vrstica, trenutni);
                                
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
                if(plosca[i][vrstica] != trenutni &&  (plosca[i][vrstica] != IGRALCI.NE_ODIGRANO || i == koncni_stolpec)){//končamo le če najdemo igralca ki ni trenutni
                    if(dolzina >=this.v_vrsto - 1){
                        if(prejsni == IGRALCI.NE_ODIGRANO){
                            ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                        }                                            
                    }
                    else{
                        //ni dovolj v vrsto
                    }
                    prejsni = trenutni;
                    trenutni = plosca[i][vrstica];
                    dolzina = 1;
                }
                else{
                    if(plosca[i][vrstica] == IGRALCI.NE_ODIGRANO){
                        prejsni = IGRALCI.NE_ODIGRANO;                        
                    }
                    else{                        
                        dolzina += 1;
                    }
                }
            }
            
            if(dolzina >=this.v_vrsto - 1){
                    if(prejsni == IGRALCI.NE_ODIGRANO){
                        ocene.push(new OcenaHevristika(trenutni, this.v_vrsto - 1));
                    }                                            
            }
        }        
    }

    return ocene;

};
Hevristika.prototype.preveri_navzdol = function(plosca){
    var ocene = [];
    for(var stolpec = 0; stolpec < this.sirina; stolpec++){
        var prejsni = IGRALCI.NE_ODIGRANO;
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

AIMreza.prototype.naredi_mrezo = function(){
    var nova_mreza = [];
    for(var i=0; i < this.sirina; i++){
        var temp = [];
        nova_mreza.push(temp);
        for(var j = 0; j < this.visina; j++){
            temp.push(IGRALCI.NE_ODIGRANO);
        }
    }
    return nova_mreza;
};

AIMreza.prototype.veljavne_poteze = function(po_vrsti){
    var veljavne = [];
    for(var i = 0; i < this.sirina; i++){
        if(this.je_poteza_veljavna(i)){
            veljavne.push(i);
        }
    }
    if(!po_vrsti){
        premesaj_seznam(veljavne);
    }

    return veljavne;
};

AIMreza.prototype.je_poteza_veljavna = function (stolpec) {
    if(stolpec >= this.sirina){
        return false;
    }
    return this.mreza[stolpec][0] === IGRALCI.NE_ODIGRANO;
};

AIMreza.prototype.izracunaj_potezo = function(poteza){
    if(this.je_poteza_veljavna(poteza)){
        for(var i = 0; i < this.visina; i++){
            if(this.mreza[poteza][i] != IGRALCI.NE_ODIGRANO){
                return i - 1;
            }
        }
        return this.visina - 1;
    }
    else{
        throw new NeveljavnaPoteza(poteza.toString() + " ni veljavna poteza");
    }

};

AIMreza.prototype.opravi_potezo = function(vrstica, stolpec){
    var poteza = new Poteza(vrstica, stolpec, this.na_potezi);
    this.poteze.push(poteza);
    this.mreza[stolpec][vrstica] = this.na_potezi;

    var zmaga = this.preveri_zmago(stolpec, vrstica);
    if(zmaga){
        this.koncano = STANJE.KONCANO;
        this.zmagovalec = this.na_potezi;
        return zmaga;
    }

    this.zamenjaj_igralca();
    return false;
};

AIMreza.prototype.igraj = function(stolpec){
    try{
        var vrstica = this.izracunaj_potezo(stolpec);
        return this.opravi_potezo(vrstica, stolpec);
    }catch(e){
        throw e;
    }
};

AIMreza.prototype.zamenjaj_igralca = function(){
    //Za 2 igralca je to dovolj
    if(this.na_potezi == IGRALCI.IGRALEC_1){
        this.na_potezi = IGRALCI.IGRALEC_2;
    }
    else{
        this.na_potezi = IGRALCI.IGRALEC_1;
    }
};


AIMreza.prototype.preveri_zmago = function(stolpec, vrstica){
    var igralec = this.mreza[stolpec][vrstica];

    var zmaga = (
        this.preveri_zmago_vertikalno(stolpec, vrstica, igralec) ||

        this.preveri_zmago_horizontalno(stolpec, vrstica, igralec)  ||

        this.preveri_zmago_anti_diagonalno(stolpec, vrstica, igralec) ||

        this.preveri_zmago_diagonalno(stolpec, vrstica, igralec)
    );

    if(zmaga){
        this.zmagovalec = igralec;
        this.koncano = STANJE.KONCANO;
    }

    return zmaga;

};

/**
 * Preveri zmage.
 * @param {Number} stolpec
 * @param {Number} vrstica
 * @param {Igralec} igralec
 * @return {bool} zmaga
 */
AIMreza.prototype.preveri_zmago_vertikalno = function(stolpec, vrstica, igralec){
    // gor-dol
    var sprememba_visine = 1;
    for(var dy_gor = 1; (vrstica - dy_gor >= 0) && (this.mreza[stolpec][vrstica - dy_gor] == igralec) && ++sprememba_visine; ++dy_gor){} // Doda 1 prevec
    for(var dy_dol = 1; (vrstica + dy_dol < this.visina) && (this.mreza[stolpec][vrstica + dy_dol] == igralec) && ++sprememba_visine; ++dy_dol){} // Doda 1 prevec
    if(sprememba_visine >= this.v_vrsto){
        return true;
    }
    return false;
};

AIMreza.prototype.preveri_zmago_horizontalno = function(stolpec, vrstica, igralec){
    // levo-desno
    var sprememba_sirine = 1;
    for(var dx_levo = 1; (stolpec - dx_levo >= 0) && (this.mreza[stolpec - dx_levo][vrstica] == igralec) && ++sprememba_sirine; ++dx_levo){} // Doda 1 prevec
    for(var dx_desno = 1; (stolpec + dx_desno < this.mreza.length) && (this.mreza[stolpec + dx_desno][vrstica] == igralec) && ++sprememba_sirine; ++dx_desno){} // Doda 1 prevec
    if(sprememba_sirine >= this.v_vrsto){
        return true;
    }
    return false;
};

AIMreza.prototype.preveri_zmago_anti_diagonalno = function (stolpec, vrstica, igralec) {
    // dol-levo, gor-desno
    var sprememba_antidiagonalno = 1;
    for(var dx_dol_levo = 1; (stolpec - dx_dol_levo >= 0) && (vrstica + dx_dol_levo < this.mreza[stolpec].length) && (this.mreza[stolpec - dx_dol_levo][vrstica + dx_dol_levo] == igralec) && ++sprememba_antidiagonalno; ++dx_dol_levo){} // ads one too much
    for(var dx_gor_desno = 1; (stolpec + dx_gor_desno < this.mreza.length) && (vrstica - dx_gor_desno >= 0) && (this.mreza[stolpec + dx_gor_desno][vrstica - dx_gor_desno] == igralec) && ++sprememba_antidiagonalno; ++dx_gor_desno){} // ads one too much
    if(sprememba_antidiagonalno >= this.v_vrsto){
        return true;
    }
    return false;
};

AIMreza.prototype.preveri_zmago_diagonalno = function (stolpec, vrstica, igralec) {
    // gor-levo, dol-desno
    var sprememba_diagonalno = 1;
    for(var dx_gor_levo = 1; (stolpec - dx_gor_levo >= 0) && (vrstica - dx_gor_levo >= 0) && (this.mreza[stolpec - dx_gor_levo][vrstica - dx_gor_levo] == igralec) && ++sprememba_diagonalno; ++dx_gor_levo){} // ads one too much
    for(var dx_dol_desno = 1; (stolpec + dx_dol_desno < this.mreza.length) && (vrstica + dx_dol_desno < this.mreza[stolpec].length) && (this.mreza[stolpec + dx_dol_desno][vrstica + dx_dol_desno] == igralec) && ++sprememba_diagonalno; ++dx_dol_desno){} // ads one too much
    if(sprememba_diagonalno >= this.v_vrsto){
        return true;
    }
    return false;
};

AIMreza.prototype.najdi_potezo = function(){
    var veljavne = this.veljavne_poteze();
    var nakljucna = veljavne[Math.floor(Math.random() * veljavne.length)];    
    return nakljucna;
};

AIMreza.prototype.poteza_nazaj = function(){
    var zadnja = this.poteze.pop();
    this.na_potezi = zadnja.igralec;
    this.mreza[zadnja.stolpec][zadnja.vrstica] = IGRALCI.NE_ODIGRANO;

    this.koncano = STANJE.NE_KONCANO; //ne mormo igrt po tem k je enkrat ze konc
    this.zmagovalec = IGRALCI.NE_ODIGRANO; // Ponastavimo zmagovalca nazaj
};

AI.prototype.dobi_stanje = function(){
    return this.aiMreza.koncano;
};

AI.prototype.dobi_zmagovalca = function(){
    return this.aiMreza.zmagovalec;
};

AI.prototype.dobi_trenutnega_igralca = function(){
    return this.aiMreza.na_potezi;
};

AI.prototype.dobi_mrezo = function(){
    return this.aiMreza.mreza;
};

AI.prototype.dobi_veljavne_poteze = function(){
    return this.aiMreza.veljavne_poteze();
};

AI.prototype.najboljsa_poteza = function() {
    this.maksimizirani_igralec = this.dobi_trenutnega_igralca();
    var najbolsa_poteza = this.algoritem.najboljsa_poteza();
    if(najbolsa_poteza.stolpec == null){
        return this.aiMreza.najdi_potezo(); // Random
    }
    this.maksimizirani_igralec = null;
    return najbolsa_poteza.stolpec;

};

AI.prototype.igraj = function (stolpec) {
    this.aiMreza.igraj(stolpec);
};

AI.prototype.poteza_nazaj = function () {
    this.aiMreza.poteza_nazaj();
};