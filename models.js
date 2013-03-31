function Phase (name, duration) {
  var self = this;
  self.name = name;
  self.duration = duration;
}

var DRAWING_PHASE = new Phase("Drawing", 5);
var GUESSING_PHASE = new Phase("Guessing", 5);

function phaseEquals (left, right) {
  return (left.name == right.name);
}

if (Meteor.isServer) {
  function changePhase (game) {
    var nextPhase = null;
    if (phaseEquals(game.phase, DRAWING_PHASE)) {
      nextPhase = GUESSING_PHASE;
    } else if (phaseEquals(game.phase, GUESSING_PHASE)) {
      nextPhase = DRAWING_PHASE;
    }
    Games.update(game._id, {$set: {phase: nextPhase, clock: nextPhase.duration}});
  }
}

function Game (phase) {
  var self = this;
  self.phase = phase;
  self.clock = phase.duration;
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
}

function Player () {
  var self = this;
  self.gameId = null;
  self.score = 0;
}

function Subject (drawerId, text) {
  var self = this;
  self.drawerId = drawerId;
  self.text = text;
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

function Picture (drawerId, image) {
  var self = this;
  self.drawerId = drawerId;
  self.image = image;
}

var Games = new Meteor.Collection("games");
var Players = new Meteor.Collection("players");
var Subjects = new Meteor.Collection("subjects");
var Answers = new Meteor.Collection("answers");
var Pictures = new Meteor.Collection("pictures");
if (Meteor.isServer) {
  var Problems = new Meteor.Collection(null);
}

Meteor.methods({
  answer: function (answererId, drawerId, text) {
    if (Meteor.isServer) {
      var subject = Subjects.find({drawerId: drawerId});
      var answerer = Players.find(answererId);
      if (subject.text == text) {
        Subjects.update(subject._id, {$set: {answered: true}});
      }
      Players.update(answerer._id, {$set: {score: answerer.score}});
    }
  },
  
  requireSubject: function (drawerId) {
    if (Meteor.isServer) {
      var problem = getRandomProblem();
      if (Subjects.find({drawerId: drawerId}).count() == 0) {
        Subjects.insert(new Subject(drawerId, problem.text));
      } else {
        Subjects.update({drawerId: drawerId}, {$set: {text: problem.text, answered: false}});
      }
    }
  },
  
  sendPicture: function (drawerId, image) {
    if (Meteor.isServer) {
      Pictures.insert(new Picture(drawerId, image));
    }
  }
});
