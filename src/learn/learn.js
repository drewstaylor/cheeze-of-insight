'use strict';

window.jQuery = require('jquery');

// Create application
if (location.href.indexOf('learn') !== -1) {
    let learnVm = new Vue({
        el: '#learn',
        data: () => ({
            api: require('../api'),
            wizardUtils: require('../wizards'),
            isBgAnimated: false,
            wizards: null,
            currentWizard: {},
            currentOpposingWizard: {},
            affinities: [
                'Unknown',
                'Neutral',
                'Fire',
                'Water',
                'Wind'
            ],
            matchUpReady: false,
            steps: [0,1,2],
            step: 0
        }),
        mounted: async function () {
            // Animate Cheeze Melt
            setTimeout(() => {
                this.isBgAnimated = true;
                setTimeout(() => {
                    jQuery('document').ready(function () {
                        jQuery('#learn').removeClass('hidden');
                    });
                }, 0);
            }, 0);

            // Load all wizards
            this.getAllWizards();
        },
        methods: {
            // Menu Nav
            goHome: function () {
                return window.location.href = "/";
            },
            goPredict: function () {
                return window.location.href = "/markets";
            },
            getAllWizards: async function () {
                // Get Wizards
                let wizardsQuery = await this.api.getAllWizards();
                // Sort Wizards
                this.wizards = wizardsQuery.wizards.sort(this.wizardUtils.sortByPowerLevel);
                //console.log('All wizards', this.wizards);
            },
            generateMatchUp: function () {
                this.matchUpReady = false;
                // Fetch random wizards
                this.currentWizard = this.wizards[Math.floor(Math.random() * this.wizards.length)];
                this.currentOpposingWizard = this.wizards[Math.floor(Math.random() * this.wizards.length)];

                // Fetch wizard metadata
                this.currentWizard.image = this.api.getWizardImageUrlById(this.currentWizard.id);
                this.currentWizard = this.wizardUtils.getWizardMetadata(this.currentWizard);
                this.currentOpposingWizard.image = this.api.getWizardImageUrlById(this.currentOpposingWizard.id);
                this.currentOpposingWizard = this.wizardUtils.getWizardMetadata(this.currentOpposingWizard);

                // Matchup ready
                this.matchUpReady = true;
            },
            getPrettyPowerLevel: function (powerLevel) {
                if (isNaN(powerLevel)) {
                    return '';
                }
                return Math.round(powerLevel / 1000000000000);
            },
            proceedToDuel: function (wizardA, wizardB) {
                // URI Scheme: /duels/?wiz1=1614&wiz2=230
                window.location.href = "/duels/?wiz1=" + wizardA + "&wiz2=" + wizardB;
            }
        }
    });
}