#!/usr/bin/env python
from google.appengine.api import urlfetch
import json
import logging

def geocode(location,area=None):
"""
  #GEOCODE apartment address via google maps api
"""
    url = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address='+location.replace(" ","%20")
    result = json.loads(urlfetch.fetch(url).content)
    
    if result['status']=='OK':
      coord=str(result['results'][0]['geometry']['location']['lat'])+","+str(result['results'][0]['geometry']['location']['lng'])
      #num = len(result['results'][0]['address_components'])-1
      return coord,result['results'][0]['address_components'][1]['long_name']
    else:
      return False, False