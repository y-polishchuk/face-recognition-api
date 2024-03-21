
const regenerateSession = (req, res, next, user) => {
  req.session.regenerate(function (err) {
    if (err) next(err);
    req.session.user = user;
    req.session.save(function (err) {
      if (err) return next(err);
      res.json(user);
    });
  });
}

module.exports = regenerateSession;