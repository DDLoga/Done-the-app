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

    // configuration of the table only if in project page
    if (tabletype === 'project') {
        // configuration of the table
        // variable to enable the highlighting of the row
        var prevRow = null;
        var project_filter = null;
        var project_table = new Tabulator("#project-table", {
            // layout:"fitData", //fit columns to width of data
            // theme:"midnight",
            resizableColumns: true,
            ajaxURL: "/project-get/",
            ajaxProgressiveLoad: "scroll",
            paginationSize: 20,
            tableBuilding: function(){
                this.element.classList.add("dual-table"); //add class to table
            },
            columns: [
                { title: "Name", field: "project_name", editor: "input"},
                { title: "Priority", field: "project_priority", editor: "select", editorParams: {values: project_priorities} },
                { title: "Deadline", field: "project_deadline", editor: dateEditor },
                { title: "Status", field: "project_status", editor: "select", editorParams: {values: project_statuses} },
                { title: "Completed", field: "project_complete", formatter: "tickCross", editor: true },
            ],
        // add a listener to the click event that highlight the row
        cellClick: function(e, cell) {
            // set the variable project_table to be the value of the field field: "project_name" of the row
            project_filter = cell.getRow().getData().project_name;
            task_table.setData();
            // If there is a previously clicked row, reset its background color
            if (prevRow) {
                prevRow.getElement().style.backgroundColor = "";
            }

            // Highlight the current row
            cell.getRow().getElement().style.backgroundColor = "#133774";

            // Update the previously clicked row
            prevRow = cell.getRow();
        },
        // add a listener to the edit event that send the data to the server
        cellEdited: function(cell) {
            // send the new data to the server
            console.log(cell.getField() + " of row " + cell.getRow().getIndex() + " changed to " + cell.getValue());
            var showAddTaskDialog = false;
        
            // Check if the edited cell is the 'complete' field and its new value is true
            if (cell.getField() == 'project_complete' && cell.getValue() == true) {
            console.log("project_complete");
                // Show the 'add-task-dialog'
                document.getElementById('add-project-dialog').showModal();
                showAddTaskDialog = true;
            }
        
            $.ajax({
                url: "/project-update/",  // replace with the actual path
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
                        url: '/delete_project/',  // Replace with the URL of your view
                        type: 'DELETE',
                        success: function(response) {
                            // Handle the response from the server
                            if (response.success) {
                                // If the server successfully deleted the projects, reload the table
                                // $('#projects-table').tabulator('setData');
                                project_table.setData("/project-get/");
                            }
                        }
                    });
                    }
                }
            });
        }
        });
    }

    // configuration of the task table
    var task_table = new Tabulator("#task-table", {
        layout:"fitData", //fit columns to width of data
        // theme:"midnight",
        resizableColumns: true,
        ajaxURL: "/task-get/",
        ajaxProgressiveLoad: "scroll",
        paginationSize: 20,
        tableBuilding: function(){
            if (tabletype === 'project') {
                this.element.classList.add("dual-table"); //add class to table
            }
        },
        columns: [
            { title: "Name", field: "name", editor: "input" },
            { title: "Priority", field: "priority", editor: "select", editorParams: {values: task_priorities} },
            // { title: "Compound Priority", field: "compound_priority", editor: "number" },
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
                            task_table.setData("/task-get/");
                        }
                    }
                });
                }
            }
        });
    },
    ajaxResponse: tabletype === 'project' ? function(url, params, response) {
        // Check if response is an array
        if (Array.isArray(response)) {
            // Filter the tasks
            return response.filter(function(task) {
                return task.parent__project_name === project_filter;
            });
        } else if (response.data && Array.isArray(response.data)) {
            // If the tasks are inside a 'data' property, filter them
            return { data: response.data.filter(function(task) {
                return task.parent__project_name === project_filter;
            })};
        } else {
            // If response is not an array and does not have a 'data' property that is an array, log an error message and return an object with an empty 'data' property
            console.error('Unexpected response structure');
            return { data: [] };
        }
    } : null,
    });

    // Function to add event listeners to the dialog buttons
    function addDialogEventListeners(openButtonId, closeButtonId, dialogId) {
    document.getElementById(openButtonId).addEventListener('click', function() {
        document.getElementById(dialogId).showModal();
    });
    document.getElementById(closeButtonId).addEventListener('click', function() {
        document.getElementById(dialogId).close();
    });
    }

    // Use the function to add the event listeners - not used if in task page
    if (tabletype === 'project') {
        addDialogEventListeners('add-project-button', 'close-project-dialog', 'add-project-dialog');
    }
    addDialogEventListeners('add-task-button', 'close-task-dialog', 'add-task-dialog');


    // Submit the form to create a new project
    $('#add-project-form').on('submit', function(event) {
    event.preventDefault();
    $.ajax({
        url: '/create_project/',  // Replace with the URL of your view
        type: 'POST',
        data: $(this).serialize(),
        success: function(response) {
        // close the dialog
        
        document.getElementById('add-project-dialog').close();
        
        // refresh the table
        project_table.setData("/project-get/");

        
        }
    });
    });

    // Submit the form to create a new task
    $('#add-task-form').on('submit', function(event) {
    event.preventDefault();

    // Get the form data
    var formData = $(this).serializeArray();

    // Convert the form data to an object
    var data = {};
    $.each(formData, function(i, field) {
        data[field.name] = field.value;
    });
    

    // Set the "parent__project_name" field to the value of the "project_filter" variable
    data.parent__project_name = project_filter;

    $.ajax({
        url: '/create_task/',  // Replace with the URL of your view
        type: 'POST',
        data: data,
        success: function(response) {
        // close the dialog
        document.getElementById('add-task-dialog').close();
        // refresh the table
        task_table.setData("/task-get/");
        document.getElementById('add-task-form').style.display = 'block';
        }
    });
    });
    
});
