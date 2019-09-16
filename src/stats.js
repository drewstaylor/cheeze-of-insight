'use strict';

const duelUtils = require('./duels');

const Constants = require('./constants');

const { ADVANTAGED, DISADVANTAGED, EQUAL } = Constants.AffinityRelationships;
const { FIRE, WIND, WATER, NEUTRAL } = Constants.AffinityIndexes;

const emptyStats = {
    usesOwnAffinityVsNeutral: 0,
    usesOwnAffinityVsSame: 0,
    usesOwnAffinityWhileAdvantaged: 0,
    usesOwnAffinityWhileDisadvantaged: 0,

    usesOpponentsWeaknessVsSame: 0,
    usesOpponentsWeaknessWhileAdvantaged: 0,
    usesOpponentsWeaknessWhileDisadvantaged: 0,

    usesOwnWeaknessVsSame: 0,
    usesOwnWeaknessWhileAdvantaged: 0,
    usesOwnWeaknessWhileDisadvantaged: 0,
};

/**
 * Given an array of duels for a given wizard, calculates some stats about overall
 * duel outcomes.
 *
 * @param wizardId is the id for the wizard we want to collect stats about
 * @param duels should be an array of duel objects (e.g. from the Alchemy API)
 * @return an object containing aggregate duel stats, example:
 *
 * {
 *   wins: 6,
 *   losses: 4,
 *   winRate: 0.6,
 *   powerHigh: 100000000000000,
 *   powerLow: 0,
 * }
 */
const calculateDuelStatsOverall = (duels, wizardId) => {
    const stats = {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winRate: 0.0,
        powerHigh: 0,
        powerLow: Number.MAX_VALUE,
        moveStats: null,
        aggregateMoveStats: null,
    }

    for (const duel of duels) {
        // TODO: handle timeout or other duels we don't care about

        // pull out stats we want based on whether wizard is 'wizard1' or 'wizard2'
        let affinity = null;
        let startPower = null;
        let endPower = null;
        let moveset = null;
        let opponentAffinity = null;

        console.log("duel.moveSet1 => ", duel.moveSet1);
        console.log("duel.moveSet2 => ", duel.moveSet2);

        // match our desired wizard in this duel or ignore it
        if (wizardId == duel.wizard1Id) {
            affinity = duel.affinity1;
            startPower = duel.startPower1;
            endPower = duel.endPower1;
            moveset = duel.moveSet1;
            opponentAffinity = duel.affinity2;

        } else if (wizardId == duel.wizard2Id) {
            affinity = duel.affinity2;
            startPower = duel.startPower2;
            endPower = duel.endPower2;
            moveset = duel.moveSet2;
            opponentAffinity = duel.affinity1;

        } else {
            continue;
        }

        // convert strings to numbers
        affinity = parseInt(affinity);
        startPower = parseInt(startPower);
        endPower = parseInt(endPower);
        // moveset = duelUtils.convertMovesetToIntArray(moveset);

        console.log("moveset: => ", moveset);

        stats.moveStats = calculateWizardMovesetStats(affinity, opponentAffinity, moveset, stats.moveStats);

        // TODO: handle tie
        const isWin = (endPower > startPower);

        stats.totalMatches++;

        if (isWin) {
            stats.wins++;
        } else {
            stats.losses++;
        }

        stats.powerHigh = Math.max(stats.powerHigh, startPower, endPower);
        stats.powerLow = Math.min(stats.powerLow, startPower, endPower);
    }

    if (stats.totalMatches > 0) {
        stats.winRate = stats.wins / stats.totalMatches;
    }

    if (stats.powerLow == Number.MAX_VALUE) {
        stats.powerLow = 0;
    }

    stats.aggregateMoveStats = aggregateStats(stats.moveStats);

    return stats;
}

/**
 * Calculates stats for the moves made by one wizard against another. These stats fall
 * into different categories:
 *
 *   // a move that play's to the wizard's affinity
 *   usesOwnAffinityVsNeutral: 0,
 *   usesOwnAffinityVsSame: 0,
 *   usesOwnAffinityWhileAdvantaged: 0,
 *   usesOwnAffinityWhileDisadvantaged: 0,
 *
 *   // a move that play's to the opponent's weakness
 *   usesOpponentsWeaknessVsSame: 0,
 *   usesOpponentsWeaknessWhileAdvantaged: 0,
 *   usesOpponentsWeaknessWhileDisadvantaged: 0,
 *
 *   // a move that play's against the wizard's affinity
 *   usesOwnWeaknessVsSame: 0,
 *   usesOwnWeaknessWhileAdvantaged: 0,
 *   usesOwnWeaknessWhileDisadvantaged: 0,
 *
 * @param wizardAffinity is the affinity index of the wizard for which we are generating stats
 * @param opponentAffinity is the affinity index of the opposing wizard
 * @param move is the wizard's move against its opponent
 * @param stats should be an existing stats object to accumulate results into, or null for a fresh one
 *
 * @return an object with stats for the given match
 */
