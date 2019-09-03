'use strict';

const assert = require('assert');

const duelUtils = require('./duels');
const Constants = require('./constants');



describe("duels", () => {
  describe("getMoveResults", () => {

    it("it should affinity rules", () => {
      let results = duelUtils.getMoveResults(
        Constants.AffinityIndexes.FIRE,
        Constants.AffinityIndexes.WIND);
      expect(results.winner).toEqual("p1");

      results = duelUtils.getMoveResults(
        Constants.AffinityIndexes.WIND,
        Constants.AffinityIndexes.WATER);
      expect(results.winner).toEqual("p1");

      results = duelUtils.getMoveResults(
        Constants.AffinityIndexes.WATER,
        Constants.AffinityIndexes.FIRE);
      expect(results.winner).toEqual("p1");

      results = duelUtils.getMoveResults(
        Constants.AffinityIndexes.WIND,
        Constants.AffinityIndexes.FIRE);
      expect(results.winner).toEqual("p2");

      results = duelUtils.getMoveResults(
        Constants.AffinityIndexes.WATER,
        Constants.AffinityIndexes.WIND);
      expect(results.winner).toEqual("p2");

      results = duelUtils.getMoveResults(
        Constants.AffinityIndexes.FIRE,
        Constants.AffinityIndexes.WATER);
      expect(results.winner).toEqual("p2");

      results = duelUtils.getMoveResults(
        Constants.AffinityIndexes.WATER,
        Constants.AffinityIndexes.WATER);
      expect(results.winner).toEqual("tie");

    });

  });
});
