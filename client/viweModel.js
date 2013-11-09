Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Template.page.created = function () {
  $.ionSound({
    sounds: [
      "NewRound",
      "LetsGuess",
      "CheckAnswers",
      "Correct",
      "Wrong"
    ],
    path: "sounds/"
  });
}

function playSound (phase) {
  if (isPhase(game().phaseSet.drawingPhase)) {
    $.ionSound.play("NewRound");
  } else if (isPhase(game().phaseSet.guessingPhase)) {
    $.ionSound.play("LetsGuess");
  } else if (isPhase(game().phaseSet.answerPhase)) {
    $.ionSound.play("CheckAnswers");
  }
}

Template.page.notInGame = function () {
  return (!Session.get("gameId"));
};

Template.lobby.games = function () {
  return Games.find({});
};

Template.newGame.events({
  "click #newGame": function (event, template) {
    var gameName = template.find("#gameName").value;
    if (!gameName) {
      alert("Please give a game name.");
    } else {
      var problemSetName = template.find("#problemSet").value;
      var problemSetId = ProblemSets.findOne({name: problemSetName})._id;
      var drawingPhaseDuration = parseInt(template.find("#drawingPhaseDuration").value) || 0;
      var guessingPhaseDuration = parseInt(template.find("#guessingPhaseDuration").value) || 0;
      var answerPhaseDuration = parseInt(template.find("#answerPhaseDuration").value) || 0;
      var phaseSet = new PhaseSet(drawingPhaseDuration, guessingPhaseDuration, answerPhaseDuration);
      createGame(gameName, problemSetId, phaseSet);
    }
  }
});

Template.newGame.problemSets = function () {
  return ProblemSets.find({});
};

Template.gameInfo.events({
  "click #join": function (event, template) {
    joinGame(this._id);
  }
});

Template.problemUploader.events({
  "change #selector": function (event) {
    var files = event.target.files;
    uploadProblems(files);
  }
});

function game () {
  return Games.findOne(Session.get("gameId"));
}

Template.gameStatus._name = function () {
  var name = game() && game().name;
  if (!name) {
    return "Invalid Name";
  }
  return name;
};

Template.gameStatus.phase = function () {
  var phase = game() && game().phase;
  if (!phase) {
    return "Invalid Phase";
  }
  return phase.name + " Phase";
};

Template.gameStatus.clock = function () {
  var clock = game() && game().clock;
  if (!clock && clock != 0) {
    return "Invalid Clock";
  }
  var min = Math.floor(clock / 60);
  var sec = clock % 60;
  return min + ":" + (sec < 10 ? "0" : "") + sec;
};

Template.player._name = function () {
  return Meteor.users.findOne(this.userId).username;
};

Template.player.score = function () {
  return this.score + " point" + (this.score > 1 ? "s" : "");
};

Template.subject.text = function () {
  var subject = Subjects.findOne({drawerId: this + ""});
  var text = subject && subject.text;
  if (!text) {
    return "No Subject";
  }
  return text;
};

Template.drawing.rendered = function () {
  if (Template.drawing.show()) {
    $("#paint").show();
  } else {
    $("#paint").hide();
  }
};

Template.drawing.show = function() {
  return game() && isPhase(game().phaseSet.drawingPhase);
};

Template.drawing.drawerData = function () {
  return Session.get("playerId");
};

Template.paint.rendered = function () {
  $("#paint").wPaint({
    strokeStyle: "#000000",
    lineWidthMin: 1,
    lineWidthMax: 20,
    lineWidth: 1,
    menu: ["pencil", "eraser", "strokeColor", "lineWidth", "undo", "redo", "clear"]
  });
};

Template.guessing.show = function() {
  return game() && (isPhase(game().phaseSet.guessingPhase) || isPhase(game().phaseSet.answerPhase));
};

Template.guessing.pictures = function () {
  return Pictures.find({});
};

function isPhase (phase) {
  var currentPhase = game() && game().phase;
  return (currentPhase && arePhasesEqual(currentPhase, phase));
}

Template.picture.drawer = function () {
  return Players.findOne(this.drawerId);
};

function getImageInPaintArea () {
  return $("#paint").wPaint("image");
}

function clearPaintArea () {
  $('#paint').wPaint('clear');
}

Template.picture.answered = function () {
  return Answers.find({drawerId: this.drawerId, correct: true}).count() > 0;
};

Template.picture.mine = function () {
  return (this.drawerId == Session.get("playerId"));
};

Template.picture.preserve(["#answerInput"]);

Template.picture.events({
  "click button, keydown input": function (event, template) {
    if (event.type === "click" || (event.type === "keydown" && String.fromCharCode( event.which ) === "\r")) {
      var textbox = template.find("#answerInput");
      Meteor.call("answer", Session.get("playerId"), this.drawerId, textbox.value, function (error, correct) {
        if (error) {
          console.log(error);
        } else {
          if (correct) {
            $.ionSound.play("Correct");
          } else {
            $.ionSound.play("Wrong");
          }
        }
      });
      textbox.value = "";
      textbox.focus();
    }
  }
});

Template.picture.answers = function () {
  return Answers.find({gameId: game()._id, drawerId: this.drawerId}).fetch().reverse().slice(0, 5);
};

Template.players.players = function () {
  return Players.find({});
};

Template.answer.answerer = function () {
  var userId = Players.findOne(this.answererId).userId;
  return Meteor.users.findOne(userId).username;
};

Template.chat.messages = function () {
  return Messages.find({gameId: Session.get("gameId")}).fetch().reverse();
};

Template.message.speaker = function () {
  return Meteor.users.findOne(this.speakerId).username;
};

Template.chat.events({
  "click button, keydown input": function (event, template) {
    if (event.type === "click" || (event.type === "keydown" && String.fromCharCode( event.which ) === "\r")) {
      var textbox = template.find("#message");
      var message = textbox.value;
      if (message) {
        Meteor.call("speak", Meteor.userId(), Session.get("gameId"), message);
        textbox.value = "";
      }
      textbox.focus();
    }
  }
});
