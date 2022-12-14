//NOTE: ITS A GOOD PRACTICE TO ISOLATE CODES. HERE LAYS EVERYTHING RELATED TO EXPRESS

//-->IMPORT CORE MODULES
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

//-->IMPORT CUSTOM MODULES
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController'); //global error handler
const tourRouter = require('./routes/tourRoutes'); //for require, ${__dirname} is not necessary
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

//-->START EXPRESS.JS
const app = express(); //Call express function to use its functions

//-->Hosting @ railway, heroku same account serving multiple sites
app.enable('trust proxy');

//-->SET VIEW ENGINE (PUG) FOR NODE.JS
app.set('view engine', 'pug'); //NOTE: Express.js - A template engine enables you to use static template files in your application. At runtime, the template engine replaces variables in a template file with actual values, and transforms the template into an HTML file sent to the client. While by default, it is set to Jade there are some popular template engines that work with Express namely Pug, Mustache, Dust,and EJS. The template engine files are provided under views folder. In this case as *.pug extentions. In the run time, these static pages with variables inside automatically rendered as HTML pages as an output.
// console.log(__dirname); //__dirname is a npm environment variable that tells you the absolute path of the directory containing the currently executing file.
// console.log(process.cwd()); //It tells the current working directory
app.set('views', path.join(__dirname, 'views')); //Lets tell express.js where the 'views' folder is.
//NOTE: The path.join() method joins all given path segments together using the platform-specific separator as a delimiter, then normalizes the resulting path. Basically, makes the path descriptors OS independent.

//-->#1.GLOBAL MIDDLEWARES
//->SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//->IMPLEMENT CORS
app.use(cors()); //Enable cors()
//This is a global enabling, allows everyone comsume our API -- Means Access-Control-Allow-Origin * --
// If we would need cors on certain routes we woudl have called in the middleware stack as ex: app.use('/api/v1/tours', core(), tourRouter);
// If we needed specific domains to make use of our API, then we would need the code below:
// app.use(
//   cors({
//     origin: 'https://www.natours.com',
//   })
// );
app.options('*', cors()); //Allow cors() on all routes
// app.options('api/v1/tours/:id', cors()); //Allow on a spoecific route

//Bug!: Why we would need this installed while we have enabled CORS in helmet??

//->SET SECURITY HTTP HEADERS MIDDLEWARE
//GOT TO BE THE FIRST GLOBAL MIDDLEWARE TO EXECUTE FOR SECURITY
// app.use(helmet());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        baseUri: ["'self'"],
        connectSrc: [
          "'self'",
          'data:',
          'blob:',
          // 'https://unpkg.com',
          // 'https://tile.openstreetmap.org',
          'https://*.tiles.mapbox.com', // per CSP instructions @ https://docs.mapbox.com/mapbox-gl-js/guides/browsers-and-testing/#csp-directives
          'https://api.mapbox.com', // per CSP instructions @ https://docs.mapbox.com/mapbox-gl-js/guides/browsers-and-testing/#csp-directives
          'https://events.mapbox.com', // per CSP instructions @ https://docs.mapbox.com/mapbox-gl-js/guides/browsers-and-testing/#csp-directives
          'https://checkout.stripe.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
          'https://api.stripe.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
          'https://maps.googleapis.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
          // 'https://*.stripe.com',
          // 'https://*.cloudflare.com/',
          // 'https://bundle.js:*',
          'ws://127.0.0.1:*/',
        ],
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        fontSrc: [
          "'self'", // Default helmet()
          'https:', // Default helmet()
          'data:', // Default helmet()
          'fonts.gstatic.com', // per CSP instructions @ https://content-security-policy.com/examples/google-fonts/
          // 'fonts.googleapis.com', //?
        ],
        formAction: ["'self'"],
        frameSrc: [
          "'self'", //?
          'https://js.stripe.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
          'https://checkout.stripe.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
          'https://hooks.stripe.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
        ],
        scriptSrc: [
          "'self'", // Default helmet()
          'https:', //?
          // 'http:', //?
          'blob:', //?
          'https://checkout.stripe.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
          'https://js.stripe.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
          'https://maps.googleapis.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
          // 'https://m.stripe.network',
          // 'https://*.cloudflare.com',
          // 'https://unpkg.com/',
          // 'https://tile.openstreetmap.org',
          // 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js',
          // 'ajax.googleapis.com *',
        ],
        styleSrc: [
          "'self'", // Default helmet()
          'https:', // Default helmet()
          "'unsafe-inline'", // Default helmet()
          'w3.org/*',
          'https://fonts.googleapis.com/', // per CSP instructions @ https://content-security-policy.com/examples/google-fonts/
          'https://m.stripe.network',
          // 'https://unpkg.com/',
          // 'https://tile.openstreetmap.org',
        ],
        workerSrc: [
          "'self'",
          'data:',
          'blob:', //https://docs.mapbox.com/mapbox-gl-js/guides/browsers-and-testing/#csp-directives
          // 'https://m.stripe.network', //?
        ],
        objectSrc: ["'none'"],
        childSrc: [
          // "'self'", //?
          'blob:', //per CSP instructions @ https://docs.mapbox.com/mapbox-gl-js/guides/browsers-and-testing/#csp-directives
        ],
        imgSrc: [
          "'self'", // Default helmet()
          'data:', // Default helmet() & per CSP instructions @ https://docs.mapbox.com/mapbox-gl-js/guides/browsers-and-testing/#csp-directives
          'https://*.stripe.com', // per CSP insrtructions @ https://stripe.com/docs/security/guide
          'blob:', //https://docs.mapbox.com/mapbox-gl-js/guides/browsers-and-testing/#csp-directives
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

//->DEVELOPMENT LOGGING MIDDLEWARE
// console.log(process.env.NODE_ENV);
//IF PROCESS.ENV SHOWS DEVELOPMENET FOR NODE_ENV THEN ONLY USE MORGAN.
//NOTE: HOW DO WE HAVE ACCESS TO PROCESS.ENV IF ITS CALLED IN SERVER.JS. SERVER STARTS AND CALLS THE APP. PROCESS.ENV IS EALRLIER DEFINED ONCE BY THE DOTENV SO ITS AVAILABLE FOR EVERY FILE AFTER
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //GLOBAL MIDDLEWARE - We used morgan with dev option - Console.log reporter @ node REPL
}

