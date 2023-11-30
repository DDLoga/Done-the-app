// once the document is fully loaded
$(document).ready(function() {


    ///////////////////////////////////////////////////////////////////////////////// HIDE/SHOW DEFINITIONS /////////////////////////////////////////////////////////////////////////////////
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
    // update funtion 
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

    // show/hide date picker
    $(document).on('click', '.editable', function() {
        $(this).find('.date-input').show();
        $(this).find('.date-display').hide();
    });

    // update date
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

    // update text
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
});