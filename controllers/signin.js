
const handleSignIn = (db, bcrypt, regenerateSession) => (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json('Incorrect form submission');
  }

  db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if(isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => {
            regenerateSession(req, res, next, user[0]);
          })
          .catch(err => res.status(400).json('Unable to get user...'));
      } else {
        res.status(400).json('Wrong credentials...');
      }
    })
    .catch(err => res.status(400).json('Wrong credentials...'))
}

module.exports = {
  handleSignIn
}