function Game (name, problemSetId, drawingPhaseDuration, guessingPhaseDuration) {
  var self = this;
  self.name = name;
  self.drawingPhase = new Phase("Drawing", drawingPhaseDuration);
  self.guessingPhase = new Phase("Guessing", guessingPhaseDuration);
  self.answerPhase = new Phase("Answer", 5);
  self.phase = self.drawingPhase;
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

function Phase (name, duration) {
  var self = this;
  self.name = name;
  self.duration = duration;
}

function arePhasesEqual (left, right) {
  return left.name == right.name;
}

if (Meteor.isServer) {
  function changePhase (game) {
    var nextPhase = null;
    if (arePhasesEqual(game.phase, game.drawingPhase)) {
      nextPhase = game.guessingPhase;
    } else if (arePhasesEqual(game.phase, game.guessingPhase)) {
      nextPhase = game.answerPhase;
    } else if (arePhasesEqual(game.phase, game.answerPhase)) {
      nextPhase = game.drawingPhase;
    } else {
      console.log("No suitable next phase: Current phase = " + game.phase.name);
    }
    Games.update(game._id, {$set: {phase: nextPhase, clock: nextPhase.duration}});
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
  var Problems = new Meteor.Collection("problems");
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