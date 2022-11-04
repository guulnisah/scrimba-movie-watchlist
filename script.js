const searchBtn = document.querySelector('#search-bar-button')
const movieList = document.querySelector('.movie-list')

const movieListDefault = document.querySelector('#movie-list-default')
const movieListError = document.querySelector('#movie-list-error')

const searchBarForm = document.querySelector('.search-bar')
const searchBarInput = document.getElementById('search-bar-input')
let MOVIES = JSON.parse(localStorage.getItem('movies')) || [];

const watchListDefault = document.querySelector('#watch-list-default')
const watchList = document.querySelector('.watch-list')

const watchlistLength = document.querySelector('.watchlist-length')

if (watchlistLength) { watchlistLength.textContent = localStorage.getItem('watchlist') }
let moviesFound = []

class Movie {
    constructor(id, poster, title, rating, runtime, genre, plot) {
        this.id = id
        this.poster = poster
        this.title = title
        this.rating = rating
        this.runtime = runtime
        this.genre = genre
        this.plot = plot
    }
}

if (searchBtn) {
    searchBarForm.addEventListener('submit', (e) => {
        e.preventDefault()
        findMovies()
    })
}

function findMovies() {
    const searchValue = searchBarInput.value
    movieListDefault.style.display = 'none'
    movieListError.style.display = 'none'
    moviesFound = []
    fetch(`https://www.omdbapi.com/?s=${searchValue.trim()}&apikey=f6c71cbb`)
        .then(res => res.json())
        .then(data => {
            let searchResults = data.Search
            searchResults.forEach((elem) => {
                fetch(`https://www.omdbapi.com/?i=${elem.imdbID}&apikey=f6c71cbb`)
                    .then(res => res.json())
                    .then(data => {
                        let movie = new Movie(data.imdbID, data.Poster, data.Title, data.Ratings[0].Value, data.Runtime, data.Genre, data.Plot)
                        moviesFound.push(movie)
                        movieList.innerHTML = ''
                        displayMovies(moviesFound)
                    })
            })
        })
        .catch(() => nothingFound());
}

function displayMovies(arr) {
    arr.forEach(elem => {
        let { id, poster, title, rating, runtime, genre, plot } = elem

        const movieCard = document.createElement('article')

        const movieCardInner = document.createElement('div')
        movieCard.append(movieCardInner)
        movieCardInner.classList.add('movie-list-card')

        const moviePoster = document.createElement('img')
        moviePoster.classList.add('movie-poster')
        moviePoster.setAttribute('src', poster)
        moviePoster.setAttribute('alt', `${title} poster`)
        movieCardInner.append(moviePoster)

        const movieHeader = document.createElement('div')
        movieHeader.classList.add('movie-header')
        movieHeader.innerHTML = `
        <h3 class="movie-title"><a href="https://www.imdb.com/title/${id}/">${title}</a></h3>
        <span class="movie-rating"><i class="fa-solid fa-star" style="color:#fab005"></i>${rating.substr(0, rating.indexOf('/'))}</span>
        `
        movieCardInner.append(movieHeader)

        const movieInfo = document.createElement('div')
        movieInfo.classList.add('movie-info')
        movieInfo.innerHTML = `
        <p class="movie-runtime">${runtime}</p>
        <p class="movie-genre">${genre}</p>
        `

        let inLocalStorage = MOVIES.includes(id)

        const watchlistBtn = document.createElement('button')
        watchlistBtn.innerHTML = !inLocalStorage ? '<i class="fa-solid fa-circle-plus"></i><span>Watchlist</span>' : '<i class="fa-solid fa-circle-minus"></i><span>Remove</span>'

        watchlistBtn.addEventListener('click', () => {
            inLocalStorage = !inLocalStorage
            watchlistBtn.innerHTML = !inLocalStorage ? '<i class="fa-solid fa-circle-plus"></i><span>Watchlist</span>' : '<i class="fa-solid fa-circle-minus"></i><span>Remove</span>'
            if (inLocalStorage) {
                MOVIES.push(id)
                localStorage.setItem('movies', JSON.stringify(MOVIES));
                localStorage.setItem('watchlist', JSON.parse(localStorage.getItem('movies')).length)
            } else {
                MOVIES = MOVIES.filter(watchlistBtn => watchlistBtn != id);
                localStorage.setItem('movies', JSON.stringify(MOVIES));
                localStorage.setItem('watchlist', JSON.parse(localStorage.getItem('movies')).length)
            }
            if (watchlistLength) { watchlistLength.textContent = localStorage.getItem('watchlist') }
        })

        movieInfo.append(watchlistBtn)
        movieCardInner.append(movieInfo)

        const moviePlot = document.createElement('p')
        moviePlot.classList.add('movie-plot')
        moviePlot.textContent = plot
        movieCardInner.append(moviePlot)

        if (watchList) {
            watchList.append(movieCard)
        }

        if (movieList) {
            movieList.append(movieCard)
        }
    })
}

function nothingFound() {
    movieList.innerHTML = ''
    movieListError.style.display = 'block'
}


if (watchList && MOVIES.length) {
    let moviesAdded = []
    watchListDefault.style.display = 'none'
    watchList.innerHTML = ''
    MOVIES.forEach((id) => {
        fetch(`https://www.omdbapi.com/?i=${id}&apikey=f6c71cbb`)
            .then(res => res.json())
            .then(data => {
                let movie = new Movie(data.imdbID, data.Poster, data.Title, data.Ratings[0].Value, data.Runtime, data.Genre, data.Plot)
                moviesAdded.push(movie)
                watchList.innerHTML = ''
                displayMovies(moviesAdded)
                watchList.querySelectorAll("button").forEach(button =>
                    button.addEventListener("click", () => button.parentElement.parentElement.remove())
                )
            })
    })
}