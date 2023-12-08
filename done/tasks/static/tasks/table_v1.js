// once the document is fully loaded
$(document).ready(function() {

    ///////////////////////////////////////////////////////////////////////////////// HIDE/SHOW SECTIONS ON LOAD/////////////////////////////////////////////////////////////////////////////////
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

    // Add event listener for htmx:afterOnLoad event TO APPLY THE ColResizable
    document.body.addEventListener('htmx:afterOnLoad', function(event) {
        applyColResizable('.table_component');
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                          UPDATE AND DELETE FUNCTIONS                                                                                      //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // UPDATE FUNCTION DEFINITION
    function updateItem(id, field, value, successCallback) {
        console.log("update to server function triggered");
        console.log("id: " + id);
        console.log("field: " + field);
        console.log("value: " + value);
        console.log("updateUrl: " + updateUrl);
        console.log('successCallback: ' + successCallback);
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

        // .done(function(response){
        //     // identify if we are on the project page or the task page
        //     var isChecked = $("#project-radio").is(":checked");
        //     console.log("isChecked: " + isChecked);
        //     if (field === 'priority' && !isChecked) {
        //         var task_id = id;
        //         console.log("task_id: " + task_id);
        //         // call a view that pull the compound priority from the database and update the task
        //         fetch(compound_priority_url+`?task_id=${task_id}`)
        //             .then(response => response.json())
        //             .then(data => {
        //                 var compoundPriority = data.compound_priority;
        //                 document.getElementById('compound-priority-'+id).textContent = compoundPriority;
        //             });
                    
        //     } else if (field === 'priority' && isChecked) {
        //         // call a view that pull the completion percentage from the database and update all tasks
        //         // fetch('/api/tasks/')
        //         fetch(api_tasks_url) 
        //             .then(response => response.json())
        //             .then(tasks => {
        //                 tasks.forEach(task => {
        //                     var tdElement = document.getElementById('compound-priority-' + task.pk);
        //                     if (tdElement) {
        //                         tdElement.textContent = task.fields.compound_priority;
        //                     }
        //                 });
        //             })
        //             .catch(error => console.error('Error:', error));
        //     }})

    }

    // DELETE FUNCTION DEFINITION
    function deleteProject(id, successCallback) {
        $.ajax({
            url: deleteUrl,
            type: 'POST',
            data: {
                'id': id,
                'csrfmiddlewaretoken': csrftoken
            },
            success: function() {
                // Check if successCallback is a function before calling it
                if (typeof successCallback === 'function') {
                    successCallback();
                }
                // Trigger htmx request to reload the table
                htmx.trigger('#project-radio', 'change');
            },
            error: function(response) {
                console.log("error");
                console.log(response);
            }
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                          CONTENT UPDATE DEFINITIONS                                                                                       //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // DATE UPDATE
    $(document).on('change', '.date-input', function() {
        var value = $(this).val();
        var id = $(this).parent().data('id');
        var field = $(this).parent().data('field');
        var self = $(this);

        updateItem(id, field, value, function(response) {
            var formattedDate = new Date(value);

            // Update span element with new date and show it
            var dateDisplay = self.siblings('.date-display');
            dateDisplay.text(formattedDate.getDate() + ' ' + formattedDate.toLocaleString('default', { month: 'short' }));
            dateDisplay.show();

            // Hide date picker
            self.hide();
        });
    });

    // DATE UPDATE - SHOW/HIDE DATE PICKER ON CLICK
    $(document).on('click', '.editable', function() {
        $(this).find('.date-input').show();
        $(this).find('.date-display').hide();
    });

    // TEXT UPDATE
    $(document).on('blur keypress', 'td[contenteditable="True"]', function(e) {
        if (e.type === 'focusout' || e.keyCode == 13) {
            e.preventDefault();
            var id = $(this).data('id');
            var field = $(this).data('field');
            var value = $(this).text();
            updateItem(id, field, value, function(response) {
                console.log("success");
                console.log(response);
            });
        }
    });

    // EFFORT VALUE - DATA VALIDATION TO BE A NUMBER
    $(document).on('blur', '.editable-effort', function() {
        var value = $(this).text();
        if (isNaN(value)) {
            alert("Please enter a number");
            $(this).text('');
            $(this).focus();
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                          PRIORITY, CONTEXT AND ASSIGNEE DROPDOWNS MENU                                                                   //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Priority Update - on click listener that fires the handleClick function
    $(document).on('click', '.priority', function() {
        handleClick('priority', ['-','A', 'B', 'C', 'D']);
    });
    
    // Context Update - on click listener that fires the handleClick function
    $(document).on('click', '.context', function() {
        handleClick('context', contextOptions);
    });

    // Assignee Update - on click listener that fires the handleClick function
    $(document).on('click', '.assignee', function() {
        handleClick('assignee', assigneeOptions);
    });

    // collect the id, field and current value of the className and fire the createDropdown function to insert the dropdown
    function handleClick(className, options) {
        $(document).on('click', '.' + className, function() {
            var id = $(this).data('id');
            var field = $(this).data('field');
            var currentValue = $(this).text();
            var self = $(this);

            var select = createDropdown(id, field, currentValue, options, className + '-dropdown');

            self.replaceWith(select);
            select.show().focus();
        });
    }

    function createDropdown(id, field, currentValue, options, dropdownClass, dropdownTag) {
        var select = $('<select class="' + dropdownClass + '"></select>');
        select.data('id', id);
        select.data('field', field);
    
        // Populate select options
        $.each(options, function(_, value) {
            var option = $('<option></option>').val(value).text(value);
            if (value === currentValue) {
                option.prop('selected', true);
            }
            select.append(option);
        });
    
        return select;
    }
    
    function replaceElementWithTd(self, id, field, value) {
        var td = $('<td class="' + field + ' tbl-cell centered"></td>');
        td.data('id', id);
        td.data('field', field);
        td.text(value);
        self.replaceWith(td);
    }

    // listening on focus on dropdowns and fire the function below
    $(document).on('focus', '.priority-dropdown, .context-dropdown, .assignee-dropdown', function() {
        handleDropdownFocus($(this));
    });

    // function who stores the original value of the dropdown to originalValue variable
    function handleDropdownFocus(select) {
        originalValue = select.val();
    }

    // listening on change and focusout on dropdowns and fire the function below (excluding priorities dropdown)
    var changedRecently = false;

    $(document).on('change', '.context-dropdown, .assignee-dropdown', function() {
        console.log("dropdown changed");
        changedRecently = true;
        handleDropdownChange($(this));
    });

    $(document).on('focusout', '.context-dropdown, .assignee-dropdown', function() {
        if (!changedRecently) {
            console.log("dropdown focused out");
            handleDropdownChange($(this));
        }
        changedRecently = false;
    });
    
    // function who handles the change of the dropdown.
    function handleDropdownChange(select) {
        // collect the value, id and field of the dropdown
        var value = select.val();
        var id = select.data('id');
        var field = select.data('field');

        // If the value is different from the original value, it calls the updateItem function and then the replaceElementWithTd function
        if (value !== originalValue) {
            updateItem(id, field, value, function(response) {
                replaceElementWithTd(select, id, field, value);
            });
        // If the value is the same, it replaces the dropdown with a standard html element
        } else {
            var td = $('<td class="' + field + ' tbl-cell centered"></td>');
            td.data('id', id);
            td.data('field', field);
            td.text(originalValue);
            select.replaceWith(td);
        }
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                          COMPOUND PRIORITY CALCULATION AND HANDLING                                                                      //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    $(document).on('change', '.priority-dropdown', function() {
        console.log("priority dropdown changed");
        changedRecently = true;
        handlePriorityDropdownChange($(this));
    });

    $(document).on('focusout', '.priority-dropdown', function() {
        if (!changedRecently) {
            console.log("priority dropdown focused out");
            handlePriorityDropdownChange($(this));
        }
        changedRecently = false;
    });

    function handlePriorityDropdownChange(select) {
        // collect the value, id and field of the dropdown
        var value = select.val();
        var id = select.data('id');
        var type = select.data('field');
        var field = select.data('field');

        var isChecked = $("#project-radio").is(":checked");
        var serverUrl;
    
        if (isChecked) {
            // Set serverUrl to a specific value when the radio button is checked
            serverUrl = projectServerUrl;
        } else {
            // If the radio button is unchecked, you can clear or set it to another value
            serverUrl = taskServerUrl;
        }
        
        $.ajax({
            // serverUrl is rendered on the html page
            url:serverUrl,
            type:"POST",
            data:{id:id,type:type,value:value},
        })

        .done(function(response){
            // update the compound priority dynamically on the page
            if (type === 'priority' && !isChecked) {
                var task_id = id;
                // call a view that pull the compound priority from the database and update the task
                fetch(compound_priority_url+`?task_id=${task_id}`)
                    .then(response => response.json())
                    .then(data => {
                        var compoundPriority = data.compound_priority;
                        document.getElementById('compound-priority-'+id).textContent = compoundPriority;
                    });
                    
            } else if (type === 'priority' && isChecked) {
                // call a view that pull the completion percentage from the database and update all tasks
                // fetch('/api/tasks/')
                fetch(api_tasks_url) 
                    .then(response => response.json())
                    .then(tasks => {
                        tasks.forEach(task => {
                            var tdElement = document.getElementById('compound-priority-' + task.pk);
                            if (tdElement) {
                                tdElement.textContent = task.fields.compound_priority;
                            }
                        });
                    })
                    .catch(error => console.error('Error:', error));
            }
            replaceElementWithTd(self, id, field, value)
        })

        .fail(function(){
            console.log("Error Occurred");
        });
    }





    ///////////////////////////////////////////////////////////////////////////////// DELETE DEFINITION /////////////////////////////////////////////////////////////////////////////////
    // create a dialog box to confirm deletion
    $(document).on('click', '.completion-checkbox', function(e) {
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
                // Change the text of the close button to 'X'
                $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').text('X');
            }
        });
    });

    ///////////////////////////////////////////////////////////////////////////////// CONTENT CREATION /////////////////////////////////////////////////////////////////////////////////
    $(document).on('click', '.content-btn', function(e) {
        console.log("add button clicked");
        e.preventDefault();
        // remove the add row from the table
        var selectedRow = $('.add-row').detach();
        // get the last ID in the table
        var lastRowId = $('table.table_component tr:last').data('id');
        $.ajax({
            url: addUrl,
            type: 'POST',
            data: {
                'csrfmiddlewaretoken': csrftoken
            },
            success: function(response) {
                lastRow = lastRowId + 1;
                $('table').append(
                    '<tr class="rendered-row" data-id="' + response.project_id + '"><td class="tbl-cell centered"><input type="checkbox" data-id="' + response.project_id + '" class="input-data form-control completion-checkbox"></td><td class="priority tbl-cell centered" data-id="' + response.project_id + '" data-field="project_priority">-</td><td class="editable tbl-cell" contenteditable="True" data-id="' + response.project_id + '" data-field="project_name">' + response.name + '</td><td class="editable tbl-cell centered" data-id="' + response.project_id + '" data-field="project_deadline"><span class="date-display">-</span><input type="date" class="date-input" style="display: none;" value=""></td></tr>'
                    );
                // recreate the add row
                $('table').append(selectedRow);
            },
            error: function(response) {
                // Handle error
            }
        });
    });

});