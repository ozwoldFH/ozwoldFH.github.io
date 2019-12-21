"use strict";

const inventory = {};
let dataTable;
let tableHeaders;
let tableRows;
let lastSearchKey;
let importCsvFileData;
let importRawCsvData;
$(document).ready(function () {
    console.log("=== page ready ===");

    const editRenderer = function (value, record, $cell, $displayEl) {
        const editBtnHtml = '<button type="button" class="btn btn-success btn-sm command-edit table-btn" id="editBtn">Editieren</button>';
        const $editBtn = $(editBtnHtml).on('click', function () {
            const row = inventory[value];
            localStorage.setItem("editMode", "true");
            localStorage.setItem("row", JSON.stringify(row));
            goToForm("./form.html");
        });
        const deleteBtnHtml = '<button type="button" class="btn btn-danger btn-sm command-delete table-btn mt-1">L&ouml;schen</button>';
        const $deleteBtn = $(deleteBtnHtml).on('click', async function () {
            const json = {id: inventory[value].id};
            const userInput = confirm("Wollen Sie den Eintrag " + inventory[value].name + " wirklich löschen?");
            if (userInput) {
                try {
                    await request('./inventory', 'DELETE', json);
                    window.alert("Eintrag wurde erfolgreich gelöscht!");
                    await loadData();
                } catch (err) {
                    window.alert("Eintrag konnte nicht gelöscht werden!");
                }
            }
        });
        $displayEl.empty().append($editBtn).append($deleteBtn);
    };
    const dateRenderer = function (value, record, $cell, $displayEl) {
        const formattedDate = convertDateToLocalFormat(value);
        $displayEl.empty().append($(`<div>${formattedDate}</div>`));
    };
    const dataFilter = function (value, searchStr) {
        if (searchStr.length < 4) {
            return true;
        }
        const lowerCaseStr = searchStr.toLowerCase();
        const row = inventory[value];
        const values = Object.values(row);
        for (let i = 1; i < values.length; i++) {
            if (String(values[i]).toLowerCase().includes(lowerCaseStr)) {
                return true;
            }
        }
        return false;
    };

    dataTable = $("#grid").grid({
        responsive: true,
        detailTemplate: '<div></div>',
        showHiddenColumnsAsDetails: true,
        notFoundText: 'Keine Einträge',
        columns: [
            {field: 'name', title: 'Name', sortable: true},
            {field: 'weight', title: 'Gewicht [kg]', width: 110, minWidth: 110, priority: 1, sortable: true},
            {field: 'description', title: 'Beschreibung', minWidth: 120, priority: 2, sortable: true},
            {field: 'location', title: 'Standort', minWidth: 120, priority: 3, sortable: true},
            {field: 'room', title: 'Raum', minWidth: 120, priority: 4, sortable: true},
            {field: 'type', title: 'Typ', minWidth: 100, priority: 5, sortable: true},
            {
                field: 'addedDateTime',
                title: 'Hinzugefügt am',
                minWidth: 120,
                priority: 6,
                type: 'date',
                renderer: dateRenderer,
                sortable: true
            },
            {field: 'addedBy', title: 'Hinzugefügt von', minWidth: 120, priority: 7, sortable: true},
            {
                field: 'lastServiceDateTime',
                title: 'Letzter Service',
                minWidth: 120,
                priority: 7,
                renderer: dateRenderer,
                sortable: true
            },
            {field: 'lastServiceBy', title: 'Letzter Service von', minWidth: 120, priority: 9, sortable: true},
            {
                field: 'nextServiceDateTime',
                title: 'Nächstes Service',
                minWidth: 120,
                priority: 10,
                type: 'date',
                renderer: dateRenderer,
                sortable: true
            },
            {field: 'id', title: '', width: 120, renderer: editRenderer, filter: dataFilter},
        ],
    });
    tableHeaders = dataTable.children()[0].children[0].children;
    tableRows = dataTable.children()[1].children;
    dataTable.on('resize', function () {
        checkColumnsCount();
    });

    async function loadData() {
        try {
            const dataJSON = await request("./inventory", "GET");
            dataTable.clear();
            dataJSON.forEach(item => {
                inventory[item.id] = {...item};
                dataTable.addRow(item);
            });
            checkColumnsCount();
        } catch (e) {
            console.log(e);
        }
    }

    $("#searchBox").bind('input propertychange', onSearch);
    $("#importFileInput").change(updateImportFileStatus);
    $("#importRawCsvText").bind('input propertychange', updateImportRawStatus);

    loadData();
    checkColumnsCount();
});

