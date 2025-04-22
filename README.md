# btc-testkit

A Bitcoin regtest environment using Docker Compose. This setup provides everything you need to develop and test Bitcoin applications in a controlled environment.

## Features

- **Bitcoin Core in Regtest Mode**: A private Bitcoin network for development and testing
- **Mempool Block Explorer**: Visual interface to monitor transactions and blocks
- **Mine API**: HTTP API for wallet creation, mining blocks, and sending transactions
- **Extended Halving Period**: Modified bitcoind to use mainnet's 210,000 block halving period instead of regtest's default 150 blocks
- **Mempool API Access**: Direct access to the Mempool API for advanced block explorer functionality with API limits removed

## Getting Started

1. Clone this repository
2. Start the environment:
   ```
   docker-compose up -d
   ```
3. Access the Mempool block explorer at http://localhost:8888
4. Access the Mempool API at http://localhost:8889/api

## APIs

### Mine API

The included Mine API provides a simple HTTP interface for interacting with your regtest Bitcoin node. It supports:

- Creating wallets
- Getting wallet information
- Mining blocks
- Sending transactions

All endpoints use POST methods and require authentication with a Bearer token.

For detailed API documentation and examples, see the [Mine API README](mine-api/README.md).

### Mempool API

The environment also includes access to the Mempool API, which provides:

- Block and transaction data
- Mempool statistics
- Fee estimates
- Network information

Access the Mempool API at `http://localhost:8889/api`. Some useful endpoints:

- `/api/blocks`: Get recent blocks
- `/api/tx/{txid}`: Get transaction details
- `/api/mempool`: Get mempool statistics

## Configuration

The environment can be configured through the `.env` file. See the example configuration for available options.

## License

[MIT](LICENSE)
