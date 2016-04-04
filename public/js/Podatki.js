function Igralec(id, ime, barva, clovek) {
    this.id = id;
    this.ime = ime;
    // Pustimo si clovesko breljivo barvo, cetudi se nikjer direktno ne uporabi
    //noinspection JSUnusedGlobalSymbols
    this.barva = barva;
    this.html_razred_barve = barva.toString();
    this.clovek = clovek
}

IGRALCI = {};
IGRALCI.IGRALEC_1 = new Igralec(1, "Igralec 1", "modra", true);
IGRALCI.IGRALEC_2 = new Igralec(2, "Igralec 2", "rdeca", false);
IGRALCI.NE_ODIGRANO = new Igralec(0, "Narava", "bela");
IGRALCI.DEFUALT = IGRALCI.IGRALEC_1;

IGRALCI.IGRALCI = [IGRALCI.NE_ODIGRANO, IGRALCI.IGRALEC_1, IGRALCI.IGRALEC_2];

STANJE = {};
STANJE.KONCANO = 1;
STANJE.REMI = 0;
STANJE.NE_KONCANO = -1;
STANJE.DEFUALT = STANJE.NE_KONCANO;

HEVRISTIKA = {};
HEVRISTIKA.TOCKOVANJE = {};
HEVRISTIKA.TOCKOVANJE.ZMAGA = 1000000;
HEVRISTIKA.TOCKOVANJE.PORAZ = -HEVRISTIKA.TOCKOVANJE.ZMAGA;
HEVRISTIKA.TOCKOVANJE.REMI = 0;
// Negativna ocena pomeni, da raje isti rezultat igramo na manj potez
HEVRISTIKA.TOCKOVANJE.KAZEN_NA_GLOBINO_MAX = -1;
HEVRISTIKA.TOCKOVANJE.KAZEN_NA_GLOBINO_MIN = HEVRISTIKA.TOCKOVANJE.KAZEN_NA_GLOBINO_MAX;

NESKONCNO = Math.pow(10,9);


function NeveljavnaPoteza(sporocilo) {
    // Pustimo si podatke, pri odpravljanju napak ridejo se kako prav
    //noinspection JSUnusedGlobalSymbols
    this.sporocilo = sporocilo;
    //noinspection JSUnusedGlobalSymbols
    this.ime_napake = "Neveljavna Poteza";
}


function Poteza(vrstica, stolpec, igralec) {
    this.vrstica = vrstica;
    this.stolpec = stolpec;
    this.igralec =  igralec;

}

function OptimalnaPoteza(stolpec, ocena, igralec) {
    this.stolpec = stolpec;
    this.ocena = ocena;
    this.igralec = igralec;
}

function Zmaga(x_1, y_1, x_2, y_2) {
    this.zacetek = new Tocka(x_1, y_1);
    this.konec = new Tocka(x_2, y_2);
}

function Tocka(x,y) {
    this.x = x;
    this.y = y;
}

function Nastavitve(visina_celice, sirina_celice, obloga /*padding*/, meja) {
    this.visina_celice = visina_celice || 60;
    this.sirina_celice = sirina_celice || 60;
    this.obloga = obloga || 10;
    this.meja = meja || 1;
    this.polna_sirina_celice = this.sirina_celice + 2 * this.obloga + this.meja;
    this.polna_visina_celice = this.visina_celice + 2 * this.obloga + this.meja;
}

function OcenaHevristika(igralec, dolzina) {    
    this.igralec = igralec;
    this.dolzina = dolzina;
}

OcenaHevristika.prototype.dobi_vrednost = function() {
    return Math.pow(10, this.dolzina);
};

// Hvala wikipediji
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function premesaj_seznam(seznam) {
    for (var i = seznam.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = seznam[i];
        seznam[i] = seznam[j];
        seznam[j] = temp;
    }
}

function igraj_ai() {
    setTimeout(
        function(){
            $("#igraj-AI").trigger("click");
        },
        100
    ); // Da se vsi eventi pomirijo
}