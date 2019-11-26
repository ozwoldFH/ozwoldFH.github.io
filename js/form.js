"use strict";
let today = new Date();

window.addEventListener("load", function(){
    let day=today.getDate();
    let month = today.getMonth()+1;
    let year = today.getFullYear();

    if(day <10){
        day='d'+day;
    } else if (month < 10){
        month='0'+month;
    }

    today=year+'-'+month+'-'+day;
    document.getElementById('mindate').setAttribute('min', today);
});

function addData(){
    var elements = document.getElementById("myForm").elements;
    const nextID=localStorage.getItem('nextID'); //only works if you go from index directly to form
    var obj = {};
    obj["id"]=nextID;
    for(var i=0; i< 11; i++){
        var item = elements.item(i);
        console.log('item', item)
        if(item.name === "nextServiceDate" && item.value < today){
            document.getElementById("json-output").innerHTML = "Datum für das nächste Service liegt in der Vergangenheit.";
            return
        } else{
            obj[item.name] = item.value;
        }
    }

    let json = JSON.stringify(obj);

    document.getElementById("json-output").innerHTML = json;

    document.myForm.reset(); //clears form

    //writing to JSON yet to implement
}

function goToTable() {
    document.location.href = "./index.html"
}

