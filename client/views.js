Template.game.phase = function () {
  var game = Games.findOne({});
  var phase = game && game.phase;
  if (!phase) {
    return "Invalid Phase";
  }
  return phase.name;
};

Template.game.clock = function () {
  var game = Games.findOne({});
  var clock = game && game.clock;
  if (!clock && clock != 0) {
    return "Invalid Clock";
  }
  var min = Math.floor(clock / 60);
  var sec = clock % 60;
  return min + ':' + (sec < 10 ? '0' : '') + sec;
};

Template.subject.text = function () {
  var subject = Subjects.findOne({drawerId: Session.get("playerId")});
  var text = subject && subject.text;
  if (!text) {
    return "Invalid Subject";
  }
  return text;
};

Meteor.startup(function () {
	$("#paint").wPaint({
    strokeStyle: "#000000",
    lineWidthMin: 1,
    lineWidthMax: 20,
    lineWidth: 1,
    menu: ["pencil", "eraser", "strokeColor", "lineWidth", "undo", "redo", "clear"]
  });
});
