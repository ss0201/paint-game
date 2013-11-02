function Phase (name, duration) {
  var self = this;
  self.name = name;
  self.duration = duration;
}

var DRAWING_PHASE = new Phase("Drawing", 10);
var GUESSING_PHASE = new Phase("Guessing", 20);

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

function Game (name, problemSetId) {
  var self = this;
  self.name = name;
  self.phase = DRAWING_PHASE;
  self.clock = self.phase.duration;
  self.problemSetId = problemSetId;
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

function Player (userId, gameId) {
  var self = this;
  self.userId = userId;
  self.gameId = gameId;
  self.score = 0;
}

function Subject (drawerId, gameId, text) {
  var self = this;
  self.drawerId = drawerId;
  self.gameId = gameId;
  self.text = text;
  self.answered = false;
}

function Picture (drawerId, gameId, image) {
  var self = this;
  self.drawerId = drawerId;
  self.gameId = gameId;
  self.image = image;
}

function ProblemSet (name) {
  var self = this;
  self.name = name;
}

function Problem (problemSetId, text) {
  var self = this;
  self.problemSetId = problemSetId;
  self.text = text;
}

function Message (speakerId, gameId, text) {
  var self = this;
  self.speakerId = speakerId;
  self.gameId = gameId;
  self.text = text;
}

var Games = new Meteor.Collection("games");
var Players = new Meteor.Collection("players");
var Subjects = new Meteor.Collection("subjects");
var Pictures = new Meteor.Collection("pictures");
var ProblemSets = new Meteor.Collection("problemSets");
if (Meteor.isServer) {
  var Problems = new Meteor.Collection(null);
}
var Messages = new Meteor.Collection("messages");

if (Meteor.isClient) {
  Deps.autorun(function () {
    Meteor.subscribe("userData");
    Meteor.subscribe("games");
    Meteor.subscribe("problemSets");
    Meteor.subscribe("messages");
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.publish("userData", function () {
      return Meteor.users.find({});
    });
    Meteor.publish("games", function () {
      return Games.find({});
    });
    Meteor.publish("players", function (gameId) {
      return Players.find({gameId: gameId});
    });
    Meteor.publish("subjects", function (gameId, playerId) {
      return Subjects.find(
        {$and: [
          {gameId: gameId},
          {$or: [
            {drawerId: playerId},
            {answered: true}
          ]}
        ]}
      );
    });
    Meteor.publish("pictures", function (gameId) {
      return Pictures.find({gameId: gameId});
    });
    Meteor.publish("problemSets", function () {
      return ProblemSets.find({});
    });
    Meteor.publish("messages", function () {
      return Messages.find({});
    });

    Games.remove({});
    Players.remove({});
    Subjects.remove({});
    Pictures.remove({});
    Messages.remove({});
  });
}