"use strict";

var dataJSON = [ ];
var lastSearchKey = undefined;

window.addEventListener("load", function(){    
    console.log("=== page ready ===");

    // member variables
    var tableOutput = document.getElementById("tableOutput");

    function ajaxLoadData(){
        console.log(this); 
        if(this.readyState == 4 && this.status == 200) {
            dataJSON = JSON.parse(this.responseText);
            createHeader();
            updateSearch();           
        }
        else {
            console.log("Error! JSON Message read failed!");
        }

    }

    function createHeader() {
        var rowHeader = tableOutput.insertRow();
        for(var column in dataJSON[0]) {
            var columnHeader = document.createElement("th");
            columnHeader.innerHTML = column;
            rowHeader.appendChild(columnHeader);
        }
    }

    function loadData(){
        var ajaxObject = new XMLHttpRequest();
        var ajaxURL = "https://raw.githubusercontent.com/ozwoldFH/webapp_inventory_WS2019/master/data/data.json";
        ajaxObject.onreadystatechange = ajaxLoadData;
        ajaxObject.open("GET", ajaxURL, true);
        ajaxObject.send();
    }



    // call function
    loadData();

});

function createBody(data) {
    while (tableOutput.rows.length > 1) {
        tableOutput.deleteRow(-1);
    }

    for (var row in data) {
        var rowBody = tableOutput.insertRow();
        for(var column in data[row]) {
            var columnBody = document.createElement("td");
            columnBody.innerHTML = data[row][column];
            rowBody.appendChild(columnBody);
        }
    }
}

function updateSearch() {
    const currentSearchKey = document.getElementById("searchInput").value.toLowerCase();

    if (currentSearchKey === lastSearchKey) {
        return;
    }
    
    lastSearchKey = currentSearchKey;
    const data = currentSearchKey ?
        dataJSON.filter(d => Object.values(d).some(v => String(v).toLowerCase().includes(currentSearchKey))) : 
        dataJSON;
    createBody(data);
}

function addData(){
    document.location.href="./form.html"
}