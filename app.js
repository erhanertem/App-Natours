//IMPORT CORE MODULES
const fs = require('fs');
//IMPORT EXPRESS
//NOTE: Its a custom to have all express configurations in <app.js>.
const express = require('express'); //Import express
const { resourceLimits } = require('worker_threads');
const app = express(); //Call express function to use its functions
//IMPORT EXPRESS MIDDLEWARE
app.use(express.json()); //USEFULL FOR POST REQ JSON HANDLING.

// app.get('/', (req, res) => {
//   // res.status(200).send('Hello from the server side!'); //Send reqular txt response
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// }); //READ - RECEIVE DATA FROM THE SERVER

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint');
// }); //CREATE - SEND DATA TO THE SERVER

//Read the file in sync mode and parse the JSON file as a variable into a string
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
// console.log(tours); //array

//--> ROUTE HANDLER CALLBACKS - CRUD
const getAllTours = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } }); //Upon success response, restructure a new response JSON file with status and data itself received earlier
  // res.status(200).json({ status: 'success', data: { tours: tours } }); //same as above
};

const getTour = (req, res) => {
  // console.log(req);
  console.log(req.params); //returns { id: '5' }

  const id = +req.params.id; //Take the id value inside the req.params object and turn into a number from string
  // console.log(typeof id);
  const tour = tours.find(el => el.id === id);
  console.log(tour); //for unmatching id tour returns undefined

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
  console.log(req.params); //returns { id: '5' }
  const id = +req.params.id; //Take the id value inside the req.params object and turn into a number from string
  // console.log(typeof id);
  const tour = tours.find(el => el.id === id);
  console.log(tour); //for unmatching id tour returns undefined
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

// //--->ROUTE HANDLER FOR GET REQUESTS - RECEIVE TOURS INFO
// app.get('/api/v1/tours', getAllTours); //Its a good practice to specify your API version
// //--->ROUTE HANDLER FOR POST REQUESTS - CREATES NEW TOURS
// //IMPORTANT: ON POST ROUTES DATA SEND BY THE CLIENT SHOULD BE INCLUDED IN THE REQ. HOWEVER, EXPRESS.JS DO NOT SUPPORT DATA IN REQ. THEREFORE, WE WOULD NEED MIDDLEWARE TO HANDLE THIS.
// app.post('/api/v1/tours', createTour);
//---> REFACTORED ROUTE HANDLERS IN ONE-GO
app.route('/api/v1/tours').get(getAllTours).post(createTour);

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

const port = 3000; //Declare port
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
}); //Create a server listening @ port ****
