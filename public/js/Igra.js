function IgralnaCelica(html_celica, zacetni_igralec){
    this.html_celica = html_celica;
    this.igralec = zacetni_igralec;
    this.spremeni_barvo();
}


IgralnaCelica.prototype.odigraj_potezo = function (nov_igralec){
    this.igralec = nov_igralec;
    this.spremeni_barvo();
};


IgralnaCelica.prototype.spremeni_barvo = function () {
    this.html_celica.attr("class", "");
    this.html_celica.addClass(this.igralec.html_razred_barve);
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


function Igra(html_mreza, kazalci, visina, sirina, v_vrsto) {


    this.html_mreza = html_mreza;
    this.kazalci = kazalci;
    this.na_potezi = IGRALCI.DEFUALT;
    this.poteze = [];
    this.koncano = STANJE.DEFUALT;
    this.visina = visina;
    this.sirina = sirina;
    this.v_vrsto = v_vrsto;

}


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


Igra.prototype.opravi_potezo = function(vrstica, stolpec){
    var poteza = new Poteza(vrstica, stolpec, this.na_potezi);
    this.poteze.push(poteza);
    this.html_mreza[stolpec][vrstica].odigraj_potezo(this.na_potezi);
    this.zamenjaj_igralca();

};


Igra.prototype.igraj = function(stolpec){
    try{
        var vrstica = this.izracunaj_potezo(stolpec);
        this.opravi_potezo(vrstica, stolpec);
    }
    catch (e){
        throw e;
    }

};


Igra.prototype.zamenjaj_igralca = function(){
    //Za 2 igralca je to dovolj
    if(this.na_potezi == IGRALCI.CLOVEK){
        this.na_potezi = IGRALCI.RACUNALNIK;
    }
    else{
        this.na_potezi = IGRALCI.CLOVEK;
    }
};


Igra.prototype.prikazi_potezo = function(stolpec){
    this.kazalci[stolpec].prikazi_potezo(this.na_potezi, this.je_poteza_veljavna(stolpec));
};

Igra.prototype.skrij_potezo = function(stolpec){
    this.kazalci[stolpec].skrij_potezo();
};

