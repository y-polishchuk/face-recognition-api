
const handleRegister = (db, bcrypt, regenerateSession) => (req, res, next) =>{
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json('Incorrect form submission');
  }

  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(data => {
      return trx('users')
        .returning('*')
        .insert({
          name: name,
          email: data[0].email,
          joined: new Date()
        })
        .then(user => {
          regenerateSession(req, res, next, user[0]);
        })
    })
    .then(trx.commit)
    .catch(trx.rollback);
  })
  .catch(err => res.status(400).json('Unable to register...'));
}

module.exports = {
  handleRegister
}