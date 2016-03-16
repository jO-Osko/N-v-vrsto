function AI(globina){
    this.globina = globina;
    this.igra = null;

}
AI.prototype.veljavne_poteze = function(igra){
    var veljavne =[];
    for(var i=0; i<igra.sirina;i++){
        if(igra.je_poteza_veljavna(i)){
            veljavne.push(i);
        }
    }
    return veljavne;
}
AI.prototype.najdi_potezo = function(igra){
    var veljavne = this.veljavne_poteze(igra);
    var nakljucna = veljavne[Math.floor(Math.random() * veljavne.length)];
    return nakljucna;
};

