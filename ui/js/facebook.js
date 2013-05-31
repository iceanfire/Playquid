(function($) {

    PQ.fbAsyncInitCallback = function() {
        FB.Event.subscribe('auth.login', function() {
            if (PQ['onFBLogin']) {
                location.href = PQ.onFBLogin;
            }
        });
    }

}(jQuery));
