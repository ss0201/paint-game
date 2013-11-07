function progress () {
  var games = Games.find({});
  games.forEach(function (game) {
    tickClock(game);
    if (isTimeOver(game)) {
      var phase = game.phase;
      changePhase(game);
      if (phaseEquals(phase, GUESSING_PHASE)) {
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
    }
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
