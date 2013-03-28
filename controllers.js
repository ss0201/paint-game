Meteor.methods({
  requireSubject: function (drawerId) {
    Subjects.remove(drawerId);
    Subjects.insert(new Subject("test", drawerId));
  }
});
