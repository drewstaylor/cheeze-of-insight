'use strict';

// Config 
const config = require('../config');
const firebaseConfig = config.firebaseConfig;

// Create application
if (location.href.indexOf('duels') !== -1) {
    let duelsVm = new Vue({
        el: '#duels',
        data: () => ({
            // Dependencies
            Provider: require('../providers'),
            api: require('../api'),
            duelUtils: require('../duels'),
            wizardUtils: require('../wizards'),
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
            // Duel
            duel: null
        }),
        mounted: async function () {
            // Web3 Instance
            this.web3Providers.mainnet = await this.Provider.getWssWeb3Mainnet();

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
                    
                    // ERC721 Instances
                    this.contracts.mainnet.wizards = await this.Provider.mainnetWizardsInstance();
                    console.log('ERC721 Contract', this.contracts.mainnet.wizards);
                }
            } else {
                this.isWeb3Enabled = false;
            }

            // Mount duel configuration
            let duelConfig = JSON.parse(sessionStorage.getItem('duel'));
            console.log('duelConfig', duelConfig);
            if (duelConfig) {
                //sessionStorage.removeItem('duel');
                this.duel = duelConfig;
            }
        }
    });
}