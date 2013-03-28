function Game (clock) {
  var self = this;
  self.clock = clock;
}

function Player () {
  var self = this;
  self.gameId = null;
  self.score = 0;
}

function Subject (text, drawerId, answered) {
  var self = this;
  self.text = text;
  self.drawerId = drawerId;
  self.answered = false;
}

function Answer (text, drawerId, answererId) {
  var self = this;
  self.text = text;
  self.drawerId = drawerId;
  self.answererId = answererId;
}

function Problem (text) {
  var self = this;
  self.text = text;
}

if (Meteor.isServer) {
  function tickClock (game) {
    if (game.clock > 0) {
      Games.update(game._id, {$set: {clock: game.clock - 1}});
    }
  }
  
  function isTimeOver (game) {
    return (game.clock == 0);
  };
}

Games = new Meteor.Collection("games");
Players = new Meteor.Collection("players");
Subjects = new Meteor.Collection("subjects");
Answers = new Meteor.Collection("answers");
if (Meteor.isServer) {
  Problems = new Meteor.Collection(null);
}

Meteor.methods({
  answer: function (subjectId, answererId, text) {
    var subject = Subjects.findOne({_id: subjectId});
    if (subject.text == text) {
      Subjects.update(subjectId, {$set: {answered: true}});
    }
    var answerer = Players.findOne({_id: answererId});
    Players.update(answererId, {$set: {score: answerer.score}});
  }
});
