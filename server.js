const express = require('express');
var cors = require('cors');
var app = express();
const { resolve } = require('path');
const AWS = require('aws-sdk')
// Copy the .env.example in the root into a .env file in this folder
//require('dotenv').config({ path: './.env' });

const serverURL = 'https://naturistic.herokuapp.com'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
  appInfo: { //  not required for production:
    name: "naturistic e-store demo",
    version: "0.0.1",
    url: "https://Naturistic.github.io"
  }
});

app.use(cors());

app.use(express.static('client'));

app.use(express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.get('/', (req, res) => {
  const path = resolve('index.html');
  res.sendFile(path);
});
app.get('/cancelled', (req, res) => {
  const path = resolve('client/cancelled.html');
  res.sendFile(path);
});
app.get('/success', (req, res) => {
  const path = resolve('client/success.html');
  res.sendFile(path);
});

// minimize endpoints to fit rebuilt SPA style

// Use STRIPE API to get all of the prices that have been defined.
// we use the EXPAND option on the product link in the price object
// This returns a compund object we can use to extract our required data
// It also reduces the number of API calls to prevent throttling by STRIPE

app.get("/prices", async (req, res) => {

  let productPrices = [];

//  console.log("getting all prices");

  try {

    const stripePrices = await stripe.prices.list({  expand: ['data.product'], limit: 99, });

    const prodObjs = Object.values(stripePrices.data);

    prodObjs.forEach( (price) => {

        let obj = {
          priceId: price.id,
          currency: price.currency,
          amount: (price.unit_amount_decimal/100).toFixed(2),
          product: price.product.id,
          name: price.product.name,
          description: price.product.description,
          image: price.product.images[0],
          bigImage: price.product.metadata.bigURL,
          tags: price.product.metadata.tags,
       };

       if(obj.tags){
         obj.tags = obj.tags.split(',');
       }

       if(obj.image) {
         productPrices.push(obj);
       }

    });

//    console.log(productPrices);

    res.status(200).json(productPrices)

  } catch (error) {
    return res.status(400).send({
      Error: error.raw.message,
    });
  }
});




// Fetch the Checkout Session to display the JSON result on the success page
app.get('/checkout-session', async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

app.post('/create-checkout-session', async (req, res) => {
  const domainURL = serverURL;
  console.log(req.body);

  const pmTypes = ('card').split(',').map((m) => m.trim());

  const session = await stripe.checkout.sessions.create({
    payment_method_types: pmTypes,
    mode: 'payment',
    line_items: req.body.lineItems,
    metadata: {
      images: JSON.stringify(req.body.successImages)
    },
    // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
    success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainURL}/cancelled`,
  });

  return res.json({
    url: session.url
  })
});

// Webhook handler for asynchronous events.
app.post('/webhook', async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'checkout.session.completed') {
    console.log(`🔔  Payment received!`);
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 4242, () => console.log(`Node server listening on port ${4242}!`));
