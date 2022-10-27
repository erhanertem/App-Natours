//NOTE: ITS A GOOD PRACTICE TO ISOLATE CODES. HERE LAYS EVERYTHING RELATED TO SERVER
//-->IMPORT 3RD PARTY MODULE
//FIRST CONFIGURE THE ENVIRONMENT
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); //dotenv module acquires env data from the config.env file and assings them to process.env
// console.log(app.get('env')); //Shows current enviroment we are in.
// console.log(process.env); //Node enviroment...

//LATER RUN THE APP SO THAT WE MAKE PROCESS VARIABLE AVAILABEL TO APP
//-->IMPORT EXPRESS APP MODULE
const app = require('./app');

//-->START SERVER
const port = process.env.PORT || 8000; //Declare port first from process.env.PORT cfg or as a fallback manually set to 3000
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
