"use strict";
let today;
let editMode = "false";

window.addEventListener("load", function() {
    // validation code. code by https://getbootstrap.com/docs/4.2/components/forms/?
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and check
    Array.prototype.filter.call(forms, function(form) {
        if (form.checkValidity() === false) {
            form.classList.add('was-validated');
        }
    });



  today = new Date().toISOString().slice(0, 10);
  document.getElementById('mindate').setAttribute('min', today);

  editMode = this.localStorage.getItem("editMode");
  if (editMode == "true") {
    changeFormToEditMode();
  }

});


async function changeFormToEditMode() {
    const jsonDATA = JSON.parse(localStorage.getItem("row"));
    localStorage.setItem("editMode", "false");
    document.getElementById("title").innerHTML = "Daten ändern"
    document.getElementById("h1").innerHTML = "Daten ändern"

    for (var key in jsonDATA) {
        var name = key;
        var value = jsonDATA[key];
        if (name != "id") {
            if (name.toLowerCase().endsWith("datetime")) {
                if (value) {
                    const date = new Date(value);
                    document.getElementsByName(key)[0].value = date.toISOString().split('T')[0];
                }
            } else {
                if (!name.toLowerCase().endsWith("format") && !name.toLowerCase().endsWith("at")) {
                    document.getElementsByName(key)[0].value = value;
                }
            }
        }
    }
}

function showMessageModal(title, message) {
    document.getElementById("modal-title").innerHTML = title;
    document.getElementById("modal-message").innerHTML = message;
    $("#messageModal").modal();
}

function showMessageModalAndGoBackToIndex(title, message) {
    document.getElementById("modal-title-index").innerHTML = title;
    document.getElementById("modal-message-index").innerHTML = message;
    $("#messageModalAndGoBackToIndex").modal();
}

function showMessageModalForEditMode(title, message) {
    document.getElementById("modal-title-edit").innerHTML = title;
    document.getElementById("modal-message-edit").innerHTML = message;
    $("#messageModalForEditMode").modal();
}

async function addData() {
    var forms = document.getElementsByClassName('needs-validation');
    var validation = true;
    Array.prototype.filter.call(forms, function(form) {
        if (form.checkValidity() === false) {
            form.classList.add('was-validated');
            validation = false;
        }
    });

    if (validation == false) {
        return;
    }

    
    var elements = document.getElementById("myForm").elements;
    var obj = {};
    if (editMode == "true") {
        const jsonDATA = JSON.parse(localStorage.getItem("row"));
        obj["id"] = jsonDATA["id"];
    } else {
        obj["id"] = -1;
    }
    let missingInput = "";
    for (var i = 0; i < 11; i++) {
        var item = elements.item(i);
        if ((item.name === 'addedDateTime' || item.name === 'nextServiceDateTime' || item.name === 'lastServiceDateTime') && item.value !== '') {
            var ua = navigator.userAgent.toLowerCase();
            if(ua.indexOf('safari') != -1){
                if(ua.indexOf('chrome') <= -1){
                    if(!validateDate(item.value)){
                        return;
                    }
                }
                
            }         
        }
        if (item.name === "nextServiceDateTime" && item.value < today && item.value !== "") {
            showMessageModal("Fehler bei der Eingabe", "Datum für das nächste Service liegt in der Vergangenheit.");
            return
        } 
        obj[item.name] = item.value;
    }

    var objArray = new Array(obj);

    if (editMode == "true") {
        await putData(obj);
    } else {
        await postData(objArray);
    }

}

// date validation for safari
function validateDate(date) {
  let pattern = /([0-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
  if (!pattern.test(date)) {
    showMessageModal("Fehler bei der Eingabe", "Invalides Datum: Datum sollte im YYYY-MM-DD Format und valide sein!");
    return false;
  }
  return true;
}

async function postData(body) {
    try {
        await request("./inventory", "POST", body);
        showMessageModalAndGoBackToIndex("Erfolg!", "Daten wurden erfolgreich gespeichert!");

        // TODO go -> bitte showMessageModal so ändern, dass je nach Button klick weitergeht oder nicht
        // document.location.href = "./index.html"
    } catch (err) {
        if (err.message.includes("duplicate key value violates unique constraint")) {
            showMessageModal("Fehler!", "Leider existiert der Name bereits. Wählen Sie einen anderen Namen aus.");
        } else {
            showMessageModal("Fehler!", "Daten konnten nicht gespeichert werden.");
        }
    }
}

async function putData(body) {
    try {
        await request("./inventory", "PUT", body);
        showMessageModalAndGoBackToIndex("Erfolg!", "Daten wurden erfolgreich gespeichert!");
    } catch (err) {
        if (err.message.includes("duplicate key value violates unique constraint")) {
            showMessageModal("Fehler!", "Leider existiert der Name bereits. Wählen Sie einen anderen Namen aus.");
        } else {
            showMessageModal("Fehler!", "Daten konnten nicht gespeichert werden.");
        }
    }
}

function goToTable(force) {
    if (editMode === "true") {
        showMessageModalForEditMode("Achtung!", "Möchten Sie die Seite wirklich verlassen? \n Alle ungespeicherten Daten gehen verloren.");
        if(force === true) {
            document.location.href = "./index.html"
        }
    } else {
        document.location.href = "./index.html"
    }
}