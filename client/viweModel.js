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
  
  $.fn.wPaint.cursors.pencil = {path: 'images/wPaint/main/cursor-crosshair.png', left: 7, top: 7};
  $.fn.wPaint.menus.main.items.lineWidth.range = [1, 5, 10, 25, 50, 99];
}

playSound = function (phase) {
  if (isPhase(game().phaseSet.drawingPhase)) {
    $.ionSound.play("NewRound");
  } else if (isPhase(game().phaseSet.guessingPhase)) {
    $.ionSound.play("LetsGuess");
  } else if (isPhase(game().phaseSet.answerPhase)) {
    $.ionSound.play("CheckAnswers");
  }
}

openGoogleImageSearch = function (answer) {
  window.open("https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(answer.problem.problemData.searchText), "search", "menubar=yes, scrollbars=yes, status=yes, toolbar=yes, location=yes, resizable=yes");
}

Template.page.inGame = function () {
  return (Session.get("gameId") != undefined);
};

Template.lobby.rendered = function () {
  if ($("body").hasClass("ui-layout-container")) {
    $("body").layout().destroy();
  }
};

Template.gameList.games = function () {
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

var game = function () {
  return Games.findOne(Session.get("gameId"));
}

var isPhase = function (phase) {
  var currentPhase = game() && game().phase;
  return (currentPhase && arePhasesEqual(currentPhase, phase));
}

Template.game.rendered = function () {
  $("body").layout({
    applyDefaultStyles: true,
    east__size: "250"
  });
};

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

Template.drawing.answer = function () {
  return Answers.findOne({drawerId: Session.get("playerId")});
};

Template.paint.rendered = function () {
  $("#paint").wPaint({
    strokeStyle: "#000000",
    bg: "#FFFFFF",
    lineWidth: 1
  });
};

getImageInPaintArea = function () {
  return $("#paint").wPaint("image");
}

clearPaintArea = function () {
  $('#paint').wPaint('clear');
}

Template.guessing.show = function() {
  return game() && (isPhase(game().phaseSet.guessingPhase) || isPhase(game().phaseSet.answerPhase));
};

Template.guessing.players = function () {
  var presentPlayerIds = Pictures.find({}).map(function (picture) {
    return picture.drawerId;
  });
  return Players.find({_id: {$in: presentPlayerIds}});
};

Template.subject.pictures = function () {
  return Pictures.find({drawerId: this._id});
};

Template.subject.answer = function () {
  var answer = Answers.findOne({drawerId: this._id});
  return (answer ? answer : new Answer(this._id, game()._id, "???"));
};

Template.subject.guesses = function () {
  return Guesses.find({drawerId: this._id}).fetch().reverse().slice(0, 5);
};

Template.answer.mine = function () {
  return this && this.drawerId == Session.get("playerId");
};

Template.answer.text = function () {
  return this && this.problem.problemData.text;
};

Template.answer.preserve(["#answerInput"]);

Template.answer.events({
  "click button, keydown input": function (event, template) {
    if (event.type === "click" || (event.type === "keydown" && String.fromCharCode( event.which ) === "\r")) {
      var textbox = template.find("#answerInput");
      if (textbox.value) {
        Meteor.call("guess", Session.get("playerId"), this.drawerId, game()._id, textbox.value, function (error, correct) {
          if (error) {
            console.log(error);
          } else {
            $.ionSound.play(correct ? "Correct" : "Wrong");
          }
        });
        textbox.value = "";
      }
      textbox.focus();
    }
  }
});

Template.guess.guesser = function () {
  var guesser = Players.findOne(this.guesserId);
  return guesser && Meteor.users.findOne(guesser.userId).username;
};

Template.players.players = function () {
  return Players.find({});
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

Template.gallery.finishedPictures = function () {
  return FinishedPictures.find({}).fetch().reverse();
};

Template.galleryItem.drawer = function () {
  var drawer = Players.findOne(this.drawerId);
  return drawer && Meteor.users.findOne(drawer.userId).username;
};