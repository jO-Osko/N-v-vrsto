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
