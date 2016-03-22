ZMAGA = 10000;
NESKONCNO = Number.POSITIVE_INFINITY;


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

AI.prototype.minimax = function(igra, maksimiramo){
    if(this.globina == 0){
        if(igra.koncano == STANJE.KONCANO){
            var zmagovalec = igra.poteze[igra.poteze.length - 1].igralec;
            if(zmagovalec == IGRALCI.CLOVEK){
                return (null, -ZMAGA);
            }
            else{
                return (null, ZMAGA);
            }
        }
        else{
            return (null, 0);
        }


        
    }
    if(igra.koncano == STANJE.KONCANO){
        var zmagovalec = igra.poteze[igra.poteze.length - 1].igralec;
        if(zmagovalec == IGRALCI.CLOVEK){
            return (null, -ZMAGA);
        }
        else{
            return (null, ZMAGA);
        }
    }
    else{
        if(maksimiramo){
            najbolsa = null;
            vrednost_najbolse = -NESKONCNO;
            for(var poteza in this.veljavne_poteze(igra)){         
                igra.igraj(poteza);                
                vrednost = this.minimax(this.globina-1, !maksimiramo)[1];
                igra.poteza_nazaj();
                if (vrednost > vrednost_najbolse){
                    vrednost_najbolse = vrednost;
                    najbolsa = poteza
                }
            }

        }
        else{
            najbolsa = null;
            vrednost_najbolse = NESKONCNO;
            for(var poteza in this.veljavne_poteze(igra)){                
                igra.igraj(poteza);
                vrednost = this.minimax(this.globina-1, !maksimiramo)[1];
                igra.poteza_nazaj();
                if(vrednost < vrednost_najbolse){
                    vrednost_najbolse = vrednost;
                    najbolsa = poteza;
                }
            }
        }

        return (najbolsa, vrednost_najbolse);

    }
};

AI.prototype.najbolsa_poteza = function(igra){    
    najbolsa_poteza = this.minimax(igra, true)[0];
    console.log(najbolsa_poteza[0], najbolsa_poteza[1]);
}

