(function($) {
    var geocoder;
    function initialize(elm) {
        var latlng = new google.maps.LatLng(30.26, -97.74);
        geocoder = new google.maps.Geocoder();
        var myOptions = {
          zoom: 11,
          center: latlng,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
          },
          navigationControl: true,
          navigationControlOptions: {
            style: google.maps.NavigationControlStyle.SMALL
          },
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(elm, myOptions);
        var markeroption = {
            map: map,
            position: latlng
        };
        var marker = new google.maps.Marker(markeroption);

        google.maps.event.addListener(map, 'click', function(point) {
            var lat = point.latLng.lat();
            var lng = point.latLng.lng();
            jQuery('#lat').val(lat);
            jQuery('#lng').val(lng);
            latlng = new google.maps.LatLng(lat, lng);
            marker.setPosition(latlng);
            geocoder.geocode({'latLng': latlng}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                if (results.length && results[0]) {
                  jQuery('#address').val(results[0].formatted_address);
                }
              } else {
                alert("Geocoder failed due to: " + status);
              }
            });
        });
    }

    $(function() {
        var jElm = $('#event_map');
        if (jElm.length) {
            initialize(jElm[0]);
        }
    });
})(jQuery);
