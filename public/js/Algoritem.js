// Osnovni interface za odlocitveni algoritem

/**
 *
 * @param ime Ime algoritma
 * @param igra Kot Igra obnasajoc se objekt, implementirati mora: Igra.dobi_veljavne_poteze() (vrne veljavne poteze),
 * Igra.igraj(poteza) (odigra potezo), Igra.poteza_nazaj() (razveljavi potezo), Igra.dobi_stanje() (vrne stanje igre),
 * Igra.dobi_zmagovalca() (vrne zmagovalca, ob predpostavki, da je igra koncana), Igra.dobi_trenutnega_igralca()
 * (vrne trenutnega igralca na potezi), Igra.dobi_mrezo() (vrne mrezo za potrebe hevristike)
 * @param hevristika Kot Hevristika obnasajoc se objekt, implementirati mora: Hevristika.tockuj_zmago()
 * (vrne stevilo tock, ki jih prinese zmaga), Hevristika.tockuj_poraz (vrne stevilo tock, ki jih prinese poraz),
 * Hevristika.tockuj_remi() (vrnes stevilo tock, ki jih prinese remi), Hevristika.oceni_plosco(mreza, na_potezi)
 * (hevristicno oceni pozicijo na mrezi), Hevrisitka.kaznuj_globino(globina, trenutni_igralec) (potezi doda kazen/bonus za
 * globino)
 * @constructor
 */

function AIAlgoritem(ime, igra, hevristika){
    this.ime = ime;
    this.igra = igra;
    this.hevristika = hevristika;
}

AIAlgoritem.prototype.najboljsa_poteza = function (){
    throw new Error("Not implemented");
};

AIAlgoritem.prototype.dodaj_igro = function(igra){
    this.igra = igra;
};

AIAlgoritem.prototype.dodaj_hevristiko = function (hevristika) {
    this.hevristika = hevristika;
};


// Dedovanje
Minimax.prototype = new AIAlgoritem();
Minimax.prototype.constructor = Minimax;
Minimax.prototype.super = AIAlgoritem.prototype;

function Minimax(ime, igra, hevristika, globina){
    this.super.constructor.call(this, ime, igra, hevristika);

    // Ponovitev kode od iz konstruktorja, samo zato, da WebStorm ve katere atribte ima objekt
    //noinspection ConstantIfStatementJS
    if(false) {
        this.ime = ime;
        this.igra = igra;
        this.hevristika = hevristika;
    }
    // Konec ponovitve konstruktorja

    this.globina = globina;
    this.maksimizirani_igralec = null;
}

Minimax.prototype.najboljsa_poteza = function (){
    this.maksimizirani_igralec = this.igra.dobi_trenutnega_igralca();
    var optimalna_poteza = this.minimax(true, this.globina);
    this.maksimizirani_igralec = null;
    return optimalna_poteza;
};

Minimax.prototype.minimax = function(maksimiramo, globina){

    // Veselo uporabimo dejstvo, da je javascript dinamicno tipiziran jezik, in mocno udarimo uporabnika, ki bi minmax
    // klical na ze koncani plosci.
    // Nasvet za uporabnika: uporabljal metodo: Ai.najboljsa_poteza, saj ti sama pove, kaj pocne.

    if(this.igra.dobi_stanje() == STANJE.KONCANO){
        var zmagovalec = this.igra.dobi_zmagovalca();
        if(zmagovalec == this.maksimizirani_igralec){
            return new OptimalnaPoteza(null, this.hevristika.tockuj_zmago(), null);
        }else if(zmagovalec != IGRALCI.NE_ODIGRANO){
            return new OptimalnaPoteza(null, this.hevristika.tockuj_poraz(), null);
        }else{
            return new OptimalnaPoteza(null, this.hevristika.tockuj_remi(), null);
        }
    }

    if(globina == 0){
        return new OptimalnaPoteza(null, this.hevristika.oceni_plosco(this.igra.dobi_mrezo(),
            this.igra.dobi_trenutnega_igralca()), null);
    }

    if(maksimiramo){
        return this.maximiziraj(globina)
    }else{
        return this.minimiziraj(globina);
    }

};

Minimax.prototype.maximiziraj = function (globina){
    var veljavne_poteze = this.igra.dobi_veljavne_poteze();

    var optimalna_poteza = null;
    var optimalna_ocena = -NESKONCNO;

    for(var j = 0; j < veljavne_poteze.length; ++j) {
        var poteza = veljavne_poteze[j];

        this.igra.igraj(poteza);

        // Gremo v globino in ignoriramo vse razen ocene pozicije
        var ocena_poteze = this.minimax(false, globina-1);

        ocena_poteze = ocena_poteze.ocena;

        this.igra.poteza_nazaj();

        if(ocena_poteze > optimalna_ocena){
            optimalna_poteza = poteza;
            optimalna_ocena = ocena_poteze;
        }
    }

    // Kaznujmo globino na koncu, vmes nima veze (razen mogoce za obrezovanje)

    optimalna_poteza = new OptimalnaPoteza(optimalna_poteza, optimalna_ocena +
        this.hevristika.kaznuj_globino(this.globina - globina, true), this.igra.dobi_trenutnega_igralca());

    return optimalna_poteza;
};

