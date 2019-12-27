`use strict`;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 7070;
const app = express();

app.use(cors());

/////// Routs 

app.get('/', proofOfLife);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/events', eventsHandler);


//////// Errors Routs

app.use(`*`, notFound);
app.use(errorHandler);

//////// Main Functions

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
    const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${cityName}&format=json`;

    return superagent.get(url)
        .then(data => {
            return new Location(cityName, data.body)
        })
}

function Location(cityName, data) {
    this.formatted_query = cityName;
    this.display_name = data[0].display_name;
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
    const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENT_API_KEY}&location=${cityName.formatted_query}`

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

//////// Error Functions

function notFound(req, res) {
    res.status(404).send('ops')
}

function errorHandler(error, req, res) {
    res.status(500).send(error)
}



app.listen(PORT, () => console.log(`Welcome Aboard on ${PORT}`));




//////////////////////////////////////////////////

/*
'use strict';

let __API_URL__;
let GEOCODE_API_KEY;

function setEventListeners() {
  $('#url-form').on('submit', function (event) {
    event.preventDefault();
    __API_URL__ = $('#back-end-url').val();
    $('#url-form').addClass('hide');
    manageForms();
  });

  $('#geocode-form').on('submit', function (event) {
    event.preventDefault();
    GEOCODE_API_KEY = $('#api-key').val();
    storeKey(GEOCODE_API_KEY);
    $('#geocode-form').addClass('hide');
    manageForms();
  });

  $('#search-form').on('submit', fetchCityData);
}

function getKey() {
  if (localStorage.getItem('geocode')) return JSON.parse(localStorage.getItem('geocode'));
}

function storeKey(key) {
  localStorage.setItem('geocode', JSON.stringify(key));
}

function manageForms() {
  let urlState = $('#url-form').hasClass('hide');
  let keyState = $('#geocode-form').hasClass('hide');

  if (urlState && keyState) { $('#search-form').removeClass('hide'); }
}

function fetchCityData(event) {
  event.preventDefault();

  // start off by cleaning any previous errors
  compileTemplate([], 'error-container', 'error-template');

  let searchQuery = $('#input-search').val().toLowerCase();

  $.ajax({
    url: `${__API_URL__}/location`,
    method: 'GET',
    data: { city: searchQuery },
  })
    .then(location => {
      displayMap(location);
      getResource('weather', location);
      getResource('movies', location);
      getResource('yelp', location);
      getResource('trails', location);
      getResource('events', location);
    })
    .catch(error => {
      compileTemplate([error], 'error-container', 'error-template');
      $('#map').addClass('hide');
      $('section, div').addClass('hide');
    });
}

function displayMap(location) {
  $('.query-placeholder').text(`Here are the results for ${location.formatted_query}`);

  $('#map').removeClass('hide');
  $('section, div').removeClass('hide');

  let lat = location.latitude;
  let lon = location.longitude;
  let width = 800;
  let height = 400;

  let mapURL = `https://maps.locationiq.com/v2/staticmap?key=${GEOCODE_API_KEY}&center=${lat},${lon}&size=${width}x${height}&zoom=12`;

  $('#map').attr('src', mapURL);
}

function getResource(resource, location) {
  $.get(`${__API_URL__}/${resource}`, location)
    .then(result => {
      console.log('ok');
      compileTemplate(result, `${resource}-results`, `${resource}-results-template`);
    })
    .catch(error => {
      compileTemplate([error], 'error-container', 'error-template');
    });
}

function compileTemplate(input, sectionClass, templateId) {
  $(`.${sectionClass}`).empty();

  let template = Handlebars.compile($(`#${templateId}`).text());

  input.forEach(element => {
    $(`.${sectionClass}`).append(template(element));
  });
}

$(() => {
  setEventListeners();
  GEOCODE_API_KEY = getKey();
  if (GEOCODE_API_KEY) { $('#geocode-form').addClass('hide'); }
});
*/