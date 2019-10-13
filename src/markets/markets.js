'use strict';

// Config 
const config = require('../config');
const request = require('request-promise');

const RINKEBY_MARKET_URL = 'https://dev.augur.net/#!/market?id=';
const MAINNET_MARKET_URL = 'https://cloudflare-ipfs.com/ipfs/QmUZDUMFRdVb45RtwRiK7jwdRQX71FWNnLgDS1i9mf7wfy/?ethereum_node_http=https%3a%2f%2feth-mainnet.alchemyapi.io%2fjsonrpc%2f7sE1TzCIRIQA3NJPD5wg7YRiVjhxuWAE&augur_node=wss%3a%2f%2fpredictions.market:9002#!/market?id=';
const MAIN_STATE = 0;
const EXIT_COI_STATE = 1;

window.jQuery = require('jquery');

Vue.config.devtools = false;
Vue.config.productionTip = false;

// Query helper
const apiQuery = async (endpoint = null, method = "GET") => {
    let options;
    // Nothing to do here...    
    if (!endpoint) {
        return false;
    }

    let apiUrl = 'https://api.cheezeofinsight.com/' + endpoint;
    options = {
        method: method,
        uri: apiUrl,
        // Headers
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Debug request options
    //console.log('req. options', options);

    // Make request
    let response;
    await request(options)
    .then((data) => {
        response = data;
    })
    .catch((err) => {
        //console.log('Encountered error', err);
        response = err.response.body;
    });

    // Handle response
    response = JSON.parse(response);
    return response;
};

// Create application
if (location.href.indexOf('markets') !== -1) {
    let marketsVm = new Vue({
        el: '#markets',
        data: () => ({
            // App Constants
            RINKEBY_MARKET_URL: RINKEBY_MARKET_URL,
            MAINNET_MARKET_URL: MAINNET_MARKET_URL,
            MAIN_STATE: MAIN_STATE,
            EXIT_COI_STATE: EXIT_COI_STATE,
            // Utilities
            apiQuery: apiQuery,
            // Dependencies
            Provider: require('../providers'),
            // Web3
            web3Providers: {
                rinkeby: null,
                mainnet: null
            },
            isWeb3Enabled: null,
            wallets: {
                rinkeby: null,
                mainnet: null
            },
            contracts: {
                rinkeby: {},
                mainnet: {}
            },
            tokens: {
                rinkeby: {
                    wizards: []
                },
                mainnet: {
                    wizards: []
                }
            },
            isMainnetAugur: true,
            isPhaseThreeTournament: false,
            coiMarkets: [],
            communityMarkets: [],
            applicationState: MAIN_STATE,
            descrReadMore: true,
            exitTimer: null,
            isBgAnimated: false
        }),
        mounted: async function () {
            // Animate Cheeze Melt
            setTimeout(() => {
                this.isBgAnimated = true;
                setTimeout(() => {
                    jQuery('document').ready(function () {
                        jQuery('#markets').removeClass('hidden');
                    });
                }, 0);
            }, 0);

            // Web3 Instances
            this.web3Providers.mainnet = await this.Provider.getWssWeb3Mainnet();
            this.web3Providers.rinkeby = await this.Provider.getWssWeb3Rinkeby();

            // Wallet Instance
            let accounts;
            if (window.hasOwnProperty('ethereum')) {
                this.isWeb3Enabled = true;
                accounts = await window.ethereum.enable();
                if (accounts[0]) {
                    // Wallets
                    this.wallets.rinkeby = false;
                    this.wallets.mainnet = accounts[0];
                    //console.log('Accounts =>', this.wallets);
                }
            } else {
                this.isWeb3Enabled = false;
            }

            // Get COI Markets
            this.getCoiMarkets();
            // Get Community Markets
            this.getCommunityMarkets();
        },
        methods: {
            // Menu Nav
            goHome: function () {
                return window.location.href = "/";
            },
            goHere: function () {
                //return window.location.href = "/markets";
                this.descrReadMore = !this.descrReadMore;
            },
            // Load COI Markets
            getCoiMarkets: async function () {
                // Do not fetch markets unless the BM has arrived!
                if (!this.isPhaseThreeTournament) {
                    return;
                }
                let coiMarkets = await this.apiQuery('markets/owned');
                if (coiMarkets) {
                    if (coiMarkets.hasOwnProperty('data')) {
                        if (coiMarkets.data.hasOwnProperty('markets')) {
                            this.coiMarkets = coiMarkets.data.markets.reverse();
                            //console.log('coiMarkets =>', this.coiMarkets);
                        }
                    }
                }
            },

            // Load Comunnity Markets
            getCommunityMarkets: async function () {
                // Do not fetch markets unless the BM has arrived!
                if (!this.isPhaseThreeTournament) {
                    return;
                }
                let communityMarkets = await this.apiQuery('markets/community');
                if (communityMarkets) {
                    if (communityMarkets.hasOwnProperty('data')) {
                        if (communityMarkets.data.hasOwnProperty('markets')) {
                            this.communityMarkets = communityMarkets.data.markets.reverse();
                            //console.log('communityMarkets =>', this.communityMarkets);
                        }
                    }
                }
            },
            getMarketImageUrl: function (marketTitle) {
                let baseImgUrl = 'https://storage.googleapis.com/cheeze-wizards-production/0xec2203e38116f09e21bc27443e063b623b01345a/';
                if (!marketTitle) {
                    return '/img/coinlist-promo.png';
                }
                let wizardId = null;
                // Example Market Title:
                // "Will Wizard #1214 increase in power after the next dueling window is resolved?"
                // Find Wizard, e.g. tag: "Wizard1614"
                if (marketTitle.indexOf('Will Wizard #') !== -1) {
                    let marketTitlePieces = marketTitle.split('Will Wizard #').join('').split(' ');
                    wizardId = marketTitlePieces[0];
                    // Return Wizard image or if no Wizard ID is found
                    // return a default Hackathon promo image from Coinlist
                    if (wizardId) {
                        return baseImgUrl + wizardId + ".svg";
                    } else {
                        return '/img/coinlist-promo.png';
                    }
                // Else, show Coinlist promo image
                } else {
                    return '/img/coinlist-promo.png';
                }
            },
            doMarketNavigation: function (marketAddress) {
                if (!marketAddress) {
                    return '';
                }

                // Set navigation warning
                this.applicationState = EXIT_COI_STATE;

                jQuery('#markets-footer').hide();

                let marketUrl;
                
                // Build Market URL
                if (!this.isMainnetAugur) {
                    marketUrl = this.RINKEBY_MARKET_URL + marketAddress;
                } else {
                    marketUrl = this.MAINNET_MARKET_URL + marketAddress;
                }

                //console.log('Navigating to Market Address =>', marketUrl);
                this.exitTimer = 5;
                let timer;
                timer = setInterval(() => {
                    if (this.exitTimer > 0) {
                        --this.exitTimer;
                    } else {
                        window.location.href = marketUrl;
                        clearInterval(timer);
                    }
                }, 1000);
            }
        }
    });
}