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



//////// Errors Routs

app.use(`*`, notFound);
app.use(errorHandler);

//////// Main Functions

function proofOfLife(req, res) {
    res.status(200).send('welcome to the world');
}

function locationHandler(req, res) {
    getLocation(req.query.data)
        .then(locationData => {
            res.status(200).json(locationData)
        })
}

function getLocation(cityName) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=${process.env.GEOCODE_API_KEY}`;

    return superagent.get(url)
        .then(data => {
            return new Location(cityName, data.body)
        })
}

function Location(cityName, data) {
    this.search_query = cityName;
    this.formatted_query = data.results[0].formatted_address;
    this.latitude = data.results[0].geometry.location.lat;
    this.longitude = data.results[0].geometry.location.lng;
}



//////// Error Functions

function notFound(req, res) {
    res.status(404).send('ops')
}

function errorHandler(error, req, res) {
    res.status(500).send(error)
}



app.listen(PORT, () => console.log(`Welcome Aboard on ${PORT}`));