//NOTE: Its a custom to have all express configurations in <app.js>.

//->IMPORT CORE MODULES
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express(); //Call express function to use its functions
//Read the file in sync mode and parse the JSON file as a variable into a string
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
// console.log(tours); //array

//-->#1. IMPORT EXPRESS MIDDLEWARE
app.use(morgan('dev')); // we used morgan with dev option
app.use(express.json()); //USEFULL FOR POST REQ JSON HANDLING.

// //CREATE OUR CUSTOM MIDDLEWARE
// //NOTE: THEY ARE APPLIED TO EVERY ROUTE HANDLER UNLESS WE SPECIY A SPECIFIC ROUTE.
// app.use((req, res, next) => {
//   console.log('Hello from our custom middleware 👋');
//   next();
// });
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// app.get('/', (req, res) => {
//   // res.status(200).send('Hello from the server side!'); //Send reqular txt response
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// }); //READ - RECEIVE DATA FROM THE SERVER

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint');
// }); //CREATE - SEND DATA TO THE SERVER

//-->#2. ROUTE HANDLER CALLBACKS - CRUD
const getAllTours = (req, res) => {
  console.log(req.requestTime); //we can use our custom middleware output here
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime, //we can even use the custom middleware output in the json output
    results: tours.length,
    data: { tours },
  }); //Upon success response, restructure a new response JSON file with status and data itself received earlier
  // res.status(200).json({ status: 'success', data: { tours: tours } }); //same as above
};

const getTour = (req, res) => {
  // console.log(req);
  // console.log(req.params); //returns { id: '5' }

  const id = +req.params.id; //Take the id value inside the req.params object and turn into a number from string
  // console.log(typeof id);
  const tour = tours.find(el => el.id === id);
  // console.log(tour); //for unmatching id tour returns undefined

  //GUARD CLAUSE
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }

  //SUCCESS RESPONSE
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  // console.log(req.body);
  // res.send('DONE'); //NOTE: IN ORDER TO COMPLETE POST REQUEST ONE NEED REQ AND RES HANDLED TO COMPLETE THE CYCLE.

  //Get the id of the last element in the dataset
  const newId = tours[tours.length - 1].id + 1;
  //Create a new object from an existing object
  const newTour = Object.assign({ id: newId }, req.body); // merges two objects together
  //Mutate the read tour database content and add to array this new tour object before we persist it physically to the database file
  tours.push(newTour);

  //JSON.stringfy is used to change the array to a JSON file before we write/persist this to JSON file.
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      //SUCCESS RESPONSE
      res.status(201).json({ status: 'success', data: { tour: newTour } }); //code 201 means created - express.json() middleware is required for post requests to work
    }
  );
};

const updateTour = (req, res) => {
  // console.log(req.params); //returns { id: '5' }
  const id = +req.params.id; //Take the id value inside the req.params object and turn into a number from string
  // console.log(typeof id);
  const tour = tours.find(el => el.id === id);
  // console.log(tour); //for unmatching id tour returns undefined
  //GUARD CLAUSE
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }

  //PATCH RESPONSE
  res.status(200).json({
    status: 'success',
    data: { tour: '<Updated tour here...>' },
  });
};

const deleteTour = (req, res) => {
  // console.log(req.params); //returns { id: '5' }
  const id = +req.params.id; //Take the id value inside the req.params object and turn into a number from string
  // console.log(typeof id);
  const tour = tours.find(el => el.id === id);
  // console.log(tour); //for unmatching id tour returns undefined
  //GUARD CLAUSE
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  }

  //DELETE RESPONSE
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
const createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
const getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
const updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};
const deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

//-->#3. ROUTES

// //--->ROUTE HANDLER FOR GET REQUESTS - RECEIVE TOURS INFO
// app.get('/api/v1/tours', getAllTours); //Its a good practice to specify your API version
// //--->ROUTE HANDLER FOR POST REQUESTS - CREATES NEW TOURS
// //IMPORTANT: ON POST ROUTES DATA SEND BY THE CLIENT SHOULD BE INCLUDED IN THE REQ. HOWEVER, EXPRESS.JS DO NOT SUPPORT DATA IN REQ. THEREFORE, WE WOULD NEED MIDDLEWARE TO HANDLE THIS.
// app.post('/api/v1/tours', createTour);
//---> REFACTORED ROUTE HANDLERS IN ONE-GO
app.route('/api/v1/tours').get(getAllTours).post(createTour);

// //NOTE: BY RELOCAITNG OUR CUSTOM MIDDLEWARE HERE, APPLIED ONLY TO ROUTES BELOW, ABOVE ROUTES DO NOT GET THIS MIDDLEWARE. LOCATION OF THIS MIDDLEWARE CODE PLAYS A CRUCIAL ROLE THEREBY.
// app.use((req, res, next) => {
//   console.log('Hello from our custom middleware 👋');
//   next();
// });

// //--->ROUTE HANDLER FOR CUSTOM GET REQUESTS - RECEIVE A SPECIFIC TOUR INFO
// //NOTE: WE CREATE A VARIABLE CALLED id BY PUTTING A COLUMN <:> AFTER SLASH
// // app.get('/api/v1/tours/:id/:trial/:sample?', (req, res) => { //VERY IMPORTANT We can create multiple variables one after another. ? is used to mark it optional so it is upto the client to use it or not...
// app.get('/api/v1/tours/:id', getTour);
// //--->ROUTE HANDLER FOR PATCH REQUESTS - AMEND THE SPECIFIC PART OF THE DATA
// app.patch('/api/v1/tours/:id', updateTour);
// //--->ROUTE HANDLER FOR DELETE REQUESTS
// app.delete('/api/v1/tours/:id', deleteTour);
//---> REFACTORED ROUTE HANDLERS IN ONE-GO
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

//-->#4. SERVER LISTENING
const port = 3000; //Declare port
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
}); //Create a server listening @ port ****
