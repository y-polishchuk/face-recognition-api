const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: 'c6ba98ba70ed4bcb8afc8dd1dea6d90d'
 });

const handleApiCall = (req, res) => {
  app.models.predict('face-detection', req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json('Unable to work with API'));
}

const handleImage = (db) => (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(data => {
      req.session.user.entries = data[0].entries;
      res.json(data[0].entries);
    })
    .catch(err => res.status(400).json('Unable to get entries'))
}

module.exports = {
  handleImage,
  handleApiCall
}