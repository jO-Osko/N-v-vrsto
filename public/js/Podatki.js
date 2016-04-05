/**
 * Osnovni objekt igralec
 *
 * @constructor
 *
 * @param {Number} id
 *  Id igralca, uporabljan za hitrejso(lazjo) deserializacijo
 * @param {String} ime
 *  Clovesko berljivo ime igralca
 * @param {String} barva
 *  Clovesko berljiv opis barve celice
 * @param {boolean} clovek
 *  Ali je igralec clovek
 */
function Igralec(id, ime, barva, clovek) {
    this.id = id;
    this.ime = ime;
    // Pustimo si clovesko berljivo barvo, cetudi se nikjer direktno ne uporabi
    //noinspection JSUnusedGlobalSymbols
    this.barva = barva;
    this.html_razred_barve = barva.toString();
    this.clovek = clovek
}

// Nastavimo si singeltone igralcev
var IGRALCI = {};
IGRALCI.IGRALEC_1 = new Igralec(1, "Igralec 1", "modra", true);
IGRALCI.IGRALEC_2 = new Igralec(2, "Igralec 2", "rdeca", false);
IGRALCI.NE_ODIGRANO = new Igralec(0, "Narava", "bela", false);
IGRALCI.DEFUALT = IGRALCI.IGRALEC_1;
// Tabela za preprostejso deserializacijo
IGRALCI.IGRALCI = [IGRALCI.NE_ODIGRANO, IGRALCI.IGRALEC_1, IGRALCI.IGRALEC_2];

// Singeltoni stanj
var STANJE = {};
STANJE.KONCANO = 1;
STANJE.REMI = 0;
STANJE.NE_KONCANO = -1;
STANJE.DEFUALT = STANJE.NE_KONCANO;

// Singeltoni hevristicnih tockovanj
var HEVRISTIKA = {};
HEVRISTIKA.TOCKOVANJE = {};
HEVRISTIKA.TOCKOVANJE.ZMAGA = 1000000;
HEVRISTIKA.TOCKOVANJE.PORAZ = -HEVRISTIKA.TOCKOVANJE.ZMAGA;
HEVRISTIKA.TOCKOVANJE.REMI = 0;
// Negativna ocena pomeni, da raje isti rezultat igramo na manj potez
HEVRISTIKA.TOCKOVANJE.KAZEN_NA_GLOBINO_MAX = -1;
HEVRISTIKA.TOCKOVANJE.KAZEN_NA_GLOBINO_MIN = HEVRISTIKA.TOCKOVANJE.KAZEN_NA_GLOBINO_MAX;

var NESKONCNO = Math.pow(10, 9);

// Ali exportamo glavni objekt igre
// V gh-pages ga naceloma ne damo na voljo
var HOCEMO_NAREDITI_IGRO_BOLJ_VARNO = true;


/**
 * Osnovna napaka, ki jo dobimo, ce zahtevamo od igre neveljavno potezo
 *
 * @constructor
 *
 * @param {String} sporocilo
 *  Kratek opis neveljavne poteze
 */
function NeveljavnaPoteza(sporocilo) {
    // Pustimo si podatke, pri odpravljanju napak pridejo se kako prav
    //noinspection JSUnusedGlobalSymbols
    this.sporocilo = sporocilo;
    //noinspection JSUnusedGlobalSymbols
    this.ime_napake = "Neveljavna Poteza";
}


/**
 * Osnovni objekt poteze
 *
 * @constructor
 *
 * @param {Number} vrstica
 *  V kateri vrstici je bila poteza opravljena
 * @param {Number} stolpec
 *  V katerem stolpcu je bila poteza opravljena
 * @param {Igralec} igralec
 *  Kateri igralec je opravil potezo
 */
function Poteza(vrstica, stolpec, igralec) {
    this.vrstica = vrstica;
    this.stolpec = stolpec;
    this.igralec = igralec;
}


