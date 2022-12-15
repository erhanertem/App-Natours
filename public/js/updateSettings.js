/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url, // url: url ES6
      data, // data: data ES6
    });

    // console.log('🎈', res, '🎈', res.data);
    if (res.data.status === 'success') {
      showAlert(
        'success',
        `${type[0].toUpperCase()}${type.slice(1)} updated succesfully!`
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