function convertDateToLocalFormat(text) {
    if (!text) {
        return '';
    }
    const date = new Date(text);
    const options = {year: 'numeric', month: '2-digit', day: '2-digit'};
    return date.toLocaleDateString('de-AT', options);
}

function checkColumnsCount() {
    let viewsAllColumns = true;
    for (let i = 1; i < tableHeaders.length; i++) {
        if (tableHeaders.item(i).style["display"] === "none") {
            viewsAllColumns = false;
            break;
        }
    }

    const detailRowsDisplay = viewsAllColumns ? "none" : null;
    tableHeaders.item(0).style["width"] = viewsAllColumns ? "0px" : null;

    for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows.item(i);
        if (row.getAttribute("data-role") === "details") {
            row.style["display"] = detailRowsDisplay;
        }
    }
}

function onSearch() {
    let currentSearchKey = $('#searchBox').val();
    if (currentSearchKey.length < 4) {
        currentSearchKey = '';
    }
    if (currentSearchKey !== lastSearchKey) {
        dataTable.reload({id: currentSearchKey});
        lastSearchKey = currentSearchKey;
    }
}

function goToForm(formURL) {
    document.location.href = formURL;
}

function convertToCSV(object) {
    let arr = typeof object != 'object' ? JSON.parse(object) : object;
    let str = '';

    for (let i = 0; i < arr.length; i++) {
        let line = '';
        let col = '';
        for (let index in arr[i]) {
            col = arr[i][index];
            col = typeof col === 'string' ? col.replace(/"/g, '""') : col;
            col = '"' + col + '";';
            line += col;
        }
        str += line + '\r\n';
    }
    return str;
}

function exportCSVFile(header, items, name) {
    if (header) {
        items.unshift(header); //put in front
    }

    //object to JSON
    let jsonObject = JSON.stringify(items);
    let csv = convertToCSV(jsonObject);
    let fileName = name + '.csv';

    let blob = new Blob(["\ufeff", csv]);
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, fileName)
    } else {
        let link = document.createElement("a");
        if (link.download !== undefined) {
            let url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function downloadCSV() {
    const headers = {
        name: 'Name',
        weight: 'Gewicht',
        description: 'Beschreibung',
        location: 'Standort',
        type: 'Typ',
        addedDateTime: 'Hinzugefügt am',
        addedBy: 'Hinzugefügt von',
        lastServiceDateTime: 'Letzter Service',
        lastServiceBy: 'Letzter Service von',
        nextServiceDateTime: 'Nächstes Service'
    };

    const formattedItems = Object.values(inventory).map((item) => {
        return {
            name: item.name,
            weight: item.weight,
            description: item.description,
            location: item.location,
            type: item.type,
            addedDateTime: convertDateToLocalFormat(item.addedDateTime),
            addedBy: item.addedBy,
            lastServiceDateTime: convertDateToLocalFormat(item.lastServiceDateTime),
            lastServiceBy: item.lastServiceBy,
            nextServiceDateTime: convertDateToLocalFormat(item.nextServiceDateTime),
        };
    });

    let fileName = "Inventar";
    exportCSVFile(headers, formattedItems, fileName);
}

function downloadPDF() {
    alert('to be continued...')
}

function openImportDataOverlay() {
    $('#import-overlay').fadeIn(200);
    $('body').addClass('noscroll');
    updateImportFileStatus();
}

function closeImportDataOverlay() {
    $('#import-overlay').fadeOut(200);
    $('body').removeClass('noscroll');
}

function updateImportFileStatus() {
    const files = document.getElementById('importFileInput').files;
    const file = files && files.length ? files[0] : null;

    if (file) {
        $('#importFileLabel').text(file.name);
        readImportFile(file, 'importFileInfo');
    } else {
        $('#importFileLabel').text('Datei auswählen');
        $('#importFileInfo').hide();
        importCsvFileData = null;
    }
}

function readImportFile(file) {
    const fr = new FileReader();
    fr.onload = function () {
        importCsvFileData = parseCsvAndShowValidationInfos(fr.result, 'importFileInfo');
    };
    fr.readAsText(file);
}

function updateImportRawStatus() {
    const text = $('#importRawCsvText').val();

    if (text) {
        importRawCsvData = parseCsvAndShowValidationInfos(text, 'importRawInfo');
    } else {
        $('#importRawInfo').hide();
        importRawCsvData = null;
    }
}

function parseCsvAndShowValidationInfos(text, infoElementId) {
    try {
        const rows = validateImportCsv(text);

        if (rows.length === 0) {
            $(`#${infoElementId}`).text('Keine gültigen Daten enthalten')
                .addClass('text-warning')
                .removeClass('text-success')
                .removeClass('text-danger')
                .show();
            return null;
        } else if (rows.every(row => row.invalidHeaders.length === 0)) {
            $(`#${infoElementId}`).text('Gültige Zeilen: ' + rows.length)
                .removeClass('text-warning')
                .addClass('text-success')
                .removeClass('text-danger')
                .show();
            return rows.map(row => row.item);
        }

        const list = rows.map((row, index) => {
            if (!row.invalidHeaders.length) {
                return '';
            }
            const headers = row.invalidHeaders.map(header => `"${header}"`).join(',');
            return `<li>Zeile ${index + 1}: ${headers}</li>`;
        }).filter(Boolean).join('');
        $(`#${infoElementId}`).html('<label>Invalide Zeilen:</label><br><ul>' + list + '</ul>')
            .removeClass('text-warning')
            .removeClass('text-success')
            .addClass('text-danger')
            .show();
        return null;
    } catch (err) {
        $(`#${infoElementId}`).text(err)
            .removeClass('text-warning')
            .removeClass('text-success')
            .addClass('text-danger')
            .show();
        return null;
    }
}

function validateImportCsv(text) {
    const lines = text.split('\n').map(line => line.trim('\r'));
    let headers = null;
    let rowIndex = 0;

    try {
        headers = splitValues(lines[0]);
    } catch (err) {
        throw `Syntaxfehler in der Kopfzeile. Wert: ${err.valueIndex}, Zeichen ${err.relativeIndex}`;
    }

    try {
        const rows = [];
        for (rowIndex = 1; rowIndex < lines.length; rowIndex++) {
            const values = splitValues(lines[rowIndex]);
            if (values) {
                rows.push(getInventoryItemAndInvalidHeaders(headers, values));
            }
        }
        return rows;
    } catch (err) {
        throw `Syntaxfehler in Zeile ${rowIndex}. Wert: ${err.valueIndex}, Zeichen ${err.relativeIndex}`;
    }
}

function splitValues(line, separator = ';') {
    if (!line || !line.length) {
        return null;
    }

    const values = [];
    let literal = false;
    let isValueBegin = true;
    for (let i = 0; i < line.length; i++) {
        if (isValueBegin) {
            if (line[i] === separator) {
                literal = false;
                values.push('');
            } else if (line[i] === '"') {
                literal = true;
                isValueBegin = false;
                values.push('');
            } else {
                literal = false;
                isValueBegin = false;
                values.push(line[i]);
            }
        } else {
            if (!literal && line[i] === separator) {
                isValueBegin = true;
            } else if (literal && line[i] === '"') {
                literal = false;
            } else {
                values[values.length - 1] += line[i];
            }
        }
    }

    if (isValueBegin) {
        values.push('');
    }

    if (literal) {
        throw {
            lineIndex: line.length,
            valueIndex: values.length,
            relativeIndex: values[values.length - 1].length,
        }
    }

    return values;
}

function getInventoryItemAndInvalidHeaders(headers, values) {
    const item = {};
    const invalidHeaders = [];
    headers.forEach((header, index) => {
        const propName = getInventoryPropertyName(header);
        if (propName) {
            item[propName] = convertValue(propName, values[index]);
            if (!isValueValid(propName, values[index])) {
                invalidHeaders.push(header);
            }
        }
    });
    return {item, invalidHeaders};
}

function getInventoryPropertyName(header) {
    const lowerHeader = header.toLowerCase();
    switch (lowerHeader) {
        case 'name':
            return 'name';
        case 'beschreibung':
            return 'description';
        case 'standort':
            return 'location';
        case 'raum':
            return 'room';
        case 'typ':
            return 'type';
        case 'hinzugefügt von':
            return 'addedBy';
        case 'hinzugefügt am':
            return 'addedDateTime';
        case 'letzter service':
            return 'lastServiceDateTime';
        case 'letzter service von':
            return 'lastServiceBy';
        case 'nächstes service':
            return 'nextServiceDateTime';
        default:
            return lowerHeader.startsWith('gewicht') ? 'weight' : null;
    }
}

function isValueValid(propName, value) {
    switch (propName) {
        case 'name':
        case 'description':
        case 'location':
        case 'room':
        case 'type':
        case 'addedBy':
            return value;
        case 'weight':
            return !Number.isNaN(parseFloat(value));
        case 'addedDateTime':
            return validateDate(value);
        case 'lastServiceDateTime':
            return !value || validateDate(value);
        case 'nextServiceDateTime':
            return !value || validateDate(value, new Date());
        default:
            return true;
    }
}

function convertValue(propName, value) {
    switch (propName) {
        case 'weight':
            return parseFloat(value);
        case 'addedDateTime':
        case 'lastServiceDateTime':
        case 'nextServiceDateTime':
            return convertDateFromLocalFormat(value);
        default:
            return value;
    }
}

function convertDateFromLocalFormat(text) {
    return text && text.split('.').reverse().join('-');
}

function validateDate(text, minDate) {
    const parts = text.split('.');
    if (parts.length !== 3 || !parts.every(isValidInt)) {
        return false;
    }

    if (!minDate) {
        minDate = new Date('0000-01-01');
    }

    const nos = parts.map(part => parseInt(part));
    const date = new Date(nos[2], nos[1], nos[0]);
    return date >= minDate;
}

function isValidInt(text) {
    return text.split('').every(c => c >= 0 && c <= 9);
}

async function importFileCSV() {
    await importCSV(importCsvFileData, 'importFileInfo');
}

async function importRawCSV() {
    await importCSV(importRawCsvData, 'importRawInfo');
}

async function importCSV(data, infoElementId) {
    if (!data) {
        $(`#${infoElementId}`).text('Keine validen Daten zum importieren vorhanden')
            .addClass('text-warning')
            .removeClass('text-success')
            .removeClass('text-danger')
            .show();
        return;
    }

    try {
        const result = await request('./inventory', 'POST', data);
        $(`#${infoElementId}`).text('Hinzugefügte Zeilen: ' + result)
            .removeClass('text-warning')
            .addClass('text-success')
            .removeClass('text-danger')
            .show();
    } catch (err) {
        $(`#${infoElementId}`).text('Daten wurden nicht gespeichert')
            .removeClass('text-warning')
            .removeClass('text-success')
            .addClass('text-danger')
            .show();
    }
}