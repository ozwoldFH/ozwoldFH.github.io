"use strict";
let today;
let editMode = "false";


window.addEventListener("load", function() {
  today = new Date().toISOString().slice(0, 10);
  document.getElementById('mindate').setAttribute('min', today);

  editMode = this.localStorage.getItem("editMode");
  if (editMode == "true") {
    changeFormToEditMode();
  }

});


function changeFormToEditMode() {
  const jsonDATA = JSON.parse(localStorage.getItem("row"));
  localStorage.setItem("editMode", "false");
  document.getElementById("title").innerHTML = "Daten ändern"

  for (var key in jsonDATA) {
    var name = key;
    var value = jsonDATA[key];
    if (name != "id") {
      if (name.toLowerCase().endsWith("datetime")) {
        if (value) {
          const date = new Date(value);
          document.getElementsByName(key)[0].value = date.toISOString().split('T')[0];
        }
      }
      else {
        document.getElementsByName(key)[0].value = value;
      }
    }
  }
}



function addData() {
  var elements = document.getElementById("myForm").elements;
  var obj = {};
  if (editMode == "true") {
    const jsonDATA = JSON.parse(localStorage.getItem("row"));
    obj["id"] = jsonDATA["id"];
  }
  else {
    obj["id"] = -1;
  }
  let missingInput = "";
  for (var i = 0; i < 11; i++) {
    var item = elements.item(i);
    if ((item.name === 'addedDateTime' || item.name === 'nextServiceDateTime' || item.name === 'lastServiceDateTime') && item.value !== '') {
      validateDate(item.value);
    }
    if (item.name === "nextServiceDateTime" && item.value < today && item.value !== "") {
      confirm("Datum für das nächste Service liegt in der Vergangenheit.")
      return
    } else {
      switch (item.name) {
        case "name":
          if (item.value === "") {
            missingInput += " - Name\n";
          }
          break;
        case "weight":
          if (item.value === "") {
            missingInput += " - Gewicht in kg\n";
          }
          break;
        case "description":
          if (item.value === "") {
            missingInput += " - Beschreibung\n";
          }
          break;
        case "location":
          if (item.value === "") {
            missingInput += " - Standort\n";
          }
          break;
        case "room":
          if (item.value === "") {
            missingInput += " - Raum\n";
          }
          break;
        case "type":
          if (item.value === "") {
            missingInput += " - Typ\n";
          }
          break;
        case "addedDateTime":
          if (item.value === "") {
            missingInput += " - Hinzugefügt am\n";
          }
          break;
        default:
      }
      obj[item.name] = item.value;
    }
  }

  if (missingInput !== "") {
    confirm("Bitte fügen Sie folgende Daten hinzu: " + "\n" + missingInput.slice(0, missingInput.length - 1))
    return
  }

  let json = JSON.stringify(obj);
  //document.getElementById("json-output").innerHTML = json;

  if (editMode == "true") {
    putData(json);
  }
  else {
    postData(json);
  }


}

// date validation for safari
function validateDate(date) {
  let pattern = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;

  if (!pattern.test(date)) {
    confirm('Invalides Datum: Datum sollte gültig und im Brower Safari im YYYY-MM-DD Format sein!')
  }
}

function ajaxPostData() {
  if (this.readyState == 4 && this.status == 200) {
    const responseJSON = JSON.parse(this.responseText);

    if (responseJSON.hasOwnProperty('result')) {
      if (responseJSON.result.length == 0) {
        window.alert("Daten wurden erfolgreich gespeichert!");
        document.myForm.reset(); //clears form
        return;
      }
    }
    if (responseJSON.hasOwnProperty('message')) {
      if (responseJSON.message.includes("duplicate key value violates unique constraint")) {
        window.alert("Fehler! Leider existiert der Name bereits. Wählen Sie einen anderen Namen aus.");
        return;
      }
    }
  }
}

function postData(json) {
  const ajaxObject = new XMLHttpRequest();
  const ajaxURL = "./inventory";
  ajaxObject.onreadystatechange = ajaxPostData;
  ajaxObject.open("POST", ajaxURL, true);
  ajaxObject.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  ajaxObject.send(json);
}






function ajaxPutData() {
  if (this.readyState == 4 && this.status == 200) {
    const responseJSON = JSON.parse(this.responseText);

    if (responseJSON.hasOwnProperty('result')) {
      if (responseJSON.result.length == 0) {
        window.alert("Daten wurden erfolgreich geändert!");
        return;
      }
    }
    if (responseJSON.hasOwnProperty('message')) {
      if (responseJSON.message.includes("duplicate key value violates unique constraint")) {
        window.alert("Fehler! Leider existiert der Name bereits. Wählen Sie einen anderen Namen aus.");
        return;
      }
    }
  }
}

function putData(json) {
  const ajaxObject = new XMLHttpRequest();
  const ajaxURL = "./inventory";
  ajaxObject.onreadystatechange = ajaxPutData;
  ajaxObject.open("PUT", ajaxURL, true);
  ajaxObject.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  ajaxObject.send(json);
}



function goToTable() {
  if (editMode === "true") {
    var answer = confirm("Möchten Sie die Seite wirklich verlassen? \n Alle ungespeicherten Daten gehen verloren.")
    if (answer) {
      document.myForm.reset();
      document.location.href = "./index.html"
    }
  } else {
    document.myForm.reset();
    document.location.href = "./index.html"
  }


}
