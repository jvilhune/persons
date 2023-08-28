const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

/* Cant't read this url from the .env file because there is '&' character in the url */
/* Replace process.env.MONGODB_URI with direct url and .env file no needed */
const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    required: true
  },
  number: {
    type: String,
    validate: {
     validator: function(tstnumberstr) {
        var result = endFunction(tstnumberstr);
        return result;
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  },
})


/*
IS PHONE NUMBER LEGAL?
The lenght of the phone number string is at least 8 characters (including '-' chars)
1st part has 2 or 3 number
the second part has at least 4 or 5 numbers
One hyphen character (-) between the first and second part
09-1234556 is legal
040-22334455 is legal
1234556 is illegal
1-22334455 is illegal
10-22-334455 is illegal
*/
const endFunction = (phonenumber) => {
  var retval = "";
  var phonenum = phonenumber;
  var a = 0;
  var numcount = 0;
  var hyphencount = 0;
  var hyphenindex = 0;
  var notnumnothypencount = 0;
  var len = phonenum.length;

  for(a=0;a<phonenum.length;a++)
  {
    if(phonenum[a] == '-')
    {
      hyphencount++;
      hyphenindex = a;
    }
    else if (phonenum[a] >= '0' && phonenum[a] <= '9')
    {      
      numcount++;
    }
    else
    {      
      notnumnothypencount++;
    }
  }

  if(len > 7 && notnumnothypencount == 0 && numcount > 6 && hyphencount == 1 && (hyphenindex == 2 || hyphenindex == 3))
  {
    /* Phone number is illegal */
    retval = 1;
  }
  else
  {
    /* Phone number is legal */
    retval = 0;
  }
  return retval;
}

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)