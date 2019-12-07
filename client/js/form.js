"use strict";
let today;
let editMode = false;


window.addEventListener("load", function(){
    today = new Date().toISOString().slice(0,10);
    document.getElementById('mindate').setAttribute('min', today);

    editMode = this.localStorage.getItem("editMode");
    if(editMode == "true") {
        changeFormToEditMode();
    }
    // wenn ja, dann änder die .html Seite (fülle alle Felder aus)


});


function changeFormToEditMode(){
    const jsonDATA = JSON.parse(localStorage.getItem("row"));
    localStorage.setItem("editMode", "false");
    document.getElementById("title").innerHTML = "Daten ändern"

    for (var key in jsonDATA){
        var name = key;
        var value = jsonDATA[key];
        
        if(name != "id") {
            console.log(name);
            if(name.toLowerCase().endsWith("datetime")) {
                let stringDateArray = value.split('.');
                document.getElementsByName(key)[0].value = stringDateArray[2] + "-" + stringDateArray[1] + "-" + stringDateArray[0];
            }
            else {
                document.getElementsByName(key)[0].value = value;
            }
        }
    }
}



function addData(){
    var elements = document.getElementById("myForm").elements;
    const nextID=localStorage.getItem('nextID'); //only works if you go from index directly to form
    var obj = {};
    obj["id"]=nextID;
    let missingInput="";
    for(var i=0; i< 11; i++){
        var item = elements.item(i);
        if(item.name === "nextServiceDateTime" && item.value < today && item.value !== ""){
            confirm("Datum für das nächste Service liegt in der Vergangenheit.")
            return
        } else{
            switch(item.name){
                case "name":
                        if(item.value===""){
                            missingInput+=" - Name\n";
                        }
                        break;
                case "weight":
                        if(item.value===""){
                            missingInput+=" - Gewicht in kg\n";
                        }
                        break;
                case "description":
                        if(item.value===""){
                            missingInput+=" - Beschreibung\n";
                        }
                        break;
                case "location":
                        if(item.value===""){
                            missingInput+=" - Standort\n";
                        }
                        break;
                case "room":
                        if(item.value===""){
                            missingInput+=" - Raum\n";
                        }
                        break;
                case "type":
                        if(item.value===""){
                            missingInput+=" - Typ\n";
                        }
                        break;
                case "addedDateTime":
                    if(item.value===""){
                        missingInput+=" - Hinzugefügt am\n";
                    }
                    break;
                default:     
            }            
            obj[item.name] = item.value;
        }
    }
   
    if(missingInput !== ""){
        confirm("Bitte fügen Sie folgende Daten hinzu: "+"\n"+missingInput.slice(0, missingInput.length-1))
        return
    }

    let json = JSON.stringify(obj);
    //document.getElementById("json-output").innerHTML = json;

    if(editMode == true) {
        postData(json);
    }
    else {
        putData(json);
    }


}

function ajaxPostData() {
    if (this.readyState == 4 && this.status == 200) {
        console.log("Data was sent.");
        const responseJSON = JSON.parse(this.responseText);
        console.log(responseJSON);

        if(responseJSON.hasOwnProperty('result')){
            if(responseJSON.result.length == 0) {
                window.alert("Daten wurden erfolgreich gespeichert!");
                document.myForm.reset(); //clears form
                return;
            }
        }
        if(responseJSON.hasOwnProperty('message')){
            if(responseJSON.message.includes("duplicate key value violates unique constraint")) {
                window.alert("Fehler! Leider existiert der Name bereits. Wählen Sie einen anderen Namen aus.");
                return;
            }
        }
    }
}

function postData(json){
    const ajaxObject = new XMLHttpRequest();
    const ajaxURL = "./inventory";
    ajaxObject.onreadystatechange = ajaxPostData;
    ajaxObject.open("POST", ajaxURL, true);
    ajaxObject.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    ajaxObject.send(json);
}



function putData(json){
    console.log("putData");
}



function goToTable() {
    var answer = confirm ("Möchten Sie die Seite wirklich verlassen? \n Alle ungespeicherten Daten gehen verloren.")
    if (answer)
        document.location.href = "./index.html"

}