//->LIMIT REQUESTS FROM SAME API
//IMPORTANT REQUEST LIMITER MIDDLEWARE TO COPE WITH D-O-S AND BRUTEFORCE ATTACKS
// Limit requests from same API
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, //60mins
  max: 100, // Limit 100 requests per 60mins
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter); //WE APPLY THIS MIDDLEWARE WHICH EFFECTS ALL ROUTES STARTING WITH /API...

// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
); //We have to locate this before the body.parser declaration as we would need the data in raw format (as stream) only for the stripe not as JSON.

//-->PARSER
//->BODY PARSER, READING DATA FROM BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' })); //GLOBAL MIDDLEWARE - USEFULL FOR POST REQ JSON HANDLING. Anything larger than 10kb is not be accepted.
// app.use(express.urlencoded({ extended: true, limit: '10kb' })); //GLOBAL MIDDLEWARE - USEFULL FOR INLINE HTML POST REQ (form data) HANDLING.
//->COOKIE PARSER, READING DATA FROM THE COOKIE INTO REQ.BODY
app.use(cookieParser());
/* NOTE: If you have observed, every URL follows the format

protocol://hostname:port/path-and-file-name 
i.e, there are 4 parts to any URL:

protocol : i.e. HTTP, FTP etc. HTTP being the most common
hostname : this is the domain name you visit, eg quora.com
port : this is the TCP port number that the server is listening to for incoming requests from the clients. It is almost never specified and defaults to 80 for HTTP, which is the default TCP port for HTTP requests.
path-and-file-name : The name and location of the requested resource, under the server document base directory.
When you type this URL in your browser, it performs a bit of magic. It takes all this information that you have provided to it and transforms it into an HTTP request. Now, each URL identifies to a specific resource on the internet. The browser sends the HTTP request to that unique server on the internet. The server then makes sense of the request and sends the appropriate response, which is then served to you by yor browser.

Now, you might be wondering what this HTTP request is that the browser sends to the server. Basically, all requests look like this:

[METH] [REQUEST-URI] HTTP/[VER] 
[fieldname1]: [field-value1] 
[fieldname2]: [field-value2] 
 
[request body, if any] 
The METH (for request method) gives the request method used, eg. GET, HEAD, POST etc. The above example used GET. The REQUEST-URI is the identifier of the document on the server, which is the same as path-and-file-name that I have mentioned above. VER is the HTTP version. The request body is only used for requests that transfer data to the server, such as POST and PUT.

You can read up a lot about HTTP on the web and get more clarity on the same. I am going to skip all the gory details, since that???s not what the question seeks. I am, however, going to touch upon ???fieldnames??? that you see in the request. Each field name is nothing but some extra information that the client sends to the server, for whatever reason. There are a whole bunch of them, and you can look them up on wikipedia (List of HTTP header fields - Wikipedia).

Now, one of these header fields is COOKIE. i.e, each request made to the server carries the COOKIE data stored by the browser for that particular domain. Once sent, the server needs to parse this cookie data and use it to send the appropriate response. And here???s where the catch lies.

Neither node.js???s http interface nor express.js parse the COOKIE field for you. They are extremely minimalistic, and you need to do this by yourself. That is where cookie-parser comes in. It parses the COOKIE header for you and populates req.cookies with an object keyed by the cookie names.
*/

//->DATA SANITIZATION AGAINST NOSQL QUERY INJECTIONS
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//->DATA SANITIZATION AGAINST XSS
app.use(xss()); //Against code injections thru input fields....

//->PREVENT PARAMETER POLLUTION
//NOTE: Express populates HTTP requests params with the same name in an array, and attacker can intentianally pollute request params to exploit this mechanism, which may allow bypassing the input validation or even result in DOS. HPP puts array parameters in req.query and/or req.body aside and just selects the last parameter value. However there are params that we would like to use side by side which could be whitelisted to narrow the scope of the hpp().
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
); //this should be used by the end as it clears up query strings

//->Compress all responses
app.use(compression());

//->TEST MIDDLEWARE
app.use((req, res, next) => {
  console.log('Hello from the middleware ????');
  next();
});

//->TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(x); //Create an unexceptional error for testing
  // console.log(req.headers); //WEB HTTP API
  // console.log('????', req.cookies);
  next();
});

//-->#2.MOUNT ROUTES
app.use('/', viewRouter); //watch for this route
app.use('/api/v1/tours', tourRouter); //watch for this route
app.use('/api/v1/users', userRouter); //watch for this route
app.use('/api/v1/reviews', reviewRouter); //watch for this route
app.use('/api/v1/bookings', bookingRouter); //watch for this route

//If all above routes not matched then apply to rest of the HTTP routes with this callback function....
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`); //We create a new error object with custom message
  // err.status = 'fail'; //We define status for centrilized handling
  // err.statusCode = 404; //We define statuscode for centrilized handling
  // next(err); //anything passed inside next() is assumed err always...

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //anything passed inside next() is assumed err always...
});

//-->#3.CENTRILIZED Typical error handling express middleware
app.use(errorController); //run global error handler

//-->#4.LINK EXPRESS TO SERVER AS CUSTOM MODULE
module.exports = app;
