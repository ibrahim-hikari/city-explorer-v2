`use strict`

const superagent = require('superagent');

let movies = {}

movies.getMovies = function (cityName) {
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

module.exports = movies;