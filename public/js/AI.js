ZMAGA = 10000;
NESKONCNO = Number.POSITIVE_INFINITY;


function AI(globina, mreza, nastavitve){
    this.globina = globina;
    this.aiMreza = new AIMreza(nastavitve.visina, nastavitve.sirina, mreza, nastavitve.v_vrsto, nastavitve.na_potezi);
}


function AIMreza(visina, sirina, mreza, v_vrsto, na_potezi){
    this.visina = visina;
    this.sirina = sirina;
    this.v_vrsto = v_vrsto;
    this.poteze = [];
    this.na_potezi = na_potezi;
    this.koncano = STANJE.NE_KONCANO;
    this.zmagovalec = undefined;
    if(mreza === undefined){
        this.mreza = this.naredi_mrezo();
    }else{
        this.mreza = mreza;
    }

}

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

AIMreza.prototype.veljavne_poteze = function(){
    var veljavne = [];
    for(var i = 0; i < this.sirina; i++){
        if(this.je_poteza_veljavna(i)){
            veljavne.push(i);
        }
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
    if(this.na_potezi == IGRALCI.CLOVEK){
        this.na_potezi = IGRALCI.RACUNALNIK;
    }
    else{
        this.na_potezi = IGRALCI.CLOVEK;
    }
};


AIMreza.prototype.preveri_zmago = function(stolpec, vrstica){
    var igralec = this.mreza[stolpec][vrstica];
    return(
        this.preveri_zmago_vertikalno(stolpec, vrstica, igralec) ||

        this.preveri_zmago_horizontalno(stolpec, vrstica, igralec)  ||

        this.preveri_zmago_anti_diagonalno(stolpec, vrstica, igralec) ||

        this.preveri_zmago_diagonalno(stolpec, vrstica, igralec)
    );
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

    this.koncano = STANJE.NE_KONCANO; //ne mormo igrt po tem k je enkrat �e konc
};

AI.prototype.minimax = function(maksimiramo, globina){

    if(this.aiMreza.koncano == STANJE.KONCANO){
        var zmagovalec = this.aiMreza.zmagovalec;
        if(zmagovalec == IGRALCI.CLOVEK){
            return [null, -ZMAGA];
        }
        else{
            return [null, ZMAGA];
        }
    }

    if(globina == 0){
        return [null, 0];
    }

    var najbolsa = -1;
    var veljavne_poteze = this.aiMreza.veljavne_poteze();
    var vrednost_najbolse = 0;
    if(maksimiramo){
        vrednost_najbolse = -NESKONCNO;
        for(var j = 0; j < veljavne_poteze.length; ++j) {
            var poteza_j = veljavne_poteze[j];
            if (this.aiMreza.igraj(poteza_j)) {
                vrednost_najbolse = ZMAGA;
                najbolsa = poteza_j;
                this.aiMreza.poteza_nazaj();
                break;
            }
            var vrednost_max = this.minimax(!maksimiramo, globina-1)[1];
            this.aiMreza.poteza_nazaj();
            if (vrednost_max > vrednost_najbolse){
                vrednost_najbolse = vrednost_max;
                najbolsa = poteza_j;
            }
        }

    }else{
        vrednost_najbolse = NESKONCNO;
        for(var i = 0; i < veljavne_poteze.length; ++i){
            var poteza_i = veljavne_poteze[i];
            if(this.aiMreza.igraj(poteza_i)) {
                vrednost_najbolse = ZMAGA;
                najbolsa = poteza_i;
                this.aiMreza.poteza_nazaj();
                break;
            }
            var vrednost_min = this.minimax(!maksimiramo, globina-1)[1];
            this.aiMreza.poteza_nazaj();
            if(vrednost_min < vrednost_najbolse){
                vrednost_najbolse = vrednost_min;
                najbolsa = poteza_i;
            }
        }
    }
    return [najbolsa, vrednost_najbolse];

};

AI.prototype.najboljsa_poteza = function() {
    var najbolsa_poteza = this.minimax(true, this.globina);
    if(najbolsa_poteza[0] === null){
        return this.aiMreza.najdi_potezo(); // Random
    }
    return najbolsa_poteza[0];

};

AI.prototype.igraj = function (stolpec) {
    this.aiMreza.igraj(stolpec);
};

AI.prototype.poteza_nazaj = function () {
    this.aiMreza.poteza_nazaj();
};