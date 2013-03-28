Meteor.methods({
  requireSubject: function (drawerId) {
    Subjects.remove(drawerId);
    var problem = getRandomProblem();
    Subjects.insert(new Subject(problem.text, drawerId));
  }
});
