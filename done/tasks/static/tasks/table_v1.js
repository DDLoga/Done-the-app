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
    $(document).on('click', '.editable', function() {
        console.log('editable clicked');
        $(this).find('.date-input').show();
        $(this).find('.date-display').hide();
    });
    
    
    // update existing context
    $(document).on('blur keypress', 'td[contenteditable="True"], input[contenteditable="True"]', function(e) {
        if (e.type === 'focusout' || e.keyCode == 13) {
            e.preventDefault();
            var id = $(this).data('id');
            var field = $(this).data('field');
            // var value = $(this).text();
            var value;
            if ($(this).is('input[type="date"]')) {
                value = $(this).val();
            } else {
                value = $(this).text();
            }
            console.log('id is: ' +id);
            console.log('field is: ' +field);
            console.log('value is: ' +value);
            console.log('update url is: ' +updateUrl);
            $.ajax({
                url: updateUrl,
                type: 'POST',
                data: {
                    'id': id,
                    'field': field,
                    'value': value,
                    'csrfmiddlewaretoken': csrftoken
                },
                success: function(response) {
                    console.log("success");
                    console.log(response);
                },
                error: function(response) {
                    console.log("error");
                    console.log(response);
                }
            });
        }
    });
});