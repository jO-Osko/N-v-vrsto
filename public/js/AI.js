function AI(globina, mreza, hevristika, nastavitve) {
    this.globina = globina;
    this.maksimizirani_igralec = null;
    this.hevristika = hevristika;
    this.aiMreza = new AIMreza(nastavitve.visina, nastavitve.sirina, mreza, nastavitve.v_vrsto, nastavitve.na_potezi);
    this.algoritem = alphabeta;
    this.algoritem.dodaj_hevristiko(this.hevristika);
    this.algoritem.dodaj_igro(this);
    this.nastavitve = nastavitve; // Za rekonstrukcijo v WebWorkerju
}

AI.iz_shranjene = function (podatki) {

    var hevr = Hevristika.iz_shranjene(podatki.hevristika);

    var temp_mreza = AIMreza.iz_shranjene(podatki.aiMreza);

    var temp = new AI(podatki.globina, podatki.aiMreza.mreza, hevr, podatki.nastavitve);
    temp.aiMreza = temp_mreza;
    temp.algoritem = ALGORITMI[podatki.algoritem.id];
    temp.algoritem.dodaj_igro(temp);

    return temp;

};

AI.prototype.dobi_stanje = function() {
    return this.aiMreza.koncano;
};

AI.prototype.dobi_zmagovalca = function() {
    return this.aiMreza.zmagovalec;
};

AI.prototype.dobi_trenutnega_igralca = function() {
    return this.aiMreza.na_potezi;
};

AI.prototype.dobi_mrezo = function() {
    return this.aiMreza.mreza;
};

