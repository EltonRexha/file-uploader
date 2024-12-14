function renderGetStarted(req, res) {
  if (req.user) {
    res.redirect('/dashboard/home');
    return;
  }
  res.render('getStartedPage');
}

module.exports = {
  renderGetStarted,
};
