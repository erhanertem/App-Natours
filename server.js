//NOTE: ITS A GOOD PRACTICE TO ISOLATE CODES. HERE LAYS EVERYTHING RELATED TO SERVER
//-->IMPORT EXPRESS APP MODULE
const app = require('./app');

//-->IMPORT 3RD PARTY MODULE
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); //dotenv module acquires env data from the config.env file and assings them to process.env
// console.log(app.get('env')); //Shows current enviroment we are in.
console.log(process.env); //Node enviroment...

//-->START SERVER
const port = 3000; //Declare port
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
