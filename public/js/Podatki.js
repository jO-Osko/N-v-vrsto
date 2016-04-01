function Igralec(id, barva){
    this.id = id;
    this.barva = barva;
    this.html_razred_barve = barva.toString();
}

IGRALCI = {};
IGRALCI.CLOVEK = new Igralec(1, "modra");
IGRALCI.RACUNALNIK = new Igralec(2, "rdeca");
IGRALCI.NE_ODIGRANO = new Igralec(0, "bela");
IGRALCI.DEFUALT = IGRALCI.CLOVEK;


STANJE = {};
STANJE.KONCANO = 1;
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

function NeveljavnaPoteza(sporocilo){
    this.sporocilo = sporocilo;
    this.ime_napake = "Neveljavna Poteza";
}


function Poteza(vrstica, stolpec, igralec){
    this.vrstica = vrstica;
    this.stolpec = stolpec;
    this.igralec =  igralec;

}

function OptimalnaPoteza(stolpec, ocena, igralec){
    this.stolpec = stolpec;
    this.ocena = ocena;
    this.igralec = igralec;
}

function Zmaga(x_1, y_1, x_2, y_2){
    this.zacetek = new Tocka(x_1, y_1);
    this.konec = new Tocka(x_2, y_2);
}

function Tocka(x,y){
    this.x = x;
    this.y = y;
}

function Nastavitve(visina_celice, sirina_celice, obloga /*padding*/, meja){
    this.visina_celice = visina_celice || 60;
    this.sirina_celice = sirina_celice || 60;
    this.obloga = obloga || 10;
    this.meja = meja || 1;
    this.polna_sirina_celice = this.sirina_celice + 2 * this.obloga + this.meja;
    this.polna_visina_celice = this.visina_celice + 2 * this.obloga + this.meja;
}

function OcenaHevristika(igralec, dolzina) {    
    this.igralec = igralec;
    this.vrednost = null;
    this.dolzina = dolzina;    
    
}

OcenaHevristika.prototype.dobi_vrednost = function(){
    return Math.pow(10, this.dolzina);
};
