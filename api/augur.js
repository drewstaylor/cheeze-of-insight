require('dotenv').config({path: __dirname + '/.env'});

const Augur = require('augur.js');
let augur = new Augur();
let coiOwnedMarkets = [];
let communityMarkets = [];
let allCoiMarkets = [];

/**
 * Get detailed market data for a market address
 * @param {Object} markets: An `Array` of market addresses to resolve data for
 */
const getMarketDataByAddresses = async function (markets) {
    if (!markets) {
        return;
    } else if (!markets.length) {
        return;
    }

    augur.markets.getMarketsInfo({
        marketIds: markets
    }, (error, marketData) => {
        console.log(marketData);
        coiOwnedMarkets = marketData;
    });
}

/**
 * Get markets created by COI team
 */
const getCoiOwnedMarkets = function () {
    augur.markets.getMarkets({
        universe: process.env.AUGUR_UNIVERSE,
        creator: process.env.COI_OWNER_ADDRESS
    }, (error, markets) => {
        console.log(markets);
        getMarketDataByAddresses(markets);
    });
};

const augurConnect = async function () {
    // Connect to Augur node
    augur.connect({
        ethereumNode: {
            httpAddresses: [
                "https://rinkeby.infura.io" // hosted HTTP address for Ethereum Rinkeby test network
            ],
            wsAddresses: [
                "wss://rinkeby.infura.io/ws" // hosted WebSocket address Ethereum Rinkeby test network
            ]
        },
        augurNode: "wss://dev.augur.net/augur-node" // WebSocket address for an Augur Node on Rinkeby
    }, (error, connectionInfo) => {
        //console.log(connectionInfo);
        console.log('Augur connected');
        // Get COI Markets
        getCoiOwnedMarkets();
    });
}


module.exports = {
    node: augur
};