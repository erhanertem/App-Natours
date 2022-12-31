/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error' per CSS setup
export const showAlert = (type, msg, timeSpan = 7) => {
  //1.Lets make sure all alerts are hidden before we create a new alert
  hideAlert();
  //2.Create an alert
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  //3.Hide the alert after 5 secs
  window.setTimeout(hideAlert, timeSpan * 1000);
};
