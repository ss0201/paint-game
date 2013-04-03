Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Template.page.notInGame = function () {
  return (!Session.get("gameId"));
};

Template.lobby.events({
  "click #newGame": function (event, template) {
    if (checkNameSupplied()) {
      Meteor.call("createGame", template.find("#gameName").value, function (error, result) {
        var gameId = result;
        if (error) {
          console.log(error);
        } else {
          callJoinGame(gameId, $("#playerName").val());
        }
      });
    }
  }
});

Template.lobby.games = function () {
  return Games.find({});
};

Template.gameInfo.events({
  "click #join": function (event, template) {
    if (checkNameSupplied()) {
      callJoinGame(this._id, $("#playerName").val());
    }
  }
});

function checkNameSupplied () {
  if (!$("#playerName").val()) {
    $("#playerNameLabel").stop().animate({color: "#ff0000"}, 0).animate({color: "#000000"}, 1500);
    return false;
  } else {
    return true;
  }
}

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

Template.drawing.show = function() {
  return isPhase(DRAWING_PHASE);
};

Template.drawing.drawerData = function () {
  return Session.get("playerId");
};

Template.paint.created = function () {
  $("#paint").wPaint({
    strokeStyle: "#000000",
    lineWidthMin: 1,
    lineWidthMax: 20,
    lineWidth: 1,
    menu: ["pencil", "eraser", "strokeColor", "lineWidth", "undo", "redo", "clear"]
  });
};

Template.guessing.show = function() {
  return isPhase(GUESSING_PHASE);
};

Template.guessing.pictures = function () {
  return Pictures.find({});
};

function isPhase (phase) {
  var currentPhase = game() && game().phase;
  return (currentPhase && phaseEquals(currentPhase, phase));
}

Template.picture.drawer = function () {
  return Players.findOne(this.drawerId);
};

function getImageInPaintArea () {
  return $("#paint").wPaint("image");
}

Template.picture.answered = function () {
  var subject = Subjects.findOne({drawerId: this.drawerId});
  return (subject && subject.answered);
};

Template.picture.mine = function () {
  return (this.drawerId == Session.get("playerId"));
};

Template.picture.events({
  "click button, keydown input": function (event, template) {
    if (event.type === "click" || (event.type === "keydown" && String.fromCharCode( event.which ) === "\r")) {
      var textbox = template.find("#answerInput");
      Meteor.call("answer", Session.get("playerId"), this.drawerId, textbox.value);
      textbox.value = "";
      textbox.focus();
    }
  }
});

Template.players.players = function () {
  return Players.find({});
};
