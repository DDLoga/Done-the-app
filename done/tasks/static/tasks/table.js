
// once the document is fully loaded
$(document).ready(function() {

    // DOUBLE CLICK TO EDIT
    // on double click event listener for all .editable class
    $(document).on("dblclick", ".editable", function() {
        // get the data type of the element double clicked on
        var data_type = $(this).data("type");
        // get the existing text, tag of the item double clicked on and set input_type as text
        var value = $(this).text();
        var input_type = "text";
        // if field deadline chosen, bring a date picker
        if (data_type === "deadline") {
            input_type = "date";
        } else if (data_type === "effort") {
            input_type = "number";
        }
        // create the html form
        var input="<input type='"+input_type+"' class='input-data' value='"+value+"' class='form-control'>";
        // pass to html page
        $(this).html(input);
        $(this).removeClass("editable");

        if (input_type === "date") {
            // Handle the date input change event
            $(this)
                .find("input[type=date]")
                .on("change", function() {
                    var selectedDate = this.value;
                    // Parse the selected date to your desired format
                    var formattedDate = parseAndFormatDate(selectedDate);
                    var td = $(this).closest("td");
                    td.html(formattedDate);
                    td.addClass("editable");
                    sendToServer(td.data("id"), formattedDate, data_type);
                });
        }
    });

    // ////////////////////////////////////////////// DROP DOWN MENUS //////////////////////////////////////////////////////
    // CREATE A PRIORITY DROP DOWN MENU ON CLICK
    $(document).on("click", ".priority", function() {
        // get the ID and data type of the edited row
        var taskId = $(this).data("id");
        // Define the priority options here
        var options = ['A', 'B', 'C', 'D'];
        var dropdownClass = "input-data-priority form-control"
        var dropdownId = 'priority-select-'

        // Create a <select> element with <option> elements
        var selectHtml = createDropdown(taskId, options, dropdownClass, dropdownId);
        
        // Append the <select> element to the table cell
        $(this).html(selectHtml);
        $(this).removeClass("priority");
    });

// CREATE A CONTEXT DROP DOWN MENU ON CLICK
    $(document).on("click", ".context", function() {
        var taskId = $(this).data("id");
        var options = contextOptions
        var dropdownClass = "input-data-context form-control"
        var dropdownId = 'context-select-'

        // Create a <select> element with <option> elements
        var selectHtml = createDropdown(taskId, options, dropdownClass, dropdownId);

        // Append the <select> element to the table cell
        $(this).html(selectHtml);
        $(this).removeClass("context");
    });

    // CREATE AN ASSIGNEE DROP DOWN MENU ON CLICK
    $(document).on("click", ".assignee", function() {
        console.log("event assignee triggered")
        var taskId = $(this).data("id");
        var options = assigneeOptions;
        var dropdownClass = "input-data-assignee form-control"
        var dropdownId = 'assignee-select-'

        // Create a <select> element with <option> elements
        var selectHtml = createDropdown(taskId, options, dropdownClass, dropdownId);

        // Append the <select> element to the table cell
        $(this).html(selectHtml);
        $(this).removeClass("assignee");
    });


    // ////////////////////////////////////////////// AUTOSAVE WHEN AWAY //////////////////////////////////////////////////////
    // SAVE WHEN CLICKING SOMEWHERE ELSE (ANY EXCEPT LISTED AFTER)
        // once clicking somewhere else, call this function on items with .input-data class
    $(document).on("blur",".input-data",function(){
        // get the value of the newly keyed input
        var value=$(this).val();
        // set the class to restore for further edit
        var classToAdd = "editable";
        var td=$(this).parent("td");
        exitForm(classToAdd,value,td);
    });

    // SAVE WHEN CLICKING SOMEWHERE ELSE (PRIORITY FORM)
    $(document).on("blur",".input-data-priority",function(){
        // get the value of the newly keyed input
        console.log("event triggered")
        var value=$(this).val();
        // set the class to restore for further edit
        var classToAdd = ("priority");
        var td=$(this).parent("td");
        exitForm(classToAdd,value,td)
    });

    // SAVE WHEN CLICKING SOMEWHERE ELSE (CONTEXT FORM)
    $(document).on("blur",".input-data-context",function(){
        // get the value of the newly keyed input
        var value=$(this).val();
        // set the class to restore for further edit
        var classToAdd = ("context");
        var td=$(this).parent("td");
        exitForm(classToAdd,value,td)
    });

    // SAVE WHEN CLICKING SOMEWHERE ELSE (ASSIGNEE FORM)
    $(document).on("blur",".input-data-assignee",function(){
        // get the value of the newly keyed input
        var value=$(this).val();
        // set the class to restore for further edit
        var classToAdd = ("assignee");
        var td=$(this).parent("td");
        exitForm(classToAdd,value,td)
    });

    // ////////////////////////////////////////////// AUTOSAVE WHEN ENTER //////////////////////////////////////////////////////
    // SAVE WHEN ENTER (ANY EXCEPT LISTED AFTER)
    $(document).on("keypress",".input-data",function(e){
        // retrieves the keycode of the entered key
        // if "enter"
        if(e.key === 'Enter'){
            // get the value of the newly keyed input
            var value=$(this).val();
            var classToAdd = "editable";
            var td=$(this).parent("td");
            exitForm(classToAdd,value,td)
        }
        
    });

    // SAVE WHEN ENTER (PRIORITY FORM)
    $(document).on("keypress",".input-data-priority",function(e){
        // retrieves the keycode of the entered key
        // if "enter"
        if(e.key === 'Enter'){
            // get the value of the newly keyed input
            var value=$(this).val();
            var classToAdd = "priority";
            var td=$(this).parent("td");
            exitForm(classToAdd,value,td)
        }
        
    });
        
    // SAVE WHEN ENTER (CONTEXT FORM)
    $(document).on("keypress",".input-data-priority",function(e){
        // retrieves the keycode of the entered key
        // if "enter"
        if(e.key === 'Enter'){
            // get the value of the newly keyed input
            var value=$(this).val();
            var classToAdd = "context";
            var td=$(this).parent("td");
            exitForm(classToAdd,value,td)
        }
        
    });

    // SAVE WHEN ENTER (ASSIGNEE FORM)
    $(document).on("keypress",".input-data-assignee",function(e){
        // retrieves the keycode of the entered key
        // if "enter"
        if(e.key === 'Enter'){
            // get the value of the newly keyed input
            var value=$(this).val();
            var classToAdd = "assignee";
            var td=$(this).parent("td");
            exitForm(classToAdd,value,td)
        }
        
    });

    // SAVE WHEN CHECKBOX STATE CHANGE
    // Add an event listener for checkbox state changes
    $(document).on("change", ".input-data[type=checkbox]", function() {
        // get the checkbox status
        var isChecked = this.checked;
        // concert to string to make it comparable with the filter input
        var value = isChecked.toString().charAt(0).toUpperCase() + isChecked.toString().slice(1); // Capitalize the first letter
        var td = $(this).closest("td");
        var type = td.data("type");
        sendToServer(td.data("id"), value, type);
    });

    // ////////////////////////////////////////////// OTHER EVENTS //////////////////////////////////////////////////////
    // SORTING ONCE CLICKED ON TABLE HEADER
    // event listener on click for classes with table header
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
        // bindDoubleClickEditing();
    });

    // TASK COMPLETE FILTER
    // Event listener for the filter drop-down change
    $('#completion-filter').on('change', function() {
        // get the value defined on completion-filter id in selector from HTML file
        var selectedValue = $(this).val();
        // pass this value to the function
        filterTableByCompletion(selectedValue);
    });


    // ////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////
    // Function to filter the table
    function filterTableByCompletion(selectedValue) {
        // Show all rows initially
        $('.rendered-row').show();
        // for each table cell of the datatype complete and input checkbox
        $('.tbl-cell[data-type="complete"] input:checkbox').each(function() {
            // Get the value of the checkbox and convert to string
            var isChecked = $(this).prop('checked').toString();
            // hide each row that don't match
            if (isChecked == selectedValue) {
                $(this).closest('.rendered-row').hide();
            } 
        });
    }

    function sendToServer(id,value,type){
        console.log(id);
        console.log(value);
        console.log(type);
        $.ajax({
            // serverUrl is rendered on the html page
            url:serverUrl,
            type:"POST",
            data:{id:id,type:type,value:value},
        })
        .done(function(response){
            console.log(response);
        })
        .fail(function(){
            console.log("Error Occurred");
        });

    }

    function exitForm(classToAdd,value,td) {
        if (value !== "on") {
            // get the value of the parent
            // remove the input entry keyed
            $(this).remove();
            // set the newly entered value and class to the td component
            td.html(value);
            td.addClass(classToAdd);
            // get the data type of td
            var type=td.data("type");
            // send the pk + value + data type to server
            sendToServer(td.data("id"),value,type);
        }
    }

    function createDropdown(taskId, options, dropdownClass, dropdownId) {
        var selectHtml = '<select id="' + dropdownId + taskId + '" class="' + dropdownClass + ' custom-select">';
        for (var i = 0; i < options.length; i++) {
            selectHtml += '<option value="' + options[i] + '">' + options[i] + '</option>';
        }
        selectHtml += '</select>';
        return selectHtml;
    }

    function parseAndFormatDate(selectedDate) {
        // Parse the selected date using JavaScript Date object
        const date = new Date(selectedDate);
        // Format the date as "d Mmm" (e.g., "1 Jan")
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "short" });
        return `${day}-${month}`;
    }


});

