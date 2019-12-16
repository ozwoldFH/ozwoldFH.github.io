"use strict";

const inventory = {};
let dataTable;
let tableHeaders;
let tableRows;
let lastSearchKey;
$(document).ready(function() {
  console.log("=== page ready ===");

  function ajaxDeleteData() {
      if (this.readyState == 4 && this.status == 200) {
          const responseJSON = JSON.parse(this.responseText);

          if(responseJSON.hasOwnProperty('result')){
              if(responseJSON.result.length == 0) {
                  window.alert("Eintrag wurde erfolgreich gelöscht!");
                  goToForm("./index.html");
                  return;
              }
          }
      }
  }

  const deleteRenderer = function(value, record, $cell, $displayEl) {
    const $btn = $('<button type="button" class="btn btn-danger btn-s command-delete">L&ouml;schen</button>').on('click', function() {
      const row = inventory[value];
      var json = {};
      json["id"] = inventory[value].id;
      var userInput = confirm("Wollen Sie den Eintrag " + inventory[value].name + " wirklich löschen?");
      if (userInput) {
        const ajaxObject = new XMLHttpRequest();
        const ajaxURL = "./inventory";
        ajaxObject.onreadystatechange = ajaxDeleteData;
        ajaxObject.open("DELETE", ajaxURL, true);
        ajaxObject.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        ajaxObject.send(JSON.stringify(json));
      }
    });
    $displayEl.empty().append($btn);
  };
  const editRenderer = function(value, record, $cell, $displayEl) {
    const $btn = $('<button type="button" class="btn btn-success btn-s command-edit">Editieren</button>').on('click', function() {
      const row = inventory[value];
      localStorage.setItem("editMode", "true");
      localStorage.setItem("row", JSON.stringify(row));
      goToForm("./form.html");
    });
    $displayEl.empty().append($btn);
  };
  const dateRenderer = function(value, record, $cell, $displayEl) {
    let formattedDate;
    if (value) {
      const date = new Date(value);
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      formattedDate = date.toLocaleDateString('de-AT', options);
    } else {
      formattedDate = '';
    }

    $displayEl.empty().append($(`<div>${formattedDate}</div>`));
  };
  const dataFilter = function(value, searchStr) {
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
      { field: 'name', title: 'Name', sortable: true },
      { field: 'weight', title: 'Gewicht [kg]', width: 110, minWidth: 110, priority: 1, sortable: true },
      { field: 'description', title: 'Beschreibung', minWidth: 120, priority: 2, sortable: true },
      { field: 'location', title: 'Standort', minWidth: 120, priority: 3, sortable: true },
      { field: 'room', title: 'Raum', minWidth: 120, priority: 4, sortable: true },
      { field: 'type', title: 'Typ', minWidth: 100, priority: 5, sortable: true },
      {
        field: 'addedDateTime',
        title: 'Hinzugefügt am',
        minWidth: 120,
        priority: 6,
        type: 'date',
        renderer: dateRenderer,
        sortable: true
      },
      { field: 'addedBy', title: 'Hinzugefügt von', minWidth: 120, priority: 7, sortable: true },
      {
        field: 'lastServiceDateTime',
        title: 'Letzter Service',
        minWidth: 120,
        priority: 7,
        renderer: dateRenderer,
        sortable: true
      },
      { field: 'lastServiceBy', title: 'Letzter Service von', minWidth: 120, priority: 9, sortable: true },
      {
        field: 'nextServiceDateTime',
        title: 'Nächstes Service',
        minWidth: 120,
        priority: 10,
        type: 'date',
        renderer: dateRenderer,
        sortable: true
      },
      { field: 'id', title: '', width: 120, renderer: editRenderer, filter: dataFilter },
      { field: 'id', title: '', width: 120, renderer: deleteRenderer, filter: dataFilter },
    ],
  });
  tableHeaders = dataTable.children()[0].children[0].children;
  tableRows = dataTable.children()[1].children;
  dataTable.on('resize', function() {
    checkColumnsCount();
  });

  function ajaxLoadData() {
    if (this.readyState == 4 && this.status == 200) {
      const dataJSON = JSON.parse(this.responseText);
      dataJSON.forEach(item => {
        inventory[item.id] = { ...item };
        dataTable.addRow(item);
      });
      checkColumnsCount();
    }
  }

  function loadData() {
    const ajaxObject = new XMLHttpRequest();
    const ajaxURL = "./inventory";
    ajaxObject.onreadystatechange = ajaxLoadData;
    ajaxObject.open("GET", ajaxURL, true);
    ajaxObject.send();
  }



  // call function
  loadData();
  checkColumnsCount();
});

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
    dataTable.reload({ id: currentSearchKey });
    lastSearchKey = currentSearchKey;
  }
}

function goToForm(formURL) {
  document.location.href = formURL;
}
