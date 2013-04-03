Meteor.methods({
  answer: function (answererId, drawerId, text) {
    if (Meteor.isServer) {
      var subject = Subjects.findOne({drawerId: drawerId});
      var answerer = Players.findOne(answererId);
      if (subject.text == text) {
        Subjects.update(subject._id, {$set: {answered: true}});
        Players.update(answerer._id, {$set: {score: answerer.score + 1}});
      }
    }
  },
  
  requireSubject: function (drawerId, gameId) {
    if (Meteor.isServer) {
      var problem = getRandomProblem();
      if (Subjects.find({drawerId: drawerId}).count() == 0) {
        Subjects.insert(new Subject(drawerId, gameId, problem.text));
      } else {
        Subjects.update({drawerId: drawerId}, {$set: {text: problem.text, answered: false}});
      }
    }
  },
  
  sendPicture: function (drawerId, gameId, image) {
    if (Meteor.isServer) {
      Pictures.insert(new Picture(drawerId, gameId, image));
    }
  },
  
  createGame: function (name) {
    if (Meteor.isServer) {
      return Games.insert(new Game(name));
    }
  },
  
  joinGame: function (userId, gameId, playerName) {
    if (Meteor.isServer) {
      var playerId;
      if (Players.find({userId: userId}).count() == 0) {
        playerId = Players.insert(new Player(userId, gameId, playerName));
      } else {
        playerId = Players.update({userId: userId}, {$set: {gameId: gameId, name: playerName}});
      }
      return playerId
    }
  }
});
