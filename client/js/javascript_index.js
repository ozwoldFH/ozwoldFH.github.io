"use strict";

const searchPropertyNames = ['name', 'weight', 'description', 'location', 'room',
    'type', 'addedAt', 'addedBy', 'lastServiceAt', 'lastServiceBy', 'nextServiceAt'];
const inventory = {};
let searchCount = 0;
let dataTable;
let tableHeaders;
let tableRows;
let lastSearchKey;
let importCsvFileData;
let importRawCsvData;
let loadFunctionCallbackForModal;
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
            localStorage.setItem("deleteId", JSON.stringify(json));
            showMessageModalForDeleteConfirm("Achtung!", "Wollen Sie den Eintrag " + inventory[value].name + " wirklich löschen?");
        });
        $displayEl.empty().append($editBtn).append($deleteBtn);
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
                field: 'addedAtGijgoFormat',
                title: 'Hinzugefügt am',
                minWidth: 120,
                priority: 6,
                type: 'date',
                format: 'dd.mm.yyyy',
                sortable: true
            },
            {field: 'addedBy', title: 'Hinzugefügt von', minWidth: 120, priority: 7, sortable: true},
            {
                field: 'lastServiceAtGijgoFormat',
                title: 'Letzter Service',
                minWidth: 120,
                priority: 7,
                type: 'date',
                format: 'dd.mm.yyyy',
                sortable: true
            },
            {field: 'lastServiceBy', title: 'Letzter Service von', minWidth: 120, priority: 9, sortable: true},
            {
                field: 'nextServiceAtGijgoFormat',
                title: 'Nächstes Service',
                minWidth: 120,
                priority: 10,
                type: 'date',
                format: 'dd.mm.yyyy',
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
                if (item.addedDateTime) {
                    const date = new Date(item.addedDateTime);
                    item.addedAt = convertDateToLocalFormat(date);
                    item.addedAtGijgoFormat = `\/Date(${date.getTime()}\/`;
                } else {
                    item.addedAt = '';
                }
                if (item.lastServiceDateTime) {
                    const date = new Date(item.lastServiceDateTime);
                    item.lastServiceAt = convertDateToLocalFormat(date);
                    item.lastServiceAtGijgoFormat = `\/Date(${date.getTime()}\/`;
                } else {
                    item.addedAt = '';
                }
                if (item.nextServiceDateTime) {
                    const date = new Date(item.nextServiceDateTime);
                    item.nextServiceAt = convertDateToLocalFormat(date);
                    item.nextServiceAtGijgoFormat = `\/Date(${date.getTime()}\/`;
                } else {
                    item.nextServiceAt = '';
                }
                inventory[item.id] = item;
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
    loadFunctionCallbackForModal = loadData;
});


const dataFilter = function (value, searchStr) {
    if (searchStr == null) {
        return true;
    }

    if (searchStr.length < 4) {
        return true;
    }
    const lowerCaseStr = searchStr.toLowerCase();
    const row = inventory[value];
    return searchPropertyNames.some(propName => String(row[propName]).toLowerCase().includes(lowerCaseStr));
};

function showMessageModal(title, message) {
    document.getElementById("modal-title").innerHTML = title;
    document.getElementById("modal-message").innerHTML = message;
    $("#messageModal").modal();
}

function showMessageModalForLoad(title, message) {
    document.getElementById("modal-title-load").innerHTML = title;
    document.getElementById("modal-message-load").innerHTML = message;
    $("#messageModalForLoad").modal();
}

function showMessageModalForDeleteConfirm(title, message) {
    document.getElementById("modal-title-delete-confirm").innerHTML = title;
    document.getElementById("modal-message-delete-confirm").innerHTML = message;
    $("#messageModalForDeleteConfirm").modal();
}

async function confirmDelete() {
    try {
        const json = JSON.parse(localStorage.getItem("deleteId"));
        await request('./inventory', 'DELETE', json);
        showMessageModalForLoad("Erfolg!", "Eintrag wurde erfolgreich gelöscht!");
    } catch (err) {
        showMessageModal("Fehler!", "Eintrag konnte nicht gelöscht werden!");
    }
}

async function loadDataForModal() {
    await loadFunctionCallbackForModal();
}

