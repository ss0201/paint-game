Meteor.startup(function () {
  var playerId = Players.insert(new Player());
  Session.set('playerId', playerId);

  Deps.autorun(function () {
    Meteor.subscribe("games");
    Meteor.subscribe("subjects", playerId);
    Meteor.subscribe("players");
    Meteor.subscribe("answers");
    Meteor.subscribe("pictures");
  });
  
  var game = Games.find({}); // TODO: filter by id
  game.observeChanges({
    changed: function (id, fields) {
      if (fields.hasOwnProperty("phase")) {
        if (phaseEquals(fields.phase, GUESSING_PHASE)) {
          var image = $("#paint").wPaint("image");
          Meteor.call("sendPicture", playerId, image);
          clearPaintArea();
        }
      }
    }
  });
  
  Meteor.call("requireSubject", playerId);
});
