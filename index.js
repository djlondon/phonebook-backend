const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] :body ":referrer" ":user-agent"'))

const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })
const personModel = require('./models/person')

app.get('/', (request, response) => {
  response.send('<h1>Hello world</h1>')
})

app.get('/info', async (request, response) => {
  const persons = await personModel.Person.find({}).exec()
  const info = `
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>
  `
  response.send(info)
})

app.get('/api/persons', (request, response) => {
  personModel.Person.find({}).then(persons => { response.json(persons) })
})

app.get('/api/persons/:id', (request, response, next) => {
  personModel.Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  personModel.Person.findByIdAndDelete(request.params.id).then(person => {
    if (person) {
      response.status(204).end()
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  console.log(/\d{2,3}-\d+/.test(body.number))
  const person = new personModel.Person({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(savedNote => response.json(savedNote))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }

  personModel.Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' },
  )
    .then(person => {
      if (person) {
        return response.json(person)
      }
      response.status(404).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001

personModel.connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})