$(document).ready(function() {

    // set the side menu hide or show
    $('.slider-btn').on('click', function() {
        console.log('slider-btn clicked');
        var sideMenuDiv = $('.side-menu-div');
        var sliderIcon = $('.slider-icon');
        if (sideMenuDiv.width() === 25) {
            sideMenuDiv.animate({width: '255px', maxWidth: '255px', minWidth: '255px'}, 500);
            $('.nav-hdr, .all-tabs').fadeIn(500);
            sliderIcon.html('&lt;');
        } else {
            sideMenuDiv.animate({width: '25px', maxWidth: '25px', minWidth: '25px'}, 500);
            $('.nav-hdr, .all-tabs').fadeOut(500);
            sliderIcon.html('&gt;');
        }
    });
});