const express = require('express');
const BitcoinClient = require('bitcoin-core');
const app = express();

// Middleware
app.use(express.json());

const rpcConfig = {
  host: `http://${process.env.BITCOIND_HOST}:${process.env.BITCOIND_PORT}`,
  username: process.env.BITCOIND_RPCUSER,
  password: process.env.BITCOIND_RPCPASSWORD
}

// Create the default Bitcoin client
console.log('Connecting to Bitcoin node with config:', {
  ...rpcConfig,
  password: '********' // Hide password in logs
});

// Test connection to Bitcoin node
const client = new BitcoinClient(rpcConfig);

// Test the connection
client.getBlockchainInfo()
  .then(() => console.log('Successfully connected to Bitcoin node'))
  .catch(err => console.error('Failed to connect to Bitcoin node:', err));

// Helper function to get a wallet-specific client
const getWalletClient = (walletName) => {
  console.log(`Creating wallet client for: ${walletName}`);
  return new BitcoinClient({
    ...rpcConfig,
    wallet: walletName
  });
};

// Authentication middleware
app.use(function authenticate(req, res, next) {
  const token = req.headers.authorization;

  if (!token || token !== `Bearer ${process.env.MINE_API_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
});

// Create wallet endpoint
app.post('/api/wallet/create', async (req, res) => {
  try {
    // Create a descriptor wallet in Bitcoin Core
    const walletId = `wallet_${Date.now()}`;

    try {
      // Create a new descriptor wallet
      await client.createWallet(walletId);

      // Get a wallet-specific client
      const walletClient = getWalletClient(walletId);

      // Get a new address from the wallet
      const address = await walletClient.getNewAddress();

      // Get wallet info
      const walletInfo = await walletClient.getWalletInfo();

      res.json({
        success: true,
        wallet: {
          id: walletId,
          address,
          walletInfo,
          network: 'regtest'
        }
      });
    } catch (error) {
      console.log('Wallet operation error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Wallet creation error:', error);
    res.status(500).json({
      error: 'Failed to create wallet',
      details: error
    });
  }
});

// Mine blocks endpoint
app.post('/api/mine', async (req, res) => {
  const { blocks, address } = req.body;
  const blocksNum = parseInt(blocks);

  if (!blocks || !address) {
    return res.status(400).json({ error: 'Missing required parameters: blocks and address' });
  }

  if (isNaN(blocksNum) || blocksNum <= 0) {
    return res.status(400).json({ error: 'Blocks must be a positive number' });
  }

  try {
    const blockHashes = await client.generateToAddress(blocksNum, address);

    res.json({
      success: true,
      message: `Successfully mined ${blocksNum} blocks to ${address}`,
      blocks: blockHashes
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to mine blocks',
      details: error
    });
  }
});

// Get wallet endpoint
app.post('/api/wallet', async (req, res) => {
  try {
    const { id: walletId } = req.body;

    if (!walletId) {
      return res.status(400).json({ error: 'Missing wallet ID parameter' });
    }

    let walletClient;
    let walletInfo;
    let isAddress = false;
    let foundWallet = null;

    // First try to use it as a wallet name
    try {
      walletClient = getWalletClient(walletId);
      walletInfo = await walletClient.getWalletInfo();
      console.log(`Found wallet by name: ${walletId}`);
    } catch (walletError) {
      console.log(`Not a valid wallet name: ${walletId}. Error: ${walletError.message}`);
      isAddress = true;

      // If not a wallet name, try to find a wallet that contains this address
      try {
        // Get list of all wallets
        const wallets = await client.listWallets();

        // Check each wallet for the address
        for (const walletName of wallets) {
          const tempClient = getWalletClient(walletName);
          const addresses = await tempClient.getAddressesByLabel('');

          if (Object.keys(addresses).includes(walletId)) {
            foundWallet = walletName;
            walletClient = tempClient;
            walletInfo = await walletClient.getWalletInfo();
            break;
          }
        }

        if (!foundWallet) {
          return res.status(404).json({
            error: 'Wallet not found',
            details: `Could not find a wallet with name or address: ${walletId}`
          });
        }

        console.log(`Found wallet ${foundWallet} for address: ${walletId}`);
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to find wallet',
          details: error.message
        });
      }
    }

    // Get wallet balance
    const balance = await walletClient.getBalance();

    // Get addresses for the wallet
    const addresses = await walletClient.getAddressesByLabel('');

    // Get recent transactions
    const transactions = await walletClient.listTransactions('*', 10); // Get last 10 transactions

    res.json({
      success: true,
      wallet: {
        id: isAddress ? foundWallet : walletId,
        info: walletInfo,
        balance,
        addresses: Object.keys(addresses),
        recentTransactions: transactions
      }
    });
  } catch (error) {
    console.error('Wallet info error:', error);
    res.status(500).json({
      error: 'Failed to get wallet information',
      details: error.message
    });
  }
});

// Send Bitcoin endpoint
app.post('/api/send', async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'Required: from (wallet name or address), to (address), amount (BTC)'
      });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    let walletClient;

    // Determine if 'from' is a wallet name or an address
    try {
      // First, try to use it as a wallet name
      walletClient = getWalletClient(from);

      // Test if the wallet exists by getting wallet info
      await walletClient.getWalletInfo();
      console.log(`Using wallet: ${from}`);
    } catch (walletError) {
      console.log(`Not a valid wallet name: ${from}. Error: ${walletError.message}`);

      // If not a wallet name, try to find a wallet that contains this address
      try {
        // Get list of all wallets
        const wallets = await client.listWallets();
        let foundWallet = null;

        // Check each wallet for the address
        for (const walletName of wallets) {
          const tempClient = getWalletClient(walletName);
          const addresses = await tempClient.getAddressesByLabel('');

          if (Object.keys(addresses).includes(from)) {
            foundWallet = walletName;
            break;
          }
        }

        if (!foundWallet) {
          return res.status(404).json({
            error: 'Source not found',
            details: `Could not find a wallet with name or address: ${from}`
          });
        }

        walletClient = getWalletClient(foundWallet);
        console.log(`Found wallet ${foundWallet} for address: ${from}`);
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to find source wallet',
          details: error
        });
      }
    }

    // Send the transaction
    try {
      const txid = await walletClient.sendToAddress(to, parseFloat(amount));

      res.json({
        success: true,
        message: `Successfully sent ${amount} BTC to ${to}`,
        transaction: {
          txid,
          amount,
          to
        }
      });
    } catch (sendError) {
      res.status(500).json({
        error: 'Failed to send transaction',
        details: sendError
      });
    }
  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({
      error: 'Failed to process send request',
      details: error
    });
  }
});


// Example API usage
console.log(`
Example API usage:
  Create wallet: curl -X POST -H "Authorization: Bearer your-secret-api-token" -H "Content-Type: application/json" http://localhost:4000/api/wallet/create
  Get wallet: curl -X POST -H "Authorization: Bearer your-secret-api-token" -H "Content-Type: application/json" -d '{"id":"WALLET_NAME_OR_ADDRESS"}' http://localhost:4000/api/wallet
  Mine blocks: curl -X POST -H "Authorization: Bearer your-secret-api-token" -H "Content-Type: application/json" -d '{"blocks":1,"address":"YOUR_ADDRESS"}' http://localhost:4000/api/mine
  Send Bitcoin: curl -X POST -H "Authorization: Bearer your-secret-api-token" -H "Content-Type: application/json" -d '{"from":"wallet_name","to":"address","amount":0.1}' http://localhost:4000/api/send
`);

// Start the server
const port = process.env.MINE_API_PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
