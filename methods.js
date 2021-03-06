Meteor.methods({
  guess: function (guesserId, drawerId, gameId, text) {
    if (Meteor.isServer) {
      var answer = Answers.findOne({drawerId: drawerId});
      var guess = new Guess(guesserId, drawerId, gameId, text, answer.problem.problemData.text == text, Date.now());
      Guesses.insert(guess);
      if (guess.isCorrect) {
        Players.update(guesserId, {$inc: {score: 1}});
        Players.update(drawerId, {$inc: {score: 1}});
        Answers.update(answer._id, {$set: {isRevealed: true}});
        return true;
      } else {
        return false;
      }
    }
  },
  
  sendPicture: function (drawerId, gameId, image) {
    if (Meteor.isServer) {
      Pictures.insert(new Picture(drawerId, gameId, image, Date.now()));
    }
  },
  
  createGame: function (name, problemSetId, phaseSet) {
    if (Meteor.isServer) {
      var gameId = Games.insert(new Game(name, problemSetId, phaseSet));
      ProblemPools.insert(new ProblemPool(gameId, problemSetId));
      return gameId;
    }
  },
  
  joinGame: function (userId, gameId) {
    if (Meteor.isServer) {
      var playerId;
      if (Players.find({userId: userId, gameId: gameId}).count() == 0) {
        playerId = Players.insert(new Player(userId, gameId));
        var game = Games.findOne(gameId);
        if (arePhasesEqual(game.phase, game.phaseSet.drawingPhase)) {
          requestSubject(playerId, gameId);
        }
      } else {
        playerId = Players.findOne({userId: userId})._id;
      }
      return playerId;
    }
  },
  
  speak: function (speakerId, gameId, message) {
    if (Meteor.isServer) {
      Messages.insert(new Message(speakerId, gameId, message, Date.now()));
      var messages = Messages.find({gameId: gameId});
      if (messages.count() > 10) {
        var oldest = _.first(messages.fetch());
        Messages.remove(oldest._id);
      }
    }
  },
  
  createProblemSet: function (name, problemDataSet) {
    if (Meteor.isServer) {
      var problemSetId = ProblemSets.insert(new ProblemSet(name));
      _.each(problemDataSet, function (problemData) {
        Problems.insert(new Problem(problemSetId, problemData));
      });
    }
  }
});
