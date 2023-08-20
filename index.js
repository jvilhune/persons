const express = require('express')
const morgan = require('morgan')
const app = express()



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
Body:   { phonename: 'Helena Takalo', phonenumber: '040-666622' }
---
Helena Takalo
040-666622
*/

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())


/* Morgan middleware, joka tulostaa konsoliin palvelimelle tulevien GET ja POST pyyntöjen tiedot */ 
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'));

/* GET /api/persons 200 102.905 ms - 329 {} - -  */
/* POST /api/persons 200 48.755 ms - 64 {"phonename":"Helena Takalo","phonenumber":"040-666622"} - 72 */


//app.use(morgan('tiny'))

//morgan(':method :url :status :res[content-length] - :response-time ms');


/*
morgan.token('host', function(req, res) {
    return req.hostname;
});

morgan.token('param', function(req, res, param) {
    return req.params[param];
});

app.use(morgan(':method :host :status :param[id] :res[content-length] - :response-time ms'));
*/

/*
if (req.method === "POST") {
 app.use((req, res, next) => {
    console.log(req.body);
    next();
  });
}
*/

/*
 app.use((req, res, next) => {
    console.log(req.body);
    next();
  });
*/


app.use(requestLogger)


let persons = [
    {
      id: 1,
      phonename: "Arto Hellas",
      phonenumber: "040-123456"
    },
    {
      id: 2,
      phonename: "Ada Lovelace",
      phonenumber: "39-44-5323523"
    },
    {
      id: 3,
      phonename: "Dan Abramov",
      phonenumber: "12-43-234345"
    },
    {
      id: 4,
      phonename: "Mary Poppendieck",
      phonenumber: "39-23-6423122"
    },
    {
      id: 5,
      phonename: "Jukka Vilhunen",
      phonenumber: "050-3002111"
    }
]



/* Route. Web page request main page */
app.get('/', (req, res) => {
  const ddate = new Date()
  const mnum = generateId()
  const rnum = randomNumberInRange(10, 100)
  console.log('rnum = ', rnum, 'mnum = ', mnum, 'ddate =', ddate)
  res.send(`<h2>Hello World. Random number is ${rnum} and Max number is ${mnum} and date is ${ddate}</h2>`)
})

/* Route. Web page request all phonebook data */
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

/* Route. Web page request single (one) phonebook data */
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }

})

/* Web page request to delete single (one) phonebook data */
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

/* Route. Web page request to add single (one) phonebook data */
app.post('/api/persons', (request, response) => {
  const body = request.body

  console.log(body.phonename)
  console.log(body.phonenumber)

  if (!body.phonename) {
    return response.status(400).json({ 
      error: 'phonename missing' 
    })
  }

  if (!body.phonenumber) {
    return response.status(400).json({ 
      error: 'phonenumber missing' 
    })
  }

  if (persons.filter(e => e.phonename === body.phonename).length > 0) {
    return response.status(400).json({ 
      error: `${body.phonename} is already added to phonebook` 
    })
  }

  const person = {    
    phonename: body.phonename,
    phonenumber: body.phonenumber,
    id: randomNumberInRange(10, 100)
  }

  persons = persons.concat(person)

  response.json(person)
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

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})