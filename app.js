`use strict`;

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg')

const PORT = process.env.PORT || 7070;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL)

app.use(cors());

/////// Routs 

app.get('/', proofOfLife);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/events', eventsHandler);
app.get('/yelp', yelpHandler);
app.get('/movies', moviesHandler);
app.get('/trails', trailsHandler)


//////// Errors Routs

app.use(`*`, notFound);
app.use(errorHandler);

//////////////////// MAIN FUNCTIONS \\\\\\\\\\\\\\\\\\\\

function proofOfLife(req, res) {
  res.status(200).send('welcome to the world');
}


////////// Location Functions \\\\\\\\\\
function locationHandler(req, res) {

  getLocation(req.query.city)
    .then(locationData => {
      res.status(200).json(locationData)
    })
}

function getLocation(cityName) {

  let SQL = `SELECT * FROM locations WHERE search_query = $1`
  let values = [cityName];

  return client.query(SQL, values)
    .then(results => {
      if (results.rowCount) {
        return results.rows[0]
      } else {
        const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${cityName}&format=json`;

        return superagent.get(url)
          .then(data => {
            cacheLocation(cityName, data.body)
          })
      }
    })
}

function cacheLocation(cityName, data) {

  const location = new Location(data);
  let SQL = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4)`
  let values = [cityName, location.formatted_query, location.latitude, location.longitude];
  return client.query(SQL, values)
    .then(results => {
      const savedLocation = results.rows[0];
      return savedLocation
    })
}


function Location(data) {
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}
////////// Weather Functions \\\\\\\\\\

function weatherHandler(req, res) {
  getWeather(req.query)
    .then(weatherData => {
      res.status(200).json(weatherData)
    })
}

function getWeather(cityName) {
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${cityName.latitude},${cityName.longitude}`;
  return superagent.get(url)
    .then(data => {
      let weatherData = data.body;
      return weatherData.daily.data.map(oneDay => {
        return new Weather(oneDay)
      })
    })
}

function Weather(oneDay) {
  this.forecast = oneDay.summary;
  this.time = new Date(oneDay.time * 1000).toDateString();
}

////////// Event Functions \\\\\\\\\\   

function eventsHandler(req, res) {
  getEvents(req.query)
    .then(eventsData => {
      res.status(200).json(eventsData)
    })
}

function getEvents(cityName) {
  const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENT_API_KEY}&location=${cityName.search_query}`

  return superagent.get(url)
    .then(data => {
      let eventsData = JSON.parse(data.text);
      return eventsData.events.event.map(eventsDay => {
        return new Events(eventsDay)
      })
    })
}

function Events(oneDay) {
  this.link = oneDay.url;
  this.name = oneDay.title;
  this.event_data = oneDay.start_time;
  this.summary = oneDay.description
}

////////// Movies Functions \\\\\\\\\\
function moviesHandler(req, res) {
  getMovies(req.query)
    .then(moviesData => {
      res.status(200).json(moviesData)
    })
}

function getMovies(cityName) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${cityName.search_query}`

  return superagent.get(url)
    .then(data => {
      return data.body.results.map(oneMovie => {
        return new Movies(oneMovie);
      })
    })
}

function Movies(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  if (!data.poster_path) {
    this.image_url = `https://farm5.staticflickr.com/4363/36346283311_74018f6e7d_o.png`
  } else {
    this.image_url = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  }
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}

////////// Yelp Functions \\\\\\\\\\

function yelpHandler(req, res) {
  getYelp(req.query)
    .then(yelpData => {
      res.status(200).json(yelpData)
    })
}

function getYelp(cityName) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${cityName.search_query}`


  return superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(data => {
      let yelpData = data.body.businesses;
      return yelpData.map(oneYelp => {
        return new Yelp(oneYelp)
      })
    })

}

function Yelp(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price
  this.rating = data.rating;
  this.url = data.url;
}

////////// Trails Functions \\\\\\\\\\
function trailsHandler(req, res) {
  getTrails(req.query)
    .then(trailsData => {
      res.status(200).json(trailsData)
    })
}

function getTrails(cityName) {
  const url = `https://www.hikingproject.com/data/get-trails?lat=${cityName.latitude}&lon=${cityName.longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`

  return superagent.get(url)
    .then(data => {
      return data.body.trails.map(oneTrail => {
        return new Trails(oneTrail)
      })
    })
}

function Trails(data) {
  this.name = data.name
  this.location = data.location;
  this.length = data.length;
  this.stars = data.stars;
  this.star_votes = data.starVotes
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionDetails;
  if (!data.conditionDetails) {
    this.conditionDetails = 'notFound'
  } else {
    this.condition_date = data.conditionDetails.slice(0, 10);
    this.condition_time = data.conditionDetails.slice(12);
  }
}

//////// Error Functions

function notFound(req, res) {
  res.status(404).send('ops')
}

function errorHandler(error, req, res) {
  res.status(500).send(error)
}


client.connect()
  .then(
    app.listen(PORT, () => console.log(`Welcome Aboard on ${PORT}`))
  );
