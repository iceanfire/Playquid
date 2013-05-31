# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os

from modules.maps import *
import webapp2
from webapp2_extras import routes
from webapp2_extras import jinja2
from google.appengine.ext import ndb
from models import *



config = {}
config['webapp2_extras.jinja2'] = {
  'template_path':'ui/html/include/admin/',
  'environment_args': {
    'autoescape': True,
    'extensions': [
        'jinja2.ext.autoescape']}
}


class BaseHandler(webapp2.RequestHandler):
  @webapp2.cached_property
  def jinja2(self):
      # Returns a Jinja2 renderer cached in the app registry.
      return jinja2.get_jinja2(app=self.app)
      
  def render_response(self, _template, **context):
      # Renders a template and writes the result to the response.
      rv = self.jinja2.render_template(_template, **context)
      self.response.write(rv)


class home(BaseHandler):
  def get(self):
    getClientListing = Clients.query().fetch()
    context = {'ClientList':getClientListing}
    
    self.render_response('admin_home.html',**context)
    
class addClient(BaseHandler):
  def get(self):
    context = {}
    self.render_response('admin_add.html',**context)
  
  def post(self):
    addNewClient = Clients()
    addNewLocation = clientLocations()
    
    addNewClient.name = self.request.get('companyName')
    addNewClient.emailDomains = self.request.get('emailDomain').split(',')
    
    addNewLocation.ClientName = addNewClient.name
    addNewLocation.emailDomains = addNewClient.emailDomains
    addNewLocation.streetAddress = self.request.get('streetAddress')
    addNewLocation.city = self.request.get('city')
    addNewLocation.state = self.request.get('state')
    latlong, city = geocode(' '.join([addNewLocation.streetAddress,addNewLocation.city,addNewLocation.state]))
    addNewLocation.latlong = ndb.GeoPt(latlong)
    
    for domain in addNewClient.emailDomains:
      if len(Clients.query(Clients.emailDomains==domain).fetch(1)) > 0:
        self.redirect('/admin/?msg="Domain Exists!"')
      else:
        addNewLocation.client = addNewClient.put()
        addNewLocation.put()
        
        self.redirect('/admin/?msg="Client Added!"')
      
app = webapp2.WSGIApplication([
  webapp2.Route(r'/admin/', handler=home, name='home'),
  webapp2.Route(r'/admin/add', handler=addClient, name='addClient')

],config=config)
