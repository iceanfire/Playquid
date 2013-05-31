# -*- coding: utf-8 -*-
import os
import webapp2
from webapp2_extras import auth
from webapp2_extras import sessions
from webapp2_extras import routes
from webapp2_extras.auth import InvalidAuthIdError
from webapp2_extras.auth import InvalidPasswordError
from webapp2_extras import jinja2


config = {}
config['webapp2_extras.jinja2'] = {
  'template_path':'ui/html/',
  'environment_args': {
    'autoescape': True,
    'extensions': [
        'jinja2.ext.autoescape']}
}
config['webapp2_extras.sessions'] = {
	'secret_key': 'Im_an_alien',
}
config['webapp2_extras.auth'] = {
  'user_model':'models.User',
  'user_attributes': ['fname','lname','gender','auth_ids','zipcode','latlong','city','office','officeCityState','officeLatLong','timezone']
}


def user_required(handler):
    """
         Decorator for checking if there's a user associated with the current session.
         Will also fail if there's no session present.
     """

    def check_login(self, *args, **kwargs):
        auth = self.auth
        user = auth.get_user_by_session()
        if not user:
            # If handler has no login_url specified invoke a 403 error
            try:
                self.redirect(self.auth_config['login_url'], abort=True)
            except (AttributeError, KeyError), e:
                self.abort(403)
        else:
            self.userInfo = user
            return handler(self, *args, user=self.userInfo,**kwargs)

    return check_login

class BaseHandler(webapp2.RequestHandler):
    """
         BaseHandler for all requests

         Holds the auth and session properties so they are reachable for all requests
     """      

    def dispatch(self, *args, **kwargs):
        """
              Save the sessions for preservation across requests
          """
        self.variable = os.environ['HTTP_HOST']
        try:
            response = super(BaseHandler, self).dispatch()
        finally:
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def jinja2(self):
        # Returns a Jinja2 renderer cached in the app registry.
        return jinja2.get_jinja2(app=self.app)

    @webapp2.cached_property
    def auth(self):
        return auth.get_auth()

    @webapp2.cached_property
    def session_store(self):
        return sessions.get_store(request=self.request)

    @webapp2.cached_property
    def auth_config(self):
        """
              Dict to hold urls for login/logout
          """
        return {
            'login_url': '/',
            'logout_url': self.uri_for('logout')
        }

    def render_response(self, _template, **context):
        # Renders a template and writes the result to the response.
        
        rv = self.jinja2.render_template(_template, **context)
        self.response.write(rv)
