'use strict';

// Navigation states
const VIEW_SELECTED_WIZARD = 1;
const PREDICT_MATCHES = 2;
const PREDICTION_MARKETS = 3;
const LEARN = 4;
const PLAY = 5;

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

// Contract constants
const MAINNET = 0;
const RINKEBY = 1;

// Config
const config = require('../../config');
const firebaseConfig = config.firebaseConfig;

// Modal component
Vue.component('modal', {
    template: '#modal-template'
});

// Notification component
Vue.component('notification', {
    template: '#notification-template'
});

// Sidebar component
Vue.component('sidebar', {
    template: '#sidebar-template',
    data: () => ({
        showSidebar: false
    })
});

// Pending duels component
Vue.component('pending-duel', {
    template: '#duel-request-template'
});

window.jQuery = require('jquery');

// Context menus (right-click) component
const contextMenuOptions = [
    {
        action: 'challenge',
        name: 'Challenge to a duel simulation',
        isValidPartner: null,
        wizardChallenged: null,
        wizardChallenging: null
    }/*,
    {
        action: 'message',
        name: 'Invite this user to chat'
    }*/
];
Vue.component('vue-simple-context-menu', VueSimpleContextMenu.default);

// Online users ref.
const FIREBASE = require('../../firebase');
let usersOnline = FIREBASE.firebaseDb.ref('firechat-general/user-names-online');

