/* eslint-disable */

// console.log('Hello from parser!');
import 'core-js/stable'; // <- at the top of your entry point - polyfill only stable features - ES and web standards:
import 'regenerator-runtime';

import { displayMap } from './mapbox';
import { login } from './login';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations); // console.log(locations); //JSON parse returns an array output
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', event => {
    event.preventDefault(); //this prevents the form from loading any other page
    //VALUES
    const email = document.getElementById('email').value; //Refer to input#email fields @ login.pug
    const password = document.getElementById('password').value; //Refer to input#password fields @ login.pug
    console.log(email, password);
    login(email, password);
  });
}
