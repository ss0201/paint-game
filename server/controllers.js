var TIME_LIMIT = 60;

Meteor.setInterval(function () {
  var game = Games.findOne({});
  tickClock(game);
  if (isTimeOver(game)) {
    var players = Players.find({});
    players.forEach(function (player) {
      Subjects.remove({});
      Meteor.call("requireSubject", player._id);
    });
    Games.update(game._id, {$set: {clock: TIME_LIMIT}});
  }
}, 1*1000);

Meteor.startup(function () {
  Games.remove({});
  Players.remove({});
  Subjects.remove({});
  Answers.remove({});
  Problems.remove({});
  
  Games.insert(new Game(TIME_LIMIT));
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
});

function getRandomProblem () {
  var problems = Problems.find({});
  var random = getRandomValue(0, problems.count() - 1);
  return problems.fetch()[random];
}

function getRandomValue (min, max) {
  return Math.floor((Math.random() * max) + min);
}
