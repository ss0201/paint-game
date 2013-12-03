Game = function (name, problemSetId, phaseSet) {
  var self = this;
  self.name = name;
  self.phaseSet = phaseSet;
  self.phase = self.phaseSet.drawingPhase;
  self.clock = self.phase.duration;
  self.problemSetId = problemSetId;
}

if (Meteor.isServer) {
  tickClock = function (game) {
    if (game.clock > 0) {
      Games.update(game._id, {$set: {clock: game.clock - 1}});
    }
  }
  
  isTimeOver = function (game) {
    return (game.clock == 0);
  }
  
  isReadyForNextPhase = function (game) {
    if (isTimeOver(game)) {
      return true;
    } else if (arePhasesEqual(game.phase, game.phaseSet.guessingPhase)) {
      return Answers.find({gameId: game._id, isRevealed: false}).count() == 0;
    }
  }
}

Phase = function (name, duration) {
  var self = this;
  self.name = name;
  self.duration = duration;
}

PhaseSet = function (drawingPhaseDuration, guessingPhaseDuration, answerPhaseDuration) {
  var self = this;
  self.drawingPhase = new Phase("Drawing", drawingPhaseDuration);
  self.guessingPhase = new Phase("Guessing", guessingPhaseDuration);
  self.answerPhase = new Phase("Answer", answerPhaseDuration);
}

arePhasesEqual = function (left, right) {
  return left.name == right.name;
}

if (Meteor.isServer) {
  changePhase = function (game) {
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

Player = function (userId, gameId) {
  var self = this;
  self.userId = userId;
  self.gameId = gameId;
  self.score = 0;
}

Answer = function (drawerId, gameId, problem) {
  var self = this;
  self.drawerId = drawerId;
  self.gameId = gameId;
  self.problem = problem;
  self.isRevealed = false;
}

Picture = function (drawerId, gameId, image, time) {
  var self = this;
  self.drawerId = drawerId;
  self.gameId = gameId;
  self.image = image;
  self.time = time;
  self.answer = "";
}

Guess = function (guesserId, drawerId, gameId, text, isCorrect, time) {
  var self = this;
  self.guesserId = guesserId;
  self.drawerId = drawerId;
  self.gameId = gameId;
  self.text = text;
  self.isCorrect = isCorrect;
  self.time = time;
}

ProblemSet = function (name) {
  var self = this;
  self.name = name;
}

ProblemData = function (text, searchText) {
  var self = this;
  self.text = text;
  self.searchText = searchText || text;
}

Problem = function (problemSetId, problemData) {
  var self = this;
  self.problemSetId = problemSetId;
  self.problemData = problemData;
}

Message = function (speakerId, gameId, text, time) {
  var self = this;
  self.speakerId = speakerId;
  self.gameId = gameId;
  self.text = text;
  self.time = time;
}

Games = new Meteor.Collection("games");
Players = new Meteor.Collection("players");
Answers = new Meteor.Collection("answers");
Pictures = new Meteor.Collection("pictures");
Guesses = new Meteor.Collection("guesses");
ProblemSets = new Meteor.Collection("problemSets");
FinishedPictures = new Meteor.Collection("finishedPictures");
if (Meteor.isServer) {
  Problems = new Meteor.Collection("problems");
}
Messages = new Meteor.Collection("messages");

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
    Meteor.publish("answers", function (playerId) {
      return Answers.find(
        {$or: [
          {drawerId: playerId},
          {isRevealed: true}
        ]}
      );
    });
    Meteor.publish("pictures", function (gameId) {
      return Pictures.find({gameId: gameId});
    });
    Meteor.publish("guesses", function (gameId) {
      return Guesses.find({gameId: gameId});
    });
    Meteor.publish("problemSets", function () {
      return ProblemSets.find({});
    });
    Meteor.publish("messages", function () {
      return Messages.find({});
    });
    Meteor.publish("finishedPictures", function (gameId) {
      return FinishedPictures.find({gameId: gameId});
    });

    Games.remove({});
    Players.remove({});
    Answers.remove({});
    Pictures.remove({});
    Guesses.remove({});
    Messages.remove({});
    FinishedPictures.remove({});
  });
}