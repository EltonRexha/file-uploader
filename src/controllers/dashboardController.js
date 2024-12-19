function getAllFilesPage(req, res) {
  const query = req.query;
  const showCreateWorkspaceModal = query.workspaceModal;

  if (showCreateWorkspaceModal) {
    const errors = req.flash('createWorkspaceErrors');

    res.render('allFiles', {
      showCreateWorkspaceModal,
      errors,
    });
    return;
  }
  res.render('allFiles');
}

module.exports = {
  getAllFilesPage,
};
