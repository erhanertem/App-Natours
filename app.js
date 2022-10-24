//NOTE: Its a custom to have all express configurations in <app.js>.
const express = require('express'); //Import express
const app = express(); //Call express function to use its functions

app.get('/', (req, res) => {
  // res.status(200).send('Hello from the server side!'); //Send reqular txt response
  res
    .status(200)
    .json({ message: 'Hello from the server side!', app: 'Natours' });
}); //Define route to send json object to root (/) address - READ - RECEIVE DATA FROM THE SERVER

app.post('/', (req, res) => {
  res.send('You can post to this endpoint');
}); //Define route to send to this address - CREATE - SEND DATA TO THE SERVER

const port = 3000; //Declare port
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
}); //Create a server listening @ port ****
