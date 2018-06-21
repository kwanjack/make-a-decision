import { Meteor } from 'meteor/meteor';
import '../imports/api/votes.js';

const END_TIME = (new Date()).setHours(18,0,0);

Meteor.startup(() => {
  // code to run on server at startup
});
