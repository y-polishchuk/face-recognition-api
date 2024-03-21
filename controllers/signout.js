
const handleSignout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: 'Failed to sign out' });
    } else {
      res.clearCookie('session-id');
      res.json({ message: 'Signed out successfully' });
    }
  });
}

module.exports = {
  handleSignout
}