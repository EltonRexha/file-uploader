function renderGetStarted(req, res) {
  if (req.user) {
    res.redirect('/home');
    return;
  }
  res.render('getStartedPage');
}

module.exports = {
  renderGetStarted,
};
