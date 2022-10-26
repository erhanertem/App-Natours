//NOTE: ITS A GOOD PRACTICE TO ISOLATE CODES. HERE LAYS EVERYTHING RELATED TO SERVER

//-->IMPORT EXPRESS APP MODULE
const app = require('./app');

//-->START SERVER
const port = 3000; //Declare port
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
