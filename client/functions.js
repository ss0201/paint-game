function onPhaseChanged (phase) {
  var gameId = Session.get("gameId");
  var game = Games.findOne(gameId);
  if (arePhasesEqual(phase, game.phaseSet.guessingPhase)) {
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
  Meteor.subscribe("players", gameId);
  Meteor.subscribe("answers", playerId);
  Meteor.subscribe("pictures", gameId);
  Meteor.subscribe("guesses", gameId);
  Meteor.subscribe("finishedPictures", gameId);

  Games.find(gameId).observeChanges({
    changed: function (id, fields) {
      if (fields.hasOwnProperty("phase")) {
        onPhaseChanged(fields.phase);
      }
    }
  });
  Answers.find({drawerId: playerId, gameId: gameId}).observe({
    added: function (answer) {
      openGoogleImageSearch(answer);
    }
  });

  playSound();
}

function createGame (gameName, problemSetId, phaseSet) {
  Meteor.call("createGame", gameName, problemSetId, phaseSet, function (error, result) {
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