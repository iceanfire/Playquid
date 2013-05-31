(function($) {

    $(function() {

        var map;

        function setUpTheClick(gmap) {
            gmap.addClickMarker(function(latlng) {
                var lat = latlng.lat(), lng = latlng.lng();
                $('#locationLat').val(lat);
                $('#locationLng').val(lng);
                gmap.geoCodeLatLng(latlng, function(address, citystate) {
                    $("#locationAddress").val(address);
                    $("#locationCity").val(citystate);
                });
            });
            function onadddrchg(gmap) {
                var addr = $('#locationAddress').val(), city = $('#locationCity').val()
                if (addr && addr.length > 3 && city && city.length > 1) {
                    gmap.reverseGeoAddr(addr+", "+city, function(latLng) {
                        gmap.moveClickMarker(latLng);
                    });
                } else {
                    PQ.log.debug("Too short ("+addr+","+city+")");
                }
            }
            $('#locationAddress').change(function() {
                onadddrchg(gmap);
            });
            $('#locationCity').change(function() {
                onadddrchg(gmap);
            });
            onadddrchg(gmap);
        }

        var markerMap = {}, showing=null;

        function setUpTheDropdown(gmap) {
            markerMap = {};
            $.each(PQ.locations, function(key, val) {
                var lng = val['lng'], lat = val['lat'], id = val['key'],
                    marker = gmap.addMarker(gmap, lat, lng);
                google.maps.event.addListener(marker, 'click', function() {
                    $('#sportLocation').val(id);
                });
                markerMap[id] = marker;
            })
        }

        function onchangeEvent(gmap, je) {
            var id = je.val(),
                loc = $('.newLocation');
            // Always need a clean slate
            if (id == 0) {
                if (showing !== true) {
                    gmap.removeAllMarkers();
                    setUpTheClick(gmap);
                    loc.show();
                }
                showing = true;
            } else {
                if (showing !== false) {
                    gmap.removeAllMarkers();
                    setUpTheDropdown(gmap)
                    loc.hide();
                }
                if (markerMap[id]) {
                    gmap.panToMarker(markerMap[id]);
                }
                showing = false;
            }
        }

        if (PQ && PQ.Gmap) {
            map = new PQ.Gmap('#locationMap', PQ.center.latitude, PQ.center.longitude);
        }

        onchangeEvent(map, $('#sportLocation').change(function() {
            var je = $(this);
            onchangeEvent(map, je);
        }));
    });

})(jQuery);