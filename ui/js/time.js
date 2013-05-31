(function($) {

$(function() {
    var table = $('#timetable td');
    var hidden = $('#timetable_hidden');

    init();

    table.click(function() {
        $(this).toggleClass('selected');
        serialize($('#timetable td.selected'));
    });
    table.hover(function() {
        $(this).addClass('hover')
    }, function() {
        $(this).removeClass('hover');
    });

    function init() {
        var setsel = hidden.val().split(',');
        $.each(table, function() {
            var je = $(this);
            var sel = je.data('daytime');
            if ($.inArray(sel, setsel) >= 0) {
                je.addClass('selected');
            }
        });
    }

    function serialize(elements) {
        var txt = [];
        $.each(elements, function() {
            var je = $(this);
            txt.push(je.data('daytime'));
        });
        hidden.val(txt.join(','));
    }
});

})(jQuery)
