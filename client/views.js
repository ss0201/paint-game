Template.game.clock = function () {
  var game = Games.findOne({});
  var clock = game && game.clock;
  if (!clock && clock != 0) {
    return;
  }
  var min = Math.floor(clock / 60);
  var sec = clock % 60;
  return min + ':' + (sec < 10 ? '0' : '') + sec;
};

Template.subject.text = function () {
  var subject = Subjects.findOne({drawerId: Session.get("playerId")});
  var text = subject && subject.text;
  if (!text) {
    return;
  }
  return text;
};

Meteor.startup(function () {
	$("#paint").wPaint({
    strokeStyle: "#000000",
    menu: ["fillColor", "lineWidth", "eraser", "undo", "clear"]
  });
});
