/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51MHPvZBwv1Yp5zuJvqSU0VeIh5UHdCXhqdHit1BgpPTTclPqtnYhFuFGPi4PSoJ6a8yeWlpSwC6RbkVSyH7LYLEI00VSL20s1i'
); //Per docs @ https://stripe.com/docs/js & https://stripe.com/docs/payments/checkout/migration

export const bookTour = async tourId => {
  try {
    //1.Get checkout session from API end point
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);
    //2.Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    }); //Per docs @ https://stripe.com/docs/payments/checkout/migration
  } catch (err) {
    console.log(err);
    showAlert('error', err); //Show errro on the UI
  }
};
