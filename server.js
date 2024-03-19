const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const app = express();
const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'root',
    database : 'smart_brain'
  }
});
const corsOptions = {
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200,
  credentials: true
}

app.use(session({
  secret: 'thisismysecret001',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: false, // true for production
    sameSite: 'none'
  }
}))
app.use(express.json());
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('success');
})

app.get('/session-status', (req, res) => {
  if (req.session.user) {
    res.json({ isSignedIn: true, user: req.session.user });
  } else {
    res.json({ isSignedIn: false });
  }
});

app.post('/signin', (req, res, next) => {
  const { email, password } = req.body;

  db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if(isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => {
            req.session.regenerate(function (err) {
              if (err) next(err);
              req.session.user = user[0];
              req.session.save(function (err) {
                if (err) return next(err);
                res.json(user[0]);
              })
            })
          })
          .catch(err => res.status(400).json('Unable to get user...'));
      } else {
        res.status(400).json('Wrong credentials...');
      }
    })
    .catch(err => res.status(400).json('Wrong credentials...'))

  
})

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
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
          req.session.regenerate(function (err) {
            if (err) next(err);
            req.session.user = user[0];
            req.session.save(function (err) {
              if (err) return next(err);
              res.json(user[0]);
            })
          })
        })
    })
    .then(trx.commit)
    .catch(trx.rollback);
  })
  .catch(err => res.status(400).json('Unable to register...'));
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({id})
    .then(user => {
      if(user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('Not found...');
      }
      
    })
    .catch(err => res.status(400).json('Error getting user'));
})

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(data => res.json(data[0].entries))
    .catch(err => res.status(400).json('Unable to get entries'))
})

app.get('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: 'Failed to sign out' });
    } else {
      res.clearCookie('session-id');
      res.json({ message: 'Signed out successfully' });
    }
  });
});

app.listen(3000, () => {
  console.log('app is running on port 3000');
})
