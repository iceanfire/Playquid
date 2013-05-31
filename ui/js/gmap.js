(function($) {

    if (!PQ.google) {
        PQ.google = {};
    }
    PQ.google.Geocoder = new google.maps.Geocoder();
    PQ.Gmap = function(selector, lat, lng) {
        this.center = null;
        this.jelm = $(selector);
        this.allMarkers = [];
        this.eventListener = null;

        function initialize(Gmap, elm, latlng) {
            if (!latlng) {
                latlng = Gmap.getLatLng(30.26, -97.74); // AUSTIN
            } else {
                PQ.log.debug('Using '+latlng);
            }
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
            return new google.maps.Map(elm, myOptions);
        }

        if (lat && lng) {
            this.center = this.getLatLng(lat, lng);
        }
        if (this.jelm && this.jelm.length) {
            this.map = initialize(this, this.jelm[0], this.center);
        }
    };
    $.extend(PQ.Gmap.prototype,
            {
                getLatLng: function(lat, lng) {
                    return new google.maps.LatLng(lat, lng);
                },
                removeAllMarkers: function() {
                    if (this.eventListener != null) {
                        google.maps.event.removeListener(this.eventListener);
                        this.eventListener = null;
                    }
                    $.each(this.allMarkers, function(key, marker) {
                        marker.setMap(null);
                    });
                    this.allMarkers = [];
                    this.marker = null;
                },
                addMarker: function(map, lat, lng) {
                    var latlng = new google.maps.LatLng(lat, lng),
                        markeroption = {
                            map: this.map,
                            position: latlng
                        },
                        marker = new google.maps.Marker(markeroption);
                    this.allMarkers.push(marker);
                    return marker;
                },
                moveClickMarker: function(latLng) {
                    var lat = latLng.lat(), lng = latLng.lng();
                    if (!this.marker) {
                        this.marker = this.addMarker(this.map, lat, lng);
                    } else {
                        this.marker.setPosition(latLng);
                    }
                    this.panTo(latLng);
                },
                panTo: function(latLng) {
                    this.map.panTo(latLng);
                },
                panToMarker: function(marker) {
                    this.panTo(marker.getPosition());
                },
                addClickMarker: function(callback) {
                    var self = this;
                    this.removeAllMarkers();
                    this.eventListener = google.maps.event.addListener(this.map, 'click', function(point) {
                        var lat = point.latLng.lat(),
                                lng = point.latLng.lng(),
                                latlng;
                        latlng = new google.maps.LatLng(lat, lng);
                        if (!self.marker) {
                            self.marker = self.addMarker(self.map, lat, lng);
                        } else {
                            self.marker.setPosition(latlng);
                        }
                        callback(latlng);
                    });
                },
                pullOutInfoAndCall: function(result, callback) {
                    var street_number = '', route = '', administrative_area_level_3 = '', administrative_area_level_1 = '';
                    $.each(result['address_components'], function(key, obj) {
                        var name = obj['short_name'];
                        $.each(obj['types'], function(key, type) {
                            if (type == 'street_number') {
                                street_number = name;
                            } else if (type == 'route') {
                                route = name;
                            } else if (type == 'administrative_area_level_3') {
                                administrative_area_level_3 = name;
                            } else if (type == 'administrative_area_level_1') {
                                administrative_area_level_1 = name;
                            }
                        });
                    });
                    callback($.trim(street_number + ' ' + route), $.trim(administrative_area_level_3 + ', ' + administrative_area_level_1));
                },
                geoCodeLatLng: function(latlng, callback) {
                    var self = this;
                    PQ.google.Geocoder.geocode({'latLng': latlng}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results.length && results[0]) {
                                self.pullOutInfoAndCall(results[0], callback);
                            }
                        } else {
                            // no callback
                        }
                    });
                },
                reverseGeoAddr: function(addr, callback) {
                    PQ.google.Geocoder.geocode({'address': addr}, function(results, status) {
                        console.info(results);
                        if (status = google.maps.GeocoderStatus.OK) {
                            if (results && results[0]) {
                                callback(results[0]['geometry']['location']);
                            }
                        } else {
                            // no callback
                        }
                    });
                }
            });
})(jQuery);