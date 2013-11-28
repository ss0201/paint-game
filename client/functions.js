joinGame = function (gameId) {
  Meteor.call("joinGame", Meteor.userId(), gameId, function (error, result) {
    if (error) {
      console.log(error);
    } else {
      var playerId = result;
      onJoinedGame(playerId, gameId);
    }
  });
};

createGame = function (gameName, problemSetId, phaseSet) {
  Meteor.call("createGame", gameName, problemSetId, phaseSet, function (error, result) {
    var gameId = result;
    if (error) {
      console.log(error);
    } else {
      joinGame(gameId);
    }
  });
};

uploadProblems = function (files) {
  _.each(files, function (file) {
    if (!file.type.match("text")) {
      return true;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      var problemSetName = file.name.substr(0, file.name.lastIndexOf('.')) || file.name;
      if (ProblemSets.find({name: problemSetName}).count() == 0) {
        var lines = e.target.result.split(/\r?\n/);
        var problemDataSet = new Array();
        _.each(lines, function (line) {
          if (line) {
            var texts = line.split(",");
            problemDataSet.push(new ProblemData(texts[0], texts[1]));
          }
        });
        Meteor.call("createProblemSet", problemSetName, problemDataSet);
      }
    };
    reader.readAsText(file);
  });
};

Meteor.startup(function () {
  Session.set("gameId", undefined);
  Session.set("playerId", undefined);
});

var onPhaseChanged = function (phase) {
  var gameId = Session.get("gameId");
  var game = Games.findOne(gameId);
  if (arePhasesEqual(phase, game.phaseSet.guessingPhase)) {
    var image = getImageInPaintArea();
    Meteor.call("sendPicture", Session.get("playerId"), gameId, image);
    clearPaintArea();
  }
  playSound();
};

var onJoinedGame = function (playerId, gameId) {
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
};
