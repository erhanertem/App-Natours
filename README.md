### 👋 **I am Erhan ERTEM**

### Udemy Node.js, Express, MongoDB & More The Complete Bootcamp 2022 by Jonas Schmedtmann

#### **Objective:** Create Natours API

- Establish MVC Architecture

- ToDo's:
  - Back-end API:
    - Restrict user to review only the tours he booked.
    - Implement nested booking routes for a speicific tour or a user
    - Implement participants/sold-out functionality to avoid overbooking in respect to maxgroupsize field
    - Implement 2-F authentication
  - Front-end:
    - Implement sign-up section
    - If a tour has already been taken, let the user review the tour.
    - Prevent dupe bookings of a tour
    - Like tour functionality to user/tour schema or a fav page
    - Implement my reviews page via react
    - Implement admin panel for CRUD operations via react

&emsp;

#### Link to Project &rarr; [Natours-App](https://natours-app-erhan-ertem.up.railway.app)

#### Project Preview

![Screenshot](screenshot.webp)

---

![JS](https://img.shields.io/badge/JavaScript-323330?style=flat&logo=javascript&logoColor=F7DF1E) ![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![expressJS](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat&logo=Postman&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)

<details>
<summary>Installed NPM packages and utilized APIs:</summary>

| Package command                       | Package link                                                                                                        | Description                                                                                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm i -g nodemon                      | <https://www.npmjs.com/package/nodemon>                                                                             | Nodemon is a helper tool for developing Node.js based applications.                                                                                                                          |
| npm i -g win-node-env                 | <https://www.npmjs.com/package/win-node-env>                                                                        | Run npm scripts on Windows (package.JSON) that set (common) environment variables.                                                                                                           |
| npm i -g ndb                          | <https://www.npmjs.com/package/ndb>                                                                                 | An improved debugging experience for Node.js thru ChromeDevTools                                                                                                                             |
| npm i dotenv                          | <https://www.npmjs.com/package/dotenv>                                                                              | Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env                                                                                        |
| npm i express                         | <https://www.npmjs.com/package/express>                                                                             | Fast, unopinionated, minimalist web framework for Node.js                                                                                                                                    |
| npm i morgan                          | <https://www.npmjs.com/package/morgan>                                                                              | HTTP request logger middleware for node terminal.js                                                                                                                                          |
| npm i mongoose                        | <https://www.npmjs.com/package/mongoose>                                                                            | Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment (MongoDB driver)                                                                                  |
| npm i slugify                         | <https://www.npmjs.com/package/slugify>                                                                             | Slugifies the strings                                                                                                                                                                        |
| npm i validator                       | <https://www.npmjs.com/package/validator>                                                                           | A library of string validators and sanitizers                                                                                                                                                |
| npm i bcryptjs                        | <https://github.com/dcodeIO/bcrypt.js>                                                                              | Optimized bcrypt in JavaScript with zero dependencies                                                                                                                                        |
| npm i jsonwebtoken                    | <https://www.npmjs.com/package/jsonwebtoken>                                                                        | An implementation of JSON Web Tokens                                                                                                                                                         |
| npm i nodemailer                      | <https://nodemailer.com/about/>                                                                                     | Send emails from Node.js                                                                                                                                                                     |
| npm i express-rate-limit              | <https://www.npmjs.com/package/express-rate-limit>                                                                  | Security: Basic rate-limiting middleware for Express. (Security measure for DOS or Bruteforce attacks)                                                                                       |
| npm i helmet                          | <https://www.npmjs.com/package/helmet>                                                                              | Security: Helps you secure your Express apps by setting various HTTP headers. (Secure HTTP Headers)                                                                                          |
| npm i express-mongo-sanitize          | <https://www.npmjs.com/package/express-mongo-sanitize>                                                              | Security: Sanitizes user-supplied data to prevent MongoDB Operator Injection.                                                                                                                |
| npm i xss-clean                       | <https://www.npmjs.com/package/xss-clean>                                                                           | Security: Node.js Connect middleware to sanitize user input coming from POST body, GET queries, and url params.                                                                              |
| npm i hpp                             | <https://www.npmjs.com/package/hpp>                                                                                 | Security: Express middleware to protect against HTTP Parameter Pollution attacks.                                                                                                            |
| npm i pug                             | <https://www.npmjs.com/package/pug>                                                                                 | Pug is a high performance template engine.                                                                                                                                                   |
| npm i axios OR via script referencing | <https://www.npmjs.com/package/axios> OR <https://cdnjs.com/libraries/axios> OR <https://axios-http.com/docs/intro> | Axios is a promise-based HTTP Client for node.js and the browser.                                                                                                                            |
| npm i cookie-parser                   | <https://www.npmjs.com/package/cookie-parser>                                                                       | Parse Cookie header and populate req.cookies with an object keyed by the cookie names.                                                                                                       |
| npm install --save-dev parcel         | <https://www.npmjs.com/package/parcel-bundler> OR <https://parceljs.org/getting-started/migration/>                 | Web application bundler                                                                                                                                                                      |
| npm i core-js                         | <https://www.npmjs.com/package/core-js>                                                                             | Polyfilling support for older browsers                                                                                                                                                       |
| npm i regenerator-runtime             | <https://www.npmjs.com/package/regenerator-runtime>                                                                 | Standalone runtime for Regenerator-compiled generator and async functions.                                                                                                                   |
| npm i mapbox-gl                       | <https://www.npmjs.com/package/mapbox-gl> OR <https://docs.mapbox.com/mapbox-gl-js/guides/install/>                 | Mapbox library                                                                                                                                                                               |
| npm i multer                          | <https://github.com/expressjs/multer#readme>                                                                        | Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. Multer will not process any form which is not multipart (multipart/form-data). |
| npm i sharp                           | <https://www.npmjs.com/package/sharp> OR <https://sharp.pixelplumbing.com/>                                         | Resize, reformat images                                                                                                                                                                      |
| npm i html-to-text                    | <https://www.npmjs.com/package/html-to-text>                                                                        | Parses HTML and returns beautiful text                                                                                                                                                       |
| npm i stripe                          | <https://www.npmjs.com/package/stripe> OR <https://stripe.com/docs/js>                                              | The Stripe Node library provides convenient access to the Stripe API from applications written in server-side JavaScript                                                                     |
| npm i compression                     | <https://www.npmjs.com/package/compression>                                                                         | Node.js compression middleware via deflate and gzip coding options                                                                                                                           |
| npm i cors                            | <https://www.npmjs.com/package/cors>                                                                                | CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options                                                                    |

</details>

&emsp;
