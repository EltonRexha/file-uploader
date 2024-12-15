function getAllFilesPage(req, res) {
  const query = req.query;
  const showCreateWorkspaceModal = query.workspaceModal;

  if (showCreateWorkspaceModal) {
    const errors = [];
    const nameError = query.nameError;
    const descriptionError = query.descriptionError;

    if (nameError) {
      errors.push({ msg: nameError });
    }

    if (descriptionError) {
      errors.push({ msg: descriptionError });
    }

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
