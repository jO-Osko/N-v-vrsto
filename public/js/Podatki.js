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



function NeveljavnaPoteza(sporocilo){
    this.sporocilo = sporocilo;
    this.ime_napake = "Neveljavna Poteza";
}


function Poteza(vrstica, stolpec, igralec){
    this.vrstica = vrstica;
    this.stolpec = stolpec;
    this.igralec =  igralec;

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
