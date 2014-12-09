'use strict';

describe('ta.js', function () {
    var stockPrices;

    beforeEach(function () {
        stockPrices = [1, 2, 3, 4, 5, 1];
    });

    describe('TA([1, 2, 3, 1]).asArray()', function () {
        it('should return the array ([1, 2, 3, 1]) of the TA object', function () {
            var result = TA([1, 2, 3, 1]).asArray();
            expect(result).toEqual([1, 2, 3, 1]);
        });
    });

    describe('TA([1, 2, 3, 1]).max()', function () {
        it('should return the max value (3)', function () {
            var result = TA([1, 2, 3, 1]).max();
            expect(result).toEqual(3);
        });
    });

    describe('TA([1, 2, 3, 1]).min()', function () {
        it('should return the min value (1)', function () {
            var result = TA([1, 2, 3, 1]).min();
            expect(result).toEqual(1);
        });
    });

    describe('TA([1, 2, 3, 1]).sum()', function () {
        it('should return the sum (7)', function () {
            var result = TA([1, 2, 3, 1]).sum();
            expect(result).toEqual(7);
        });
    });

    describe('TA([1, 2, 3, 1]).plus([1, 2, 3, 0])', function () {
        it('should return the sum (5) based on a part of the array (array.slice(1, 3))', function () {
            var result = TA([1, 2, 3, 1]).plus([1, 2, 3, 0]).asArray();
            expect(result).toEqual([2, 4, 6, 1]);
        });
    });

    describe('TA([1, 2, 3, 1]).minus([1, 2, 3, 0])', function () {
        it('should return the sum (5) based on a part of the array (array.slice(1, 3))', function () {
            var result = TA([1, 2, 3, 1]).minus([1, 2, 3, 0]).asArray();
            expect(result).toEqual([0, 0, 0, 1]);
        });
    });

    describe('TA([1, 2, 3]).a()', function () {
        it('should return the avarage (2)', function () {
            var result = TA([1, 2, 3]).a();
            expect(result).toEqual(2);
        });
    });

    describe('TA([1, 2, 3, 1]).a(1, 3)', function () {
        it('should return the avarage (2.5) based on a part of the array (array.slice(1, 3))', function () {
            var result = TA([1, 2, 3, 1]).a(1, 3);
            expect(result).toEqual(2.5);
        });
    });

    describe('TA([1, 2, 3, 1]).sma(2)', function () {
        it('should calculate the simple moving avarage', function () {
            var result = TA([1, 2, 3, 1]).sma(2).asArray();
            expect(result).toEqual([null, 1.5, 2.5, 2]);
        });
    });

    describe('TA([9, 1, 2, 3, 1, 9]).sma(2, 1, 5)', function () {
        it('should calculate the simple moving avarage based on a part of the array (array.slice(1, 5))', function () {
            var result = TA([9, 1, 2, 3, 1, 9]).sma(2, 1, 5).asArray();
            expect(result).toEqual([5, 1.5, 2.5, 2]);
        });
    });

    describe('TA([1, 2, 3, 1]).ema(2)', function () {
        it('should calculate the exponential weighted moving average', function () {
            var result = TA([1, 2, 3, 1]).ema(2).asArray();
            expect(result).toEqual([null, 1.5, 2.5, 1.5]);
        });
    });

    describe('TA([9, 1, 2, 3, 1, 9]).ema(2, 1, 5)', function () {
        it('should calculate the exponential weighted moving average based on a part of the array (array.slice(1, 5))', function () {
            var result = TA([9, 1, 2, 3, 1, 9]).ema(2, 1, 5).asArray();
            expect(result).toEqual([5, 3, 3, 1.6666666666666667]);
        });
    });

    describe('TA([1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 8, 9, 12, 15, 8, 5, 2, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 9, 13, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 8, 9, 12, 15, 8, 5, 2, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 9, 13]).macd()', function () {
        it('should calculate the moving average convergence/divergence', function () {
            var result = TA([1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 8, 9, 12, 15, 8, 5, 2, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 9, 13, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 8, 9, 12, 15, 8, 5, 2, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 9, 13]).macd();
            expect(result.macd.asArray()).toEqual([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, -1.340301082621508, -1.293645075608513, -1.1625767501640465, -0.9668670735318967, -0.7227427733382541, -0.44346883132513426, -0.06006652540231805, 0.5600927345133044, 0.08232471610516523, -0.21316105006765262, -0.3624657266980069, -0.39553958187337823, -0.33717249311478437, -0.207828791174407, -0.024350633914288267, 0.03990547942528355, 0.010021745096739032, -0.09327772476290885, -0.09337528405735807, -0.012615533828709502, 0.13057362129434846, 0.3210429180854133, 0.5463844706358438, 0.9560237557322111, 1.5053875972666049, 1.3602408908076082, 0.991704401236511, 0.45234727235617633, -0.05515301120939853, -0.4521386691458531, -0.7580147411001033, -0.9092508118209528, -1.0173787782054253, -1.0107282814615735, -0.9939995073008738, -0.8897932083738205, -0.7182379233640339, -0.49587138469979664, -0.23622955087796083, 0.1294297724967306, 0.7335283332889047]);
            expect(result.signal.asArray()).toEqual([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, -0.5941389623748001, -0.5179433799133706, -0.48684784927029784, -0.46858619579091393, -0.44230345525568804, -0.3954085224394318, -0.3211969447344031, -0.24897645990246575, -0.19717681890262478, -0.1763970000746816, -0.15979265687121688, -0.1303572322627154, -0.07817106155130263, 0.001671734376040554, 0.11061428162800123, 0.2796961764488432, 0.5248344606123956, 0.6919157466514381, 0.7518734775684527, 0.6919682365259974, 0.5425439869789181, 0.3436074557539639, 0.12328301638315045, -0.0832237492576702, -0.2700547550472212, -0.41818946033009163, -0.5333514697242481, -0.6046398174541625, -0.6273594386361367, -0.6010618278488687, -0.5280953724546872, -0.3965903434644036, -0.1705666081137419]);
            expect(result.divergence.asArray()).toEqual([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 0.6764636784799654, 0.30478232984571796, 0.12438212257229092, 0.0730466139175357, 0.10513096214090367, 0.1875797312650248, 0.2968463108201148, 0.2888819393277493, 0.20719856399936382, 0.08311927531177274, 0.06641737281385882, 0.11774169843400589, 0.2087446828456511, 0.31937118370937273, 0.4357701890078426, 0.6763275792833678, 0.9805531366542093, 0.6683251441561702, 0.23983092366805836, -0.23962096416982104, -0.5976969981883167, -0.795746124899817, -0.8812977574832537, -0.8260270625632826, -0.7473240231582041, -0.5925388211314818, -0.46064803757662576, -0.28515339091965797, -0.09087848472789717, 0.10519044314907211, 0.29186582157672636, 0.5260201159611342, 0.9040949414026466]);
        });
    });

    describe('TA([1, 2, 3, 4, 5, 6, 7, 6]).macd(3, 4, 2)', function () {
        it('should calculate the moving average convergence/divergence', function () {
            var result = TA([1, 2, 3, 4, 5, 6, 7, 6]).macd(3, 4, 2);
            expect(result.macd.asArray()).toEqual([null, null, null, 0.5, 0.5, 0.5, 0.5, 0.2999999999999998]);
            expect(result.signal.asArray()).toEqual([null, null, null, null, 0.5, 0.5, 0.5, 0.3666666666666666]);
            expect(result.divergence.asArray()).toEqual([null, null, null, null, 0, 0, 0, -0.06666666666666676]);
        });
    });

    describe('TA([44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328, 45.614, 46.282, 46.282, 46.0028, 46.0328, 46.4116, 46.2222, 45.6439]).rsi(14)', function () {
        it('should calculate the rsi (relative strength index)', function () {
            var result = TA([44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328, 45.614, 46.282, 46.282, 46.0028, 46.0328, 46.4116, 46.2222, 45.6439]).rsi(14);
            expect(result.asArray()).toEqual([null, null, null, null, null, null, null, null, null, null, null, null, null, null, 70.53278948369497, 66.31856180517234, 66.54982993552767, 69.40630533884438, 66.35516905627179, 57.9748557143082]);
        });
    });

    describe('TA([44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328, 45.614, 46.282, 46.282, 46.0028, 46.0328, 46.4116, 46.2222, 45.6439]).rsi(14, true)', function () {
        it('should calculate the rsi (EMA based) (relative strength index)', function () {
            var result = TA([44.3389, 44.0902, 44.1497, 43.6124, 44.3278, 44.8264, 45.0955, 45.4245, 45.8433, 46.0826, 45.8931, 46.0328, 45.614, 46.282, 46.282, 46.0028, 46.0328, 46.4116, 46.2222, 45.6439]).rsi(14, true);
            expect(result.asArray()).toEqual([null, null, null, null, null, null, null, null, null, null, null, null, null, null, 70.53278948369497, 62.579529408031505, 63.095455768503356, 69.26849367264965, 63.17223673597964, 48.220796654056144]);
        });
    });
});