function convertDateToLocalFormat(textOrDate) {
    if (!textOrDate) {
        return '';
    }
    const date = typeof textOrDate === 'string' ? new Date(textOrDate) : textOrDate;
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

async function onSearch() {
    const currentSearchCount = ++searchCount;
    await sleep(200);
    if (currentSearchCount !== searchCount) {
        return;
    }

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

    const formattedItems = Object.values(inventory).filter(item=>dataFilter(item.id, lastSearchKey)).map((item) => {
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

  function downloadPDF(){
    const headers = [
        'Name',
        'Gewicht',
        'Beschreibung',
        'Standort',
        'Typ',
        'Hinzugefügt am',
        'Hinzugefügt von',
        'Letzter Service',
        'Letzter Service von',
        'Nächstes Service'
    ];

    const formattedItems = Object.values(inventory).filter(item=>dataFilter(item.id, lastSearchKey)).map((item) => {
        return [
            item.name,
            item.weight,
            item.description,
            item.location,
            item.type,
            convertDateToLocalFormat(item.addedDateTime),
            item.addedBy,
            convertDateToLocalFormat(item.lastServiceDateTime),
            item.lastServiceBy,
            convertDateToLocalFormat(item.nextServiceDateTime),
        ];
    });


      var doc = new jsPDF('l', 'mm', [297,210]);
      doc.autoTable(headers, formattedItems, { theme: 'striped', cellWidth: 'auto', headerStyles: {fillColor: [228,104,93]}});

    const addFooters = doc => {
        const pageCount = doc.internal.getNumberOfPages()
      
        doc.setFontSize(9)
        for (var i = 1; i <= pageCount; i++) { 
          doc.setPage(i);
          doc.text('Seite ' + i + ' von ' + String(pageCount), 264, 200, {
            align: 'left'
          })
        }
      }

    addFooters(doc);

    
    doc.save('Inventory.pdf')
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
        const rows = tryValidateImportCSV(text);

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
            const headers = row.invalidHeaders.map(header => `"${header.name}" (${header.reason})`).join(',');
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

function tryValidateImportCSV(text) {
    const separators = [';', '\t', ',', '|', '-', '_', ' '];
    const separatorRows = [];
    for (let i = 0; i < separators.length; i++) {
        const rows = validateImportCsv(text, separators[i]);
        separatorRows.push(rows);
        if (rows.length && rows.every(row => row.invalidHeaders.length === 0)) {
            return rows;
        }
    }

    let minErrorCount = Number.MAX_SAFE_INTEGER;
    let minErrorRows = null;
    for (let i = 0; i < separatorRows.length; i++) {
        const errorCount = separatorRows[i].reduce((pre, cur) => pre + cur.invalidHeaders.length, 0);
        if (errorCount < minErrorCount) {
            minErrorCount = errorCount;
            minErrorRows = separatorRows[i];
        }
    }
    return minErrorRows;
}

function validateImportCsv(text, separator = ';') {
    const lines = text.split('\n').map(line => line.trim('\r'));
    let headers = null;
    let rowIndex = 0;

    try {
        headers = splitValues(lines[0], separator);
    } catch (err) {
        throw `Syntaxfehler in der Kopfzeile. Wert: ${err.valueIndex}, Zeichen ${err.relativeIndex}`;
    }

    try {
        const rows = [];
        for (rowIndex = 1; rowIndex < lines.length; rowIndex++) {
            const values = splitValues(lines[rowIndex], separator);
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
            const invalid = isValueInvalid(propName, values[index]);
            if (invalid) {
                invalidHeaders.push({name: header, reason: invalid});
            }
        }
    });
    const requiredHeaders = {
        name: 'Name',
        weight: 'Gewicht',
        description: 'Beschreibung',
        location: 'Standort',
        type: 'Typ',
        addedDateTime: 'Hinzugefügt am',
        addedBy: 'Hinzugefügt von'
    };
    Object.keys(requiredHeaders).forEach(key => {
        if (!item[key]) {
            invalidHeaders.push({name: requiredHeaders[key], reason: 'fehlt'});
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

function isValueInvalid(propName, value) {
    switch (propName) {
        case 'name':
        case 'description':
        case 'location':
        case 'room':
        case 'type':
        case 'addedBy':
            return !value;
        case 'weight':
            return Number.isNaN(parseFloat(value)) ? 'Format' : false;
        case 'addedDateTime':
            return !validateDate(value) ? 'Format' : false;
        case 'lastServiceDateTime':
            const lastDate = !value || validateDate(value);
            if (!lastDate) {
                return 'Format';
            } else if (lastDate >= new Date()) {
                return 'Zukunft';
            }
            return false;
        case 'nextServiceDateTime':
            const nextDate = !value || validateDate(value);
            if (!nextDate) {
                return 'Format';
            } else if (nextDate <= new Date()) {
                return 'Vergangenheit';
            }
            return false;
        default:
            return false;
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
    const date = new Date(`${nos[2]}-${nos[1]}-${nos[0]}`);
    return date >= minDate ? date : false;
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