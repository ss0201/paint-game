function Phase (name, duration) {
  var self = this;
  self.name = name;
  self.duration = duration;
}

var DRAWING_PHASE = new Phase("Drawing", 10);
var GUESSING_PHASE = new Phase("Guessing", 5);

function Game (phase) {
  var self = this;
  self.phase = phase;
  self.clock = phase.duration;
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
  }
  
  function changePhase (game) {
    var nextPhase = null;
    switch (game.phase.name) {
      case DRAWING_PHASE.name:
        nextPhase = GUESSING_PHASE;
        break;
      case GUESSING_PHASE.name:
        nextPhase = DRAWING_PHASE;
        break;
      default:
        break;
    }
    Games.update(game._id, {$set: {phase: nextPhase, clock: nextPhase.duration}});
  }
}

var Games = new Meteor.Collection("games");
var Players = new Meteor.Collection("players");
var Subjects = new Meteor.Collection("subjects");
var Answers = new Meteor.Collection("answers");
if (Meteor.isServer) {
  var Problems = new Meteor.Collection(null);
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
