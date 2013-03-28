Meteor.methods({
  requireSubject: function (drawerId) {
    if (Meteor.isServer) {
      Subjects.remove(drawerId);
      var problem = getRandomProblem();
      Subjects.insert(new Subject(problem.text, drawerId));
    }
  }
});