const calculateWizardMoveStats = (wizardAffinity, opponentAffinity, move, stats=null) => {

    if (! stats) {
        stats = {...emptyStats};
    }

    const matchRelationship = duelUtils.calculateAffinityRelationship(wizardAffinity, opponentAffinity);
    const moveRelationship = duelUtils.calculateAffinityRelationship(move, opponentAffinity);
    let relationship = null;

    // calculate "own affinity" stats
    if (wizardAffinity == move) {
        if (opponentAffinity == NEUTRAL) {
            stats.usesOwnAffinityVsNeutral++;
        } else {
            switch (matchRelationship) {
                case ADVANTAGED:
                    stats.usesOwnAffinityWhileAdvantaged++;
                    break;
                case DISADVANTAGED:
                    stats.usesOwnAffinityWhileDisadvantaged++;
                    break;
                case EQUAL:
                    stats.usesOwnAffinityVsSame++;
                    break;
                default:
                    break;
            }
        }
    }

    // calculate "uses-opponent's-weakness" stats
    if (opponentAffinity != NEUTRAL && moveRelationship == ADVANTAGED) {
        switch (matchRelationship) {
            case ADVANTAGED:
                stats.usesOpponentsWeaknessWhileAdvantaged++;
                break;
            case DISADVANTAGED:
                stats.usesOpponentsWeaknessWhileDisadvantaged++;
                break;
            case EQUAL:
                stats.usesOpponentsWeaknessVsSame++;
                break;
            default:
                break;
        }
    }

    // calculate uses-own-weakness stats (think of this is as "as if we attacked ourselves")
    const ownRelationship = duelUtils.calculateAffinityRelationship(move, wizardAffinity);
    if (ownRelationship == ADVANTAGED) { 
        switch(matchRelationship) {
            case ADVANTAGED:
                stats.usesOwnWeaknessWhileAdvantaged++;
                break;
            case DISADVANTAGED:
                stats.usesOwnWeaknessWhileDisadvantaged++;
                break;
            case EQUAL:
                stats.usesOwnWeaknessVsSame++;
                break;
            default:
                break;
        }
    }

    return stats;
}


/**
 * Calculates stats for each move in the moveset, using calculateWizardMoveStats()
 *
 * @param wizardAffinity is the affinity index of the wizard for which we are generating stats
 * @param opponentAffinity is the affinity index of the opposing wizard
 * @param moveset should be an array of moves (e.g. standard 5 round moveset)
 * @param statsset should be an existing stats array of length >= moveset, or a new one will be created if left null
 *
 * @return an object with stats for the given match
 */
const calculateWizardMovesetStats = (wizardAffinity, opponentAffinity, moveset, statsset=null) => {

    if (! statsset) {
        statsset = [];
        for (const i in moveset) {
            statsset[i] = {...emptyStats};
        }
    }

    for (const i in moveset) {
        const move = moveset[i];
        let stats = statsset[i];
        stats = calculateWizardMoveStats(wizardAffinity, opponentAffinity, move, stats);
    }

    return statsset;
}

/**
 * Takes an array of stats and accumulates them all into one output
 */
const aggregateStats = function(statsArray) {
    const aggregate = {...emptyStats};
    console.log("initial stats => ", aggregate);
    for (const stats of statsArray) {
        console.log("adding stats => ", stats);

        aggregate.usesOwnAffinityVsNeutral += stats.usesOwnAffinityVsNeutral;
        aggregate.usesOwnAffinityVsSame += stats.usesOwnAffinityVsSame;
        aggregate.usesOwnAffinityWhileAdvantaged += stats.usesOwnAffinityWhileAdvantaged;
        aggregate.usesOwnAffinityWhileDisadvantaged += stats.usesOwnAffinityWhileDisadvantaged;

        aggregate.usesOpponentsWeaknessVsSame += stats.usesOpponentsWeaknessVsSame;
        aggregate.usesOpponentsWeaknessWhileAdvantaged += stats.usesOpponentsWeaknessWhileAdvantaged;
        aggregate.usesOpponentsWeaknessWhileDisadvantaged += stats.usesOpponentsWeaknessWhileDisadvantaged;

        aggregate.usesOwnWeaknessVsSame += stats.usesOwnWeaknessVsSame;
        aggregate.usesOwnWeaknessWhileAdvantaged += stats.usesOwnWeaknessWhileAdvantaged;
        aggregate.usesOwnWeaknessWhileDisadvantaged += stats.usesOwnWeaknessWhileDisadvantaged;
    }

    return aggregate;
}

module.exports = {
    calculateDuelStatsOverall,
    calculateWizardMoveStats,
    calculateWizardMovesetStats,
};

