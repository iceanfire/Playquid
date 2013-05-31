# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os
from models import *
from modules.user.auth import *


class updateProfile(BaseHandler):
  @user_required
  def post(self,*args,**kwargs):
    updateUser = User.get_by_id(int(self.userInfo['user_id']))
    updateUser.fname=self.request.POST.get('firstname')
    updateUser.lname=self.request.POST.get('lastname')
    updateUser.gender=self.request.POST.get('gender')
    updateUser.zipcode=self.request.POST.get('zipcode')
    updateUser.timezone=self.request.POST.get('timezone')
    updateUser.put()
    self.redirect('/profile')
                          
app = webapp2.WSGIApplication([
  webapp2.Route(r'/update/profile', handler=updateProfile, name='updateProfile'),

],config=config)
