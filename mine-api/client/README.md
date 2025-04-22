## Node.js Client

A simple Node.js client is included to interact with the API:

```javascript
const MineApiClient = require('mine-api');

// Initialize the client
const client = new MineApiClient({
  baseUrl: 'http://localhost:4000', // optional, defaults to http://localhost:4000
  token: 'your-secret-api-token'    // required
});

// Create a wallet
client.createWallet()
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Get wallet information
client.getWallet('wallet_name_or_address')
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Mine blocks
client.mineBlocks(101, 'your-bitcoin-address')
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Send Bitcoin
client.sendBitcoin('from_wallet', 'to_address', 0.1)
  .then(result => console.log(result))
  .catch(error => console.error(error));
```
