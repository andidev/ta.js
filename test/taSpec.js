'use strict';

/*globals Player:false, Song: false*/

describe("ta.js", function() {
  var stockPrices;

  beforeEach(function() {
    stockPrices = [1, 2, 3, 4, 5, 1];
  });

  describe("TA([1, 2, 3, 1]).asArray()", function() {
      it("should return the array ([1, 2, 3, 1]) of the TA object", function() {
        var result = TA([1, 2, 3, 1]).asArray();
        expect(result).toEqual([1, 2, 3, 1]);
      });
  });

  describe("TA([1, 2, 3, 1]).max()", function() {
      it("should return the max value (3)", function() {
        var result = TA([1, 2, 3, 1]).max();
        expect(result).toEqual(3);
      });
  });

  describe("TA([1, 2, 3, 1]).min()", function() {
      it("should return the min value (1)", function() {
        var result = TA([1, 2, 3, 1]).min();
        expect(result).toEqual(1);
      });
  });

  describe("TA([1, 2, 3, 1]).sum()", function() {
      it("should return the sum (7)", function() {
        var result = TA([1, 2, 3, 1]).sum();
        expect(result).toEqual(7);
      });
  });

  describe("TA([1, 2, 3, 1]).plus([1, 2, 3, 0])", function() {
      it("should return the sum (5) based on a part of the array (array.slice(1, 3))", function() {
        var result = TA([1, 2, 3, 1]).plus([1, 2, 3, 0]).asArray();
        expect(result).toEqual([2, 4, 6, 1]);
      });
  });

  describe("TA([1, 2, 3, 1]).minus([1, 2, 3, 0])", function() {
      it("should return the sum (5) based on a part of the array (array.slice(1, 3))", function() {
        var result = TA([1, 2, 3, 1]).minus([1, 2, 3, 0]).asArray();
        expect(result).toEqual([0, 0, 0, 1]);
      });
  });

  describe("TA([1, 2, 3]).a()", function() {
      it("should return the avarage (2)", function() {
        var result = TA([1, 2, 3]).a();
        expect(result).toEqual(2);
      });
  });

  describe("TA([1, 2, 3, 1]).a(1, 3)", function() {
      it("should return the avarage (2.5) based on a part of the array (array.slice(1, 3))", function() {
        var result = TA([1, 2, 3, 1]).a(1, 3);
        expect(result).toEqual(2.5);
      });
  });

  describe("TA([1, 2, 3, 1]).sma(2)", function() {
      it("should calculate the simple moving avarage", function() {
        var result = TA([1, 2, 3, 1]).sma(2).asArray();
        expect(result).toEqual([null, 1.5, 2.5, 2]);
      });
  });

  describe("TA([9, 1, 2, 3, 1, 9]).sma(2, 1, 5)", function() {
      it("should calculate the simple moving avarage based on a part of the array (array.slice(1, 5))", function() {
        var result = TA([9, 1, 2, 3, 1, 9]).sma(2, 1, 5).asArray();
        expect(result).toEqual([5, 1.5, 2.5, 2]);
      });
  });

  describe("TA([1, 2, 3, 1]).ema(2)", function() {
      it("should calculate the exponential weighted moving average", function() {
        var result = TA([1, 2, 3, 1]).ema(2).asArray();
        expect(result).toEqual([null, 1.5, 2.5, 1.5]);
      });
  });

  describe("TA([9, 1, 2, 3, 1, 9]).ema(2, 1, 5)", function() {
      it("should calculate the exponential weighted moving average based on a part of the array (array.slice(1, 5))", function() {
        var result = TA([9, 1, 2, 3, 1, 9]).ema(2, 1, 5).asArray();
        expect(result).toEqual([5, 3, 3, 1.6666666666666665]);
      });
  });

  describe("TA([1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 8, 9, 12, 15, 8, 5, 2, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 9, 13]).macd()", function() {
      it("should calculate the moving average convergence/divergence", function() {
        var result = TA([1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 8, 9, 12, 15, 8, 5, 2, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 9, 13]).macd();
        expect(result.macd.asArray()).toEqual([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, -1.3403010826215067, -1.2936450756085116, -1.1625767501640452, -0.9668670735318954, -0.7227427733382523, -0.4434688313251325, -0.06006652540231805, 0.5600927345133044]);
        expect(result.signal.asArray()).toEqual([null, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.26806021652430134, -0.4731771883411434, -0.6110571007057237, -0.6822190952709581, -0.6903238308844171, -0.6409528309725603, -0.5247755698585118, -0.3078019089841486]);
        expect(result.histogram.asArray()).toEqual([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, -1.0722408660972054, -0.8204678872673682, -0.5515196494583214, -0.28464797826093724, -0.03241894245383525, 0.1974839996474278, 0.46470904445619376, 0.867894643497453]);
      });
  });

  describe("TA([1, 2, 3, 4, 5, 6, 7, 6]).macd(3, 4, 2)", function() {
      it("should calculate the moving average convergence/divergence", function() {
        var result = TA([1, 2, 3, 4, 5, 6, 7, 6]).macd(3, 4, 2);
        expect(result.macd.asArray()).toEqual([null, null, null, 0.5, 0.5, 0.5, 0.5, 0.2999999999999998]);
        expect(result.signal.asArray()).toEqual([null, 0, 0, 0.3333333333333333, 0.4444444444444444, 0.4814814814814815, 0.49382716049382713, 0.36460905349794226]);
        expect(result.histogram.asArray()).toEqual([null, null, null, 0.16666666666666669, 0.05555555555555558, 0.01851851851851849, 0.006172839506172867, -0.06460905349794244]);
      });
  });

  describe("TA([44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328, 45.614, 46.282, 46.282, 46.0028, 46.0328, 46.4116, 46.2222, 45.6439]).rsi(14)", function() {
      it("should calculate the rsi (relative strength index)", function() {
        var result = TA([44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328, 45.614, 46.282, 46.282, 46.0028, 46.0328, 46.4116, 46.2222, 45.6439]).rsi(14);
        expect(result.asArray()).toEqual([ null, null, null, null, null, null, null, null, null, null, null, null, null, null, 70.53278948369497, 66.31856180517234, 66.54982993552767, 69.40630533884438, 66.35516905627179, 57.9748557143082 ]);
      });
  });

  describe("TA([44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328, 45.614, 46.282, 46.282, 46.0028, 46.0328, 46.4116, 46.2222, 45.6439]).rsi(14, true)", function() {
      it("should calculate the rsi (EMA based) (relative strength index)", function() {
        var result = TA([44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328, 45.614, 46.282, 46.282, 46.0028, 46.0328, 46.4116, 46.2222, 45.6439]).rsi(14, true);
// TODO: Fix expect statement        
//        expect(result.asArray()).toEqual([ null, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, 70.53278948369497, 62.579529408031505, 63.095455768503356, 69.26849367264964, 63.17223673597964, 48.22079665405615, NaN ]);
      });
  });
});