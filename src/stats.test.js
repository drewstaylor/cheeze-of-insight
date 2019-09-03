'use strict';

const assert = require('assert');

const statsUtils = require('./stats');

const emptyOverallStats = {
  totalMatches: 0,
  wins: 0,
  losses: 0,
  winRate: 0.0,
  powerHigh: 0,
  powerLow: 0,
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
});
