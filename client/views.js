function player () {
  return Players.findOne(Session.get("playerId"));
};

function game () {
//  var me = player();
//  return me && me.gameId && Games.findOne(me.gameId);
  return Games.findOne({});
};


Template.game.phase = function () {
  var phase = game() && game().phase;
  if (!phase) {
    return "Invalid Phase";
  }
  return phase.name;
};

Template.game.clock = function () {
  var clock = game() && game().clock;
  if (!clock && clock != 0) {
    return "Invalid Clock";
  }
  var min = Math.floor(clock / 60);
  var sec = clock % 60;
  return min + ":" + (sec < 10 ? "0" : "") + sec;
};

Template.player._name = function () {
  var player = Players.findOne(this + "");
  if (!player) {
    return "Invalid player";
  }
  return player._id;
};

Template.player.score = function () {
  var player = Players.findOne(this + "");
  if (!player) {
    return "Invalid player";
  }
  return player.score + " point" + (player.score > 1 ? "s" : "");
};

Template.subject.text = function () {
  var subject = Subjects.findOne({drawerId: this + ""});
  var text = subject && subject.text;
  if (!text) {
    return "No Subject";
  }
  return text;
};

Meteor.startup(function () {
  $(document).ready(function () {
	  $("#paint").wPaint({
      strokeStyle: "#000000",
      lineWidthMin: 1,
      lineWidthMax: 20,
      lineWidth: 1,
      menu: ["pencil", "eraser", "strokeColor", "lineWidth", "undo", "redo", "clear"]
	  });
  });
});

Template.drawing.drawing = function() {
  return getDisplayOption(DRAWING_PHASE);
};

Template.drawing.drawerData = function () {
  return Session.get("playerId");
};

Template.guessing.guessing = function() {
  return getDisplayOption(GUESSING_PHASE);
};

Template.guessing.pictures = function () {
  return Pictures.find({});
};

function getDisplayOption (phase) {
  var currentPhase = game() && game().phase;
  return (currentPhase && phaseEquals(currentPhase, phase) ? "block" : "none");
}

Template.picture.drawer = function () {
  return this.drawerId;
};

function clearPaintArea () {
  $("#paint").wPaint("clear");
}

Template.picture.answered = function () {
  var subject = Subjects.findOne({drawerId: this.drawerId});
  return (subject && subject.answered);
};

Template.picture.events({
  "click button, keyup input": function (event, template) {
    var textbox = template.find("#answerInput");
    if (event.type === "click" || (event.type === "keyup" && event.which === 13)) {
      Meteor.call("answer", Session.get("playerId"), this.drawerId, textbox.value);
      textbox.value = "";
      textbox.focus();
    }
  }
});
