# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os
import datetime
from models import *
from modules.user.auth import *
from modules import time
from modules.maps import *


class LoginHandler(BaseHandler):
    def post(self):
        """
          Login Handler tests to see if user is logged in, if it fails, redirects to Playquid homepage.
          """
        username = self.request.POST.get('email')
        password = self.request.POST.get('password')
        
        # Try to login user with password
        # Raises InvalidAuthIdError if user is not found
        # Raises InvalidPasswordError if provided password doesn't match with specified user
        try:
            self.auth.get_user_by_password(username, password)
            self.redirect('/profile')
        except:
          self.redirect('/')

class LogoutHandler(BaseHandler):
    """
         Destroy the user session and redirect to Playquid login
     """
    def get(self):
        self.auth.unset_session()
        # User is logged out, let's try redirecting to login page
        self.redirect("/")

class SignupHandler(BaseHandler):
  """Register new users"""
  
  def get(self):
    context = {'templates_dir':'/ui/html/'}
    self.render_response('register.html', **context)   
    
  def post(self):
    """
      Gets posted form data from register.html, processes validation requirements and signsup the user.
      Todo: Extract validation code into seperate module. 
    """
    
    #Get POST variables
    first = self.request.POST.get('firstName')
    last = self.request.POST.get('lastName')
    username = self.request.POST.get('email')
    gender1 = self.request.POST.get('gender')
    zipCode1 = self.request.POST.get('zipCode')
    password = self.request.POST.get('password')
    password2 = self.request.POST.get('password2')
    userLatLong, userCity = geocode(zipCode1)
    timezone = self.request.POST.get('timezone')
    
    #Test email to see if company is in Clients listing.
    domain = username.split('@')[1]
    searchForClient = clientLocations.query(clientLocations.emailDomains==domain).fetch(1)
    
    if len(searchForClient) == 0:
      self.redirect('/signup?msg="Your company is not signed up for Playquid :("')
    else:      
      cityState=[searchForClient[0].city,searchForClient[0].state]
      cityState = ', '.join(cityState)
      
      user = self.auth.store.user_model.create_user(username,zipcode=zipCode1,fname=first,lname=last,gender=gender1,password_raw=password,latlong=userLatLong,city=userCity,office=searchForClient[0].key.id(),officeCityState=cityState,officeLatLong = str(searchForClient[0].latlong),timezone=timezone)
      if not user[0]: #if unable to create new user, display error message. User is a tuple.
        return user[1]
      else:
        # User is created, redirect to login page.
        try:
          self.redirect(self.auth_config['login_url'], abort=True)
        except (AttributeError, KeyError), e:
          self.abort(403) 

#------------------ Marketing Pages----------------------|
class MainPage(BaseHandler):
  def get(self):
      context = {}
      self.render_response('home.html', **context)

class About(BaseHandler):
  def get(self):
    context = {}
    self.render_response('about.html', **context)

class Research(BaseHandler):
  def get(self):
    context = {}
    self.render_response('research.html', **context)

class Contact(BaseHandler):
  def get(self):
    context = {}
    self.render_response('contact.html', **context)

#--------------End Marketing Pages----------------------|

class ProfileHandler(BaseHandler):
  """Display the profile page"""
  @user_required
  def get(self,*args,**kwargs):
    context = {'userInfo':self.userInfo}
    self.render_response('profile.html',**context)
    
class suggestEvent(BaseHandler):
  """ Suggest new events: Users 
      Todos: Improve validation (in seperate module)
  """
  @user_required
  def get(self,*args,**kwargs):
    context = {'userInfo':self.userInfo}
    self.render_response('suggestEvent.html',**context)
  @user_required
  def post(self,*args,**kwargs):
    
    context = {'userInfo':self.userInfo}
    addEvent = Events()

    #Get posted Data
    #--Event Info
    addEvent.title = self.request.POST.get('eventName')
    addEvent.details = self.request.POST.get('description')
    addEvent.minimumParticipants = int(self.request.POST.get('minPlayers'))
    #--date/time
    dateTime = [self.request.POST.get('startDateTime').replace(',','').split('y ')[1],self.request.POST.get('eventTime'),self.request.POST.get('am_pm')]
    dateTime = ' '.join(dateTime)
    addEvent.date=datetime.datetime.strptime(dateTime,"%b %d %Y %I:%M %p")
    addEvent.date = addEvent.date.replace(tzinfo=time.timeMap[self.userInfo['timezone']]).astimezone(time.UTC()).replace(tzinfo=None)
    addEvent.durationMinutes = int(self.request.POST.get('duration'))
    #--location information
    addEvent.address = self.request.POST.get('locationAddress')
    addEvent.latlong = ndb.GeoPt(self.request.POST.get('latlong'))
    #--Client Information
    addEvent.office = int(self.userInfo['office'])
    
    #Submit to database. 
    try:
      addEvent.put()
      self.redirect('/events?msg="Thanks for suggesting an event! We\'ve sent you an email confirmation."')
    except:
      pass

class listEvents(BaseHandler):
  @user_required
  def get(self,*args,**kwargs):
    #make sure you query for a date greater than today!!!!
    getEventListing = Events.query(Events.office==int(self.userInfo['office'])).order(Events.date).fetch()
    markers = ""
    #update timezones
    for event in getEventListing:
      event.date = event.date.replace(tzinfo=time.UTC()).astimezone(time.timeMap[self.userInfo['timezone']])
      
    context = {'EventsList':getEventListing,'userInfo':self.userInfo}
    self.render_response('events.html',**context)
      
app = webapp2.WSGIApplication([
  webapp2.Route(r'/profile', handler=ProfileHandler, name='profile'),
  webapp2.Route(r'/events', handler=listEvents, name='listEvents'),
	webapp2.Route(r'/login/', handler=LoginHandler, name='login'),
	webapp2.Route(r'/signup', handler=SignupHandler, name='signup'),
	webapp2.Route(r'/peaceout', handler=LogoutHandler, name='logout'),
	webapp2.Route(r'/suggestEvent',handler=suggestEvent, name='suggestEvent'),
	webapp2.Route(r'/about', handler=About, name='about'),
	webapp2.Route(r'/contact', handler=Contact, name='contact'),
	webapp2.Route(r'/research', handler=Research, name='research'),
	webapp2.Route(r'/', handler=MainPage, name='mainpage')

],config=config)
