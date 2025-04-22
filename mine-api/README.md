# Bitcoin Regtest API

A simple HTTP API for interacting with Bitcoin Core in regtest mode.

## Setup

1. Make sure you have Bitcoin Core installed and running in regtest mode
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your `.env` file with the appropriate values
4. Start the server:
   ```
   npm start
   ```

## API Endpoints

All endpoints require authentication with a Bearer token that matches the `MINE_API_TOKEN` in your `.env` file.

### Create Wallet

```
POST /api/wallet/create
```

Creates a new wallet, generates an address, and returns the wallet details.

Example:
```bash
curl -X POST "http://localhost:4000/api/wallet/create" \
  -H "Authorization: Bearer your-secret-api-token" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:
```json
{
	"success": true,
	"wallet": {
		"id": "wallet_1744949494852",
		"address": "bcrt1quxh4gpquxuqqvfa3empa7tk8803rdffad555fw",
		"walletInfo": {
			"walletname": "wallet_1744949494852",
			"walletversion": 169900,
			"format": "sqlite",
			"descriptors": true
		},
		"network": "regtest"
	}
}
```

### Mine Blocks

```
POST /api/mine
```

Request body:
```json
{
  "blocks": 101,
  "address": "your-bitcoin-address"
}
```

Parameters:
- `blocks`: Number of blocks to mine (required)
- `address`: Bitcoin address to mine to (required)

Example:
```bash
curl -X POST "http://localhost:4000/api/mine" \
  -H "Authorization: Bearer your-secret-api-token" \
  -H "Content-Type: application/json" \
  -d '{"blocks":101,"address":"your-bitcoin-address"}'
```

Response:
```json
{
	"success": true,
	"message": "Successfully mined 101 blocks to bcrt1quxh4gpquxuqqvfa3empa7tk8803rdffad555fw",
	"blocks": [
		"73e99f55d404a548a441106ba9c204ad280f234e192109be9712a5ff9c0ba014",
		"6fefa51ac95dcb1e020042d4ad0db757c0f59eb6d4cb0323cc65e0957d67cdf5"
  ]
}
```

### Get Wallet

```
POST /api/wallet
```

Request body:
```json
{
  "id": "wallet_name_or_address"
}
```

Parameters:
- `id`: Wallet name or address (required)

Example:
```bash
curl -X POST "http://localhost:4000/api/wallet" \
  -H "Authorization: Bearer your-secret-api-token" \
  -H "Content-Type: application/json" \
  -d '{"id":"wallet_name_or_address"}'
```

Response:
```json
{
  "success": true,
  "wallet": {
    "id": "wallet_1744949494852",
    "info": {
      "walletname": "wallet_1744949494852",
      "walletversion": 169900,
      "format": "sqlite",
      "balance": 50.00000000
    },
    "balance": 50.00000000,
    "addresses": [
      "bcrt1quxh4gpquxuqqvfa3empa7tk8803rdffad555fw"
    ],
    "recentTransactions": [
      {
        "address": "bcrt1quxh4gpquxuqqvfa3empa7tk8803rdffad555fw",
        "category": "receive",
        "amount": 50.00000000,
        "confirmations": 101,
        "txid": "73e99f55d404a548a441106ba9c204ad280f234e192109be9712a5ff9c0ba014"
      }
    ]
  }
}
```

### Send Bitcoin

```
POST /api/send
```

Request body:
```json
{
  "from": "wallet_name_or_address",
  "to": "destination_address",
  "amount": 0.1
}
```

Parameters:
- `from`: Source wallet name or address (required)
- `to`: Destination Bitcoin address (required)
- `amount`: Amount of Bitcoin to send (required)

Example:
```bash
curl -X POST "http://localhost:4000/api/send" \
  -H "Authorization: Bearer your-secret-api-token" \
  -H "Content-Type: application/json" \
  -d '{"from":"wallet_name_or_address","to":"address","amount":0.1}'
```

Response:
```json
{
  "success": true,
  "message": "Successfully sent 0.1 BTC to bcrt1quxh4gpquxuqqvfa3empa7tk8803rdffad555fw",
  "transaction": {
    "txid": "73e99f55d404a548a441106ba9c204ad280f234e192109be9712a5ff9c0ba014",
    "amount": 0.1,
    "to": "bcrt1quxh4gpquxuqqvfa3empa7tk8803rdffad555fw"
  }
}
```
