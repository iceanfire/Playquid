# -*- coding: utf-8 -*-
from google.appengine.ext import ndb
from webapp2_extras.appengine.auth.models import User as wa2User

class Clients(ndb.Model):
  date = ndb.DateTimeProperty(auto_now_add=True)
  name = ndb.StringProperty()
  emailDomains = ndb.StringProperty(repeated=True)

class clientLocations(ndb.Model):
  client = ndb.KeyProperty(kind=Clients)
  ClientName = ndb.StringProperty() #normalized
  emailDomains = ndb.StringProperty(repeated=True) #normalized
  streetAddress = ndb.StringProperty()
  city = ndb.StringProperty()
  state = ndb.StringProperty()
  latlong = ndb.GeoPtProperty()
  
class User(wa2User):
  fname = ndb.StringProperty()
  lname = ndb.StringProperty()
  zipcode = ndb.StringProperty()
  gender = ndb.StringProperty()
  city = ndb.StringProperty()
  latlong = ndb.StringProperty()
  active = ndb.BooleanProperty(default=True)
  office = ndb.IntegerProperty()
  officeCityState = ndb.StringProperty()
  officeLatLong = ndb.StringProperty()
  timezone = ndb.StringProperty()
  
class Events(ndb.Model):
  title = ndb.StringProperty()
  details = ndb.TextProperty()
  date = ndb.DateTimeProperty()
  date_created = ndb.DateTimeProperty(auto_now_add=True)
  durationMinutes = ndb.IntegerProperty()
  minimumParticipants = ndb.IntegerProperty()
  
  #location information
  address = ndb.StringProperty()
  latlong = ndb.GeoPtProperty()
  
  #Client Information
  office = ndb.IntegerProperty()
  
  #participants checked-in
  participants = ndb.IntegerProperty(repeated=True)
  
class EventLocations(ndb.Model):
  name = ndb.StringProperty()
  latlong = ndb.GeoPtProperty()
  count = ndb.IntegerProperty()
  
class Comments(ndb.Model):
  user = ndb.IntegerProperty()
  userName = ndb.StringProperty()
  eid = ndb.IntegerProperty()
  comment = ndb.TextProperty()
  date = ndb.DateTimeProperty(auto_now_add=True)
  office = ndb.IntegerProperty()