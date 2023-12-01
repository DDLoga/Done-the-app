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
    // create a list of priorities pulled from the models.py to populate the dropdown menu
    $(document).on('click', '.priority', function() {
        var id = $(this).data('id');
        var field = $(this).data('field');
        var currentValue = $(this).text();
        var self = $(this);
    
        // Create select element
        var select = $('<select class="priority-select"></select>');
        select.data('id', id);
        select.data('field', field);
    
        // Populate select options
        $.each(PRIORITIES, function(index, value) {
            var option = $('<option></option>').val(value[0]).text(value[1]);
            if (value[0] === currentValue) {
                option.prop('selected', true);
            }
            select.append(option);
        });
    
        // Replace td with select
        self.replaceWith(select);
    });
    
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

});