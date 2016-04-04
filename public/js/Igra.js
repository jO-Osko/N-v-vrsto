function IgralnaCelica(html_celica, zacetni_igralec){
    this.html_celica = html_celica;
    this.igralec = zacetni_igralec;
    this.spremeni_barvo();
}


IgralnaCelica.prototype.odigraj_potezo = function (nov_igralec, animacija){
    this.igralec = nov_igralec;
    if(!animacija){
        this.spremeni_barvo();
    }
};


IgralnaCelica.prototype.spremeni_barvo = function (igralec) {
    this.html_celica.attr("class", "");
    if(igralec){
        this.html_celica.addClass(igralec.html_razred_barve);
    }else{
        this.html_celica.addClass(this.igralec.html_razred_barve);
    }
};


function KazalcnaCelica(html_celica){
    this.html_celica = html_celica;
}

KazalcnaCelica.prototype.prikazi_potezo = function (igralec, veljavnost){
    this.html_celica.attr("class", "");
    if(!veljavnost){
        this.html_celica.addClass("neveljavna");
    }
    this.html_celica.addClass(igralec.html_razred_barve);
};

KazalcnaCelica.prototype.skrij_potezo = function (){
    this.html_celica.attr("class", "");
};


function Igra(html_mreza, kazalci, visina, sirina, v_vrsto, prikaz_igralca, nastavitve) {

    this.html_mreza = html_mreza;
    this.kazalci = kazalci;
    this.na_potezi = IGRALCI.DEFUALT;
    this.poteze = [];
    this.koncano = STANJE.DEFUALT;
    this.visina = visina;
    this.sirina = sirina;
    this.v_vrsto = v_vrsto;
    this.prikaz_igralca = prikaz_igralca;
    this.nastavitve = nastavitve;

    this.preostale_poteze = visina * sirina;

    this.AI = new AI(nastavitve.globina || 10, undefined, new Hevristika(HEVRISTIKA.TOCKOVANJE, sirina, visina, v_vrsto), {visina:this.visina, sirina:this.sirina,
        v_vrsto:this.v_vrsto, na_potezi:this.na_potezi});  // AI je v igri
    
}

Igra.prototype.najboljsa_poteza = function(){
    return this.AI.najboljsa_poteza(this.na_potezi);
};

Igra.prototype.je_poteza_veljavna = function (stolpec) {
    if(stolpec >= this.sirina){
        return false;
    }
    return this.html_mreza[stolpec][0].igralec == IGRALCI.NE_ODIGRANO;
};


Igra.prototype.izracunaj_potezo = function(poteza){
    if(this.je_poteza_veljavna(poteza)){
        for(var i = 0; i < this.visina; i++){
            if(this.html_mreza[poteza][i].igralec != IGRALCI.NE_ODIGRANO){
                return i - 1;
            }
        }
        return this.visina - 1;
    }
    else{
        throw new NeveljavnaPoteza(poteza.toString() + " ni veljavna poteza");
    }

};

Igra.prototype.opravi_potezo = function(vrstica, stolpec, animacija){
    var poteza = new Poteza(vrstica, stolpec, this.na_potezi);
    this.poteze.push(poteza);

    this.html_mreza[stolpec][vrstica].odigraj_potezo(this.na_potezi, animacija);

    var zmaga = this.preveri_zmago(stolpec, vrstica, this.na_potezi);
    if(zmaga !== null){
        this.koncano = STANJE.KONCANO;
        this.narisi_zmago(zmaga);
        this.prikazi_zmagovalca();
    }else{
        this.zamenjaj_igralca();
    }

    this.preostale_poteze--;
    if(this.preostale_poteze == 0){
        this.koncano = STANJE.REMI;
        this.prikazi_zmagovalca();
    }

};

Igra.prototype.igraj = function(stolpec){
    if(this.koncano != STANJE.NE_KONCANO){ // Samo za vsak slucaj, uporabnik nacelome ne more klikniti na mrezo,
        // ker se prikaze zmaga
        return;
    }
    try{
        var vrstica = this.izracunaj_potezo(stolpec);
        var igralec = this.na_potezi;
        this.opravi_potezo(vrstica, stolpec, true);
        this.animiraj_potezo(stolpec, vrstica, igralec);
        this.AI.igraj(stolpec);
        if(this.koncano == STANJE.NE_KONCANO){
            if(!this.na_potezi.clovek && this.igraj_avtomatsko){
                igraj_ai();
            }
        }

    }
    catch (e){
        throw e;
    }

};


