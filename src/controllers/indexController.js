function renderGetStarted(req, res) {
  if (req.user) {
    res.redirect('/dashboard/home/allFiles');
    return;
  }
  res.render('getStartedPage');
}

module.exports = {
  renderGetStarted,
};
