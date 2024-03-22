const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const regenerateSession = require('./functions/regenerateSession');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const signout = require('./controllers/signout');

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

app.get('/', (req, res) => { res.send('success') })
app.get('/session-status', (req, res) => { 
  req.session.user ? res.json({ isSignedIn: true, user: req.session.user }) : res.json({ isSignedIn: false });
});
app.post('/signin', signin.handleSignIn(db, bcrypt, regenerateSession));
app.post('/register', register.handleRegister(db, bcrypt, regenerateSession));
app.get('/profile/:id', profile.handleProfileGet(db));
app.put('/image', image.handleImage(db));
app.post('/imageurl', image.handleApiCall);
app.get('/signout', signout.handleSignout);

app.listen(3000, () => {
  console.log('app is running on port 3000');
})
