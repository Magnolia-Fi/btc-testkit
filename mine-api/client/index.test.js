/**
 * Example usage of the MineApiClient
 */

const MineApiClient = require('./client');

// Example function to demonstrate client usage
async function demonstrateClient() {
  try {
    // Initialize the client with your API token
    const client = new MineApiClient({
      token: 'your-secret-api-token'
    });

    console.log('Creating a new wallet...');
    const walletResult = await client.createWallet();
    console.log('Wallet created:', walletResult.wallet.id);

    const walletId = walletResult.wallet.id;
    const address = walletResult.wallet.address;

    console.log(`Mining 101 blocks to address ${address}...`);
    const miningResult = await client.mineBlocks(101, address);
    console.log(`Mined ${miningResult.blocks.length} blocks`);

    console.log(`Getting wallet information for ${walletId}...`);
    const walletInfo = await client.getWallet(walletId);
    console.log(`Wallet balance: ${walletInfo.wallet.balance} BTC`);

    // Create a second wallet to send funds to
    console.log('Creating a second wallet for receiving funds...');
    const wallet2Result = await client.createWallet();
    const wallet2Address = wallet2Result.wallet.address;

    console.log(`Sending 1 BTC from ${walletId} to ${wallet2Address}...`);
    const sendResult = await client.sendBitcoin(walletId, wallet2Address, 1);
    console.log(`Transaction sent: ${sendResult.transaction.txid}`);

    // Mine a block to confirm the transaction
    console.log('Mining a block to confirm the transaction...');
    await client.mineBlocks(1, address);

    // Check both wallet balances
    const wallet1Updated = await client.getWallet(walletId);
    const wallet2Updated = await client.getWallet(wallet2Result.wallet.id);

    console.log(`Wallet 1 balance: ${wallet1Updated.wallet.balance} BTC`);
    console.log(`Wallet 2 balance: ${wallet2Updated.wallet.balance} BTC`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
  demonstrateClient();
}
