/**
 * Bitcoin Regtest API Client
 * A simple client for interacting with the Bitcoin Regtest API
 */

class MineApiClient {
  /**
   * Create a new MineApiClient
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - Base URL of the API (default: http://localhost:4000)
   * @param {string} options.token - API token for authentication
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:4000';
    this.token = options.token;

    if (!this.token) {
      throw new Error('API token is required');
    }
  }

  /**
   * Make an API request
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<Object>} - API response
   */
  async _request(endpoint, data = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(data)
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'API request failed');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new wallet
   * @returns {Promise<Object>} - Wallet details
   */
  async createWallet() {
    return this._request('/api/wallet/create');
  }

  /**
   * Get wallet information
   * @param {string} id - Wallet name or address
   * @returns {Promise<Object>} - Wallet information
   */
  async getWallet(id) {
    return this._request('/api/wallet', { id });
  }

  /**
   * Mine blocks to an address
   * @param {number} blocks - Number of blocks to mine
   * @param {string} address - Bitcoin address to mine to
   * @returns {Promise<Object>} - Mining results
   */
  async mineBlocks(blocks, address) {
    return this._request('/api/mine', { blocks, address });
  }

  /**
   * Send Bitcoin
   * @param {string} from - Source wallet name or address
   * @param {string} to - Destination Bitcoin address
   * @param {number} amount - Amount of Bitcoin to send
   * @returns {Promise<Object>} - Transaction details
   */
  async sendBitcoin(from, to, amount) {
    return this._request('/api/send', { from, to, amount });
  }
}

// Export the client
module.exports = MineApiClient;
