import express from "express";
import { createActionsServer, Inputs } from 'deta-space-actions'
import fetch from 'node-fetch'

const app = express()
app.use(express.json())

const actions = createActionsServer()

actions.add({
  name: 'btc_price',
  title: 'Get Current BTC Price',
  input: [],
  card: '@deta/detail',
  handler: async event => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      const data = await response.json();
      const price = Math.round(data.data.amount);

      return {
        title: 'BTC Price',
        text: `$${price}`,
        ref: 'https://www.google.com/finance/quote/BTC-USD'
      }
    } catch (err) {
      return {
        text: 'Cannot fetch BTC price at the moment'
      }
    }
  }
})

actions.add({
  name: 'crypto_price',
  title: 'Current Crypto Price',
  input: [
    Inputs('crypto').String().Optional(),
    Inputs('currency').String().Optional()
  ],
  card: '@deta/detail',
  handler: async event => {
    try {
      const crypto = event.crypto.toUpperCase() || 'BTC';
      const currency = event.currency.toUpperCase() || 'USD';

      if (currency.length > 3) {
        return {
          text: 'Invalid currency value, use 3 letter currency code.'
        }
      }

      if (crypto.length > 5) {
        return {
          text: 'Invalid crypto value, use a valid crypto code.'
        }
      }

      const response = await fetch(`https://api.coinbase.com/v2/prices/${crypto}-${currency}/spot`);
      const data = await response.json();
      const price = Math.round(data.data.amount);

      return {
        title: `Price of ${crypto}`,
        text: `The current price of ${crypto} in ${currency} is ${price}`,
        ref: `https://www.google.com/finance/quote/${crypto}-${currency}`,
      }
    } catch (err) {
      return {
        text: 'Cannot fetch crypto price at the moment'
      }
    }
  }
})

actions.serve()
