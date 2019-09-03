'use strict';

const assert = require('assert');

const duelUtils = require('./duels');
const Constants = require('./constants');

const { AffinityIndexes, AffinityRelationships } = Constants;


describe("duels", () => {
  describe("getMoveResults", () => {

    it("it should respect affinity rules", () => {
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

  describe("calculateAffinityRelationship", () => {

    it("it should respect affinity rules", () => {
      // fire vs.
      let relationship = duelUtils.calculateAffinityRelationship(
        AffinityIndexes.FIRE,
        AffinityIndexes.WIND);
      expect(relationship).toEqual(AffinityRelationships.ADVANTAGED);

      relationship = duelUtils.calculateAffinityRelationship(
        AffinityIndexes.FIRE,
        AffinityIndexes.WATER);
      expect(relationship).toEqual(AffinityRelationships.DISADVANTAGED);

      relationship = duelUtils.calculateAffinityRelationship(
        AffinityIndexes.FIRE,
        AffinityIndexes.FIRE);
      expect(relationship).toEqual(AffinityRelationships.EQUAL);

      // wind vs.
      relationship = duelUtils.calculateAffinityRelationship(
        AffinityIndexes.WIND,
        AffinityIndexes.WATER);
      expect(relationship).toEqual(AffinityRelationships.ADVANTAGED);

      relationship = duelUtils.calculateAffinityRelationship(
        AffinityIndexes.WIND,
        AffinityIndexes.FIRE);
      expect(relationship).toEqual(AffinityRelationships.DISADVANTAGED);

      relationship = duelUtils.calculateAffinityRelationship(
        AffinityIndexes.WIND,
        AffinityIndexes.WIND);
      expect(relationship).toEqual(AffinityRelationships.EQUAL);

      // water vs.
      relationship = duelUtils.calculateAffinityRelationship(
        AffinityIndexes.WATER,
        AffinityIndexes.FIRE);
      expect(relationship).toEqual(AffinityRelationships.ADVANTAGED);

      relationship = duelUtils.calculateAffinityRelationship(
        AffinityIndexes.WATER,
        AffinityIndexes.WIND);
      expect(relationship).toEqual(AffinityRelationships.DISADVANTAGED);

      relationship = duelUtils.calculateAffinityRelationship(
        AffinityIndexes.WATER,
        AffinityIndexes.WATER);
      expect(relationship).toEqual(AffinityRelationships.EQUAL);
    });
  });
});
