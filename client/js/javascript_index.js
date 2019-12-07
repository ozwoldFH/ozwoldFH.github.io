"use strict";

$(document).ready(function(){
    console.log("=== page ready ===");

    // Initializes the element with id grid as bootgrid with some settings
    // For more information check out Documentation:
    // http://www.jquery-bootgrid.com/Documentation
    const dataTable = $("#grid").bootgrid({
        caseSensitive: false,
        columnSelection: false,
        rowCount: -1,
        searchSettings: {
            delay: 50,
            characters: 2
        },
        formatters:{ // code inspired by http://www.jquery-bootgrid.com/Examples#more
            "commands":function(column, row)
            {
                return "<button type='button' class='btn btn-success btn-s command-edit' data-row='"+JSON.stringify(row)+"'>Editieren</button>";
            }
        },
        labels: {
            all: "Alle",
            infos: "Zeigt {{ctx.total}} Einträgen",
            loading: "Laden...",
            noResults: "Keine Daten",
            search: "Suchen"
        }
    }).on("loaded.rs.jquery.bootgrid", function()
    {
        dataTable.find(".command-edit").on("click", function(e)
        {

            // code inspired by https://www.codeply.com/go/iIGPoW4qmr/bootstrap-edit-table-row
            // $('#exampleModal').modal("show");
            // var modalBody = $('<div id="modalContent"></div>');
            // var modalForm = $('<form role="form" name="modalForm" method="post"></form>');
            // var jsonDATA = $(this).data().row;            
            // for (var key in jsonDATA){
            //     var name = key;
            //     var value = jsonDATA[key];
            //     var formGroup = $('<div class="form-group"></div>');
            //     formGroup.append('<label for="'+name+'">'+name+'</label>');
            //     formGroup.append('<input class="form-control" name="'+name+'" id="'+name+'" value="'+value+'" />'); 
            //     modalForm.append(formGroup);
            // }
            // modalBody.append(modalForm);
            // $('.modal-body').html(modalBody);     
            
            localStorage.setItem("editMode", "true");
            localStorage.setItem("row", $(this).data().row);
            document.location.href = "./form.html"

            // mach eine localStorage Variable die EDITIEREN = TRUE setzt
            // speichere zustzlich ins localStorage die row ab
            // gehe zur form
            

            // $.post("form.html", function(data){
            //     var formGroup = $('<div class="form-group"></div>');
            //     var body=data.replace(/^.*?<body>(.*?)<\/body>.*?$/s,"$1");
            //     formGroup.append(body);
            //     modalForm.append(formGroup);
            //     modalBody.append(modalForm);

            //     console.log(modalBody);
            //     //console.log(body);
            //     $(".modal-body").html(modalBody);
            
            // });
        });
    });

    function ajaxLoadData() {
        if (this.readyState == 4 && this.status == 200) {
            const dataJSON = JSON.parse(this.responseText);
            dataTable.bootgrid("append", dataJSON);
        }
    }

    function loadData() {
        const ajaxObject = new XMLHttpRequest();
        //const ajaxURL = "https://raw.githubusercontent.com/ozwoldFH/webapp_inventory_WS2019/master/data/data.json";
        const ajaxURL = "./inventory";
        ajaxObject.onreadystatechange = ajaxLoadData;
        ajaxObject.open("GET", ajaxURL, true);
        ajaxObject.send();
    }



    // call function
    loadData();

    $("#grid-header").find('.actionBar').prepend('<button id="addDataButton" type="button" onclick="window.print();return false;">Drucken</button>');
    $("#grid-header").find('.actionBar').prepend('<button id="printButton" type="button" onclick="goToForm()">Daten hinzufügen</button>');
    $("#grid-header").find('.fa-search').remove();       
    //$('#grid-header').find('.form-control').css({'border': 'none', 'padding':'15px 32px', 'text-align': 'center','text-decoration': 'none', 'display': 'inline-block','font-size': '16px'});

});

function goToForm() {
    document.location.href = "./form.html"
}




