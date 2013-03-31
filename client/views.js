function player () {
  return Players.findOne(Session.get("playerId"));
};

function game () {
  var me = player();
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

Template.subject.text = function () {
  var subject = Subjects.findOne({drawerId: Session.get("playerId")});
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

Template.guessing.guessing = function() {
  return getDisplayOption(GUESSING_PHASE);
};

function getDisplayOption (phase) {
  var currentPhase = game() && game().phase;
  return (currentPhase && phaseEquals(currentPhase, phase) ? "block" : "none");
}

Template.guessing.players = function () {
  return Players.find({});
};

Template.picture.drawer = function () {
  return this._id;
};

Template.picture.image = function () {
  var picture = Pictures.findOne({drawerId: this._id});
  var image = picture && picture.image;
  if (!image) {
    return;
  }
  return image;
};

Template.picture.subject = function () {
  var subject = Subjects.findOne({drawerId: this._id});
  var text = subject && subject.text;
  if (!text) {
    return "Invalid Subject";
  }
  return text;
};

function clearPaintArea () {
  $("#paint").wPaint("clear");
}

Template.picture.answered = function () {
  var subject = Subjects.findOne({drawerId: this._id});
  return (subject && subject.answered);
};

Template.picture.events({
  "click button, keyup input": function (evt) {
    var textbox = $("#answer input");
    if (evt.type === "click" || (evt.type === "keyup" && evt.which === 13)) {
      var subject = Subjects.findOne({drawerId: this._id});
      Meteor.call("answer", player(), subject._id, textbox.val());
      textbox.val("");
      textbox.focus();
    }
  }
});
