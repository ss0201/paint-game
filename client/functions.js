function onPhaseChanged (phase) {
  if (phaseEquals(phase, GUESSING_PHASE)) {
    var image = getImageInPaintArea();
    Meteor.call("sendPicture", Session.get("playerId"), Session.get("gameId"), image);
    clearPaintArea();
  }
}

Meteor.startup(function () {
  Session.set("gameId", undefined);
  Session.set("playerId", undefined);
});

function callJoinGame (gameId) {
  Meteor.call("joinGame", Meteor.userId(), gameId, function (error, result) {
    if (error) {
      console.log(error);
    } else {
      var playerId = result;
      onJoinedGame(playerId, gameId);
    }
  });
}

function onJoinedGame (playerId, gameId) {
  Session.set("gameId", gameId);
  Session.set("playerId", playerId);
  Meteor.call("requireSubject", playerId, gameId);
  var game = Games.find(gameId);
  game.observeChanges({
    changed: function (id, fields) {
      if (fields.hasOwnProperty("phase")) {
        onPhaseChanged(fields.phase);
      }
    }
  });
  Meteor.subscribe("players", gameId);
  Meteor.subscribe("subjects", gameId, playerId);
  Meteor.subscribe("pictures", gameId);
}
