/* eslint-disable */

// console.log('Hello from parser!');
import 'core-js/stable'; // <- at the top of your entry point - polyfill only stable features - ES and web standards:
// import 'regenerator-runtime';

import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

const userPhotoUpload = document.querySelector('#photo');
const userPhotoCurrent = document.querySelector('.form__user-photo');
const userPhotoIconCurrent = document.querySelector('.nav__user-img');

const bookBtn = document.getElementById('book-tour');

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations); // console.log(locations); //JSON parse returns an array output
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', event => {
    event.preventDefault(); //prevents the form from loading any other page
    //VALUES
    const email = document.getElementById('email').value; //Refer to input#email fields @ login.pug
    const password = document.getElementById('password').value; //Refer to input#password fields @ login.pug
    // console.log(email, password);
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

//Temporarily preview the selected picture on the user photo PRIOR TO userDataForm UPLOAD
const readURL = picture => {
  if (picture.files && picture.files[0]) {
    // console.log('🎄🎄🎄🎄🎄', picture.files);
    const reader = new FileReader();

    reader.addEventListener('load', event => {
      // console.log('🎄🎄🎄🎄🎄🎈🎈🎈', event);
      userPhotoCurrent.setAttribute('src', event.target.result);
    });

    reader.readAsDataURL(picture.files[0]);
  }
};

if (userPhotoUpload && userPhotoCurrent) {
  userPhotoUpload.addEventListener('change', function () {
    readURL(this);
  });
}
///////////////////////////////////////////////////////////

if (userDataForm) {
  userDataForm.addEventListener('submit', async event => {
    event.preventDefault();

    //Form Data Web API @ https://developer.mozilla.org/en-US/docs/Web/API/FormData
    //Note: The FormData interface provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the fetch() or XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".
    const form = new FormData();
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // updateSettings({ name, email }, 'data');

    await updateSettings(form, 'data');

    const userUploadedFile = form.get('photo');
    // console.log(userUploadedFile);

    if (userUploadedFile.type === 'image/jpeg') {
      userPhotoCurrent.setAttribute(
        'src',
        `img/users/${userUploadedFile.name}`
      );
      userPhotoIconCurrent.setAttribute(
        'src',
        `img/users/${userUploadedFile.name}`
      );
      // console.log(
      //   '👛',
      //   userUploadedFile,
      //   'You have changed your profile picture'
      // );
    }
  });
}

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async event => {
    event.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value; //variables per API
    const password = document.getElementById('password').value; //variables per API
    const passwordConfirm = document.getElementById('password-confirm').value; //variables per API
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    ); //its an async fucntion

    //clear the password fields once we have completed updateSettings-password function
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    // const tourId = e.target.dataset.tourId; // Same as below ES6
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
