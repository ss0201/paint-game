Meteor.methods({
  answer: function (answererId, drawerId, text) {
    if (Meteor.isServer) {
      var subject = Subjects.findOne({drawerId: drawerId});
      var answerer = Players.findOne(answererId);
      var drawer = Players.findOne(drawerId);
      if (subject.text == text) {
        Subjects.update(subject._id, {$set: {answered: true}});
        Players.update(answerer._id, {$set: {score: answerer.score + 1}});
        Players.update(drawer._id, {$set: {score: drawer.score + 1}});
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
  
  joinGame: function (userId, gameId) {
    if (Meteor.isServer) {
      var playerId;
      if (Players.find({userId: userId}).count() == 0) {
        playerId = Players.insert(new Player(userId, gameId));
      } else {
        Players.update({userId: userId}, {$set: {gameId: gameId}});
        playerId = Players.findOne({userId: userId})._id;
      }
      return playerId
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
  }
});