Igra.prototype.zamenjaj_igralca = function(){
    //Za 2 igralca je to dovolj
    if(this.na_potezi == IGRALCI.IGRALEC_1){
        this.na_potezi = IGRALCI.IGRALEC_2;
    }
    else{
        this.na_potezi = IGRALCI.IGRALEC_1;
    }

    this.prikazi_naslednjega_igralca();
};


Igra.prototype.prikazi_naslednjega_igralca = function () {
    this.prikaz_igralca.text(this.na_potezi.ime + " (" + ((this.na_potezi.clovek) ? "človek": "računalnik") + ")")

};

Igra.prototype.prikazi_zmagovalca = function () {
    if(this.koncano == STANJE.REMI){
        this.prikaz_igralca.text("Igra se je končala brez zmagovalca")
    }else{
        this.prikaz_igralca.text("Zmagovalec: " + this.na_potezi.ime + " (" + ((this.na_potezi.clovek) ? "človek": "računalnik") + ")")
    }
};


Igra.prototype.prikazi_potezo = function(stolpec){
    this.kazalci[stolpec].prikazi_potezo(this.na_potezi, this.je_poteza_veljavna(stolpec));
};

Igra.prototype.skrij_potezo = function(stolpec){
    this.kazalci[stolpec].skrij_potezo();
};


// Igralca potrebujemo zaradi animacije
Igra.prototype.preveri_zmago = function(stolpec, vrstica, igralec){
    return(
        this.preveri_zmago_vertikalno(stolpec, vrstica, igralec) ||

        this.preveri_zmago_horizontalno(stolpec, vrstica, igralec)  ||

        this.preveri_zmago_anti_diagonalno(stolpec, vrstica, igralec) ||

        this.preveri_zmago_diagonalno(stolpec, vrstica, igralec)
    );
};

/**
 * Deluje na isti nacin kot Gasperjeva koda, samo da ta potrebuje tudi kje tocno je bila dosezena zmaga.
 * @param {Number} stolpec
 * @param {Number} vrstica
 * @param {Igralec} igralec
 * @return {Zmaga} Nacin zmage
 */
Igra.prototype.preveri_zmago_vertikalno = function(stolpec, vrstica, igralec){
    // gor-dol
    var sprememba_visine = 1;
    for(var dy_gor = 1; (vrstica - dy_gor >= 0) && (this.html_mreza[stolpec][vrstica - dy_gor].igralec == igralec) && ++sprememba_visine; ++dy_gor){} // Doda 1 prevec
    for(var dy_dol = 1; (vrstica + dy_dol < this.visina) && (this.html_mreza[stolpec][vrstica + dy_dol].igralec == igralec) && ++sprememba_visine; ++dy_dol){} // Doda 1 prevec
    if(sprememba_visine >= this.v_vrsto){
                      // stolpec ostane enak
        return new Zmaga(stolpec, vrstica - (dy_gor - 1),
                         stolpec, vrstica + (dy_dol - 1) );
    }
    return null;
};

Igra.prototype.preveri_zmago_horizontalno = function(stolpec, vrstica, igralec){
    // levo-desno
    var sprememba_sirine = 1;
    for(var dx_levo = 1; (stolpec - dx_levo >= 0) && (this.html_mreza[stolpec - dx_levo][vrstica].igralec == igralec) && ++sprememba_sirine; ++dx_levo){} // Doda 1 prevec
    for(var dx_desno = 1; (stolpec + dx_desno < this.html_mreza.length) && (this.html_mreza[stolpec + dx_desno][vrstica].igralec == igralec) && ++sprememba_sirine; ++dx_desno){} // Doda 1 prevec
    if(sprememba_sirine >= this.v_vrsto){
                                               // vrstica ostane enaka
        return new Zmaga(stolpec - (dx_levo - 1),  vrstica,
                         stolpec + (dx_desno - 1), vrstica);

    }
    return null;
};

Igra.prototype.preveri_zmago_anti_diagonalno = function (stolpec, vrstica, igralec) {
    // dol-levo, gor-desno
    var sprememba_antidiagonalno = 1;
    for(var dx_dol_levo = 1; (stolpec - dx_dol_levo >= 0) && (vrstica + dx_dol_levo < this.html_mreza[stolpec].length) && (this.html_mreza[stolpec - dx_dol_levo][vrstica + dx_dol_levo].igralec == igralec) && ++sprememba_antidiagonalno; ++dx_dol_levo){} // ads one too much
    for(var dx_gor_desno = 1; (stolpec + dx_gor_desno < this.html_mreza.length) && (vrstica - dx_gor_desno >= 0) && (this.html_mreza[stolpec + dx_gor_desno][vrstica - dx_gor_desno].igralec == igralec) && ++sprememba_antidiagonalno; ++dx_gor_desno){} // ads one too much
    if(sprememba_antidiagonalno >= this.v_vrsto){
        return new Zmaga(stolpec - (dx_dol_levo - 1),  vrstica + (dx_dol_levo - 1),
                         stolpec + (dx_gor_desno - 1), vrstica - (dx_gor_desno - 1));
    }
    return null;
};

