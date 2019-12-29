`use strict`

const superagent = require('superagent')

let weather = {}

weather.getWeather = function (cityName) {
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

module.exports = weather;