"use strict";

function addData(){
    var elements = document.getElementById("myForm").elements;
    const nextID=localStorage.getItem('nextID'); //only works if you go from index directly to form
    var obj = {};
    obj["id"]=nextID;
    for(var i=0; i< 11; i++){
        var item = elements.item(i); 
        obj[item.name] = item.value;
    }

    let json = JSON.stringify(obj);

    document.getElementById("json-output").innerHTML = json;

    document.myForm.reset(); //clears form

    //writing to JSON yet to implement
}

function goToTable() {
    document.location.href = "./index.html"
}
