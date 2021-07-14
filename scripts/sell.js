const opensea = require("opensea-js");
const OpenSeaPort = opensea.OpenSeaPort;
const Network = opensea.Network;
const MnemonicWalletSubprovider = require("@0x/subproviders")
  .MnemonicWalletSubprovider;
const RPCSubprovider = require("web3-provider-engine/subproviders/rpc");
const Web3ProviderEngine = require("web3-provider-engine");

const MNEMONIC = process.env.MNEMONIC;
const NODE_API_KEY = process.env.INFURA_KEY || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const NETWORK = process.env.NETWORK;
const INFURA_KEY = process.env.INFURA_KEY
const API_KEY = process.env.API_KEY || ""; // API key is optional but useful if you're doing a high volume of requests.

if (!MNEMONIC || !NODE_API_KEY || !NETWORK || !OWNER_ADDRESS) {
  console.error(
    "Please set a mnemonic, Alchemy/Infura key, owner, network, API key, nft contract, and factory contract address."
  );
  return;
}

const BASE_DERIVATION_PATH = `44'/60'/0'/0`;

const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({
  mnemonic: MNEMONIC,
  baseDerivationPath: BASE_DERIVATION_PATH,
});
const network =
  NETWORK === "mainnet" || NETWORK === "live" ? "mainnet" : "rinkeby";
const infuraRpcSubprovider = new RPCSubprovider({
  rpcUrl: isInfura
    ? INFURA_KEY
    : "https://eth-" + network + ".alchemyapi.io/v2/" + NODE_API_KEY,
});

const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(mnemonicWalletSubprovider);
providerEngine.addProvider(infuraRpcSubprovider);
providerEngine.start();

const seaport = new OpenSeaPort(
  providerEngine,
  {
    networkName:
      NETWORK === "mainnet" || NETWORK === "live"
        ? Network.Main
        : Network.Rinkeby,
    apiKey: API_KEY,
  },
  (arg) => console.log(arg)
);
const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24)
async function main() {
  // Example: English auction.
  console.log("English auctioning an item in DAI...");
  const wethAddress =
    NETWORK === "mainnet" || NETWORK === "live"
      ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      : "0xc778417e063141139fce010982780140aa0cd5ab";

  try {
    const englishAuctionSellOrder = seaport.createSellOrder({
      asset: {
        tokenId: '67',
        tokenAddress: NFT_CONTRACT_ADDRESS,
      },
      startAmount: 0.0001,
      expirationTime: expirationTime,
      waitForHighestBid: true,
      paymentTokenAddress: wethAddress,
      accountAddress: OWNER_ADDRESS,
      englishAuctionReservePrice: 0.0001
    })
    await new Promise(r => setTimeout(r, 2000))
    console.log(englishAuctionSellOrder)
    console.log(
    `Successfully created an English auction sell order! ${englishAuctionSellOrder.asset.openseaLink}\n`
  );
  } catch(e) {
    console.log(e)
  }
}
main()
