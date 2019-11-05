"use strict"; // use strict mode in this script

// ... add global variables

// loads after window / page is fully loaded
window.addEventListener("load", function(){
    console.log(" === page ready ===");

    // ... add additional code here

    // we need a callback function, which will be loaded on ready state changes
    function ajaxCallback(){
        console.log(this); // take a look on the readyState property (!)

        if(this.readyState == 4     // fully loaded
            && this.status == 200   // successful request/response
        ){
            // directly write response to HTML element
            //var modifiedText = this.responseText.replace(/\n/g, "</br>");
            //document.getElementById("demo").innerHTML = modifiedText;

            var modifiedText = this.responseText;
            do {
                modifiedText = modifiedText.replace("\n", "</br>");
            } while(modifiedText.includes("\n"));
            document.getElementById("demo").innerHTML = modifiedText;
        }
    }

    // load function to create first AJAX Request
    function loadData(){
        var ajaxObject = new XMLHttpRequest();
        var ajaxURL = "https://raw.githubusercontent.com/ozwoldFH/webapp_inventory_WS2019/master/data/data.txt";

        // trigger function on every change of readystate
        ajaxObject.onreadystatechange = ajaxCallback;

        // set true to load asynchronous
        ajaxObject.open("GET", ajaxURL, true);
        ajaxObject.send();
    }

    document.getElementById("btnAjaxLoad").addEventListener("click", loadData);

});