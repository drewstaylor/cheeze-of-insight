'use strict';

// Config 
const config = require('../config');

// Create application
if (location.href.indexOf('markets') !== -1) {
    let marketsVm = new Vue({
        el: '#markets',
        data: () => ({
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
            }
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
        },
        methods: {
            getCoiMarkets: async function () {
                // TODO: This
            },
            getCommunityMarkets: async function () {
                // TODO: This
            }
        }
    });
}