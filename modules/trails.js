`use strict`

const superagent = require('superagent')

const trails = {}

trails.getTrails = function (cityName) {
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

module.exports = trails;