(function($){

    PQ.log = {
        debug: function() {
            if (typeof console != undefined) {
                //console.debug(arguments);
            }
        }
    };

    $(function() {
        $('.datetimePicker').datetimepicker({
            stepMinute: 15,
            ampm: true
        });

        // Taken from https://gist.github.com/379601 which is for input placeholder, applied to text areas
        $('textarea[data-placeholder]').focus(function() {
          var input = $(this);
          if (input.val() == input.data('placeholder')) {
            input.val('');
            input.removeClass('placeholder');
          }
        }).blur(function() {
          var input = $(this);
          if (input.val() == '' || input.val() == input.data('placeholder')) {
            input.addClass('placeholder');
            input.val(input.data('placeholder'));
          }
        }).blur().parents('form').submit(function() {
          $(this).find('textarea[data-placeholder]').each(function() {
            var input = $(this);
            if (input.val() == input.data('placeholder')) {
              input.val('');
            }
          })
        });
        
    })

})(jQuery);
