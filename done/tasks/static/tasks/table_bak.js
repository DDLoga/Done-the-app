// once the document is fully loaded
$(document).ready(function() {

    // DOUBLE CLICK TO EDIT
    // on double click event listener for all .editable class
    $(document).on("dblclick", ".editable", function() {
        // get the existing text, tag of the item double clicked on and set input_type as text
        var value = $(this).text();
        var data_type = $(this).data("type");
        var input_type = "text";
        // if field deadline chosen, bring a date picker
        if (data_type === "deadline") {
            input_type = "date";
        // if field priority chosen, 
        } else if (data_type === "priority") {
            // get the pk of the item
            var taskId = $(this).data("id");
            var formHtml = '<form id="priority-form-' + taskId + '" class="input-data form-control">';
            formHtml += '{% csrf_token %}{{ task_form.priority }}';
            formHtml += '<input type="submit" style="display: none;"></form>';
            console.log(formHtml.value);
            $(this).html(formHtml);
            $(this).removeClass("editable");

            // Handle form submission for priority change
            $("#priority-form-" + taskId).submit(function(event) {
                event.preventDefault();
                var newPriority = $("#id_priority").val();
                sendToServer(taskId, newPriority, data_type);
            });

            return;
        }
        var input = "<input type='" + input_type + "' class='input-data form-control' value='" + value + "'>";
        $(this).html(input);
        $(this).removeClass("editable");
    });

    // Handle editing blur and keypress events here...
    $(document).on("blur", ".input-data", function() {
        var value = $(this).val();
        var td = $(this).parent("td");
        $(this).remove();
        td.html(value);
        td.addClass("editable");
        var type = td.data("type");
        sendToServer(td.data("id"), value, type);
    });
    $(document).on("keypress", ".input-data", function(e) {
        var key = e.which;
        if (key == 13) {
            var value = $(this).val();
            var td = $(this).parent("td");
            $(this).remove();
            td.html(value);
            td.addClass("editable");
            var type = td.data("type");
            sendToServer(td.data("id"), value, type);
        }
    });

    // Sorting
    $('.tbl-hdr').on('click', function() {
        var column = $(this).data('sort');
        var direction = $(this).hasClass('asc') ? -1 : 1;
        var $table = $(this).closest('table');
        var $rows = $table.find('tbody > tr');

        $rows.sort(function(a, b) {
            var aValue = $(a).find('td[data-type="' + column + '"]').text();
            var bValue = $(b).find('td[data-type="' + column + '"]').text();
            if ($.isNumeric(aValue) && $.isNumeric(bValue)) {
                return direction * (parseFloat(aValue) - parseFloat(bValue));
            } else {
                return direction * aValue.localeCompare(bValue);
            }
        });

        $table.find('th').removeClass('asc').removeClass('desc');
        $(this).addClass(direction === 1 ? 'asc' : 'desc');

        $table.find('tbody').empty().append($rows);

        // Rebind double-click events for editing after sorting
        bindDoubleClickEditing();
    });

    function bindDoubleClickEditing() {
        $(document).on("dblclick", ".editable", function() {
            var value = $(this).text();
            var data_type = $(this).data("type");
            var input_type = "text";
            if (data_type === "deadline") {
                input_type = "date";
            } else if (data_type === "priority") {
                var taskId = $(this).data("id");
                var formHtml = '<form id="priority-form-' + taskId + '" class="input-data form-control">';
                formHtml += '{% csrf_token %}{{ task_form.priority }}';
                formHtml += '<input type="submit" style="display: none;"></form>';
                console.log(formHtml.value);
                $(this).html(formHtml);
                $(this).removeClass("editable");

                // Handle form submission for priority change
                $("#priority-form-" + taskId).submit(function(event) {
                    event.preventDefault();
                    var newPriority = $("#id_priority").val();
                    sendToServer(taskId, newPriority, data_type);
                });

                return;
            }
            var input = "<input type='" + input_type + "' class='input-data form-control' value='" + value + "'>";
            $(this).html(input);
            $(this).removeClass("editable");
        });

        // Handle editing blur and keypress events here...
        $(document).on("blur", ".input-data", function() {
            var value = $(this).val();
            var td = $(this).parent("td");
            $(this).remove();
            td.html(value);
            td.addClass("editable");
            var type = td.data("type");
            sendToServer(td.data("id"), value, type);
        });
        $(document).on("keypress", ".input-data", function(e) {
            var key = e.which;
            if (key == 13) {
                var value = $(this).val();
                var td = $(this).parent("td");
                $(this).remove();
                td.html(value);
                td.addClass("editable");
                var type = td.data("type");
                sendToServer(td.data("id"), value, type);
            }
        });
    }

    function sendToServer(id,value,type){
        console.log(id);
        console.log(value);
        console.log(type);
        $.ajax({
            url:"http://127.0.0.1:8000/save_tasks/",
            type:"POST",
            data:{id:id,type:type,value:value},
        })
        .done(function(response){
            console.log(response);
        })
        .fail(function(){
           console.log("Error Occured");
        });
    }
    // Initial binding of double-click editing
    bindDoubleClickEditing();
});