AI.prototype.dobi_veljavne_poteze = function() {
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


function AIMreza(visina, sirina, mreza, v_vrsto, na_potezi, poteze) {
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

    this.preostale_poteze = sirina * visina;

}

AIMreza.iz_shranjene = function (podatki) {
    var mreza = new AIMreza(podatki.visina, podatki.sirina, podatki.mreza, podatki.v_vrsto,
        podatki.na_potezi, podatki.poteze);

    mreza.na_potezi = IGRALCI.IGRALCI[mreza.na_potezi.id];

    // Popravimo se mrezo
    var nova_mreza = [];
    for(var i = 0; i < mreza.sirina; i++){
        var temp = [];
        nova_mreza.push(temp);
        for(var j = 0; j < mreza.visina; j++){
            temp.push(IGRALCI.IGRALCI[podatki.mreza[i][j].id]);
        }
    }
    mreza.mreza = nova_mreza;

    return mreza;
};

AIMreza.prototype.naredi_mrezo = function() {
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

AIMreza.prototype.veljavne_poteze = function(po_vrsti) {
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

AIMreza.prototype.izracunaj_potezo = function(poteza) {
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

AIMreza.prototype.opravi_potezo = function(vrstica, stolpec) {
    var poteza = new Poteza(vrstica, stolpec, this.na_potezi);
    this.poteze.push(poteza);
    this.mreza[stolpec][vrstica] = this.na_potezi;

    var zmaga = this.preveri_zmago(stolpec, vrstica);
    if(zmaga){
        this.koncano = STANJE.KONCANO;
        this.zmagovalec = this.na_potezi;
        return zmaga;
    }

    this.preostale_poteze--;
    if(this.preostale_poteze == 0){
        this.koncano = STANJE.REMI;
        this.zmagovalec = IGRALCI.NE_ODIGRANO;
    }

    this.zamenjaj_igralca();
    return false;
};

AIMreza.prototype.igraj = function(stolpec) {
    var vrstica = this.izracunaj_potezo(stolpec);
    return this.opravi_potezo(vrstica, stolpec);
};

AIMreza.prototype.zamenjaj_igralca = function() {
    if(this.na_potezi == IGRALCI.IGRALEC_1){
        this.na_potezi = IGRALCI.IGRALEC_2;
    }
    else{
        this.na_potezi = IGRALCI.IGRALEC_1;
    }
};

/**
 * Funkcija preveri, ce bi lahko poteza odigrana na stolpec, vrstica pripeljala do zmage
 * @param {Number} stolpec
 * @param {Number} vrstica
 * @return {boolean} zmaga
 */
AIMreza.prototype.preveri_zmago = function(stolpec, vrstica) {
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

AIMreza.prototype.preveri_zmago_vertikalno = function(stolpec, vrstica, igralec) {
    // gor-dol
    var sprememba_visine = 1;
    for(var dy_gor = 1; (vrstica - dy_gor >= 0) && (this.mreza[stolpec][vrstica - dy_gor] == igralec) && ++sprememba_visine; ++dy_gor){} // Doda 1 prevec
    for(var dy_dol = 1; (vrstica + dy_dol < this.visina) && (this.mreza[stolpec][vrstica + dy_dol] == igralec) && ++sprememba_visine; ++dy_dol){} // Doda 1 prevec
    return sprememba_visine >= this.v_vrsto;

};

AIMreza.prototype.preveri_zmago_horizontalno = function(stolpec, vrstica, igralec) {
    // levo-desno
    var sprememba_sirine = 1;
    for(var dx_levo = 1; (stolpec - dx_levo >= 0) && (this.mreza[stolpec - dx_levo][vrstica] == igralec) && ++sprememba_sirine; ++dx_levo){} // Doda 1 prevec
    for(var dx_desno = 1; (stolpec + dx_desno < this.mreza.length) && (this.mreza[stolpec + dx_desno][vrstica] == igralec) && ++sprememba_sirine; ++dx_desno){} // Doda 1 prevec
    return sprememba_sirine >= this.v_vrsto;

};

AIMreza.prototype.preveri_zmago_anti_diagonalno = function (stolpec, vrstica, igralec) {
    // dol-levo, gor-desno
    var sprememba_antidiagonalno = 1;
    for(var dx_dol_levo = 1; (stolpec - dx_dol_levo >= 0) && (vrstica + dx_dol_levo < this.mreza[stolpec].length) && (this.mreza[stolpec - dx_dol_levo][vrstica + dx_dol_levo] == igralec) && ++sprememba_antidiagonalno; ++dx_dol_levo){} // ads one too much
    for(var dx_gor_desno = 1; (stolpec + dx_gor_desno < this.mreza.length) && (vrstica - dx_gor_desno >= 0) && (this.mreza[stolpec + dx_gor_desno][vrstica - dx_gor_desno] == igralec) && ++sprememba_antidiagonalno; ++dx_gor_desno){} // ads one too much
    return sprememba_antidiagonalno >= this.v_vrsto;

};

AIMreza.prototype.preveri_zmago_diagonalno = function (stolpec, vrstica, igralec) {
    // gor-levo, dol-desno
    var sprememba_diagonalno = 1;
    for(var dx_gor_levo = 1; (stolpec - dx_gor_levo >= 0) && (vrstica - dx_gor_levo >= 0) && (this.mreza[stolpec - dx_gor_levo][vrstica - dx_gor_levo] == igralec) && ++sprememba_diagonalno; ++dx_gor_levo){} // ads one too much
    for(var dx_dol_desno = 1; (stolpec + dx_dol_desno < this.mreza.length) && (vrstica + dx_dol_desno < this.mreza[stolpec].length) && (this.mreza[stolpec + dx_dol_desno][vrstica + dx_dol_desno] == igralec) && ++sprememba_diagonalno; ++dx_dol_desno){} // ads one too much
    return sprememba_diagonalno >= this.v_vrsto;

};

AIMreza.prototype.najdi_potezo = function() {
    var veljavne = this.veljavne_poteze();
    return veljavne[Math.floor(Math.random() * veljavne.length)];
};

AIMreza.prototype.poteza_nazaj = function() {
    var zadnja = this.poteze.pop();
    this.na_potezi = zadnja.igralec;
    this.mreza[zadnja.stolpec][zadnja.vrstica] = IGRALCI.NE_ODIGRANO;
    this.preostale_poteze--;

    this.koncano = STANJE.NE_KONCANO; //ne mormo igrt po tem k je enkrat ze konc
    this.zmagovalec = IGRALCI.NE_ODIGRANO; // Ponastavimo zmagovalca nazaj
};