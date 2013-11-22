Meteor.startup(function () {
  Meteor.setInterval(progress, 1*1000);
});

function progress () {
  var games = Games.find({});
  games.forEach(function (game) {
    tickClock(game);
    if (isTimeOver(game)) {
      var originalPhase = game.phase;
      changePhase(game);
      if (arePhasesEqual(originalPhase, game.phaseSet.answerPhase)) {
        beginNewRound(game);
      } else if (arePhasesEqual(originalPhase, game.phaseSet.guessingPhase)) {
        Answers.update({gameId: game._id}, {$set: {isRevealed: true}}, {multi: true});
      }
    }
  });
}

function beginNewRound (game) {
  Answers.remove({gameId: game._id});
  Pictures.remove({gameId: game._id});
  Guesses.remove({gameId: game._id});

  var players = Players.find({gameId: game._id});
  players.forEach(function (player) {
    requestSubject(player._id, game._id);
  });
}

function requestSubject (drawerId, gameId) {
  if (Meteor.isServer) {
    var problem = getRandomProblem(gameId);
    Answers.insert(new Answer(drawerId, gameId, problem.text));
  }
}

function getRandomProblem (gameId) {
  var game = Games.findOne(gameId);
  var problems = Problems.find({problemSetId: game.problemSetId});
  return Random.choice(problems.fetch());
}
