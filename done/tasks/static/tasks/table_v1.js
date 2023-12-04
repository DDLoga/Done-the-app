// once the document is fully loaded
$(document).ready(function() {


    ///////////////////////////////////////////////////////////////////////////////// HIDE/SHOW SECTIONS ON LOAD/////////////////////////////////////////////////////////////////////////////////
        // HIDE THE DELETE BUTTON ON LOAD
        $('#delete-btn').hide();

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

    // Add event listener for htmx:afterOnLoad event RO APPLY THE ColResizable
    document.body.addEventListener('htmx:afterOnLoad', function(event) {
        applyColResizable('.table_component');
    });

    ///////////////////////////////////////////////////////////////////////////////// CRUD SECTION /////////////////////////////////////////////////////////////////////////////////
    // UPDATE FUNCTION DEFINITION
    function updateProject(id, field, value, successCallback) {
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

    // SHOW/HIDE DATE PICKER ON CLICK
    $(document).on('click', '.editable', function() {
        $(this).find('.date-input').show();
        $(this).find('.date-display').hide();
    });

    // DATE UPDATE
    $(document).on('change', '.date-input', function() {
        var value = $(this).val();
        var id = $(this).parent().data('id');
        var field = $(this).parent().data('field');
        var self = $(this);

        updateProject(id, field, value, function(response) {
            var formattedDate = new Date(value);

            // Update span element with new date and show it
            var dateDisplay = self.siblings('.date-display');
            dateDisplay.text(formattedDate.getDate() + ' ' + formattedDate.toLocaleString('default', { month: 'short' }));
            dateDisplay.show();

            // Hide date picker
            self.hide();
        });
    });

    // TEXT UPDATE
    $(document).on('blur keypress', 'td[contenteditable="True"]', function(e) {
        if (e.type === 'focusout' || e.keyCode == 13) {
            e.preventDefault();
            var id = $(this).data('id');
            var field = $(this).data('field');
            var value = $(this).text();

            updateProject(id, field, value, function(response) {
                console.log("success");
                console.log(response);
            });
        }
    });

    // PRIORITY UPDATE
    // Show dropdown on click
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
        var PRIORITIES = ['A', 'B', 'C', 'D'];
        $.each(PRIORITIES, function(index, value) {
            var option = $('<option></option>').val(value).text(value);
            if (value === currentValue) {
                option.prop('selected', true);
            }
            select.append(option);
        });
    
        // Replace td with select
        self.replaceWith(select);
    });
    
    // Update priority on change
    $(document).on('change', '.priority-select', function() {
        var value = $(this).val();
        var id = $(this).data('id');
        var field = $(this).data('field');
        var self = $(this);
    
        updateProject(id, field, value, function(response) {
            // Replace select with td
            var td = $('<td class="priority tbl-cell centered" contenteditable="True"></td>');
            td.data('id', id);
            td.data('field', field);
            td.text(value);
            self.replaceWith(td);
        });
    });

    // DELETE FUNCTION DEFINITION
    function deleteProject(id, successCallback) {
        $.ajax({
            url: deleteUrl,
            type: 'POST',
            data: {
                'id': id,
                'csrfmiddlewaretoken': csrftoken
            },
            success: successCallback,
            error: function(response) {
                console.log("error");
                console.log(response);
            }
        });
    }

    $(document).on('click', '.completion-checkbox', function(e) {
        e.preventDefault();
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
                // Style the dialog box
                var dialog = $(this).closest('.ui-dialog');
                dialog.find('.ui-dialog-titlebar')
                    .css({
                        'background-color': '#2F3B52',
                        'color': '#FFFFFF',
                        'border': 'none',
                        'border-radius': '10px 10px 0 0',
                        'box-shadow': '0px 2px 10px rgba(0, 0, 0, 0.1)',
                        'display': 'flex',
                        'justify-content': 'space-between',
                        'padding-left' : '10px',
                        'padding-right' : '10px',
                        'height': '30px',
                        'align-items': 'center'
                    });
                dialog.find('.ui-dialog-content')
                    .css({
                        'background-color': '#3F4C6B',
                        'color': '#FFFFFF',
                        'display': 'flex',
                        'justify-content': 'center',
                        'align-items': 'center',
                        'padding-left' : '10px',
                        'padding-right' : '10px'
                    });
                dialog.find('.ui-dialog-buttonpane')
                    .css({
                        'background-color': '#3F4C6B',
                        'color': '#FFFFFF',
                        'border-radius': '0 0 10px 10px',
                        'display': 'flex',
                        'justify-content': 'center',
                        'height': '30px'
                    });
                dialog.find('.ui-dialog-buttonset .ui-button').first()
                    .css({
                        'background-color': '#0078D7',
                        'color': '#FFFFFF',
                        'border': 'none',
                        'border-radius': '5px',
                        'box-shadow': '0px 2px 5px rgba(0, 0, 0, 0.1)',
                        'margin-right': '10px'
                    });
                dialog.find('.ui-dialog-buttonset .ui-button').last()
                    .css({
                        'background-color': '#0078D7',
                        'color': '#FFFFFF',
                        'border': 'none',
                        'border-radius': '5px',
                        'box-shadow': '0px 2px 5px rgba(0, 0, 0, 0.1)'
                    });
                // Change the text of the close button to 'X'
                dialog.find('.ui-dialog-titlebar-close')
                    .text('X');
            }
        });
    });



});