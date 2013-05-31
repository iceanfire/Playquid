# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os
from modules.user.auth import *
import json
from models import *

class eventCheckin(BaseHandler):
  @user_required
  def post(self,*args,**kwargs):
    eid=self.request.POST.get('eid')
    event = Events.get_by_id(int(eid))
    if event.office==int(self.userInfo['office']):
      if int(self.userInfo['user_id']) not in event.participants:
        event.participants.append(int(self.userInfo['user_id']))
        event.put()
        self.response.out.write("True")
      else:
        self.response.out.write("False")
    else:
      self.response.out.write("False")
     
class cancelCheckin(BaseHandler):
  @user_required
  def post(self,*args,**kwargs):
    eid=self.request.POST.get('eid')
    event = Events.get_by_id(int(eid))
    if event.office==int(self.userInfo['office']):
      if int(self.userInfo['user_id']) in event.participants:
        event.participants.remove(int(self.userInfo['user_id']))
        event.put()
        self.response.out.write("True")
      else:
        self.response.out.write("False")
    else:
      self.response.out.write("False")

class getComments(BaseHandler):
  @user_required
  def post(self,*args,**kwargs):
    
    eid=self.request.POST.get('eid')
    comments = Comments.query(Comments.eid==int(eid)).order(Comments.date).fetch()
    self.response.out.write('{"comments":[')
    jsonList = []
    for c in comments:
       jsonList.append('{"text":["'+c.comment+'"],"userName":["'+c.userName+'"]}')
    self.response.out.write(",".join(jsonList))
     
    self.response.out.write("]}")
    #self.response.out.write('"comment":["'+c.comment+'"],"user":{"name":["'+c.userName+'"]}')           
    #left over code form when I tried using the json module to do this easy shit
    #self.response.out.write(json.dumps(Comments._to_dict(c,exclude=['date'])))
    #Comments._to_dict()
    #self.response.out.write(json.dumps([Comments._to_dict(c) for c in comments]))

class addComment(BaseHandler):
  @user_required
  def post(self,*args,**kwargs):
    eid=self.request.POST.get('eid')
    comment=self.request.POST.get('comment')
    event = Events.get_by_id(int(eid))
    if event.office==int(self.userInfo['office']):
      addComment = Comments()
      addComment.user = int(self.userInfo['user_id'])
      addComment.userName1 = [str(self.userInfo['fname']),str(self.userInfo['lname'])]
      addComment.userName = " ".join(addComment.userName1)
      addComment.eid = int(eid)
      addComment.comment = comment
      addComment.office = int(self.userInfo['office'])
      addComment.put()
      self.response.out.write("True")
    else:
      self.response.out.write("False")
      
app = webapp2.WSGIApplication([
  webapp2.Route(r'/ajax/eventCheckin', handler=eventCheckin, name='eventCheckin'),
  webapp2.Route(r'/ajax/cancelCheckin', handler=cancelCheckin, name='cancelCheckin'),
  webapp2.Route(r'/ajax/getComments', handler=getComments, name='getComments'),
  webapp2.Route(r'/ajax/addComment', handler=addComment, name='addComment')

],config=config)
