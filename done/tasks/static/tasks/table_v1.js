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


});