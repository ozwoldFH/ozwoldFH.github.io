"use strict";
window.addEventListener("load", function(){
    console.log("=== page ready ===");

    function ajaxLoadData(){
        console.log(this); 

        if(this.readyState == 4 && this.status == 200) {
            var dataJSON = JSON.parse(this.responseText);

            console.log(dataJSON);
            for (var row in dataJSON) {
                for(var column in dataJSON[row]) {
                    
                    console.log(column + " -> ");
                    // console.log(dataJSON[row][column]);
                }
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

    loadData()

});