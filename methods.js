Meteor.methods({
  guess: function (guesserId, drawerId, gameId, text) {
    if (Meteor.isServer) {
      var answer = Answers.findOne({drawerId: drawerId});
      var guess = new Guess(guesserId, drawerId, gameId, text, answer.text == text);
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
      Pictures.insert(new Picture(drawerId, gameId, image));
    }
  },
  
  createGame: function (name, problemSetId, phaseSet) {
    if (Meteor.isServer) {
      return Games.insert(new Game(name, problemSetId, phaseSet));
    }
  },
  
  joinGame: function (userId, gameId) {
    if (Meteor.isServer) {
      var playerId;
      if (Players.find({userId: userId}).count() == 0) {
        playerId = Players.insert(new Player(userId, gameId));
        requestSubject(playerId, gameId);
      } else {
        Players.update({userId: userId}, {$set: {gameId: gameId}});
        playerId = Players.findOne({userId: userId})._id;
      }
      return playerId;
    }
  },
  
  speak: function (speakerId, gameId, message) {
    if (Meteor.isServer) {
      Messages.insert(new Message(speakerId, gameId, message));
      var messages = Messages.find({gameId: gameId});
      if (messages.count() > 10) {
        var oldest = _.first(messages.fetch());
        Messages.remove(oldest._id);
      }
    }
  },
  
  createProblemSet: function (name, problemTexts) {
    if (Meteor.isServer) {
      var problemSetId = ProblemSets.insert(new ProblemSet(name));
      _.each(problemTexts, function (text) {
        if (text) {
          Problems.insert(new Problem(problemSetId, text));
        }
      });
    }
  }
});
