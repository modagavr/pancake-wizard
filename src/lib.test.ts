import { parseEther } from "@ethersproject/units";
import { isBearBet, STRATEGIES } from "./lib";

describe("Lib", () => {
  describe("Should calculate the bet decision correctly", () => {
    it("Standard Strategy", () => {
      expect(
        isBearBet(parseEther("1"), parseEther("2"), STRATEGIES.Standard)
      ).toStrictEqual(false);

      expect(isBearBet(parseEther("1"), parseEther("2"))).toStrictEqual(false);

      expect(isBearBet(parseEther("2"), parseEther("1"))).toStrictEqual(true);

      expect(isBearBet(parseEther("1"), parseEther("6"))).toStrictEqual(true);

      expect(isBearBet(parseEther("6"), parseEther("1"))).toStrictEqual(false);
    });

    it("Experimental Strategy", () => {
      expect(
        isBearBet(parseEther("1"), parseEther("2"), STRATEGIES.Experimental)
      ).toStrictEqual(true);

      expect(
        isBearBet(parseEther("1"), parseEther("2"), STRATEGIES.Experimental)
      ).toStrictEqual(true);

      expect(
        isBearBet(parseEther("2"), parseEther("1"), STRATEGIES.Experimental)
      ).toStrictEqual(false);

      expect(
        isBearBet(parseEther("1"), parseEther("6"), STRATEGIES.Experimental)
      ).toStrictEqual(false);

      expect(
        isBearBet(parseEther("6"), parseEther("1"), STRATEGIES.Experimental)
      ).toStrictEqual(true);
    });
  });
});
