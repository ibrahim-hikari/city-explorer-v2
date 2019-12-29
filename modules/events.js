`use strict`

const superagent = require('superagent')

let events = {}

events.getEvents = function (cityName) {
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

module.exports = events;