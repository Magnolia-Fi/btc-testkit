declare module 'mine-api' {
  interface MineApiClientOptions {
    /**
     * Base URL for the API (optional, defaults to http://localhost:4000)
     */
    baseUrl?: string;
    
    /**
     * Authentication token (required)
     */
    token: string;
  }

  interface WalletResponse {
    success: boolean;
    wallet: {
      id: string;
      address: string;
      walletInfo: {
        walletname: string;
        walletversion: number;
        format: string;
        descriptors: boolean;
      };
      network: string;
    };
  }

  interface MineBlocksResponse {
    success: boolean;
    message: string;
    blocks: string[];
  }

  interface WalletInfoResponse {
    success: boolean;
    wallet: {
      id: string;
      info: {
        walletname: string;
        walletversion: number;
        format: string;
        balance: number;
      };
      balance: number;
      addresses: string[];
      recentTransactions: {
        address: string;
        category: string;
        amount: number;
        confirmations: number;
        txid: string;
      }[];
    };
  }

  interface SendBitcoinResponse {
    success: boolean;
    message: string;
    transaction: {
      txid: string;
      amount: number;
      to: string;
    };
  }

  class MineApiClient {
    /**
     * Initialize the Mine API client
     * @param options Client configuration options
     */
    constructor(options: MineApiClientOptions);

    /**
     * Create a new wallet
     * @returns Promise resolving to wallet creation response
     */
    createWallet(): Promise<WalletResponse>;

    /**
     * Get wallet information
     * @param id Wallet name or address
     * @returns Promise resolving to wallet information
     */
    getWallet(id: string): Promise<WalletInfoResponse>;

    /**
     * Mine blocks to a specified address
     * @param blocks Number of blocks to mine
     * @param address Bitcoin address to mine to
     * @returns Promise resolving to mining response
     */
    mineBlocks(blocks: number, address: string): Promise<MineBlocksResponse>;

    /**
     * Send Bitcoin from one wallet to another address
     * @param from Source wallet name or address
     * @param to Destination Bitcoin address
     * @param amount Amount of Bitcoin to send
     * @returns Promise resolving to transaction response
     */
    sendBitcoin(from: string, to: string, amount: number): Promise<SendBitcoinResponse>;
  }

  export = MineApiClient;
}
