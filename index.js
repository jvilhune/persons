const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')

/* Middleware, joka tulostaa konsoliin palvelimelle tulevien POST pyyntöjen tiedot */
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

/*
Method: GET
Path:   /api/persons
Body:   {}

Method: POST
Path:   /api/persons
Body:   { name: 'Helena Takalo', number: '040-666622' }
---
Helena Takalo
040-666622
*/

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())


/* Morgan middleware, joka tulostaa konsoliin palvelimelle tulevien GET ja POST pyyntöjen tiedot */ 
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'));

/* GET /api/persons 200 102.905 ms - 329 {} - -  */
/* POST /api/persons 200 48.755 ms - 64 {"name":"Helena Takalo","number":"040-666622"} - 72 */

//app.use(morgan('tiny'))

app.use(requestLogger)
app.use(express.static('dist'))

/* Route. Web page request main page */
/* 
app.get('/', (req, res) => {
  const ddate = new Date()
  const mnum = generateId()
  const rnum = randomNumberInRange(10, 100)
  console.log('rnum = ', rnum, 'mnum = ', mnum, 'ddate =', ddate)
  res.send(`<h2>Hello World. Random number is ${rnum} and Max number is ${mnum} and date is ${ddate}</h2>`)
})
*/


/* Route. Web page request all phonebook data */
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

/* Route. Web page request single (one) phonebook data */
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

/* Web page request to delete single (one) phonebook data */
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/* Route. Web page request to add single (one) phonebook data */
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  console.log(body.name)
  console.log(body.number)

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

/*

  Person.find({}).then(persons => {
  if (person.filter(e => e.name === body.name).length > 0) {
    return response.status(400).json({ 
      error: `${body.name} is already added to phonebook` 
    })
  }
  })
*/

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


function randomNumberInRange(min, max) {
  //  get number between min and max
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.use(unknownEndpoint)
app.use(errorHandler)

//const PORT = process.env.PORT || 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
