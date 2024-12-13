function renderGetStarted(req, res){
    console.log(req.user);
    res.render('getStartedPage');
}

module.exports = {
  renderGetStarted,
};