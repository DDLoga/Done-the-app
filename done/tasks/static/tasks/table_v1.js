// once the document is fully loaded
$(document).ready(function() {


    ///////////////////////////////////////////////////////////////////////////////// HIDE/SHOW SECTIONS ON LOAD/////////////////////////////////////////////////////////////////////////////////
    // HIDE/SHOW HINT DIV AND DELETE BUTTON WHILE CHANGING THE INPUT TYPE
    $('input[type=radio][name=input-type]').change(function() {
        $('#hint-div').hide();
        $('#delete-btn').show();
    });

    ///////////////////////////////////////////////////////////////////////////////// COL RESIZABLE DEFINITIONS /////////////////////////////////////////////////////////////////////////////////
    // DEFINE THE ColResizable PARAMETERS
    const applyColResizable = (selector) => {
        $(selector).colResizable({
            liveDrag: true,
            resizeMode: 'fit',
            draggingClass: "dragging",
            gripInnerHtml: "<div class='grip'></div>",
            minWidth: 15
        });
    };

    // Add event listener for htmx:afterOnLoad event TO APPLY THE ColResizable
    document.body.addEventListener('htmx:afterOnLoad', function(event) {
        applyColResizable('.table_component');
    });

    ///////////////////////////////////////////////////////////////////////////////// CRUD FUNCTIONS DEFINITIONS /////////////////////////////////////////////////////////////////////////////////
    // UPDATE FUNCTION DEFINITION
    function updateItem(id, field, value, successCallback) {
        console.log("updateItem function triggered");
        console.log("id: " + id);
        console.log("field: " + field);
        console.log("value: " + value);
        console.log("updateUrl: " + updateUrl);
        console.log('successCallback: ' + successCallback);
        $.ajax({
            url: updateUrl,
            type: 'POST',
            data: {
                'id': id,
                'field': field,
                'value': value,
                'csrfmiddlewaretoken': csrftoken
            },
            success: successCallback,
            error: function(response) {
                console.log("error");
                console.log(response);
            }
        });
    }

    // DELETE FUNCTION DEFINITION
    function deleteProject(id, successCallback) {
        $.ajax({
            url: deleteUrl,
            type: 'POST',
            data: {
                'id': id,
                'csrfmiddlewaretoken': csrftoken
            },
            success: function() {
                // Check if successCallback is a function before calling it
                if (typeof successCallback === 'function') {
                    successCallback();
                }
                // Trigger htmx request to reload the table
                htmx.trigger('#project-radio', 'change');
            },
            error: function(response) {
                console.log("error");
                console.log(response);
            }
        });
    }

    ///////////////////////////////////////////////////////////////////////////////// CONTENT UPDATE DEFINITION /////////////////////////////////////////////////////////////////////////////////
    // DATE UPDATE
    $(document).on('change', '.date-input', function() {
        var value = $(this).val();
        var id = $(this).parent().data('id');
        var field = $(this).parent().data('field');
        var self = $(this);

        updateItem(id, field, value, function(response) {
            var formattedDate = new Date(value);

            // Update span element with new date and show it
            var dateDisplay = self.siblings('.date-display');
            dateDisplay.text(formattedDate.getDate() + ' ' + formattedDate.toLocaleString('default', { month: 'short' }));
            dateDisplay.show();

            // Hide date picker
            self.hide();
        });
    });

    // DATE UPDATE - SHOW/HIDE DATE PICKER ON CLICK
    $(document).on('click', '.editable', function() {
        $(this).find('.date-input').show();
        $(this).find('.date-display').hide();
    });

    // TEXT UPDATE
    $(document).on('blur keypress', 'td[contenteditable="True"]', function(e) {
        if (e.type === 'focusout' || e.keyCode == 13) {
            e.preventDefault();
            var id = $(this).data('id');
            var field = $(this).data('field');
            var value = $(this).text();
            console.log("value: " + value);
            console.log("id: " + id);
            console.log("field: " + field);
            updateItem(id, field, value, function(response) {
                console.log("success");
                console.log(response);
            });
        }
    });

    // EFFORT VALUE - DATA VALIDATION TO BE A NUMBER
    $(document).on('blur', '.editable-effort', function() {
        var value = $(this).text();
        if (isNaN(value)) {
            alert("Please enter a number");
            $(this).text('');
            $(this).focus();
        }
    });

    // PRIORITY UPDATE - CREATE DROP DOWN MENU ON CLICK
    $(document).on('click', '.priority', function() {
        var id = $(this).data('id');
        var field = $(this).data('field');
        var currentValue = $(this).text();
        var self = $(this);

        // Create select element
        var select = $('<select class="priority-select"></select>');
        select.data('id', id);
        select.data('field', field);

        // Add CSS styles to the dropdown
        select.css({
            'color': 'white',
            'border': 'none',
            'padding': '5px',
            'font-size': '14px',
            'border-radius': '5px',
            'display': 'block',
            'margin': 'auto'
        });


        // Populate select options
        var PRIORITIES = ['-','A', 'B', 'C', 'D'];
        $.each(PRIORITIES, function(_, value) {
            var option = $('<option></option>').val(value).text(value);
            if (value === currentValue) {
                option.prop('selected', true);
            }
            select.append(option);
        });

        // Replace td with select
        self.replaceWith(select);

        // Open the dropdown menu
        select.show().focus();
    });

    // PRIORITY UPDATE - GET THE EXISTING PRIORITY VALUE
    var originalValue;
    $(document).on('focus', '.priority-select', function() {
        console.log("focus triggered");
        // Store the original value when the dropdown menu is opened
        originalValue = $(this).val();
        console.log('originalValue: ' + originalValue); 
    });

    // PRIORITY UPDATE - UPDATE THE PRIORITY VALUE IF CHANGE DETECTED
    $(document).on('focusout change', '.priority-select', function() {
        var value = $(this).val();
        var id = $(this).data('id');
        var field = $(this).data('field');
        var self = $(this);

        if (value !== originalValue) {
            // If the value has changed, trigger the updateItem function
            console.log('value changed - POST triggered');
            updateItem(id, field, value, function(response) {
                // Replace select with td
                var td = $('<td class="priority tbl-cell centered"></td>');
                td.data('id', id);
                td.data('field', field);
                td.text(value);
                self.replaceWith(td);
            });
        } else {
            // If the value has not changed, remove the dropdown menu and display the original value
            var td = $('<td class="priority tbl-cell centered"></td>');
            td.data('id', id);
            td.data('field', field);
            td.text(originalValue);
            self.replaceWith(td);
        }
    });

    //EXPERIMENT ON CONTEXT MENU CREATION//////////////////////////////////////////////////////////////////////////////////////////////////////
    // PRIORITY UPDATE - CREATE DROP DOWN MENU ON CLICK
    $(document).on('click', '.context', function() {
        var id = $(this).data('id');
        var field = $(this).data('field');
        var currentValue = $(this).text();
        var self = $(this);

        // Create select element
        var select = $('<select class="priority-select"></select>');
        select.data('id', id);
        select.data('field', field);

        // Add CSS styles to the dropdown
        select.css({
            'color': 'white',
            'border': 'none',
            'padding': '5px',
            'font-size': '14px',
            'border-radius': '5px',
            'display': 'block',
            'margin': 'auto'
        });


        // Populate select options
        var PRIORITIES = ['-','A', 'B', 'C', 'D'];
        $.each(PRIORITIES, function(_, value) {
            var option = $('<option></option>').val(value).text(value);
            if (value === currentValue) {
                option.prop('selected', true);
            }
            select.append(option);
        });

        // Replace td with select
        self.replaceWith(select);

        // Open the dropdown menu
        select.show().focus();
    });

    // PRIORITY UPDATE - GET THE EXISTING PRIORITY VALUE
    var originalValue;
    $(document).on('focus', '.priority-select', function() {
        console.log("focus triggered");
        // Store the original value when the dropdown menu is opened
        originalValue = $(this).val();
        console.log('originalValue: ' + originalValue); 
    });

    // PRIORITY UPDATE - UPDATE THE PRIORITY VALUE IF CHANGE DETECTED
    $(document).on('focusout change', '.priority-select', function() {
        var value = $(this).val();
        var id = $(this).data('id');
        var field = $(this).data('field');
        var self = $(this);

        if (value !== originalValue) {
            // If the value has changed, trigger the updateItem function
            console.log('value changed - POST triggered');
            updateItem(id, field, value, function(response) {
                // Replace select with td
                var td = $('<td class="priority tbl-cell centered"></td>');
                td.data('id', id);
                td.data('field', field);
                td.text(value);
                self.replaceWith(td);
            });
        } else {
            // If the value has not changed, remove the dropdown menu and display the original value
            var td = $('<td class="priority tbl-cell centered"></td>');
            td.data('id', id);
            td.data('field', field);
            td.text(originalValue);
            self.replaceWith(td);
        }
    }); 







    ///////////////////////////////////////////////////////////////////////////////// DELETE DEFINITION /////////////////////////////////////////////////////////////////////////////////
    // create a dialog box to confirm deletion
    $(document).on('click', '.completion-checkbox', function(e) {
        var id = $(this).data('id');
        var self = $(this);
    
        // Create modal dialog
        var dialog = $('<div></div>').html('Do you want to delete the selected project?');
        dialog.dialog({
            title: 'Confirm Deletion',
            modal: true,
            buttons: {
                'Yes': function() {
                    deleteProject(id);  // Call deleteProject function
                    $(this).dialog('close');
                },
                'No': function() {
                    self.prop('checked', false);  // Uncheck checkbox
                    $(this).dialog('close');
                }
            },
            create: function() {
                // Change the text of the close button to 'X'
                $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').text('X');
            }
        });
    });

    ///////////////////////////////////////////////////////////////////////////////// CONTENT CREATION /////////////////////////////////////////////////////////////////////////////////
    $(document).on('click', '.content-btn', function(e) {
        console.log("add button clicked");
        e.preventDefault();
        // remove the add row from the table
        var selectedRow = $('.add-row').detach();
        // get the last ID in the table
        var lastRowId = $('table.table_component tr:last').data('id');
        $.ajax({
            url: addUrl,
            type: 'POST',
            data: {
                'csrfmiddlewaretoken': csrftoken
            },
            success: function(response) {
                lastRow = lastRowId + 1;
                $('table').append(
                    '<tr class="rendered-row" data-id="' + response.project_id + '"><td class="tbl-cell centered"><input type="checkbox" data-id="' + response.project_id + '" class="input-data form-control completion-checkbox"></td><td class="priority tbl-cell centered" data-id="' + response.project_id + '" data-field="project_priority">-</td><td class="editable tbl-cell" contenteditable="True" data-id="' + response.project_id + '" data-field="project_name">' + response.name + '</td><td class="editable tbl-cell centered" data-id="' + response.project_id + '" data-field="project_deadline"><span class="date-display">-</span><input type="date" class="date-input" style="display: none;" value=""></td></tr>'
                    );
                // recreate the add row
                $('table').append(selectedRow);
            },
            error: function(response) {
                // Handle error
            }
        });
    });

});