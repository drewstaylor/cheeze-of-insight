'use strict';

// Navigation states
const HOME_STATE = -1;
const VIEW_ALL_WIZARDS = 0;
const VIEW_SELECTED_WIZARD = 1;
const PREDICT_MATCHES = 2;

// Wizards sorting states
const SORTED_BY_POWER_LEVEL_STRONGEST = 0;
const SORTED_BY_POWER_LEVEL_WEAKEST = 1;
const SORTED_BY_POWER_LEVEL_GROWTH_STRONGEST = 2;
const SORTED_BY_POWER_LEVEL_GROWTH_WEAKEST = 3;
const SORTED_BY_AFFINITY_GROUPINGS = 4;

// Prediction types
const PREDICTION_UNAVAILABLE = 0;
const PREDICTION_TYPE_CLEAR_WINNER = 1;
const PREDICTION_TYPE_MIXED_REVIEWS = 2;

// Search types
const PRIMARY_SEARCH = 1;
const VULNERABILITY_SEARCH = 2;

// Total Wizarsd
const TOTAL_WIZARDS = 4882;

// Contract constants
const MAINNET = 0;
const RINKEBY = 1;

// Register modal component
Vue.component('modal', {
    template: '#modal-template'
});

// Create application
let vm = new Vue({
    el: '#cheese-of-insight',
    data: () => ({
        // App constants
        VIEW_ALL_WIZARDS: VIEW_ALL_WIZARDS,
        VIEW_SELECTED_WIZARD: VIEW_SELECTED_WIZARD,
        PREDICT_MATCHES: PREDICT_MATCHES,
        HOME_STATE: HOME_STATE,
        SORTED_BY_POWER_LEVEL_STRONGEST: SORTED_BY_POWER_LEVEL_STRONGEST,
        SORTED_BY_POWER_LEVEL_WEAKEST: SORTED_BY_POWER_LEVEL_WEAKEST,
        SORTED_BY_POWER_LEVEL_GROWTH_STRONGEST: SORTED_BY_POWER_LEVEL_GROWTH_STRONGEST,
        SORTED_BY_POWER_LEVEL_GROWTH_WEAKEST: SORTED_BY_POWER_LEVEL_GROWTH_WEAKEST,
        SORTED_BY_AFFINITY_GROUPINGS: SORTED_BY_AFFINITY_GROUPINGS,
        PREDICTION_UNAVAILABLE: PREDICTION_UNAVAILABLE,
        PREDICTION_TYPE_CLEAR_WINNER: PREDICTION_TYPE_CLEAR_WINNER,
        PREDICTION_TYPE_MIXED_REVIEWS: PREDICTION_TYPE_MIXED_REVIEWS,
        PRIMARY_SEARCH: PRIMARY_SEARCH,
        VULNERABILITY_SEARCH: VULNERABILITY_SEARCH,
        TOTAL_WIZARDS: TOTAL_WIZARDS,
        MAINNET: MAINNET,
        RINKEBY: RINKEBY,
        // Dependencies
        Provider: require('./providers'),
        api: require('./api'),
        wizardUtils: require('./wizards'),
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
        // App
        navigation: {
            state: HOME_STATE
        },
        isLoading: false,
        currentWizardsPage: 1,
        wizardsPageSize: 10,
        totalWizardsPages: null,
        wizards: null,
        wizardsSortedBy: null,
        sortedBy: [
            'Most powerful first',
            'Push-overs first',
            'Most growth',
            'Least growth',
            'Group by Affinity'
        ],
        affinities: [
            'Unknown',
            'Neutral',
            'Fire',
            'Wind',
            'Water'
        ],
        userOwnsWizards: 0,
        currentWizard: {},
        currentOpposingWizard: {},
        selectedWizardsByAddress: {},
        selectedWizardsByAddressModalShown: false,
        matchPrediction: null,
        predictionType: null,
        wizardsSearchType: PRIMARY_SEARCH,
        wizardsPrimaryFilter: '',
        wizardsVulnerabilityFilter: '',
        showSearch: false,
        showMyWizardTraits: false,
        showOpponentTraits: false,
        manualCurrentWizardSelection: false,
        showDuels: true
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
                // ERC721 Instance
                this.contracts.mainnet.wizards = await this.Provider.mainnetWizardsInstance();
                console.log('ERC721 Contract', this.contracts.mainnet.wizards);
                this.fetchUserWizards();
            }
        } else {
            this.isWeb3Enabled = false;
        }
    },
    methods: {
        setNavigation: function (state = null) {
            // Change navigation state as required
            if (this.navigation.state == state) {
                return;
            }
            // Handle state change
            switch(state) {
                // Show all Wizards
                case VIEW_ALL_WIZARDS:
                    console.log('Wizards browsing mode enabled');
                    this.navigation.state = VIEW_ALL_WIZARDS;
                    this.getAllWizards();                    
                    break;
                case VIEW_SELECTED_WIZARD:
                    this.navigation.state = VIEW_SELECTED_WIZARD;
                    break;
                // Show match prediction
                case PREDICT_MATCHES:
                    console.log('Match prediction mode enabled');
                    this.navigation.state = PREDICT_MATCHES;
                    break;
                default:
                    return;
            }
        },
        // Helpers / Utils.
        setWizardsSorting: function (sorting = null) {
            if (sorting == null || !this.wizards) {
                return;
            }

            switch(sorting) {
                case SORTED_BY_POWER_LEVEL_STRONGEST:
                    this.wizards.sort(this.wizardUtils.sortByPowerLevel);
                    this.wizardsSortedBy = SORTED_BY_POWER_LEVEL_STRONGEST;
                    break;
                case SORTED_BY_POWER_LEVEL_WEAKEST:
                    this.wizards.sort(this.wizardUtils.sortByPowerLevel);
                    this.wizards = this.wizards.reverse();
                    this.wizardsSortedBy = SORTED_BY_POWER_LEVEL_WEAKEST;
                    break;
                case SORTED_BY_POWER_LEVEL_GROWTH_STRONGEST:
                    this.wizards.sort(this.wizardUtils.sortByPowerLevelGrowth);
                    this.wizardsSortedBy = SORTED_BY_POWER_LEVEL_GROWTH_STRONGEST;
                    break;
                case SORTED_BY_AFFINITY_GROUPINGS:
                    this.wizards.sort(this.wizardUtils.groupWizardsByAffinity);
                    this.wizards = this.wizards.reverse();
                    this.wizardsSortedBy = SORTED_BY_AFFINITY_GROUPINGS;
                    break;
                
            }
        },
        getPrettyPowerLevel: function (powerLevel) {
            if (isNaN(powerLevel)) {
                return '';
            }
            return Math.round(powerLevel / 1000000000000);
        },
        getPrettyRarity: function (rarity) {
            if (!rarity) {
                rarity = TOTAL_WIZARDS;
            } else if (isNaN(rarity)) {
                return '';
            }
            return Math.round(100 * (parseInt(rarity) / TOTAL_WIZARDS));
        },
        // Getters
        getAllWizards: async function () {
            // Loading state
            this.isLoading = true;

            // Get Wizards
            let wizardsQuery = await this.api.getAllWizards();

            // Sort Wizards
            this.wizards = wizardsQuery.wizards.sort(this.wizardUtils.sortByPowerLevel);
            this.wizardsSortedBy = SORTED_BY_POWER_LEVEL_STRONGEST;

            // Get pagination args.
            this.totalWizardsPages = Math.floor(this.wizards.length / this.wizardsPageSize);

            // Set user Wizards as required
            if (this.userOwnsWizards) {
                this.tokens.mainnet.wizards = await this.wizardUtils.getWizardsByOwnerAddress(this.wallets.mainnet, this.wizards);
                if (this.tokens.mainnet.wizards) {
                    this.currentWizard = this.tokens.mainnet.wizards[0];
                }
                //console.log('User Tokens =>', this.tokens);
            }

            // Disable loading
            this.isLoading = false;
            //console.log('Wizards =>', this.wizards);
        },
        fetchUserWizards: async function (provider = MAINNET) {
            let userTotalWizards = null;
            if (provider !== MAINNET) {
                // XXX TODO: Get Rinkeby Wizards
            } else {
                // Get Mainnet Wizards
                userTotalWizards = await this.contracts.mainnet.wizards.methods.balanceOf(this.wallets.mainnet).call();
                // If user has Wizards -> get wizards
                if (userTotalWizards > 0) {
                    this.userOwnsWizards = userTotalWizards;
                }
            }
        },
        // API worker
        fetchWizardsOwnedByAddress: async function (ownerAddress, provider = MAINNET) {
            // Nothing to do here...
            if (!ownerAddress) {
                return;
            }
            let userTotalWizards = null;
            if (provider !== MAINNET) {
                // XXX TODO: Get Rinkeby Wizards
            } else {
                if (this.isWeb3Enabled) {
                    // Get Mainnet Wizards
                    userTotalWizards = await this.contracts.mainnet.wizards.methods.balanceOf(ownerAddress).call();

                    // If user has Wizards -> get wizards
                    if (userTotalWizards > 0) {
                        this.selectedWizardsByAddress = await this.wizardUtils.getWizardsByOwnerAddress(ownerAddress, this.wizards);

                        // Add metadata properties
                        for (let i = 0; i < this.selectedWizardsByAddress.length; i++) {
                            this.selectedWizardsByAddress[i].image = this.api.getWizardImageUrlById(this.selectedWizardsByAddress[i].id);
                            this.selectedWizardsByAddress[i] = this.wizardUtils.getWizardMetadata(this.selectedWizardsByAddress[i]);
                        }

                        console.log('Wizards of owner =>', this.selectedWizardsByAddress);
                    }
                } else {
                    this.selectedWizardsByAddress = await this.wizardUtils.getWizardsByOwnerAddress(ownerAddress, this.wizards);

                    // Add metadata properties
                    for (let i = 0; i < this.selectedWizardsByAddress.length; i++) {
                        this.selectedWizardsByAddress[i].image = this.api.getWizardImageUrlById(this.selectedWizardsByAddress[i].id);
                        this.selectedWizardsByAddress[i] = this.wizardUtils.getWizardMetadata(this.selectedWizardsByAddress[i]);
                    }

                    console.log('Wizards of owner =>', this.selectedWizardsByAddress);
                }
                
                
            }
        },
        // View worker
        showAllWizardsOfOwner: async function (ownerAddress) {
            // Nothing to do here...
            if (!ownerAddress) {
                return;
            }
            // Fetch Wizards
            this.fetchWizardsOwnedByAddress(this.currentOpposingWizard.owner);

            // Launch modal
            this.selectedWizardsByAddressModalShown = true;
        },
        showWizard: async function (wizardId = null) {
            if (wizardId == null) {
                return;
            } else {
                wizardId = parseInt(wizardId);
                this.setNavigation(VIEW_SELECTED_WIZARD);
                this.isLoading = true;
            }
            // Load Wizard
            this.currentOpposingWizard = await this.api.getWizardById(wizardId);

            // Add the wizard's image url
            this.currentOpposingWizard.image = this.api.getWizardImageUrlById(wizardId);
            // Add traits
            this.currentOpposingWizard.traits = await this.api.getWizardTraitsById(wizardId);
            // Add metadata
            this.currentOpposingWizard = this.wizardUtils.getWizardMetadata(this.currentOpposingWizard);
            // Add duels
            this.currentOpposingWizard.duels = await this.api.getDuelsByWizardId(wizardId);
            
            // Disable loading
            this.isLoading = false;
            console.log('Current Opposing Wizard =>', this.currentOpposingWizard);
        },
        showPredictMatchOutcome: async function () {
            if (!this.wizards) {
                await this.getAllWizards();
            }
            // Handle pre-setting values
            if (this.currentWizard.id) {
                this.currentWizard.selectedId = this.currentWizard.id;
            }
            if (this.currentOpposingWizard.id) {
                this.currentOpposingWizard.selectedId = this.currentOpposingWizard.id;
            }
            // If both Wizards are selected, run prediction routine immediately
            if (this.currentWizard.selectedId && this.currentOpposingWizard.selectedId) {
                this.predictMatchOutcome(this.currentWizard.selectedId, this.currentOpposingWizard.selectedId);
            }
            this.setNavigation(PREDICT_MATCHES);
        },
        predictMatchOutcome: async function (wizardId = null, opposingWizardId = null) {
            let currentOpposingWizard;
            if (!wizardId || !opposingWizardId) {
                return false;
            } else {
                // Enable loading
                wizardId = parseInt(wizardId);
                opposingWizardId = parseInt(opposingWizardId);
                this.isLoading = true;
            }

            // Load Wizard metrics as required
            // Current Wizard
            if (this.currentWizard.id) {
                if (this.currentWizard.id !== this.currentWizard.selectedId) {
                    // Load Wizard
                    this.currentWizard = await this.api.getWizardById(wizardId);
                }
            } else {
                // Load Wizard
                this.currentWizard = await this.api.getWizardById(wizardId);
            }
            // Opposing Wizard
            // Load Wizard
            currentOpposingWizard = await this.api.getWizardById(opposingWizardId);

            // Compare Wizard powers and affinities
            this.matchPrediction = this.wizardUtils.predictWinner(this.currentWizard, currentOpposingWizard);
            console.log('Prediction =>', this.matchPrediction);

            // Prediction type
            if (!this.matchPrediction) {
                this.predictionType = PREDICTION_UNAVAILABLE;
            } else if (Array.isArray(this.matchPrediction)) {
                this.predictionType = PREDICTION_TYPE_MIXED_REVIEWS;
            } else {
                this.predictionType = PREDICTION_TYPE_CLEAR_WINNER;
            }
            //console.log('Prediction type', this.predictionType);

            // Retain model properties
            currentOpposingWizard.selectedId = opposingWizardId;
            this.currentWizard.selectedId = wizardId;
            
            // Add the Wizards' image urls and metadata
            this.currentWizard.image = (this.currentWizard.hasOwnProperty('image')) ? this.currentWizard.image : this.api.getWizardImageUrlById(wizardId);
            this.currentWizard = this.wizardUtils.getWizardMetadata(this.currentWizard);
            currentOpposingWizard.image = this.api.getWizardImageUrlById(opposingWizardId);
            this.currentOpposingWizard = this.wizardUtils.getWizardMetadata(currentOpposingWizard);
            // Add Traits data
            if (!this.currentWizard.traits) {
                this.currentWizard.traits = await this.api.getWizardTraitsById(wizardId);
            }
            if (!this.currentOpposingWizard.traits) {
                this.currentOpposingWizard.traits = await this.api.getWizardTraitsById(opposingWizardId);
            }

            // Disable loading
            this.isLoading = false;
            console.log('Wizards Compared =>', [this.currentWizard, this.currentOpposingWizard]);
        },
        // Paging
        nextWizardsPage: function () {
            // Handle next page as required
            if (this.currentWizardsPage < this.totalWizardsPages) {
                ++this.currentWizardsPage;
            }
        },
        previousWizardsPage: function () {
            // Handle previous page as required
            if (this.currentWizardsPage > 1) {
                --this.currentWizardsPage;
            }
        }
    },
    computed: {
        wizardsPage: function () {
            let wizards,
                filter;
            // Returns Wizards filtered by ID or by Affinity
            if (this.wizardsPrimaryFilter.length) {
                filter = this.wizardsPrimaryFilter;
                wizards = this.wizards.filter((wizard) => {
                    if (wizard.id.toString().indexOf(filter) > -1) {
                            return wizard;
                    }
                    if (this.affinities[wizard.affinity].toString().toLowerCase().indexOf(filter) > -1) {
                        return wizard;
                    }
                });
                if (wizards && this.currentWizardsPage) {
                    let pageStart = (this.currentWizardsPage == 1) ? 0 : this.wizardsPageSize * this.currentWizardsPage;
                    return wizards.slice(pageStart, pageStart + this.wizardsPageSize);
                } else {
                    return [];
                }
            // Returns Wizards filtered by Vulnerability
            } else if (this.wizardsVulnerabilityFilter.length > 2) {
                filter = this.wizardsVulnerabilityFilter;
                wizards = this.wizards.filter((wizard) => {
                    let weakness = this.wizardUtils.getVulnerability(parseInt(wizard.affinity));
                    if (weakness.indexOf(filter) > -1) {
                        return wizard;
                    }
                });
                if (wizards && this.currentWizardsPage) {
                    let pageStart = (this.currentWizardsPage == 1) ? 0 : this.wizardsPageSize * this.currentWizardsPage;
                    return wizards.slice(pageStart, pageStart + this.wizardsPageSize);
                } else {
                    return [];
                }
            // Returns Wizards
            } else {
                wizards = this.wizards;
                //return wizards;
                if (wizards && this.currentWizardsPage) {
                    let pageStart = (this.currentWizardsPage == 1) ? 0 : this.wizardsPageSize * this.currentWizardsPage;
                    return wizards.slice(pageStart, pageStart + this.wizardsPageSize);
                } else {
                    return [];
                }
            }
        },
        getSortedBy: function () {
            return this.sortedBy[this.wizardsSortedBy];
        }
    }
});
