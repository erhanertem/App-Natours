//IMPORT CORE MODULES
const fs = require('fs');
//NOTE: Its a custom to have all express configurations in <app.js>.
const express = require('express'); //Import express
const app = express(); //Call express function to use its functions

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

app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } }); //Upon success response, restructure a new response JSON file with status and data itself received earlier
  // res.status(200).json({ status: 'success', data: { tours: tours } }); //same as above
}); //Its a good practice to specify your API version

const port = 3000; //Declare port
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
}); //Create a server listening @ port ****
