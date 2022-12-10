/* eslint-disable */

const login = async (email, password) => {
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
  } catch (err) {
    // console.log(err);
    console.log(err.response.data.message); //axios error
  }
};

document.querySelector('.form').addEventListener('submit', event => {
  event.preventDefault(); //this prevents the form from loading any other page
  const email = document.getElementById('email').value;
  //Refer to input#email fields @ login.pug
  const password = document.getElementById('password').value;
  //Refer to input#password fields @ login.pug
  login(email, password);
});
