
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
            }
            // create the html form
            var input="<input type='"+input_type+"' class='input-data' value='"+value+"' class='form-control'>";
            // pass to html page
            $(this).html(input);
            $(this).removeClass("editable")
    });

    // SAVE WHEN CLICKING SOMEWHERE ELSE
    // once clicking somewhere else, call this function on items with .input-data class
    $(document).on("blur",".input-data",function(){
        // get the value of the newly keyed input
        var value=$(this).val();
        // get the value of the parent
        if (value !== "on") {
            var td=$(this).parent("td");
            // remove the input entry keyed
            $(this).remove();
            // set the newly entered value and class to the td component
            td.html(value);
            td.addClass("editable");
            // get the data type of td
            var type=td.data("type");
            // send the pk + value + data type to server
            sendToServer(td.data("id"),value,type);
    }});

    // SAVE WHEN ENTER
    // event listener on keypress for classes with .input-data which calls the function "e"
    $(document).on("keypress",".input-data",function(e){
        // retrieves the keycode of the entered key
        // if "enter"
        if(e.key === 'Enter'){
            // get the value of the newly keyed input
            var value=$(this).val();
            if (value !== "on") {
                // get the value of the parent
                var td=$(this).parent("td");
                // remove the input entry keyed
                $(this).remove();
                // set the newly entered value and class to the td component
                td.html(value);
                td.addClass("editable");
                // get the data type of td
                var type=td.data("type");
                // send the pk + value + data type to server
                sendToServer(td.data("id"),value,type);
        }
        
        
    
    }});

    // CHECKBOX STATE CHANGE
    // Add an event listener for checkbox state changes
    $(document).on("change", ".input-data[type=checkbox]", function() {
        var isChecked = this.checked;
        var value = isChecked.toString().charAt(0).toUpperCase() + isChecked.toString().slice(1); // Capitalize the first letter
        var td = $(this).closest("td");
        var type = td.data("type");
        sendToServer(td.data("id"), value, type);
    });

    // SORTING
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
});