'use strict';

const assert = require('assert');

const statsUtils = require('./stats');
const Constants = require('./constants');

const { NEUTRAL, FIRE, WIND, WATER } = Constants.AffinityIndexes;

const emptyOverallStats = {
  totalMatches: 0,
  wins: 0,
  losses: 0,
  winRate: 0.0,
  powerHigh: 0,
  powerLow: 0,
};

const emptyWizardMoveStats = {
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

const emptyDuel = {
  id: "0x0000000000000000000000000000000000000000000000000000000000000000",
  wizard1Id: "1",
  wizard2Id: "2",
  affinity1: 4,
  affinity2: 3,
  startPower1: "10000000000000",
  startPower2: "10000000000000",
  endPower1: "20000000000000",
  endPower2: "0",
  moveSet1: "0x0404040404000000000000000000000000000000000000000000000000000000",
  moveSet2: "0x0303030303000000000000000000000000000000000000000000000000000000",
  startBlock: 1,
  endBlock: 2,
  timeoutBlock: 3,
  timedOut: false,
  isAscensionBattle: false,
};

describe("stats", () => {
  describe("calculateDuelStatsOverall", () => {

    it("should return valid results on empty array", () => {
      const stats = statsUtils.calculateDuelStatsOverall([], 0);

      expect(stats).toEqual(emptyOverallStats);
    });

    it("should ignore stats for other wizards", () => {
      const duels = [
        emptyDuel,
      ];

      const stats = statsUtils.calculateDuelStatsOverall(duels, 3);

      expect(stats).toEqual(emptyOverallStats);
    });

    it("should calculate basic stats for desired wizard", () => {
      const duels = [
        {...emptyDuel,
          ...{
            wizard1Id: "1",
            wizard2Id: "2",
            // end > start, this is a win for wiz1
            startPower1: "1",
            endPower1: "2",
          },
        },
        {...emptyDuel,
          ...{
            wizard1Id: "1",
            wizard2Id: "2",
            // end > start, this is a win for wiz1
            startPower1: "2",
            endPower1: "3",
          }
        },
        {...emptyDuel,
          ...{
            wizard1Id: "1",
            wizard2Id: "2",
            // end > start, this is a loss for wiz1
            startPower1: "2",
            endPower1: "1",
          }
        },
      ];

      const stats = statsUtils.calculateDuelStatsOverall(duels, 1);

      expect(stats).toEqual(
        {...emptyOverallStats,
          ...{
            totalMatches: 3,
            wins: 2,
            losses: 1,
            winRate: (2/3),
            powerHigh: 3,
            powerLow: 1,
          }
        }
      );
    });

  });

  describe("calculateWizardMoveStats", () => {

    let stats = null;

    describe("calculate own affinity setups properly", () => {

      it("should calculate own affinity vs neutral properly", () => {
        stats = statsUtils.calculateWizardMoveStats(FIRE, NEUTRAL, FIRE);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOwnAffinityVsNeutral: 1,
            }
          });
      });

      it("should calculate own affinity vs same properly", () => {
        stats = statsUtils.calculateWizardMoveStats(FIRE, FIRE, FIRE);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOwnAffinityVsSame: 1,
            }
          });
      });

      it("should calculate own affinity while advantaged properly", () => {
        stats = statsUtils.calculateWizardMoveStats(FIRE, WIND, FIRE);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOwnAffinityWhileAdvantaged: 1,
              usesOpponentsWeaknessWhileAdvantaged: 1,
            }
          });
      });

      it("should calculate own affinity while disadvantaged properly", () => {
        stats = statsUtils.calculateWizardMoveStats(FIRE, WATER, FIRE);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOwnAffinityWhileDisadvantaged: 1,
            }
          });
      });

    });

    describe("calculate opponent weakness setups properly", () => {

      it("should calculate opponent weakness vs same properly", () => {
        stats = statsUtils.calculateWizardMoveStats(WATER, WATER, WIND);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOpponentsWeaknessVsSame: 1,
              usesOwnWeaknessVsSame: 1,
            }
          });
      });

      it("should calculate opponent weakness while advantaged properly", () => {
        stats = statsUtils.calculateWizardMoveStats(WATER, FIRE, WATER);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOwnAffinityWhileAdvantaged: 1,
              usesOpponentsWeaknessWhileAdvantaged: 1,
            }
          });
      });

      it("should calculate opponent weakness while disadvantaged properly", () => {
        stats = statsUtils.calculateWizardMoveStats(WATER, WIND, WATER);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOwnAffinityWhileDisadvantaged: 1,
            }
          });
      });

    });

    describe("calculate 'own' weakness setups properly", () => {

      it("should calculate opponent weakness vs same properly", () => {
        stats = statsUtils.calculateWizardMoveStats(WATER, WATER, WIND);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOwnWeaknessVsSame: 1,
              usesOpponentsWeaknessVsSame: 1,
            }
          });
      });

      it("should calculate opponent weakness while advantaged properly", () => {
        stats = statsUtils.calculateWizardMoveStats(WATER, FIRE, WIND);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOwnWeaknessWhileAdvantaged: 1,
            }
          });
      });

      it("should calculate opponent weakness while disadvantaged properly", () => {
        stats = statsUtils.calculateWizardMoveStats(FIRE, WATER, WATER);
        expect(stats).toEqual(
          {...emptyWizardMoveStats,
            ...{
              usesOwnWeaknessWhileDisadvantaged: 1,
            }
          });
      });

    });

    describe("not detect any stats when there are none", () => {

      it("shouldn't detect any stats when WATER, FIRE, FIRE", () => {
        stats = statsUtils.calculateWizardMoveStats(WATER, FIRE, FIRE);
        expect(stats).toEqual(emptyWizardMoveStats);
      });

      it("shouldn't detect any stats when WATER, NEUTRAL, FIRE", () => {
        stats = statsUtils.calculateWizardMoveStats(WATER, NEUTRAL, FIRE);
        expect(stats).toEqual(emptyWizardMoveStats);
      });

    });
  });
});
