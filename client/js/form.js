"use strict";
let today;
let editMode = "false";

window.addEventListener("load", function () {
    $(".form-control").bind('input propertychange', onInputValueChanged);

    today = new Date().toISOString().slice(0, 10);
    document.getElementById('mindate').setAttribute('min', today);
    document.getElementById('addedDateTime').setAttribute('max', today);
    document.getElementById('lastServiceDateTime').setAttribute('max', today);

    editMode = this.localStorage.getItem("editMode");
    if (editMode === "true") {
        changeFormToEditMode();
    }

    $('.form-control').each((index, element) => validateElement(element));
});


async function changeFormToEditMode() {
    const jsonDATA = JSON.parse(localStorage.getItem("row"));
    localStorage.setItem("editMode", "false");
    document.getElementById("title").innerHTML = "Daten ändern"
    document.getElementById("h1").innerHTML = "Daten ändern"

    for (var key in jsonDATA) {
        var name = key;
        var value = jsonDATA[key];
        if (name !== "id") {
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

function onInputValueChanged(args) {
    validateElement(args.target);

    if (args.target.name === 'lastServiceDateTime') {
        validateElement(document.getElementById('lastServiceBy'));
    } else if (args.target.name === 'lastServiceBy') {
        validateElement(document.getElementById('lastServiceDateTime'));
    }
}

function validateElement(element) {
    const invalidReason = getInputInvalidReason(element.name, element.value);
    if (invalidReason) {
        $(element).removeClass('is-valid')
            .addClass('is-invalid');

        if (invalidReason !== true) {
            $(element).parent().find('.invalid-feedback').text(invalidReason);
        }
    } else {
        $(element).removeClass('is-invalid')
            .addClass('is-valid');
    }

}

function getInputInvalidReason(title, value) {
    switch (title) {
        case 'name':
            if (!value) {
                return 'Bitte einen Namen angeben.';
            } else if (value.length > 32) {
                return 'Maximale länge von 32 Zeichen';
            }
            return false;
        case 'description':
            if (!value) {
                return 'Bitte die Beschreibung angeben.';
            } else if (value.length > 256) {
                return 'Maximale länge von 256 Zeichen';
            }
            return false;
        case 'location':
            if (!value) {
                return 'Bitte einen Standort angeben.';
            } else if (value.length > 32) {
                return 'Maximale länge von 32 Zeichen';
            }
            return false;
        case 'room':
            if (!value) {
                return 'Bitte einen Raum angeben.';
            } else if (value.length > 32) {
                return 'Maximale länge von 32 Zeichen';
            }
            return false;
        case 'type':
            if (!value) {
                return 'Bitte einen Typ angeben.';
            } else if (value.length > 32) {
                return 'Maximale länge von 32 Zeichen';
            }
            return false;
        case 'addedBy':
            if (!value) {
                return 'Bitte angeben, wer diesen Gegenstand hinzugefügt hat.';
            } else if (value.length > 32) {
                return 'Maximale länge von 32 Zeichen';
            }
            return false;
        case 'weight':
            const weight = Number(value.replace(',', '.'));
            return !(weight && weight > 0);
        case 'addedDateTime':
            if (!value) {
                return 'Bitte ein Datum angeben.';
            }
            const addedDate = validateDate(value);
            if (!addedDate) {
                return 'Bitte das Datum im richtigen Format angeben.';
            } else if (addedDate > new Date()) {
                return 'Datum darf nicht in der Zukunft liegen.';
            }
            return false;
        case 'lastServiceDateTime':
            if ($('#lastServiceBy').val() && !value) {
                return 'Bitte ein Datum angeben.'
            }
            const lastDate = !value || validateDate(value);
            if (!lastDate) {
                return 'Bitte das Datum im richtigen Format angeben.';
            } else if (lastDate > new Date()) {
                return 'Datum darf nicht in der Zukunft liegen.';
            }
            return false;
        case 'lastServiceBy':
            if ($('#lastServiceDateTime').val() && !value) {
                return 'Bitte Person angebeben.';
            } else if (value.length > 32) {
                return 'Maximale länge von 32 Zeichen';
            }
            return false;
        case 'nextServiceDateTime':
            if (!value) {
                return false;
            }
            const nextDate = validateDate(value);
            if (!nextDate) {
                return 'Bitte das Datum im richtigen Format angeben.';
            } else if (nextDate <= new Date()) {
                return 'Datum muss in der Zukunft liegen.';
            }
            return false;
        default:
            return null;
    }
}

function validateDate(text) {
    const date = new Date(text);
    const nos = text.split('-').map(no => Number(no));
    const year = nos[0];
    const month = nos[1] - 1;
    const day = nos[2];
    return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year ? date : false;
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
    if ($('.is-invalid').length) {
        return;
    }

    const elements = document.getElementById("myForm").elements;
    const obj = {};
    if (editMode === "true") {
        const jsonDATA = JSON.parse(localStorage.getItem("row"));
        obj["id"] = jsonDATA["id"];
    } else {
        obj["id"] = -1;
    }

    for (let i = 0; i < 11; i++) {
        const item = elements.item(i);
        if ((item.name === 'addedDateTime' || item.name === 'nextServiceDateTime' || item.name === 'lastServiceDateTime') && item.value !== '') {
            const ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('safari') !== -1) {
                if (ua.indexOf('chrome') <= -1) {
                    if (!validateDateSafari(item.value)) {
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

    if (editMode === "true") {
        await putData(obj);
    } else {
        const objArray = new Array(obj);
        await postData(objArray);
    }

}

// date validation for safari
function validateDateSafari(date) {
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