Igra.prototype.preveri_zmago_diagonalno = function (stolpec, vrstica, igralec) {
    // gor-levo, dol-desno
    var sprememba_diagonalno = 1;
    for(var dx_gor_levo = 1; (stolpec - dx_gor_levo >= 0) && (vrstica - dx_gor_levo >= 0) && (this.html_mreza[stolpec - dx_gor_levo][vrstica - dx_gor_levo].igralec == igralec) && ++sprememba_diagonalno; ++dx_gor_levo){} // ads one too much
    for(var dx_dol_desno = 1; (stolpec + dx_dol_desno < this.html_mreza.length) && (vrstica + dx_dol_desno < this.html_mreza[stolpec].length) && (this.html_mreza[stolpec + dx_dol_desno][vrstica + dx_dol_desno].igralec == igralec) && ++sprememba_diagonalno; ++dx_dol_desno){} // ads one too much
    if(sprememba_diagonalno >= this.v_vrsto){
        return new Zmaga(stolpec - (dx_gor_levo - 1),  vrstica - (dx_gor_levo - 1),
                         stolpec + (dx_dol_desno - 1), vrstica + (dx_dol_desno - 1));
    }
    return null;
};

Igra.prototype.dobi_kordinate_centra_celice = function (tocka) {
    var x = tocka.x * this.nastavitve.polna_sirina_celice + this.nastavitve.polna_sirina_celice * 0.5;
    var y = tocka.y * this.nastavitve.polna_visina_celice + this.nastavitve.polna_visina_celice * 0.5;
    return [x,y];
};

Igra.prototype.narisi_zmago = function(zmaga){
    var glavna_plosca = $("#glavna-igralna-plosca");
    var visina_tabele = glavna_plosca.outerHeight();
    var sirina_tabele = glavna_plosca.outerWidth();
    var canvas = $("<canvas>", {class:"platno-pocez", id:"zmagovalno-platno"});

    $("#plosca-kazalcev").after(canvas);

    canvas.prop("height", visina_tabele);
    canvas.prop("width", sirina_tabele);
    var context = document.getElementById("zmagovalno-platno").getContext("2d");
    if(!context){
        return; // Ne podpiramo :(
    }
    context.lineWidth = 5;
    context.strokeStyle = '#FF88FF';

    context.beginPath();
    var start = this.dobi_kordinate_centra_celice(zmaga.zacetek);
    context.moveTo(start[0], start[1]);

    var end = this.dobi_kordinate_centra_celice(zmaga.konec);
    context.lineTo(end[0], end[1]);
    context.stroke();
};

Igra.prototype.poteza_nazaj = function(){
    var zadnja = this.poteze.pop();
    this.na_potezi = zadnja.igralec;

    this.html_mreza[zadnja.stolpec][zadnja.vrstica].odigraj_potezo(IGRALCI.NE_ODIGRANO);
    this.koncano = STANJE.NE_KONCANO; //ne mormo igrt po tem k je enkrat ze konc

    this.AI.poteza_nazaj();

};

Igra.prototype.animiraj_potezo = function(stolpec, vrstica, trenutni_igralec, je_namig){
    var time_lapse = 50;
    var trenutna_vrstica = 0;

    var igra = this; // this je lahko nevaren

    var id = setInterval(function(){
        if(trenutna_vrstica != 0){
            igra.html_mreza[stolpec][trenutna_vrstica-1].spremeni_barvo(IGRALCI.NE_ODIGRANO);
        }
        igra.html_mreza[stolpec][trenutna_vrstica].spremeni_barvo(trenutni_igralec);
        if(trenutna_vrstica == vrstica){
            if(je_namig){
                igra.html_mreza[stolpec][trenutna_vrstica].spremeni_barvo(trenutni_igralec); // odigramo zadnjo
                setTimeout(function(){
                    igra.html_mreza[stolpec][trenutna_vrstica].spremeni_barvo(IGRALCI.NE_ODIGRANO);
                }, time_lapse);
            }else {
                igra.html_mreza[stolpec][trenutna_vrstica].odigraj_potezo(trenutni_igralec); // odigramo zadnjo
            }
            clearTimeout(id);
            return;
        }
        ++trenutna_vrstica;

    }, time_lapse);

};