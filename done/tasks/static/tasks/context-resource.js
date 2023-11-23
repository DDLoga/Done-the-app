$(document).ready(function(){
    console.log("context-resource.js loaded");

    $('table').colResizable();

    $(document).on('blur keypress', 'td[contenteditable="True"]', function(e) {
        if (e.type === 'focusout' || e.keyCode == 13) {
            console.log(csrftoken);
            e.preventDefault();
            var id = $(this).data('id');
            var field = $(this).data('field');
            var value = $(this).text();
            console.log('id is: ' +id);
            console.log('field is: ' +field);
            console.log('value is: ' +value);
            $.ajax({
                url: '/update_context/',
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

    $('.cntx-btn.add').click(function(e) {
        e.preventDefault();
        // remove the add row from the table
        var selectedRow = $('.add-row').detach();
        $.ajax({
            url: '/add_context/',
            type: 'POST',
            data: {
                'csrfmiddlewaretoken': csrftoken
            },
            success: function(response) {
                // Add a new row to the table
                $('table').append('<tr><td>' + response.name + '</td><td>' + response.description + '</td></tr>');
                // recreate the add row
                $('table').append(selectedRow);
            },
            error: function(response) {
                // Handle error
            }
        });
    });

});
