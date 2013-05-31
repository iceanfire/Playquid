var test = "fuck";
(function($) {
    var map;
    
    //Initialize the Map, set the center & display on browser window given element & latlong
    function initialize(elm, latlng) {
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
        map = new google.maps.Map(elm, myOptions);
    }
    var lastOpenInfoWindow = null;
    
    //Add a marker given the latlong & the html
    function addMarker(latlong, html) {
        latlong = latlong.split(",")
        var latlng = new google.maps.LatLng(parseFloat(latlong[0]),parseFloat(latlong[1]));
        var markeroption = {
            map: map,
            position: latlng
        };
        var marker = new google.maps.Marker(markeroption);

        var infoWindow = new google.maps.InfoWindow();
        infoWindow['PARENT_MARKER'] = marker;
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(html);
            if (lastOpenInfoWindow) {
                lastOpenInfoWindow.close();
            }
            infoWindow.open(map, marker);
            lastOpenInfoWindow = infoWindow;
            marker.setAnimation(null); // once the info box is open, stop the bouncing
        });
        google.maps.event.addListener(infoWindow, 'closeclick', function() {
            lastOpenInfoWindow = null;
        });
        //closes the info window if it is open on the map.
        google.maps.event.addListener(map, 'click', function() {
               if(lastOpenInfoWindow){
        			lastOpenInfoWindow.close()	
        		}
         });
        return marker;
    }


    var locationMap = {};
    
    //Start initialize fuction
    $(function() {
        latlng = OfficeCenter.split(",")
        mapDiv = document.getElementById("event_map")
        //TO DISABLE GOOGLE MAPS //INITIALIZE AND UN// OFFICECENTER!
        //==========================================================
        initialize(mapDiv, new google.maps.LatLng(parseFloat(latlng[0]),parseFloat(latlng[1])));
        //OfficeCenter = false;
        if (OfficeCenter && MarkerLocations && MarkerLocations.length) {
            $.each(MarkerLocations, function(key, val) {
                var latlong = val['latlong'], key = val['key'],
                    addr = val['address']
                var html = "<div id='infoWindowWrapper'>";
                html += "<h4 id='mapTitle'><br />"; //we need names!!
                html += "<div id='mapAddress'>"+addr+"</div></h4>";
                locationMap[key] = addMarker(latlong, html);
            });
        }
    });

    $(function() {
        var     jElm = $('.notsignedup .checkOut button'), //if the event checkin/checkout button is clicked
                jEvent = $('li.event .eventDay, li.event h2, li.event .eventTime, li.event h5, li.event span.counts, .comment button'), //if the discuss button is clicked
                jElmCo = $('.signedup .checkOut button'), //if the event checkin/checkout button is clicked
                html=''

        $.ajaxSetup({ cache: false });

        function showMarkerInfo(eid) { //may change to location id later on
            var marker = locationMap[eid];
            if (marker) {
                google.maps.event.trigger(marker, 'click');
            }
        }
        
        //If the comment input is clicked, clear the value
        $('#events').delegate('.newComment', 'click', function() {
            $(this).val('');

        });

        function doBubble(je, eid, lid, _this) {
            showMarkerInfo(eid);
            $.post(
              "/ajax/getComments",
              {eid:eid},
              function(data,status){
                //var comments, names = [], descr = data['event']['description']
                descr = "hello"
                names = ['hadi']
                if(status=='success'){
                  removeBalloon();
                  //also don't forget to update the comments length on each refresh
                  //also don't forget to update the participants list
                  //$.each(data['comments'], function (idx, val) {
                  //          alert(val['text']);
                  //      });
                  comments = data['comments']
                  //test = comments
                  //for(c in comments){
                  //  alert(data['c'])
                  //}
                  //alert(comments.length)
                  user = data['user']
                  //comments = [];
                  $.tmpl('moreInfoTpl', {Description: descr, Names:names, Comments:comments, Eid:eid,user:user}).appendTo(je).ready(function(){
                    setupSubmit();
                  })
                }
              },'json')
          }
        
        //Setup the submit code
        function setupSubmit() {
            $('#moreInfoBalloon form').submit(function() {

                var je = $(this),
                    comment = je.find('input.newComment').val(),
                    pe = je.closest('li.event');
                    eid = pe.data('eid');
                    comment = $(".newComment").val();
                //change from here on out
                $.post("/ajax/addComment", {eid:eid,comment:comment},function(data,status){
                  if(data=='True'){
                    doBubble(pe,eid,0,0);
                  }
                  else{
                    alert("We had trouble saving your comment, we've logged this error and will investigate it!")
                  }
                return false;
              });
            });
          }
        //Show the baloon if event is clicked on
        jEvent.click(function() {
            var je = $(this).closest('li.event'),
                eid = je.data('eid');
                
                doBubble(je,eid,0,0);
        });
        jEvent.hover(function() {
            // Hover in
            var je = $(this).closest('li.event'),
                eid = je.data('eid'),
                marker = locationMap[eid];
            if (marker) {
                if (lastOpenInfoWindow && lastOpenInfoWindow['PARENT_MARKER'] == marker) {
                    // do nothing
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
            }
        }, function() {
            // Hover out
            var je = $(this).closest('li.event'),
                eid = je.data('eid'),
                marker = locationMap[eid];
            if (marker) {
                marker.setAnimation(null);
            }
        })
    });

     //THIS SCRIPT CONTROLS THE SCROLLING BHEAVIOR
    //
    //

    $(window).scroll(function(){

    if (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) < 7 && parseInt(jQuery.browser.version, 10) > 4) {
    }
    else{
        currentlyFixed = false;
        scrollPosition = $('body').scrollTop(); //if browser supports both

        if($('body').scrollTop() > $('html').scrollTop()) { //if chrome  quirks
            scrollPosition = $('body').scrollTop();
        } else { //if firefox quirks
            scrollPosition = $('html').scrollTop();
        }

        if (scrollPosition >= 116 && !currentlyFixed){

            $('#content > h1, #titleCorner').addClass('fixedTitle');

            $('#event_map').addClass('fixedMap');
            $('#eventFeed').addClass('fixedFeed');
            currentlyFixed = true;

            //$('#content h1').html(currentMonth.children().html()); //Change to current month once scrolling begins

        } else if(scrollPosition < 116){
            $('#content h1, #titleCorner').removeClass('fixedTitle');
            $('#event_map').removeClass('fixedMap');
            $('#eventFeed').removeClass('fixedFeed');

            //$('#content h1').html(originalTitle); //Return to original title
        }

    }
    });
    
    //Check into an event    
    $(function() {
        var     jElm = $('.notsignedup .checkOut button'),
                jEvent = $('li.event .eventDay, li.event h2, li.event .eventTime, li.event h5, li.event span.counts, .discuss button'),
                jElmCo = $('.signedup .checkOut button'),
                html=''
                
                
                //Check into an event
                jElm.live('click',function() {
                    var je = $(this),
                        pe = je.closest('li.event'),
                        eid = pe.data('eid');

                    je.attr("disabled", true);
                    
                    $.post("/ajax/eventCheckin", {eid:eid},function(data,status){
                      if(data=="True"){
                        pe.addClass('signedup');
                        pe.removeClass('notsignedup');
                        je.html("Signed Up!");
                        pe.removeClass('notsignedup');
                        pe.addClass('signedup');
                        je.attr("disabled",false);
                      }
                      else{
                          alert('Whops! Something broke :(. Please try again.');
                          je.attr("disabled",false);
                      }
                    })
                  })
                  
                  //Cancel Check-in an event
                  jElmCo.live('click',function(){
                      var je = $(this),
                      pe = je.closest('li.event'),
                      jeb = pe.find('.checkOut button'),
                      eid = pe.data('eid');
                    
                      je.attr("disabled", true);
                    
                      $.post("/ajax/cancelCheckin", {eid:eid},function(data,status){
                      if(data=="True"){
                        pe.removeClass('signedup');
                        pe.addClass('notsignedup');
                        jeb.html('Check-In!');
                        je.attr("disabled",false);
                      }
                      else{
                        alert('Whops! Something broke :(. Please try again.');
                        je.attr("disabled",false);
                      }
                    })
                  })
              });
              
             /* $(function(){
                var JElm=$('.comment button')
                
                JElm.live('click',function(){
                  var je = $(this),
                      pe = je.closest('li.event'),
                      eid = pe.data('eid');
                  
                  //be sure to disable the button je.attr("disabled", true);
                  doBubble(pe,eid,0,0)
                  
                })
              })
              */
              
              $.template('commentTpl', '<li><span class="name">${userName}</span><span class="comment">${text}</span>');
              //$.template('commentTpl', '<li><span class="name">helll</span><span class="comment">oooo</span>');
              $.template('moreInfoTpl', '<div class="moreInfo" id="moreInfoBalloon"><img id="commentCorner" src="/ui/img/events/commentCorner.jpg" />'+
                          '<div class="description"></div>'+
                          '<div class="whoSignedUp">Who\'s Signed up to go?<div class="signedUpList">{{if Names.length == 0}}No one has checked in yet :({{/if}} {{each(i, name) Names}}{{if i > 0}}, {{/if}}${name}{{/each}}</div></div>'+
                          '<ul class="commentsList">Comments{{tmpl(Comments) "commentTpl"}}</ul>'+
                              '<li>' +
                              '<form action="#" method="post" onsubmit="return false;"><input type="hidden" name="eid" value="${Eid}" /><input type="hidden" name="action" value="createcomment" />' +
                              '<input type="text" class="newComment" name="comment" placeholder="Write a comment..." value=""/><br />'+
                              '<span class="commentMessage">Press Enter to post your comment.</span></form></li>'+
                          '</ul></div>');
            function removeBalloon() {
                $('#moreInfoBalloon').remove();
            }             
            
      //This sets up the SignedUp button to shift to "Checkout" on hover
      $('.signedup .checkOut button').live("mouseover",function() {
        $(this).html("Cancel Signup")
      }).live("mouseout",function(){
        $(this).html("Signed Up!")
      })
            
              
})(jQuery);
