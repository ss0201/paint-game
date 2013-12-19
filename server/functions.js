Meteor.startup(function () {
  Meteor.setInterval(progress, 1*1000);
});

var progress = function () {
  var games = Games.find({});
  games.forEach(function (game) {
    tickClock(game);
    if (isReadyForNextPhase(game)) {
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

var beginNewRound = function (game) {
  Pictures.find({gameId: game._id}).forEach(function (picture) {
    var answer = Answers.findOne({drawerId: picture.drawerId, gameId: game._id});
    picture.answer = answer.problem.problemData.text;
    FinishedPictures.insert(picture);
  });

  Answers.remove({gameId: game._id});
  Pictures.remove({gameId: game._id});
  Guesses.remove({gameId: game._id});

  var players = Players.find({gameId: game._id});
  players.forEach(function (player) {
    requestSubject(player._id, game._id);
  });
}

requestSubject = function (drawerId, gameId) {
  if (Meteor.isServer) {
    var problem = getRandomProblem(gameId);
    Answers.insert(new Answer(drawerId, gameId, problem));
  }
}

var getRandomProblem = function (gameId) {
  var game = Games.findOne(gameId);
  var problemPool = ProblemPools.findOne({gameId: game._id});
  var problem = Random.choice(problemPool.availableProblems);
  var index = problemPool.availableProblems.indexOf(problem);
  problemPool.availableProblems.splice(index, 1);
  if (problemPool.availableProblems.length == 0) {
    populateProblemPool(problemPool);
  }
  ProblemPools.update(problemPool._id, {$set: {availableProblems: problemPool.availableProblems}});
  return problem;
}