// Create application
if (location.href.indexOf('wizard') !== -1) {
    let vm = new Vue({
        el: '#wizard',
        data: () => ({
            // App constants
            VIEW_SELECTED_WIZARD: VIEW_SELECTED_WIZARD,
            PREDICT_MATCHES: PREDICT_MATCHES,
            PREDICTION_MARKETS: PREDICTION_MARKETS,
            LEARN: LEARN,
            PLAY: PLAY,
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
            TOTAL_WIZARDS: null,
            MAINNET: MAINNET,
            RINKEBY: RINKEBY,
            // Dependencies
            Provider: require('../../providers'),
            api: require('../../api'),
            duelUtils: require('../../duels'),
            duelStats: require('../../stats'),
            wizardUtils: require('../../wizards'),
            // Firebase
            firebase: FIREBASE,
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
                state: VIEW_SELECTED_WIZARD
            },
            userIsLoggedIn: false,
            isLoading: false,
            currentWizardsPage: 1,
            wizardsPageSize: 12,
            totalWizardsPages: null,
            totalAllWizardsPages: null,
            wizards: null,
            wizardsSortedBy: null,
            sortedBy: [
                'Most powerful first',
                'Push-overs first',
                'Most growth',
                'Most power lost',
                'Group by Affinity'
            ],
            affinities: [
                'Unknown',
                'Neutral',
                'Fire',
                'Water',
                'Wind'
            ],

            // Notifications
            notification: {
                title: null,
                text: null,
                color: null,
                position:'top-right'
            },

            // Chat
            chat: null,
            chatUser: null,
            chatStates: ['browsing', 'chatting'],
            chatState: 'browsing',
            usersOnline: [],
            notificationsCount: 0,

            // Chat interface menu and options
            testnetContextMenuOptions: contextMenuOptions,

            // Chat Duel config
            chatDuelChallengeConfig: {},
            pendingDuelRequests: [],
            activeDuelSimulation: null,
            chatChallengeModal_step1: false, // Show / Hide challenge configurator modals
            chatChallengeModal_step2: false,
            chatChallengeModal_step3: false,

            userOwnsWizards: 0,
            wizardId: null,
            currentWizard: {},
            currentOpposingWizard: {},
            activeDuelWizard: {},
            activeOpponentWizard: {}, 
            selectedWizardsByAddress: {},
            selectedWizardsByAddressModalShown: false,
            comparisonWizardsByAddressModalShown: false,
            comparisonMyWizardsModalShown: false,
            matchPrediction: null,
            predictionType: null,
            wizardsSearchType: PRIMARY_SEARCH,
            wizardsPrimaryFilter: '',
            wizardsVulnerabilityFilter: '',
            wizardsMineFilter: false,
            showSearch: false,
            showSelectedOpponentTraits: false,
            showMyWizardTraits: false,
            showOpponentTraits: false,
            manualCurrentWizardSelection: false,
            isBgAnimated: false,
            duelData: [],
            wizardDuelStatsShown: false,
            wizardDuelStats: {},
            wizardWinRate: {
                wins: 0,
                losses: 0,
                tied: 0
            },
            wizardWinPercentage: null
        }),
        firebase: {
            usersOnline: usersOnline
        },
        mounted: async function () {
            // Load Wizards and User state
            this.currentOpposingWizard = {};
            this.isBgAnimated = false;
            this.getAllWizards();
            // Animate Cheeze Melt
            setTimeout(() => {
                this.isBgAnimated = true;
            }, 100);

            // Animate Cheeze Melt
            setTimeout(() => {
                setTimeout(() => {
                    jQuery('document').ready(function () {
                        jQuery('#wizard').removeClass('hidden');
                    });
                }, 0);
            }, 0);

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
                    //console.log('Accounts =>', this.wallets);

                    // ERC721 Instances
                    this.contracts.mainnet.wizards = await this.Provider.mainnetWizardsInstance();
                    //console.log('ERC721 Contract', this.contracts.mainnet.wizards);
                    this.fetchUserWizards();
                }
            } else {
                this.isWeb3Enabled = false;
            }

            // Handle login state (returning users)
            await this.firebase.firebaseInstance.auth().onAuthStateChanged(async (user) => {
                // Once authenticated, instantiate Firechat with the logged in user
                if (user) {
                    this.chatUser = user;
                    //console.log('Auth state changed =>', chatUser);
                    this.userIsLoggedIn = true;
                    await this.setupChat(user);
                }
            });

            // Load wizard
            this.wizardId = this.getUrlParameter('id');
            this.showWizard(this.wizardId);
        },
        methods: {
            // Get Wizard param
            getUrlParameter: function (arg) {
                arg = arg.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + arg + '=([^&#]*)');
                var results = regex.exec(location.search);
                return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            },
            // Chat / Login
            login: async function () {
                // Process login as required
                if (this.userIsLoggedIn) {
                    return;
                }
                // Twitter Login (Required for Chat / "Live" Testnet Duels)
                try {
                    let chatAvailable = await this.firebase.login();
                    if (chatAvailable) {
                        this.userIsLoggedIn = true;
                        //console.log('Chat =>', this.chat);
                        //console.log('Users =>', this.usersOnline);
                        //console.log('User Wizards =>', this.tokens.mainnet.wizards);
                    }
                } catch (e) {
                    //console.log('Error logging into Firebase =>', e);
                }
            },
            logout: async function () {
                // Process logout as required
                if (!this.userIsLoggedIn) {
                    return;
                }
                // Twitter Login (Required for Chat / "Live" Testnet Duels)
                try {
                    await this.firebase.logout();
                    this.userIsLoggedIn = false;
                } catch (e) {
                    //console.log('Error logging out user from Firebase =>', e);
                }
            },
            setupChat: async function (chatUser = null) {
                if (!chatUser) {
                    return;
                }
                // Get Wizards if not fetched
                if (!this.wizards) {
                    await this.getAllWizards();
                    // Set user Wizards as required
                    if (this.userOwnsWizards && !this.tokens.mainnet.wizards.length) {
                        this.tokens.mainnet.wizards = await this.wizardUtils.getWizardsByOwnerAddress(this.wallets.mainnet, this.wizards);
                        if (this.tokens.mainnet.wizards) {
                            this.currentWizard = this.tokens.mainnet.wizards[0];
                        }
                        //console.log('User Tokens =>', this.tokens);
                    }
                } else {
                    // Set user Wizards as required
                    if (this.userOwnsWizards && !this.tokens.mainnet.wizards.length) {
                        this.tokens.mainnet.wizards = await this.wizardUtils.getWizardsByOwnerAddress(this.wallets.mainnet, this.wizards);
                        if (this.tokens.mainnet.wizards) {
                            this.currentWizard = this.tokens.mainnet.wizards[0];
                        }
                        //console.log('User Tokens =>', this.tokens);
                    }
                }

                // Add meta properties to owned wizards
                if (this.tokens.mainnet.wizards.length) {
                    for (let i = 0; i < this.tokens.mainnet.wizards.length; i++) {
                        this.tokens.mainnet.wizards[i].image = this.api.getWizardImageUrlById(this.tokens.mainnet.wizards[i].id);
                        this.tokens.mainnet.wizards[i] = this.wizardUtils.getWizardMetadata(this.tokens.mainnet.wizards[i]);
                    }
                }

                // Bootstrap chat instance
                this.chat = await this.firebase.getChat(chatUser, this.tokens.mainnet.wizards, this.wallets.mainnet);

                // Get general room and list of online users
                await this.chat.getRoom(config.firechatConfig.generalRoom, (roomData) => {
                    this.chat.generalRoom = roomData;
                });

                // Join general chat channel (all users)
                await this.chat.enterRoom(config.firechatConfig.generalRoom);

                ///////////////////////////////////
                // Chat event listener callbacks //
                ///////////////////////////////////
                // A new challenger approaches!
                this.chat.on('room-invite', async (invite) => {
                    /*
                    {
                        fromUserId: "jAAxDMcaALZzicxcXDfOFQBYjT52",
                        fromUserName: "hacking myself",
                        id: "-Lnsiv4piIRcLOHq711Z",
                        roomId: "-Lnsiv2yHoYqojMNPwkx",
                        toRoomName: "0x33Ec2fEd3E429a515ccDf361554f102eA36e0CEB-0x88b49cA334521BadA40Faa71EF3B416Fb1B161ec-1614-1353-1567541145942"
                    }

                    roomName args:
                        - challenging player wallet
                        - challenged player wallet
                        - challenging wizard id
                        - challenged wizard id
                        - timestamp
                    */
                if (invite.hasOwnProperty('toRoomName')) {
                        // Notify user of incoming challenge
                        this.notification.title = 'Incoming challenge!';
                        this.notification.text = invite.fromUserName + ' has challenged you to a duel simulation. Open chat to accept.';
                        this.notification.color = 'primary';
                        this.notification.type = 'alert';

                        let found = false;
                        for (let i = 0; i < this.pendingDuelRequests.length; i++) {
                            if (this.pendingDuelRequests[i].hasOwnProperty('roomId')) {
                                if (this.pendingDuelRequests[i].roomId == invite.roomId) {
                                    found = true;
                                }
                            }
                        }

                        if (!found) {
                            // Parse room name
                            let roomArgs = invite.toRoomName.split('-');
                            let challengingOwner = roomArgs[0];
                            let challengingWizardId = roomArgs[3];
                            let challengedWizardId = roomArgs[2];
                            // Create duel configuration object
                            this.chatDuelChallengeConfig = {
                                action: "challenge-request",
                                isValidPartner: true,
                                name: "Challenge to a duel simulation",
                                roomId: invite.roomId,
                                inviteId: invite.id,
                                isMe: challengedWizardId,
                                isOpponent: challengingWizardId
                            };
                            
                            // Fetch wizards associated with duel
                            let p1 = await this.selectPendingChallengeWizard(challengedWizardId, false);
                            let p2 = await this.selectPendingChallengeWizard(challengingWizardId, true);

                            // Notifications counter
                            ++this.notificationsCount;

                            // Add to pending duels
                            this.pendingDuelRequests.push(this.chatDuelChallengeConfig);
                            //console.log('Pending Duels =>', this.pendingDuelRequests);
                        }

                    }
                });
                // Challenge accepted / declined
                this.chat.on('room-invite-response', (inviteResponse) => {
                    /*
                    {
                        fromUserId: "kCHBUdEBs6N9Gsz46iy935e44Kf1",
                        fromUserName: "twitterName",
                        id: "-LnttynIEwSCkolqwImb",
                        roomId: "-LnttylSBkcw3fsMuPs1",
                        status: "declined",
                        toUserName: "hacking myself,
                    }
                    */
                    let found = false;
                    for (let i = 0; i < this.pendingDuelRequests.length; i++) {
                        if (this.pendingDuelRequests[i].hasOwnProperty('roomId')) {
                            if (this.pendingDuelRequests[i].roomId == inviteResponse.roomId) {
                                found = true;
                            }
                        }
                    }

                    if (inviteResponse.status) {
                        let notifier;
                        switch (inviteResponse.status) {
                            case 'declined':
                                // Notify user of challenge declined
                                this.notification.title = 'Challenge declined!';
                                this.notification.text = inviteResponse.toUserName + ' has declined your challenge.';
                                this.notification.color = 'danger';
                                this.notification.type = 'alert';
                                if (!found) {
                                    ++this.notificationsCount;
                                }
                                break;
                            case 'accepted':
                                // Notify user of incoming Duel acceptance
                                this.notification.title = 'Challenge accepted!';
                                this.notification.text = inviteResponse.toUserName + ' has accepted your challenge. Open chat to proceed with your duel simulation.';
                                this.notification.color = 'success';
                                this.notification.type = 'alert';
                                if (!found) {
                                    ++this.notificationsCount;
                                }
                                // Create active Duel from Duel config
                                this.activeDuelSimulation = this.chatDuelChallengeConfig;
                                //console.log('this.activeDuelSimulation', this.activeDuelSimulation);

                                // assume we're challenging here
                                this.activeDuelWizard = this.activeDuelSimulation.wizardChallenged;
                                this.activeOpponentWizard = this.activeDuelSimulation.wizardChallenging;
                                //console.log('accepted invite response', [this.activeDuelWizard, this.activeOpponentWizard]);
                                break;
                        }

                    }
                });
            },
            // Context Menu Handler
            contextMenuHandler: function (event, item) {
                //console.log('contextMenuHandler =>', [event, item]);
                //console.log('this.$refs =>', this.$refs);
                this.$refs.chatContextMenu.showMenu(event, item);
            },
            // Context Menu Worker
            contextMenuResolver: function (event) {

                //console.log('Option Selected =>', event);

                // Hop out if `event` is invalid
                if (!event) {
                    return;
                } else if (!event.option) {
                    return;
                } else if (!event.option.action) {
                    return;
                } else if (!event.item) {
                    return;
                } else if (!event.item['.key']) {
                    return;
                }

                // Or, process event
                switch (event.option.action) {
                    case 'challenge':
                        // Close chat pane hack :(
                        let chatCloseCtrl = document.getElementById('close_sidebar');
                        this.clickEvent(chatCloseCtrl);

                        // Begin config
                        this.chatDuelChallengeConfig = event.option;
                        // Launch modal to finalize challenger config
                        if (!event.item.wallet) {
                            //console.log('No wallet was found for the user you wish to challenge :(');
                            event.item.wallet = false;
                        }
                        // Load Wizards of the Duelist you want to challenge
                        this.fetchWizardsOwnedByAddress(event.item.wallet);
                        this.chatChallengeModal_step1 = true;
                        break;
                    default:
                        return;
                }
            },
            // Select challenge Wizards (chat Duels)
            selectChallengeWizard: async function (wizardId, isOpponent) {
                if (!wizardId) {
                    return;
                } else {
                    wizardId = parseInt(wizardId);
                }

                if (isOpponent) {
                    // Check if challenged has been issued to yourself
                    if (this.userOwnsWizards) {
                        this.chatDuelChallengeConfig.isValidPartner = true;
                        for (let i = 0; i < this.tokens.mainnet.wizards.length; i++) {
                            if (wizardId == parseInt(this.tokens.mainnet.wizards[i].id)) {
                                this.chatDuelChallengeConfig.isValidPartner = false;
                                break;
                            }
                        }
                    }
                    // Load wizard
                    this.currentOpposingWizard = await this.api.getWizardById(wizardId);
                    // Add the wizard's image url
                    this.currentOpposingWizard.image = this.api.getWizardImageUrlById(wizardId);
                    // Add metadata
                    this.currentOpposingWizard = this.wizardUtils.getWizardMetadata(this.currentOpposingWizard);
                    // Set opponent's wizard in challenge config
                    this.chatDuelChallengeConfig.wizardChallenged = this.currentOpposingWizard;
                    // Proceed to choose own wizard (Step 2)
                    this.chatChallengeModal_step2 = true;
                } else {
                    // Load wizard
                    this.currentWizard = await this.api.getWizardById(wizardId);
                    // Add the wizard's image url
                    this.currentWizard.image = this.api.getWizardImageUrlById(wizardId);
                    // Add metadata
                    this.currentWizard = this.wizardUtils.getWizardMetadata(this.currentWizard);
                    // Set opponent's wizard in challenge config
                    this.chatDuelChallengeConfig.wizardChallenging = this.currentWizard;
                    // Proceed to review and submit challenge (Step 3)
                    this.chatChallengeModal_step3 = true;
                }
                //console.log('Challenge config =>', this.chatDuelChallengeConfig);
            },
            selectPendingChallengeWizard: async function (wizardId, isOpponent) {
                if (!wizardId) {
                    return false;
                } else {
                    wizardId = parseInt(wizardId);
                }

                if (isOpponent) {
                    // Check if challenged has been issued to yourself
                    if (this.userOwnsWizards) {
                        this.chatDuelChallengeConfig.isValidPartner = true;
                        for (let i = 0; i < this.tokens.mainnet.wizards.length; i++) {
                            if (wizardId == parseInt(this.tokens.mainnet.wizards[i].id)) {
                                this.chatDuelChallengeConfig.isValidPartner = false;
                                break;
                            }
                        }
                    }
                    // Load wizard
                    this.currentOpposingPendingWizard = await this.api.getWizardById(wizardId);
                    // Add the wizard's image url
                    this.currentOpposingPendingWizard.image = this.api.getWizardImageUrlById(wizardId);
                    // Add metadata
                    this.currentOpposingPendingWizard = this.wizardUtils.getWizardMetadata(this.currentOpposingPendingWizard);
                    // Set opponent's wizard in challenge config
                    this.chatDuelChallengeConfig.wizardChallenged = this.currentOpposingPendingWizard;
                    //console.log('Challenge config =>', this.chatDuelChallengeConfig);
                    return true;
                } else {
                    // Load wizard
                    this.currentPendingWizard = await this.api.getWizardById(wizardId);
                    // Add the wizard's image url
                    this.currentPendingWizard.image = this.api.getWizardImageUrlById(wizardId);
                    // Add metadata
                    this.currentPendingWizard = this.wizardUtils.getWizardMetadata(this.currentPendingWizard);
                    // Set opponent's wizard in challenge config
                    this.chatDuelChallengeConfig.wizardChallenging = this.currentPendingWizard;
                    //console.log('Challenge config =>', this.chatDuelChallengeConfig);
                    return true;
                }
            },
            submitChallenge: async function () {
                // Hide challenge configuration modal
                let closeModalBtn = document.getElementById('modal_close');
                this.clickEvent(closeModalBtn);

                // Create duel channel and invite remote user
                let timestamp = new Date().getTime();
                let roomName = this.chatDuelChallengeConfig.wizardChallenging.owner + '-' + this.chatDuelChallengeConfig.wizardChallenged.owner + '-' + this.chatDuelChallengeConfig.wizardChallenging.id + '-' + this.chatDuelChallengeConfig.wizardChallenged.id + '-' + timestamp;

                // Create duel room
                this.chat.createRoom(roomName, 'private', (roomId) => {
                    //console.log('Created Room =>', roomId);
                    this.chatDuelChallengeConfig.roomId = roomId;
                    // Find partner in online user list
                    this.usersOnline.filter((user) => {
                        // Only valid user objects need apply
                        if (user.hasOwnProperty('wallet')) {
                            if (user.wallet.toLowerCase() == this.chatDuelChallengeConfig.wizardChallenged.owner.toLowerCase()) {
                                // Send challenge
                                if (this.chatDuelChallengeConfig.isValidPartner) {
                                    this.chat.inviteUser(user.id, roomId);
                                }
                                // Notify challenge sent
                                this.notification.title = 'Challenge sent';
                                this.notification.text = 'Your challenge has been sent to ' + user.wallet;
                                this.notification.color = 'success';
                                // Release notification
                                let notifier = document.getElementById('notifier');
                                this.clickEvent(notifier);
                            }
                        }
                    });
                });
            },
            acceptChallenge: async function (pendingIndex) {
                // Only allow accepting Duels if there are no active
                // Duel simulations currently in progress
                if (this.activeDuelSimulation) {
                    // Notify user of incoming challenge
                    this.notification.title = 'Incoming challenge!';
                    this.notification.text = invite.fromUserName + ' has challenged you to a duel simulation but you have already accepted another unresolved challenge.';
                    this.notification.color = 'warning';
                    this.notification.counterInvalid = true;
                    this.notification.type = 'alert';
                    return;
                }
                // Else, accept the Duel
                let pendingDuel = this.pendingDuelRequests[pendingIndex];
                //console.log('Accepting duel request =>', pendingDuel);
                this.chat.acceptInvite(pendingDuel.inviteId, () => {
                    let newActiveDuel = this.pendingDuelRequests.splice(pendingIndex, 1);
                    this.activeDuelSimulation = newActiveDuel[0];
                    //console.log('this.activeDuelSimulation', this.activeDuelSimulation);
                    // Remove alert and handle notifications count
                    // If user has not closed the active alert
                    if (this.notification.type) {
                        if (this.notification.type == 'alert') {
                            this.retireAlert();
                        }
                    }
                });
            },
            declineChallenge: async function (pendingIndex) {
                let pendingDuel = this.pendingDuelRequests[pendingIndex];
                //console.log('Declining duel request =>', pendingDuel);
                this.chat.declineInvite(pendingDuel.inviteId, () => {
                    this.pendingDuelRequests.splice(pendingIndex, 1);
                    // Remove alert and handle notifications count
                    // If user has not closed the active alert
                    if (this.notification.type) {
                        if (this.notification.type == 'alert') {
                            this.retireAlert();
                        }
                    }
                });
            },

            // UI
            retireAlert: function () {
                if (this.notificationsCount > 0 && !this.notification.counterInvalid) {
                    --this.notificationsCount;
                }
                // Remove alert and handle notifications count
                // If user has not closed the active alert
                if (this.notification.type) {
                    if (this.notification.type == 'alert') {
                        --this.notificationsCount;
                        this.notification = {
                            title: null,
                            text: null,
                            color: null,
                            position:'top-right'
                        };
                    }
                }
            },
            clickEvent: function (elem) {
                // Create our event (with options)
                let evt = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                // If cancelled, don't dispatch our event
                let canceled = !elem.dispatchEvent(evt);
            },
            setChildNavigation: async function (state = null, comparisonId = null) {
                // Change navigation state as required
                if (this.navigation.state == state) {
                    return;
                }
                // Handle state change
                switch(state) {
                    case 'BACK':
                        sessionStorage.setItem('search', this.getUrlParameter('id'));
                        window.location.href = "/insights";
                        return;
                    case VIEW_SELECTED_WIZARD:
                        this.isBgAnimated = false;
                        this.navigation.state = VIEW_SELECTED_WIZARD;
                        // Animate Cheeze Melt
                        setTimeout(() => {
                            this.isBgAnimated = true;
                        }, 100);
                        
                        this.showWizard(this.wizardId);

                        return false;
                    // Show match prediction
                    case PREDICT_MATCHES:
                        this.isBgAnimated = false;
                        //console.log('Match prediction mode enabled');
                        this.navigation.state = PREDICT_MATCHES;

                        // Handle state entry
                        // User's owned wizard
                        if (!this.currentWizard.selectedId && this.userOwnsWizards) {
                            if (this.tokens.mainnet.wizards) {
                                if (this.tokens.mainnet.wizards.length) {
                                    this.currentWizard.selectedId = this.tokens.mainnet.wizards[0].id;
                                }
                            }
                        }

                        // Comparison wizard
                        if (this.currentOpposingWizard.id && !this.currentOpposingWizard.selectedId) {
                            this.currentOpposingWizard.selectedId = this.currentOpposingWizard.id;
                        } else if (comparisonId && !this.currentOpposingWizard.hasOwnProperty('selectedId')) {
                            this.currentOpposingWizard.selectedId = comparisonId;
                        } else if (comparisonId && !this.currentOpposingWizard.selectedId) {
                            this.currentOpposingWizard.selectedId = comparisonId;
                        }

                        // Animate Cheeze Melt
                        setTimeout(() => {
                            this.isBgAnimated = true;
                        }, 100);

                        // Run predictor automatically on state resolultion
                        if (this.currentWizard.selectedId && this.currentOpposingWizard.selectedId) {
                            this.predictMatchOutcome(this.currentWizard.selectedId, this.currentOpposingWizard.selectedId);
                        }

                        break;
                    case PREDICTION_MARKETS:
                        window.location.href = "/markets";
                        break;
                    case LEARN:
                        window.location.href = "/learn";
                        break;
                    case PLAY:
                        // Fetch random wizards
                        if (!this.wizards) {
                            await this.getAllWizards();
                        }
                        let wizardA = this.wizards[Math.floor(Math.random() * this.wizards.length)];
                        let wizardB = this.wizards[Math.floor(Math.random() * this.wizards.length)];
                        // Return a random duel
                        window.location.href = "/duels/?wiz1=" + wizardA.id + "&wiz2=" + wizardB.id;
                        break;
                    default:
                        return;
                }
            },
            // Active Dueling
            proceedToDuel: function () {

                //console.log('duel??', this.activeDuelWizard);
                //console.log('chatDuelConfig??', this.chatDuelChallengeConfig);

                // Note, since Duels are a route option
                // there is no need to update chat counter
                // as changing routes will clear the chat
                let duel = JSON.stringify(this.activeDuelSimulation);

                // Handle receiving player args.
                if (!this.activeDuelWizard) {
                    this.activeDuelWizard = {
                        id: this.chatDuelChallengeConfig.isMe
                    };
                } else if (!this.activeDuelWizard.id) {
                    this.activeDuelWizard = {
                        id: this.chatDuelChallengeConfig.isMe
                    };
                }
                // Handle receiving player opponent args.
                if (!this.activeOpponentWizard) {
                    this.activeOpponentWizard = {
                        id: this.chatDuelChallengeConfig.isOpponent
                    };
                } else if (!this.activeOpponentWizard.id) {
                    this.activeOpponentWizard = {
                        id: this.chatDuelChallengeConfig.isOpponent
                    };
                }

                sessionStorage.setItem('duel', duel);
                sessionStorage.setItem('mode', 'challenge');
                //sessionStorage.setItem('ourWizardId', this.activeDuelWizard.id);
                //sessionStorage.setItem('opposingWizardId', this.activeOpponentWizard.id);
                sessionStorage.setItem('opposingWizardId', this.activeDuelWizard.id);
                sessionStorage.setItem('ourWizardId', this.activeOpponentWizard.id);
                // Hard navigate to duel room
                return window.location.href = '/duels';
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
                    case SORTED_BY_POWER_LEVEL_GROWTH_WEAKEST:
                        this.wizards.sort(this.wizardUtils.sortByPowerLevelGrowthReverse);
                        this.wizardsSortedBy = SORTED_BY_POWER_LEVEL_GROWTH_WEAKEST;
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
                    rarity = this.TOTAL_WIZARDS;
                } else if (isNaN(rarity)) {
                    return '';
                }
                let rarityValue = Math.round(100 * (parseInt(rarity) / this.TOTAL_WIZARDS));
                // Don't show 0% rarity, rare stats are important!
                if (rarityValue > 0) {
                    return rarityValue;
                } else {
                    // Fix decimal length to the first non-zero value
                    rarityValue = 100 * (parseInt(rarity) / this.TOTAL_WIZARDS);
                    // Make a string from rarity stat
                    let nonZeroWorker = rarityValue.toString();
                    // Split the string at the decimal place
                    nonZeroWorker = nonZeroWorker.split('.');
                    // Take only the fractional segment of the result
                    nonZeroWorker = nonZeroWorker[1];
                    // Get substring index of first non-zero char
                    let nonZeroIndex;
                    for (let i = 1; i < nonZeroWorker.length; i++) {
                        if (nonZeroWorker.charAt(i) == 0) {
                            continue
                        } else {
                            nonZeroIndex = i + 1;
                            break;
                        }
                    }
                    // Return
                    return rarityValue.toFixed(nonZeroIndex);
                }
            },
            getIconUrlForAffinity: function(affinity) {
                if (!affinity) {
                    return "";
                }
                let index = affinity;
                if (typeof(affinity) === 'string') {
                    index = parseInt(affinity);
                }

                if (index < 0 || index > 4 || !index || index == 'undefined') {
                    //console.log("Warning: affinity should be an index between 0 and 4");
                    return "";
                }

                const name = this.affinities[index].toLowerCase();

                return "/img/icons/" + name + ".svg";
            },
            getWizardImageUrl: function(wizardId) {
                return this.api.getWizardImageUrlById(wizardId);
            },
            // Getters
            getAllWizards: async function () {
                // Loading state
                this.isLoading = true;

                // Get Wizards
                let wizardsQuery = await this.api.getAllWizards();

                // Define total Wizards
                this.TOTAL_WIZARDS = wizardsQuery.wizards.length;

                // Sort Wizards
                if (!this.wizardsSortedBy) {
                    this.wizards = wizardsQuery.wizards.sort(this.wizardUtils.sortByPowerLevel);
                    this.wizardsSortedBy = SORTED_BY_POWER_LEVEL_STRONGEST;
                }

                // Get pagination args.
                this.totalWizardsPages = Math.floor(this.wizards.length / this.wizardsPageSize);
                this.totalAllWizardsPages = this.totalWizardsPages;

                // Set user Wizards as required
                if (this.wallets.mainnet) {
                    this.tokens.mainnet.wizards = await this.wizardUtils.getWizardsByOwnerAddress(this.wallets.mainnet, this.wizards);
                    // Add meta properties to owned wizards
                    if (this.tokens.mainnet.wizards.length) {
                        this.userOwnsWizards = this.tokens.mainnet.wizards.length;
                        for (let i = 0; i < this.tokens.mainnet.wizards.length; i++) {
                            this.tokens.mainnet.wizards[i].image = this.api.getWizardImageUrlById(this.tokens.mainnet.wizards[i].id);
                            this.tokens.mainnet.wizards[i] = this.wizardUtils.getWizardMetadata(this.tokens.mainnet.wizards[i]);
                        }
                    }

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
                    //userTotalWizards = await this.contracts.mainnet.wizards.methods.balanceOf(this.wallets.mainnet).call();
                    // If user has Wizards -> get wizards
                    let userTotalWizards = 0;

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
                    
                this.selectedWizardsByAddress = await this.wizardUtils.getWizardsByOwnerAddress(ownerAddress, this.wizards);

                // Add metadata properties
                for (let i = 0; i < this.selectedWizardsByAddress.length; i++) {
                    this.selectedWizardsByAddress[i].image = this.api.getWizardImageUrlById(this.selectedWizardsByAddress[i].id);
                    this.selectedWizardsByAddress[i] = this.wizardUtils.getWizardMetadata(this.selectedWizardsByAddress[i]);
                }

                //console.log('Wizards of owner =>', this.selectedWizardsByAddress);
            },
            // View worker
            showAllWizardsOfOwner: async function (ownerAddress, isComparisonMode = false, self = false) {
                // Nothing to do here...
                if (!ownerAddress) {
                    return;
                }
                // Fetch Wizards
                this.fetchWizardsOwnedByAddress(ownerAddress);

                // Launch modal
                if (!isComparisonMode) {
                    // Show browse single Wizard modal
                    this.selectedWizardsByAddressModalShown = true;
                } else if (isComparisonMode && !self)  {
                    //console.log('show opponent wizards');
                    // Show comparison opponent Wizards
                    this.comparisonWizardsByAddressModalShown = true;
                } else {
                    //console.log('show my wizards');
                    // Show all my Wizards
                    this.comparisonMyWizardsModalShown = true;
                }
            },
            showWizard: async function (wizardId = null) {
                if (wizardId == null) {
                    return;
                } else {
                    wizardId = parseInt(wizardId);
                    this.setChildNavigation(VIEW_SELECTED_WIZARD);
                    this.isLoading = true;
                }

                // Update state tracker and query args
                if (this.wizardId !== wizardId) {
                    this.wizardId = wizardId;
                    //window.location.search = 'id=' + wizardId;
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
                const duels = await this.api.getDuelsByWizardId(wizardId);
                this.currentOpposingWizard.duels = this.duelUtils.addDuelDisplayDataArray(duels.duels);
                this.currentOpposingWizard.duels.sort(this.wizardUtils.sortByDuelTimeRecentFirst);

                for (let i = 0; i < this.currentOpposingWizard.duels.length; i++) {
                    if (this.currentOpposingWizard.duels[i].endBlock) {
                        this.currentOpposingWizard
                            .duels[i]
                            .timestamp = await this.getTimeFromBlock(this.currentOpposingWizard.duels[i].endBlock);
                    }
                }

                this.duelData = this.currentOpposingWizard.duels;
                //console.log('this.currentOpposingWizard.duels', this.currentOpposingWizard.duels);

                // Disable loading
                this.isLoading = false;
                this.$forceUpdate();
            },
            getTimeFromBlock: async function (blockNumber) {
                if (!blockNumber) {
                    return '';
                }
                blockNumber = parseInt(blockNumber);
                let timestamp = '';
                if (this.wallets.mainnet) {
                    let block = await this.web3Providers.mainnet.eth.getBlock(blockNumber);
                    timestamp = block.timestamp;
                    return timestamp;
                } else {
                    return timestamp;
                }
            },
            prettyTime: function (timestamp) {
                if (!timestamp) {
                    return '';
                }
                let dateObj = new Date(timestamp * 1000);
                let date = dateObj.toDateString();
                let time = dateObj.toLocaleTimeString();
                return date + ', ' + time;
            },
            showComparisonWizard: async function (wizardId = null) {
                // Nothing to do..
                if (!wizardId) {
                    return;
                }
                // Else
                this.currentOpposingWizard.selectedId = wizardId;
                this.predictMatchOutcome(this.currentWizard.selectedId, this.currentOpposingWizard.selectedId);
            },
            showMyComparisonWizard: async function (wizardId = null) {
                // Nothing to do..
                if (!wizardId) {
                    return;
                }
                // Else
                this.currentWizard.selectedId = wizardId;
                this.predictMatchOutcome(this.currentWizard.selectedId, this.currentOpposingWizard.selectedId);
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
                this.setChildNavigation(PREDICT_MATCHES);
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
                //console.log('Prediction =>', this.matchPrediction);

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
                //console.log('Wizards Compared =>', [this.currentWizard, this.currentOpposingWizard]);

                // Scroll to top of page (useful when running predictions from modal pop-ups)
                window.scrollTo(0,0);
            },
            getWinPercentage: function (wins, losses, tied) {
                if (isNaN(wins) || isNaN(losses) || isNaN(tied)) {
                        return '';
                }
                wins = wins + tied;
                let total = wins + losses;
                let percentage = wins / total * 100;
                //console.log('wins, losses, total, percentage', [wins, losses, total, percentage]);
                return percentage.toFixed(2);
            },
            showWizardDuelStats: async function(wizardId) {
                const that = this;
                this.wizardDuelStatsShown = true;

                // fetch duel stats
                const response = await this.api.getDuelsByWizardId(wizardId);
                const duels = response.duels;

                that.wizardDuelStats = that.duelStats.calculateDuelStatsOverall(duels, parseInt(wizardId));

                // TODO: UI should dress this up
                that.wizardDuelStats.powerHigh = that.getPrettyPowerLevel(that.wizardDuelStats.powerHigh);
                that.wizardDuelStats.powerLow = that.getPrettyPowerLevel(that.wizardDuelStats.powerLow);
            },
        },
        watch: {
            // Computed Win rate
            duelData: {
                immediate: true,
                async handler (duels) {
                    await duels;
                    if (!duels) {
                        return;
                    } else if (!duels.length) {
                        return;
                    }
                    let wins = 0;
                    let losses = 0;
                    let tied = 0;
                    // Set block time and win rate stats
                    for (let i = 0; i < duels.length; i++) {
                        if (duels[i].timedOut) {
                            continue;
                        }
                        // Match duel.wizard1
                        if (parseInt(duels[i].wizard1Id) == parseInt(this.wizardId)) {
                            if (!duels[i].wizard1DidWin) {
                                // Losses
                                ++losses;
                            } else {
                                // Ties
                                if (duels[i].wizard2DidWin) {
                                    ++tied;
                                // Wins
                                } else {
                                    ++wins;
                                }
                            }
                        }
                        // Match duel.wizard2
                        if (parseInt(duels[i].wizard2Id) == parseInt(this.wizardId)) {
                            if (!duels[i].wizard2DidWin) {
                                // Losses
                                ++losses;
                            } else {
                                // Ties
                                if (duels[i].wizard1DidWin) {
                                    ++tied;
                                // Wins
                                } else {
                                    ++wins;
                                }
                            }
                        }
                        if (i == (duels.length - 1)) {
                            // Set win rate in UI
                            this.wizardWinRate.wins = wins;
                            this.wizardWinRate.losses = losses;
                            this.wizardWinRate.tied = tied;
                            //console.log([this.wizardWinRate, this.wizardId, duels]);
                        }
                    }
                }
            }
        },
        computed: {
            // Get list of online users (Twitter login)
            // That have a web3 wallet
            onlineUsers: function () {
                return this.usersOnline.filter((user) => {
                    //console.log(user);
                    // Find user in online user list
                    if (user.hasOwnProperty('wallet')) {
                        return user;
                    }
                });
            }
        }
    });
}
