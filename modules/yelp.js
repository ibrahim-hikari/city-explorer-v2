`use strict`;

const superagent = require('superagent')

const yelp = {}

yelp.getYelp = function (cityName) {
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

module.exports = yelp;