`use strict`;

require('dotenv').config();

const express = require('express');
const cors = require('cors');


////////////////////////////////////// Dependencies \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const client = require('./modules/client.js');
const location = require('./modules/location.js');
const weather = require('./modules/weather.js');
const events = require('./modules/events.js');
const movies = require('./modules/movies.js');
const yelp = require('./modules/yelp.js');
const trails = require('./modules/trails.js');
///////////////////////////////////////////////////////////////////////////////////////////


/***************************************** Setup *****************************************/
const PORT = process.env.PORT || 7070;
const app = express();
app.use(cors());
///////////////////////////////////////////////////////////////////////////////////////////


/*************************************** Main Routs ***************************************/
app.get('/', proofOfLife);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/events', eventsHandler);
app.get('/yelp', yelpHandler);
app.get('/movies', moviesHandler);
app.get('/trails', trailsHandler)
//////////////////////////////////////////////////////////////////////////////////////////////


/*************************************** Errors Routs ***************************************/
app.use(`*`, notFound);
app.use(errorHandler);
//////////////////////////////////////////////////////////////////////////////////////////////


/************************************** MAIN FUNCTIONS **************************************/
function proofOfLife(req, res) {
  res.status(200).send('welcome to the world');
}
///////////////////////////////////// Location Function \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function locationHandler(req, res) {
  const cityName = req.query.city;
  location.getLocation(cityName)
    .then(locationData => {
      res.status(200).json(locationData)
    })
    .catch(error => {
      errorHandler(error, req, res)
    })
}

////////////////////////////////////// Weather Function \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function weatherHandler(req, res) {
  const place = req.query
  weather.getWeather(place)
    .then(weatherData => {
      res.status(200).json(weatherData)
    })
    .catch(error => {
      errorHandler(error, req, res)
    })
}

/////////////////////////////////////// Events Function \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function eventsHandler(req, res) {
  const place = req.query
  events.getEvents(place)
    .then(eventsData => {
      res.status(200).json(eventsData)
    })
    .catch(error => {
      errorHandler(error, req, res)
    })
}

/////////////////////////////////////// Movies Functions \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function moviesHandler(req, res) {
  const place = req.query;
  movies.getMovies(place)
    .then(moviesData => {
      res.status(200).json(moviesData)
    })
    .catch(error => {
      errorHandler(error, req, res)
    })
}

//////////////////////////////////////// Yelp Functions \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function yelpHandler(req, res) {
  const place = req.query
  yelp.getYelp(place)
    .then(yelpData => {
      res.status(200).json(yelpData)
    })
    .catch(error => {
      errorHandler(error, req, res)
    })
}

/////////////////////////////////////// Trails Functions \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function trailsHandler(req, res) {
  const place = req.query;
  trails.getTrails(place)
    .then(trailsData => {
      res.status(200).json(trailsData)
    })
    .catch(error => {
      errorHandler(error, req, res)
    })
}

//////////////////////////////////////// Error Functions \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function notFound(req, res) {
  res.status(404).send('ops')
}

function errorHandler(error, req, res) {
  res.status(500).send(error)
}
///////////////////////////////////////////////////////////////////////////////////////////


/************************************** Start The Server **************************************/
client.connect()
  .then(
    app.listen(PORT, () => console.log(`Welcome Aboard on ${PORT}`))
  )
  .catch(e => console.error(e.message))
