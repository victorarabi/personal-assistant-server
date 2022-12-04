//function that loads user data
function profileData(req, res) {
  let userData = {
    id: req.user.id,
    name: req.user.name,
    picture: req.user.picture,
    email: req.user.email,
  };
  res.send(userData);
}

module.exports = { profileData };
