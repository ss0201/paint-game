Meteor.methods({
  requireSubject: function (drawerId) {
    if (Meteor.isServer) {
      var problem = getRandomProblem();
      if (Subjects.find(drawerId).count() == 0) {
        Subjects.insert(new Subject(problem.text, drawerId));
      } else {
        Subjects.update(drawerId, {text: problem.text});
      }
    }
  }
});
