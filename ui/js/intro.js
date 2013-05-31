(function($) {

    $(function() {
    
        var vimeo = '<iframe src="http://player.vimeo.com/video/41398026?title=0&amp;byline=0&amp;portrait=0&amp;color=c9ff23&amp;autoplay=1" width="600" height="338" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
    	  $('#video img').click(function(){
    	    $(this).replaceWith(vimeo)
    	    $('#video').css('opacity','1')
    	    $('#video iframe').css('border','5px solid #86CB71')
    	    $('#video iframe').css('border-radius','8px')
    	    $('#video').css('background-image','none')
    	    $('#video').css('background-color','white')
    	    
    	  })
    	  
    	  $('#signIn').click(function(){
    	    $('#loginBox').fadeIn();
    	    $('#overlay').fadeIn();
    	    $('.email').focus()
    	  })
    	  
    	  $('#overlay, #closeLogin').click(function(){
    	    $('#loginBox').fadeOut();
    	    $('#overlay').fadeOut();
    	  })
    });
    
	  

})(jQuery);
