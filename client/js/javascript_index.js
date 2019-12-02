"use strict";

$(document).ready(function(){
    console.log("=== page ready ===");

    // Initializes the element with id grid as bootgrid with some settings
    // For more information check out Documentation:
    // http://www.jquery-bootgrid.com/Documentation
    const dataTable = $("#grid").bootgrid({
        caseSensitive: false,
        labels: {
            all: "Alle",
            infos: "Zeigt von {{ctx.start}} zu {{ctx.end}} von {{ctx.total}} Einträgen",
            loading: "Laden...",
            noResults: "Keine Daten",
            search: "Suchen"
        }
    });

    function ajaxLoadData() {
        if (this.readyState == 4 && this.status == 200) {
            const dataJSON = JSON.parse(this.responseText);
            dataTable.bootgrid("append", dataJSON);
        }
    }

    function loadData() {
        const ajaxObject = new XMLHttpRequest();
        //const ajaxURL = "https://raw.githubusercontent.com/ozwoldFH/webapp_inventory_WS2019/master/data/data.json";
        const ajaxURL = "./inventory";
        ajaxObject.onreadystatechange = ajaxLoadData;
        ajaxObject.open("GET", ajaxURL, true);
        ajaxObject.send();
    }



    // call function
    loadData();
});

function goToForm() {
    document.location.href = "./form.html"
}



