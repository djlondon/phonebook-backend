const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
app.use(express.json())
app.use(cors())
app.use(express.static('build'))
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] :body ":referrer" ":user-agent"'))

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]


app.get('/', (request, response) => {
  response.send('<h1>Hello world</h1>')
})

app.get('/info', (request, response) => {
  const info = `
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>
  `
  response.send(info)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = +request.params.id
  const person = persons.find(person => person.id === id)
  response.status(person ? 200 : 404).json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = +request.params.id
  if (!persons.find(p => p.id === id)) {
    return response.status(404).end()
  }
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

const generateId = () => {
  var id
  do {
    id = Math.floor(Math.random() * 0xFFFFFFFF)
  } while (persons.find(p => p.id === id))
  return id
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  const required = { name: body.name, number: body.number }

  for (r in required) {
    if (!required[r]) {
      return response.status(400).json({
        error: `${r} missing`
      })
    }
  }

  if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }
  persons = persons.concat(person)
  response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
