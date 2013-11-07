function onPhaseChanged (phase) {
  if (phaseEquals(phase, GUESSING_PHASE)) {
    hidePaintArea();
    var image = getImageInPaintArea();
    Meteor.call("sendPicture", Session.get("playerId"), Session.get("gameId"), image);
    clearPaintArea();
  } else {
    showPaintArea();
  }
}

Meteor.startup(function () {
  Session.set("gameId", undefined);
  Session.set("playerId", undefined);
});

function joinGame (gameId) {
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

function createGame (gameName, problemSetId) {
  Meteor.call("createGame", gameName, problemSetId, function (error, result) {
    var gameId = result;
    if (error) {
      console.log(error);
    } else {
      joinGame(gameId);
    }
  });
}

function uploadProblems (files) {
  _.each(files, function (file) {
    if (!file.type.match("text")) {
      return true;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      var problemSetName = file.name;
      if (ProblemSets.find({name: problemSetName}).count() == 0) {
        var problems = e.target.result.split(/\r?\n/);
        Meteor.call("createProblemSet", problemSetName, problems);
      }
    };
    reader.readAsText(file);
  });
}