/**
 * Funkcija pripravi celotno igralno mrezo, kreira objekt Igra, ki zdruzuje celotno igro in primerno nastavi vse gumbe
 * @param {Number} sirina Sirina polja
 * @param {Number} visina Visina polja
 * @param {Number} v_vrsto Stevilo zetonov v vrsti potrebnih za zmago
 */

function naredi_plosco(sirina, visina, v_vrsto) {
    var html_igralna_plosca = $("<table>", {class:"igralna-plosca", id:"glavna-igralna-plosca"});

    // Ker mreza sledi drugacnemu nacelu indeksiranja kot html, si mrezo vnaprej pripravimo in vse vrednosti
    // nastavino na null, ter jih kasneje primerno popolnimo
    var mreza = [];
    for(var i = 0; i < sirina; ++i){
        var temp = [];
        for(var j = 0; j < visina; ++j){
            temp.push(null);
        }
        mreza.push(temp);
    }

    // Naredimo zgornjo vrstico tabele, ki prikazuje kje bomo odvrgli zeton
    var tabela_kazalcev = $("<table>", {class:"tabela-kazalcev", id:"plosca-kazalcev"});
    var html_kazalci = $("<tr>", {class:"html-kazalci"});
    tabela_kazalcev.append(html_kazalci);
    var kazalci = [];
    for(var kazalec_i = 0; kazalec_i < sirina; ++kazalec_i){
        var celica_kazalca = $("<td>", {class: "igralna-celica"});
        var kazalec = $("<span>");
        html_kazalci.append(celica_kazalca);
        celica_kazalca.append(kazalec);
        kazalci.push(new KazalcnaCelica(kazalec));
    }

    // Naredimo si glavno igralno plosco (v HTML)
    for (var vrstica_i = 0; vrstica_i < visina; ++vrstica_i){
        var vrstica_html = $("<tr>", {class:"igralna-vrstica"});

        for(var stolpec_i = 0; stolpec_i < sirina; ++stolpec_i){
            var celica = $("<td>", {class: "igralna-celica"});
            var notranja_celica = $("<span>");

            // Zaprtja (closures) so potrebna, saj ce bi samo definirali anonimno funkcijo in jo bindali ob kliku,
            // bi za argument _stolpec v .igraj(_stolpec) javascript vzel vrednost reference te spremenljivke ob casu
            // klika, kar pa bi bilo kar sirina-1, saj gre tu za inicializacijsko kodo. S tem ga prisilimo, da takoj
            // 'izracuna' vrednost argumenta in si ga shrani, verjetno bi podoben(torej tak kot ga hocemo) rezultat
            // dobili tudi z vpeljavo nove lokalne spremenljivke.
            celica.click(
                (function (_stolpec, _celica) {
                    return function () {
                        if(glavna_igralna_plosca.je_poteza_veljavna(_stolpec)){
                            glavna_igralna_plosca.igraj(_stolpec);
                            // Prebarvajmo na novo (ob kliku je potrebno zamenjati igralca)
                            _celica.trigger("mouseleave");
                            _celica.trigger("mouseenter");
                        }
                    }
                })(stolpec_i, celica)
            ).mouseenter(
                (function (_stolpec){
                    return function () {
                        glavna_igralna_plosca.prikazi_potezo(_stolpec);
                    }
                })(stolpec_i)
            ).mouseleave(
                (function (_stolpec){
                    return function () {
                        glavna_igralna_plosca.skrij_potezo(_stolpec);
                    }
                })(stolpec_i));
            mreza[stolpec_i][vrstica_i] = new IgralnaCelica(notranja_celica, IGRALCI.NE_ODIGRANO);
            celica.append(notranja_celica);
            vrstica_html.append(celica);
        }
        html_igralna_plosca.append(vrstica_html);
    }
    // Primerno zamenjamo stare elemente z novo generiranimi
    $("#plosca-kazalcev").replaceWith(tabela_kazalcev);
    $("#glavna-igralna-plosca").replaceWith(html_igralna_plosca);
    // Nastavimo dogodke, ki se zgodijo ob kliku na gumb igraj
    $("#igraj-AI").bind("click.igraj-potezo",
        function() {
            // Shranjujemo si, ali umetna inteligenca trenutno racuna novo potezo
            var racunamo = false;
            return (
                function() { // Funkcijo naredimo, da se ohrani vrednost spremenljivke racunamo
                    if(racunamo){ // Ce ze racunamo novo potezo pocakamo, da se ta del konca.
                        return
                    }
                    // Tezko je optimalno igrati ze dokoncano igro, zato se vdamo v usodo in uporabniku sporocimo,
                    // da naj raje premisli o svojih zeljah.
                    if(glavna_igralna_plosca.koncano != STANJE.NE_KONCANO){
                        alert("Igra je ze koncana, igranje ni vec smiselno");
                        return;
                    }
                    racunamo = true;

                    // Funkcija nam opravi vse delo, ki je povezano z izvedbo same poteze/namiga
                    function procesiraj_potezo(poteza) {
                        if(glavna_igralna_plosca.na_potezi.clovek){ // Namig
                            var vrstica = glavna_igralna_plosca.izracunaj_potezo(poteza);
                            glavna_igralna_plosca.animiraj_potezo(poteza, vrstica, glavna_igralna_plosca.na_potezi,
                                true);
                            glavna_igralna_plosca.prikazi_potezo(poteza); // To zgleda malo cudno
                        }else{
                            glavna_igralna_plosca.igraj(poteza);
                        }
                        racunamo = false;

                    }

                    // Preverimo, ali uporabnikov brskalnik podpira spletne delavce (WebWorker), igra se normalno
                    // izvaja tudi brez tega, vendar je uporabiska izkusnja slabsa.
                    if(typeof(Worker) !== "undefined") {
                        var delavec = new Worker("public/js/WebWorker.js");

                        delavec.postMessage({ai:glavna_igralna_plosca.AI, navodilo:"NAJDI POTEZO",
                            na_potezi:glavna_igralna_plosca.na_potezi});

                        delavec.addEventListener('message', function(event) {
                            procesiraj_potezo(event.data);
                            delavec.postMessage({navodilo:"USTAVI"}); // Po potezi delavca ustavimo
                        }, false);
                    } else {
                        var poteza = glavna_igralna_plosca.najboljsa_poteza();
                        procesiraj_potezo(poteza);
                    }


                }
            )
        }()
    );

    // Koncno smo pripravljeni, da kreiramo objekt glavne igre
    //noinspection JSCheckFunctionSignatures
    var glavna_igralna_plosca = new Igra(mreza, kazalci, visina, sirina, v_vrsto, $("#na-potezi"),
        new Nastavitve(60,60));

    // Namenoma dvakrat zahtevamo element (ali pa si podefiniramo novo spremenljivko, skoraj brez pomena)
    //noinspection JSJQueryEfficiency
    glavna_igralna_plosca.igraj_avtomatsko = $("#avtomatsko-igraj-ai").prop("checked");

    // Za lazjo dodatno uporabo igre si na nek nacin exportajmo glavno igralno plosco, normalni uporabnik tega ne bo
    // zaznal, marsikdo pa se bo zaradi tega lazje igral na svoj nacin (po svoje je to varnostna luknja, saj s tem
    // dovolimo uporabniku posegati v igro, a s tem ravno ta pridobi car).
    //noinspection JSUnresolvedVariable
    if(!HOCEMO_NAREDITI_IGRO_BOLJ_VARNO){
        globalna_glavna_igralna_plosca = glavna_igralna_plosca;
    }

    // Poskrbimo, da se v okencu spodaj primerno prikaze trenutni igralec
    glavna_igralna_plosca.prikazi_naslednjega_igralca();

    // Popravimo nastavitve
                        // parseInt(true) == Nan, true + 1 = 2, WTF javascript
    $("#prvi-igralec").val(String((IGRALCI.IGRALEC_1.clovek + 1) - 1));
    $("#drugi-igralec").val(String((IGRALCI.IGRALEC_2.clovek + 1) - 1));
    //noinspection JSJQueryEfficiency
    $("#avtomatsko-igraj-ai").change(function () {
        glavna_igralna_plosca.igraj_avtomatsko = this.prop("checked");
    })
}
var globalna_glavna_igralna_plosca;