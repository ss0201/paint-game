function progress () {
  var games = Games.find({});
  games.forEach(function (game) {
    tickClock(game);
    if (isTimeOver(game)) {
      var originalPhase = game.phase;
      changePhase(game);
      if (arePhasesEqual(originalPhase, game.answerPhase)) {
        beginNewRound(game);
      } else if (arePhasesEqual(originalPhase, game.guessingPhase)) {
        revealAnswers(game);
      }
    }
  });
}

function beginNewRound (game) {
  var players = Players.find({gameId: game._id});
  var presentPlayerIds = new Array();
  players.forEach(function (player) {
    Meteor.call("requestSubject", player._id, game._id);
    presentPlayerIds.push(player._id);
  });
  Subjects.remove(
    {$and: [
      {gameId: game._id},
      {drawerId: {$not: {$in: presentPlayerIds}}}
    ]}
  );
  Pictures.remove({gameId: game._id});
}

function revealAnswers(game) {
  var subjects = Subjects.find({gameId: game._id});
  subjects.forEach(function (subject) {
    Subjects.update(subject._id, {$set: {answered: true}});
  });
}

Meteor.startup(function () {
  Meteor.setInterval(progress, 1*1000);
});

function getRandomProblem (gameId) {
  var game = Games.findOne(gameId);
  var problems = Problems.find({problemSetId: game.problemSetId});
  return Random.choice(problems.fetch());
}
