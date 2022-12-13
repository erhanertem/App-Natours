/* eslint-disable */

/*
One of the fundamental tasks of any web application is to communicate with servers through the HTTP protocol. This can be easily achieved using Fetch or Axios. Fetch and Axios are very similar in functionality. Some developers prefer Axios over built-in APIs for its ease of use. The Fetch API is perfectly capable of reproducing the key features of Axios.
Fetch: The Fetch API provides a fetch() method defined on the window object. It also provides a JavaScript interface for accessing and manipulating parts of the HTTP pipeline (requests and responses). The fetch method has one mandatory argument- the URL of the resource to be fetched. This method returns a Promise that can be used to retrieve the response of the request. 
Axios: Axios is a Javascript library used to make HTTP requests from node.js or XMLHttpRequests from the browser and it supports the Promise API that is native to JS ES6. It can be used intercept HTTP requests and responses and enables client-side protection against XSRF. It also has the ability to cancel requests. 

Axios	VS Fetch
Axios has url in request object.	Fetch has no url in request object.
Axios is a stand-alone third party package that can be easily installed.	Fetch is built into most modern browsers; no installation is required as such.
Axios enjoys built-in XSRF protection.	Fetch does not.
Axios uses the data property.	Fetch uses the body property.
Axios’ data contains the object.	Fetch’s body has to be stringified.
Axios request is ok when status is 200 and statusText is ‘OK’.	Fetch request is ok when response object contains the ok property.
Axios performs automatic transforms of JSON data.	Fetch is a two-step process when handling JSON data- first, to make the actual request; second, to call the .json() method on the response.
Axios allows cancelling request and request timeout.	Fetch does not.
Axios has the ability to intercept HTTP requests.	Fetch, by default, doesn’t provide a way to intercept requests.
Axios has built-in support for download progress.	Fetch does not support upload progress.
Axios has wide browser support.	Fetch only supports Chrome 42+, Firefox 39+, Edge 14+, and Safari 10.1+ (This is known as Backward Compatibility).
Axios “GET” call can have body Content	Fetch “GET” call cannot have body Content

*/

//Since we have disabled CDN script loading for axios in the base pug file, we would install npm package for axios locally and import directly from here.
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  console.log(email, password);
  //Note: In order to make HTTP requests to our API from the frontend we use axios library which seamlessly works between front-end and back-end HTTP requests. (KInda like POSTMAN inside our front-end code)
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login', //By looking at the Postman API Login link...
      data: {
        //By looking at the login user postman req body...
        email, //email: email, ES6
        password, //password: password, ES6
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in succesfully!'); //first var for CSS, second for the message - refer to alerts.js
      window.setTimeout(() => {
        location.assign('/'); //it will help us to keep browser history even page redirected. If location.replace() method the current page will not be saved in session history, meaning the user won't be able to use the Back button to navigate to it.
      }, 1500);
    }
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message); //axios error
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    //Reload the page after logout to refresh the login condition
    if ((res.data.status = 'success')) location.reload(true); //reloads from the server and the page content (same as pressign the reload button of the browser) - not from the cache which would have been the same page if it did so
  } catch (err) {
    console.log('🎋', err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};