Minimax.prototype.minimiziraj = function (globina){
    var veljavne_poteze = this.igra.dobi_veljavne_poteze();

    var optimalna_poteza = null;
    var optimalna_ocena = NESKONCNO;

    for(var j = 0; j < veljavne_poteze.length; ++j) {
        var poteza = veljavne_poteze[j];

        this.igra.igraj(poteza);

        // Gremo v globino in ignoriramo vse razen ocene pozicije
        var ocena_poteze = this.minimax(true, globina-1).ocena;

        this.igra.poteza_nazaj();

        if(ocena_poteze < optimalna_ocena){
            optimalna_poteza = poteza;
            optimalna_ocena = ocena_poteze;
        }

    }

    optimalna_poteza = new OptimalnaPoteza(optimalna_poteza, optimalna_ocena +
        this.hevristika.kaznuj_globino(this.globina - globina, false), this.igra.dobi_trenutnega_igralca());

    return optimalna_poteza;
};


// Dedovanje
AlphaBeta.prototype = new AIAlgoritem();
AlphaBeta.prototype.constructor = AlphaBeta;
AlphaBeta.prototype.super = AIAlgoritem.prototype;

function AlphaBeta(ime, igra, hevristika, globina){
    this.super.constructor.call(this, ime, igra, hevristika);

    // Ponovitev kode od iz konstruktorja, samo zato, da WebStorm ve katere atribte ima objekt
    //noinspection ConstantIfStatementJS
    if(false) {
        this.ime = ime;
        this.igra = igra;
        this.hevristika = hevristika;
    }
    // Konec ponovitve konstruktorja

    this.globina = globina;
    this.maksimizirani_igralec = null;
}

AlphaBeta.prototype.najboljsa_poteza = function (){
    this.maksimizirani_igralec = this.igra.dobi_trenutnega_igralca();
    var optimalna_poteza = this.alphabeta(true, this.globina, -Infinity, Infinity);
    this.maksimizirani_igralec = null;
    return optimalna_poteza;
};

AlphaBeta.prototype.alphabeta = function(maksimiramo, globina, alpha, beta){
    // Veselo uporabimo dejstvo, da je javascript dinamicno tipiziran jezik, in mocno udarimo uporabnika, ki bi minmax
    // klical na ze koncani plosci.
    // Nasvet za uporabnika: uporabljal metodo: Ai.najboljsa_poteza, saj ti sama pove, kaj pocne.

    if(this.igra.dobi_stanje() == STANJE.KONCANO){
        var zmagovalec = this.igra.dobi_zmagovalca();
        if(zmagovalec == this.maksimizirani_igralec){
            return new OptimalnaPoteza(null, this.hevristika.tockuj_zmago(), null);
        }else if(zmagovalec != IGRALCI.NE_ODIGRANO){
            return new OptimalnaPoteza(null, this.hevristika.tockuj_poraz(), null);
        }else{
            return new OptimalnaPoteza(null, this.hevristika.tockuj_remi(), null);
        }
    }

    if(globina == 0){
        return new OptimalnaPoteza(null, this.hevristika.oceni_plosco(this.igra.dobi_mrezo(),
            this.igra.dobi_trenutnega_igralca()), null);
    }

    if(maksimiramo){
        return this.alphabeta_maximiziraj(globina, alpha, beta)
    }else{
        return this.alphabeta_minimiziraj(globina, alpha, beta);
    }
};

AlphaBeta.prototype.alphabeta_maximiziraj = function (globina, alpha, beta){
    var veljavne_poteze = this.igra.dobi_veljavne_poteze();

    var optimalna_poteza = null;
    var optimalna_ocena = -NESKONCNO;

    for(var j = 0; j < veljavne_poteze.length; ++j) {
        var poteza = veljavne_poteze[j];

        this.igra.igraj(poteza);

        // Gremo v globino in ignoriramo vse razen ocene pozicije
        var ocena_poteze = this.alphabeta(false, globina-1, alpha, beta);

        ocena_poteze = ocena_poteze.ocena;

        this.igra.poteza_nazaj();

        if(ocena_poteze > optimalna_ocena){
            optimalna_poteza = poteza;
            optimalna_ocena = ocena_poteze;

            alpha = optimalna_ocena;
            if(beta <= alpha){
                break; // Obrezemo
            }
        }
    }

    optimalna_poteza = new OptimalnaPoteza(optimalna_poteza, optimalna_ocena +
        this.hevristika.kaznuj_globino(this.globina - globina, false), this.igra.dobi_trenutnega_igralca());

    return optimalna_poteza;
};

AlphaBeta.prototype.alphabeta_minimiziraj = function (globina, alpha, beta) {
    var veljavne_poteze = this.igra.dobi_veljavne_poteze();

    var optimalna_poteza = null;
    var optimalna_ocena = NESKONCNO;

    for(var j = 0; j < veljavne_poteze.length; ++j) {
        var poteza = veljavne_poteze[j];

        this.igra.igraj(poteza);

        // Gremo v globino in ignoriramo vse razen ocene pozicije
        var ocena_poteze = this.alphabeta(true, globina-1, alpha, beta).ocena;

        this.igra.poteza_nazaj();

        if(ocena_poteze < optimalna_ocena){
            optimalna_poteza = poteza;
            optimalna_ocena = ocena_poteze;

            beta = optimalna_ocena;
            if(beta <= alpha){
                break;
            }
        }

    }

    optimalna_poteza = new OptimalnaPoteza(optimalna_poteza, optimalna_ocena +
        this.hevristika.kaznuj_globino(this.globina - globina, false), this.igra.dobi_trenutnega_igralca());

    return optimalna_poteza;
};


var minimax = new Minimax("MiniMax", null, null, 4);

var alphabeta = new AlphaBeta("Alpha-Beta", null, null, 10);