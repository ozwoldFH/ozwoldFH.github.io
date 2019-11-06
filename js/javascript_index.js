"use strict";

window.addEventListener("load", function(){    
    console.log("=== page ready ===");

    // member variables
    var tableOutput = document.getElementById("tableOutput");
    var dataJSON = "[ ]";

    function ajaxLoadData(){
        console.log(this); 
        if(this.readyState == 4 && this.status == 200) {
            dataJSON = JSON.parse(this.responseText);
            createHeader();
            createBody();            
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

    function createBody() {
        for (var row in dataJSON) {
            var rowBody = tableOutput.insertRow();
            for(var column in dataJSON[row]) {
                var columnBody = document.createElement("td");
                columnBody.innerHTML = dataJSON[row][column];
                rowBody.appendChild(columnBody);
            }
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

function addData(){
    document.location.href="./form.html"
}