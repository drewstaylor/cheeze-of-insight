'use strict';

// Config 
const config = require('../config');
const request = require('request-promise');

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
        console.log('Encountered error', err);
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
            coiMarkets: [],
            communityMarkets: []
        }),
        mounted: async function () {
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
                    console.log('Accounts =>', this.wallets);
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
            getCoiMarkets: async function () {
                let coiMarkets = await this.apiQuery('markets/owned');
                if (coiMarkets) {
                    if (coiMarkets.hasOwnProperty('data')) {
                        if (coiMarkets.data.hasOwnProperty('markets')) {
                            this.coiMarkets = coiMarkets.data.markets;
                            console.log('coiMarkets =>', this.coiMarkets);
                        }
                    }
                }
            },
            getCommunityMarkets: async function () {
                let communityMarkets = await this.apiQuery('markets/community');
                console.log(communityMarkets);
                if (communityMarkets) {
                    if (communityMarkets.hasOwnProperty('data')) {
                        if (communityMarkets.data.hasOwnProperty('markets')) {
                            this.communityMarkets = communityMarkets.data.markets;
                            console.log('communityMarkets =>', this.communityMarkets);
                        }
                    }
                }
            }
        }
    });
}