require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const HTTP_PORT = process.env.PORT ?? 3000

const MoviesDB = require("./modules/moviesDB.js")
const db = new MoviesDB()

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send({message: "API Listening"})
})

app.get('/api/movies', (req, res) => {
  let { page, perPage, title } = req.query

  return db.getAllMovies(page, perPage, title)
    .then(movies => {
      return res.send({ status: true, result: movies })
    })
    .catch(err => {
      return res.status(400).send({ status: false, message: err.message })
    })
})

app.post('/api/movies', (req, res) => {
  let movie = req.body

  return db.addNewMovie(movie)
    .then(result => {
      return res.status(201).send({ status: true, result })
    })
    .catch(err => {
      return res.status(500).send({ status: false, message: err.message })
    })
})

app.get('/api/movies/:id', (req, res) => {
  let { id } = req.params

  return db.getMovieById(id)
    .then(movie => {
      if(!movie) {
        return res.status(404).send({ status: false, message: "Movie not found" })
      }

      return res.send({ status: true, result: movie })
    })
    .catch(err => {
      return res.status(500).send({ status: false, message: err.message })
    })
})

app.delete('/api/movies/:id', (req, res) => {
  let { id } = req.params

  return db.deleteMovieById(id)
    .then(_ => {
      if(!_.deletedCount) {
        return res.status(404).send({ status: false, message: "Movie not found" })
      }

      return res.send({ status: true })
    })
    .catch(err => {
      return res.status(500).send({ status: false, message: err.message })
    })
})

app.put('/api/movies/:id', (req, res) => {
  let { id } = req.params
  let movie = req.body

  return db.updateMovieById(movie, id)
    .then(_ => {
      if(!_.acknowledged) {
        return res.status(404).send({ status: false, message: "Movie not found" })
      }

      return res.send({ status: true })
    })
    .catch(err => {
      return res.status(500).send({ status: false, message: err.message })
    })
})



db.initialize(process.env.MONGODB_CONN_STRING)
  .then(()=>{
    app.listen(HTTP_PORT, ()=>{
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  }).catch((err)=>{
    console.log(err);
  });