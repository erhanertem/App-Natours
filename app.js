//IMPORT CORE MODULES
const fs = require('fs');

//IMPORT EXPRESS
//NOTE: Its a custom to have all express configurations in <app.js>.
const express = require('express'); //Import express
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

//ROUTE HANDLER FOR GET REQUESTS - RECEIVE TOURS INFO
app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } }); //Upon success response, restructure a new response JSON file with status and data itself received earlier
  // res.status(200).json({ status: 'success', data: { tours: tours } }); //same as above
}); //Its a good practice to specify your API version

//ROUTE HANDLER FOR POST REQUESTS - CREATES NEW TOURS
//IMPORTANT: ON POST ROUTES DATA SEND BY THE CLIENT SHOUDL BE INCLUDED IN THE REQ. HOWEVER, EXPRESS.JS DO NOT SUPPORT DATA IN REQ. THEREFORE, WE WOULD NEED MIDDLEWARE TO HANDLE THIS.
app.post('/api/v1/tours', (req, res) => {
  // console.log(req.body);
  //Get the id of the last element in the dataset
  const newId = tours[tours.length - 1].id + 1;
  //Create a new object from an existing object
  const newTour = Object.assign({ id: newId }, req.body);
  //Mutate the read tour database content and add to array this new tour object before we persist it physically to the database file
  tours.push(newTour);

  //JSON.stringfy is used to change the array to a JSON file before we write this to JSON file.
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({ status: 'success', data: { tour: newTour } }); //code 201 means created
    }
  );
});

const port = 3000; //Declare port
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
}); //Create a server listening @ port ****
