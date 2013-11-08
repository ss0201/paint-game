function onPhaseChanged (phase) {
  var gameId = Session.get("gameId");
  var game = Games.findOne(gameId);
  if (arePhasesEqual(phase, game.guessingPhase)) {
    var image = getImageInPaintArea();
    Meteor.call("sendPicture", Session.get("playerId"), gameId, image);
    clearPaintArea();
  }
  playSound();
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
  playSound();
}

function createGame (gameName, problemSetId, drawingPhaseDuration, guessingPhaseDuration) {
  Meteor.call("createGame", gameName, problemSetId, drawingPhaseDuration, guessingPhaseDuration, function (error, result) {
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
      var problemSetName = file.name.substr(0, file.name.lastIndexOf('.')) || file.name;
      if (ProblemSets.find({name: problemSetName}).count() == 0) {
        var problems = e.target.result.split(/\r?\n/);
        Meteor.call("createProblemSet", problemSetName, problems);
      }
    };
    reader.readAsText(file);
  });
}