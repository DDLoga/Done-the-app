$(document).ready(function(){
    console.log("context-resource.js loaded");

    $('.delete-btn').hide();
    $('table').colResizable();

    // modify existing context
    $(document).on('blur keypress', 'td[contenteditable="True"]', function(e) {
        if (e.type === 'focusout' || e.keyCode == 13) {
            e.preventDefault();
            var id = $(this).data('id');
            var field = $(this).data('field');
            var value = $(this).text();
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
                },
                error: function(response) {
                    console.log("error");
                }
            });
        }
    });

    // add a context
    $('.cntx-btn.add').click(function(e) {
        e.preventDefault();
        // remove the add row from the table
        var selectedRow = $('.add-row').detach();
        // get the last ID in the table
        var lastRowId = $('table.task-table_component tr:last').data('id');
        $.ajax({
            url: addUrl,
            type: 'POST',
            data: {
                'csrfmiddlewaretoken': csrftoken
            },
            success: function(response) {
                lastRow = lastRowId + 1;
                $('table').append(
                    '<tr class="task-table_row" data-id="' + lastRow + '"><td class="tbl-cell centered"><input type="checkbox" name="myCheckbox"><td class="tbl-cell cntx-name" contenteditable="True" data-id="' + lastRow + '" data-field="name">' + response.name + '</td><td class="tbl-cell" contenteditable="True" data-id="' + lastRow + '" data-field="description">' + response.description + '</td></tr>'
                    );
                // recreate the add row
                $('table').append(selectedRow);
            },
            error: function(response) {
                // Handle error
            }
        });
    });

    // show delete button when a checkbox is checked
    $('table input[type="checkbox"]').change(function() {
        if ($('table input[type="checkbox"]:checked').length > 0) {
            $('.delete-btn').show();
        } else {
            $('.delete-btn').hide();
        }
    });

    // delete a context
    $('.delete-btn').click(function(e) {
        e.preventDefault();
        var selected = [];
        $('table input[type="checkbox"]:checked').each(function() {
            selected.push($(this).parent().parent().data('id'));
        });
        $.ajax({
            url: deleteUrl,
            type: 'POST',
            data: {
                'selected': selected,
                'csrfmiddlewaretoken': csrftoken
            },
            success: function(response) {
                console.log("success");
                $('table input[type="checkbox"]:checked').each(function() {
                    $(this).parent().parent().remove();
                });
                $('.delete-btn').hide();
            },
            error: function(response) {
                console.log("error");
            }
        });
    });

});
