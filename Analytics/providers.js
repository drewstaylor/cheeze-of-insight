const Web3 = require('web3');
const WEBSOCKET_WEB3_PROVIDER_MAINNET = "wss://mainnet.infura.io/ws";
const WEBSOCKET_WEB3_PROVIDER_RINKEBY = "wss://rinkeby.infura.io/ws";

/**
 * Get a Mainnet instance of Web3 with websocket support
 * @return {Object} `websocketed web3 provider (mainnet)`
 */
const getWssWeb3Mainnet = async () => {
    const mainnetWebSocketWeb3 = new Web3(new Web3.providers.WebsocketProvider(WEBSOCKET_WEB3_PROVIDER_MAINNET));
    console.log('Web3 (mainnet) =>', mainnetWebSocketWeb3);
    return mainnetWebSocketWeb3;
};

/**
 * Get a Rinkeby instance of Web3 with websocket support
 * @return {Object} `websocketed web3 provider (rinkeby)`
 */
const getWssWeb3Rinkeby = async () => {
    const rinkebyWebSocketWeb3 = new Web3(new Web3.providers.WebsocketProvider(WEBSOCKET_WEB3_PROVIDER_RINKEBY));
    console.log('Web3 (rinkeby) =>', rinkebyWebSocketWeb3);
    return rinkebyWebSocketWeb3;
};

// Exports
module.exports = {
    getWssWeb3Mainnet: getWssWeb3Mainnet,
    getWssWeb3Rinkeby: getWssWeb3Rinkeby
};