/**
 * Osnovni objekt poteze
 *
 * @constructor
 *
 * @param {Number} stolpec
 *  V katerem stolpcu je bila poteza opravljena
 * @param {Number} ocena
 *  Stevilcna ocena dane (optimalne) poteze
 * @param {Igralec} igralec
 *  Kateri igralec je opravil potezo
 */
function OptimalnaPoteza(stolpec, ocena, igralec) {
    this.stolpec = stolpec;
    this.ocena = ocena;
    this.igralec = igralec;
}


/**
 * Objekt zmaga hrani zacetno in koncno tocko zmagovalne verige zetonov
 *
 * @constructor
 *
 * @param {Number} x_1
 *  X koordinata zacetne tocke, kjer je bila dosezena zmaga
 * @param {Number} x_2
 *  X koordinata koncne tocke, kjer je bila dosezena zmaga
 * @param {Number} y_1
 *  Y koordinata zacetne tocke, kjer je bila dosezena zmaga
 * @param {Number} y_2
 *  Y koordinata koncne tocke, kjer je bila dosezena zmaga
 */
function Zmaga(x_1, y_1, x_2, y_2) {
    this.zacetek = new Tocka(x_1, y_1);
    this.konec = new Tocka(x_2, y_2);
}


/**
 * POD struktura, namenjena zgolj lepsemu nacimu porabe Zmaga
 *
 * @constructor
 *
 * @param {Number} x
 *  X koordinata tocke
 * @param {Number} y
 *  Y koordinata tocke
 */
function Tocka(x, y) {
    this.x = x;
    this.y = y;
}


/**
 * Osnovne nastavitve izgleda mreze, nastavitve sa nanasajo na HTML atribute mreze
 *
 * @constructor
 *
 * @param {Number} visina_celice
 *  Visina posamezen igralne celice
 * @param {Number} sirina_celice
 *  Visina posamezen igralne celice
 * @param {Number} obloga
 *  Dimenzija obloge celice
 * @param {Number} meja
 *  Dimenzija meje celic
 */
function Nastavitve(visina_celice, sirina_celice, obloga /*padding*/, meja) {
    this.visina_celice = visina_celice || 60;
    this.sirina_celice = sirina_celice || 60;
    this.obloga = obloga || 10;
    this.meja = meja || 1;
    this.polna_sirina_celice = this.sirina_celice + 2 * this.obloga + this.meja;
    this.polna_visina_celice = this.visina_celice + 2 * this.obloga + this.meja;
}


/**
 * Objekt namenjen shranjevanju hevrisitcnih ocen plosce
 *
 * @constructor
 *
 * @param {Igralec} igralec
 *  Igralec, ki ga trenutno ocenjujemo
 * @param {Number} dolzina
 *  Dolzina verige
 */
function OcenaHevristika(igralec, dolzina) {
    this.igralec = igralec;
    this.dolzina = dolzina;
}

/**
 * Metoda vrne stevilcno oceno, ki jo predstavlja ta hevristicni objekt (Pove nam, koliko h konci oceni doprinese
 * doticna konfiguracija)
 *
 * @return {Number} ocena
 *  Vrne stevilcno oceno tega objekta
 */
OcenaHevristika.prototype.dobi_vrednost = function () {
    return Math.pow(10, this.dolzina);
};


/**
 * Moderna implementacija algoritma ki (ucinkovito) in predvsem pravilno na mestu premesa seznam, prevzeta iz
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 *
 * @param {Array} seznam
 *  Seznam, ki ga zelimo premesati
 */

function premesaj_seznam(seznam) {
    for (var i = seznam.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = seznam[i];
        seznam[i] = seznam[j];
        seznam[j] = temp;
    }
}


/**
 * Pomozna metoda/funkcija (kako lahko funkcija ne sprejme argumentov in ne vrne nicesar?), ki namesto uporabnika
 * klikne na gumb za igranje, s tem se izognemo duplikaciji kode za igranje na vec mest kot bi bilo potrebno.
 *
 */
function igraj_ai() {
    setTimeout(
        function () {
            $("#igraj-AI").trigger("click");
        },
        100
    ); // Da se vsi eventi pomirijo
}