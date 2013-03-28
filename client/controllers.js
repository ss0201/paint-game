Meteor.startup(function () {
  var playerId = Players.insert(new Player());
  Session.set('playerId', playerId);

  Deps.autorun(function () {
    Meteor.subscribe("games");
    Meteor.subscribe("subjects", playerId);
    Meteor.subscribe("players");
    Meteor.subscribe("answers");
  });
  
  Meteor.call("requireSubject", playerId);
});
