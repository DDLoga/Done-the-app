$(document).ready(function() {
    // create a date editor because the default one is not working
    var dateEditor = function(cell, onRendered, success, cancel){
    var cellValue = cell.getValue(),
    input = document.createElement("input");

    input.type = "text";
    input.value = cellValue;

    onRendered(function(){
        input.focus();
        input.style.height = "100%";

        flatpickr(input, {
            defaultDate: cellValue || null,
            onChange: function(selectedDates, dateStr, instance){
                success(dateStr);
            },
        });
    });

    return input;
    };

    // configuration of the table
    var task_table = new Tabulator("#task-table", {
        ajaxURL: "/task-get/",
        ajaxProgressiveLoad: "scroll",
        paginationSize: 20,
        columns: [
            { title: "Name", field: "name", editor: "input" },
            { title: "Priority", field: "priority", editor: "select", editorParams: {values: task_priorities} },
            { title: "Compound Priority", field: "compound_priority", editor: "number" },
            { title: "Deadline", field: "deadline", editor: dateEditor },
            { title: "Status", field: "status", editor: "select", editorParams: {values: task_statuses} },
            { title: "Effort", field: "effort", editor: "number" },
            { title: "Context", field: 'context__name', editor: "select", editorParams: {values: contextNames} },
            { title: "Assignee", field: "assignee__name", editor: "select", editorParams: {values: assigneeNames} },
            { title: "Parent", field: "parent__project_name", editor: "select", editorParams: {values: parentNames} },
            { title: "Completed", field: "complete", formatter: "tickCross", editor: true },
        ],
        cellEdited: function(cell) {
        // send the new data to the server
        console.log(cell.getField() + " of row " + cell.getRow().getIndex() + " changed to " + cell.getValue());
        var showAddTaskDialog = false;

        // Check if the edited cell is the 'complete' field and its new value is true
        if (cell.getField() == 'complete' && cell.getValue() == true) {
            // Show the 'add-task-dialog'
            document.getElementById('add-task-dialog').showModal();
            showAddTaskDialog = true;
        }

        $.ajax({
            url: "/task-update/",  // replace with the actual path
            method: "POST",
            data: {
                id: cell.getRow().getIndex(),
                field: cell.getField(),
                value: cell.getValue()
            },
            success: function() {
                // Trigger the click event listener of the 'delete-task-button' if the 'add-task-dialog' was shown
                if (showAddTaskDialog) {
                    $.ajax({
                    url: '/delete_task/',  // Replace with the URL of your view
                    type: 'DELETE',
                    success: function(response) {
                        // Handle the response from the server
                        if (response.success) {
                            // If the server successfully deleted the tasks, reload the table
                            // $('#tasks-table').tabulator('setData');
                            task_table.setData("/task-get/");
                        }
                    }
                });
                }
            }
        });
    }
    });

    // Open the form to create a new task
    document.getElementById('add-task-button').addEventListener('click', function() {
        document.getElementById('add-task-dialog').showModal();
    });

    // Close the form to create a new task
    document.getElementById('close-dialog').addEventListener('click', function() {
        document.getElementById('add-task-dialog').close();
    });


    // Submit the form to create a new task
    $('#add-task-form').on('submit', function(event) {
        event.preventDefault();
        $.ajax({
        url: '/create_task/',  // Replace with the URL of your view
        type: 'POST',
        data: $(this).serialize(),
        success: function(response) {
            // close the dialog
            document.getElementById('add-task-dialog').close();
            // refresh the table
            task_table.setData("/task-get/");
        }
        });
    });

    });