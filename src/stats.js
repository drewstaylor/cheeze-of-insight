'use strict';

const duelUtils = require('./duels');

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
    }

    for (const duel of duels) {
        // TODO: handle timeout or other duels we don't care about

        // pull out stats we want based on whether wizard is 'wizard1' or 'wizard2'
        let affinity = null;
        let startPower = null;
        let endPower = null;
        let moveset = null;

        // match our desired wizard in this duel or ignore it
        if (wizardId == duel.wizard1Id) {
            affinity = duel.affinity1;
            startPower = duel.startPower1;
            endPower = duel.endPower1;
            moveset = duel.moveSet1;

        } else if (wizardId == duel.wizard2Id) {
            affinity = duel.affinity2;
            startPower = duel.startPower2;
            endPower = duel.endPower2;
            moveset = duel.moveSet2;

        } else {
            continue;
        }

        // convert strings to numbers
        affinity = parseInt(affinity);
        startPower = parseInt(startPower);
        endPower = parseInt(endPower);
        moveset = duelUtils.convertMovesetToIntArray(moveset);

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

    return stats;
}

module.exports = {
    calculateDuelStatsOverall,
};

