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
  Subjects.remove({
    gameId: game._id,
    drawerId: {$not: {$in: presentPlayerIds}}
  });
  Pictures.remove({gameId: game._id});
  Answers.remove({gameId: game._id});
}

function revealAnswers(game) {
  var correctAnswers = Answers.find({gameId: game._id, correct: true});
  var correctlyAnsweredSubjectIds = correctAnswers.map(function () {
    return this.subjectId;
  });
  var notCorrectlyAnsweredSubjects = Subjects.find({
    gameId: game._id,
    _id: {$not: {$in: correctlyAnsweredSubjectIds}}
  });
  notCorrectlyAnsweredSubjects.forEach(function (subject) {
    Answers.insert(new Answer(undefined, subject.drawerId, game._id, subject.text, true));
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
