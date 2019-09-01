'use strict';

const config = require('./config');
const wizardUtils = require('./wizards');

/*
 * Example duel JSON from Alchemy API:
{
    "id":"0x18d53c42aff5ef1a6603f79c26e4c43fe50c6a270025a94df96332d699e39155",
    "wizard1Id":"1151",
    "wizard2Id":"1149",
    "affinity1":4,
    "affinity2":3,
    "startPower1":"71099841732970",
    "startPower2":"71284821480208",
    "endPower1":"142384663213178",
    "endPower2":"0",
    "moveSet1":"0x0404040404000000000000000000000000000000000000000000000000000000",
    "moveSet2":"0x0303030303000000000000000000000000000000000000000000000000000000",
    "startBlock":4943216,
    "endBlock":4943221,
    "timeoutBlock":4943666,
    "timedOut":false,
    "isAscensionBattle":false
}
*/

/**
 * Given a 'duel' object from the API, this will
 * create an object ready for display by the UI
 */
const addDuelDisplayData = (duel) => {
    const duelDisplayObj = {...duel};

    duelDisplayObj.wizard1SvgUrl = config.imageStorageUrl + duel.wizard1Id +".svg";
    duelDisplayObj.wizard2SvgUrl = config.imageStorageUrl + duel.wizard2Id +".svg";

    // calculate gain or loss
    const gain1 = (duel.endPower1 - duel.startPower1);
    const gain2 = (duel.endPower2 - duel.startPower2);
    duelDisplayObj.wizard1Gain = gain1;
    duelDisplayObj.wizard2Gain = gain2;

    duelDisplayObj.wizard1DidWin = (gain1 >= 0);
    duelDisplayObj.wizard2DidWin = (gain2 >= 0);

    return duelDisplayObj;
}

/**
 * Given an array of duel objects, returns an array of the same objects
 * with display data added (see addDuelDisplayData())
 */
const addDuelDisplayDataArray = (arr) => {
    const displayArray = [];

    for (const duel of arr) {
        displayArray.push(addDuelDisplayData(duel));
    }

    return displayArray;
};

module.exports = {
    addDuelDisplayData,
    addDuelDisplayDataArray,
};

