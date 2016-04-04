// WebWorker (spletni delavec), ki najboljso potezo preracuna v ozadju

importScripts("Igra.js", "Podatki.js", "AI.js", "Algoritem.js");

self.addEventListener('message', function(event) {
    var podatki = event.data;

    switch (podatki.navodilo){
        case "USTAVI":{
            ustavi();
            break;
        }
        case "NAJDI POTEZO":{
            var ai = AI.iz_shranjene(podatki.ai);

            var optimalna = ai.najboljsa_poteza(podatki.na_potezi);

            self.postMessage(optimalna);
        }

    }
}, false);



function ustavi() {
    self.close();
}