"use strict";
let today;



window.addEventListener("load", function(){
    today = new Date().toISOString().slice(0,10);
    document.getElementById('mindate').setAttribute('min', today);

    const editMode = this.localStorage.getItem("editMode");
    if(editMode == "true") {
        changeFormToEditMode();
    }
    // wenn ja, dann änder die .html Seite (Daten hinzufügen auf bearbetein, fülle alle Felder aus, button addData() auf updateData())


});


function changeFormToEditMode(){
    const jsonDATA = localStorage.getItem("row");
    localStorage.setItem("editMode", "false");
    document.getElementById("title").innerHTML = "Daten ändern"
    console.log(JSON.stringify(jsonDATA));
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

    postData(json);


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

function goToTable() {
    var answer = confirm ("Möchten Sie die Seite wirklich verlassen? \n Alle ungespeicherten Daten gehen verloren.")
    if (answer)
        document.location.href = "./index.html"

}
