function Game (name, problemSetId, phaseSet) {
  var self = this;
  self.name = name;
  self.phaseSet = phaseSet;
  self.phase = self.phaseSet.drawingPhase;
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

function PhaseSet (drawingPhaseDuration, guessingPhaseDuration, answerPhaseDuration) {
  var self = this;
  self.drawingPhase = new Phase("Drawing", drawingPhaseDuration);
  self.guessingPhase = new Phase("Guessing", guessingPhaseDuration);
  self.answerPhase = new Phase("Answer", answerPhaseDuration);
}

function arePhasesEqual (left, right) {
  return left.name == right.name;
}

if (Meteor.isServer) {
  function changePhase (game) {
    var nextPhase = null;
    if (arePhasesEqual(game.phase, game.phaseSet.drawingPhase)) {
      nextPhase = game.phaseSet.guessingPhase;
    } else if (arePhasesEqual(game.phase, game.phaseSet.guessingPhase)) {
      nextPhase = game.phaseSet.answerPhase;
    } else if (arePhasesEqual(game.phase, game.phaseSet.answerPhase)) {
      nextPhase = game.phaseSet.drawingPhase;
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
}

function Picture (drawerId, gameId, image) {
  var self = this;
  self.drawerId = drawerId;
  self.gameId = gameId;
  self.image = image;
}

function Answer (answererId, drawerId, gameId, text, correct) {
  var self = this;
  self.answererId = answererId;
  self.drawerId = drawerId;
  self.gameId = gameId;
  self.text = text;
  self.correct = correct;
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
var Answers = new Meteor.Collection("answers");
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
    Meteor.publish("answers", function (gameId) {
      return Answers.find({gameId: gameId});
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
    Answers.remove({});
    Messages.remove({});
  });
}