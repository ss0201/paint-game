function progress () {
  var game = Games.findOne({});
  tickClock(game);
  if (isTimeOver(game)) {
    var phase = game.phase;
    changePhase(game);
    if (phaseEquals(phase, GUESSING_PHASE)) {
      var players = Players.find({});
      var ids = new Array();
      players.forEach(function (player) {
        Meteor.call("requireSubject", player._id);
        ids.push(player._id);
      });
      Subjects.remove({drawerId: {$not: {$in: ids}}});
      Pictures.remove({});
    }
  }
}

Meteor.startup(function () {
  Games.remove({});
  Players.remove({});
  Subjects.remove({});
  Answers.remove({});
  Pictures.remove({});
  Problems.remove({});
  
  Games.insert(new Game(DRAWING_PHASE));
  Problems.insert(new Problem("a"));
  Problems.insert(new Problem("b"));
  Problems.insert(new Problem("c"));
  Problems.insert(new Problem("d"));
  Problems.insert(new Problem("e"));
  
  Meteor.publish("games", function () {
    return Games.find({});
  });
  Meteor.publish("subjects", function (playerId) {
    return Subjects.find({$or: [
      {drawerId: playerId},
      {answered: true}
    ]});
  });
  Meteor.publish("players", function () {
    return Players.find({});
  });
  Meteor.publish("answers", function () {
    return Answers.find({});
  });
  Meteor.publish("pictures", function () {
    return Pictures.find({});
  });

  Meteor.setInterval(progress, 1*1000);
});

function getRandomProblem () {
  var problems = Problems.find({});
  var random = getRandomValue(0, problems.count() - 1);
  return problems.fetch()[random];
}

function getRandomValue (min, max) {
  return Math.floor((Math.random() * max) + min);
}
