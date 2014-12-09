/*!
 * ta.js 0.0.1
 * http://github.com/andidev/ta.js
 * Copyright (c) 2014 Anders Steiner; Licensed Apache-2.0
 */

'use strict';
(function() {

    // helpers
    var toString = Object.prototype.toString;

    // test if array
    var isArray = Array.isArray || function(arg) {
        return toString.call(arg) === '[object Array]';
    };

    var TA = function(arg1) { // core constructor
        // ensure to use the `new` operator
        if (!(this instanceof TA)) {
            return new TA(arg1);
        }

        // if first argument is an array
        if (isArray(arg1)) {
            this.array = arg1;
        // handle case when TA object is passed to TA
        } else if (arg1 instanceof TA) {
            // duplicate the object and pass it back
            return TA(arg1.asArray());
        // unexpected argument value, return empty TA object
        } else {
            this.array = [];
        }
        return this;
    };

    // create `fn` alias to `prototype` property
    TA.fn = TA.prototype = {
        asArray: function () {
            return this.array;
        },
        max: function () {
            return Math.max.apply(Math, this.array);
        },
        min: function () {
            return Math.min.apply(Math, this.array);
        },
        sum: function (from, to) {
            if (from === undefined && to === undefined) {
                from = 0;
                to = this.array.length;
            }
            var sum = 0;
            for(var i = from; i < to; i++) {
                if (this.array[i] === null) {
                    throw 'Cannot sum array from index ' + from + ' to ' + to + ' since value is null at index ' + i + ', array = ' + this.array;
                }
                sum += this.array[i];
            }
            return sum;
        },
        plus: function (array) {
            if (array instanceof TA) {
                array = array.asArray();
            }
            var plus = [];
            for(var i = 0; i < this.array.length; i++) {
                if (this.array[i] === null || array[i] === null) {
                    plus[i] = null;
                    continue;
                }
                plus[i] = this.array[i] + array[i];
            }
            return TA(plus);
        },
        minus: function (array) {
            if (array instanceof TA) {
                array = array.asArray();
            }
            var minus = [];
            for(var i = 0; i < this.array.length; i++) {
                if (this.array[i] === null || array[i] === null) {
                    minus[i] = null;
                    continue;
                }
                minus[i] = this.array[i] - array[i];
            }
            return TA(minus);
        },
        a: function (from, to) {
            if (from === undefined && to === undefined) {
                from = 0;
                to = this.array.length;
            }
            var sum = 0;
            for(var i = from; i < to; i++) {
                if (this.array[i] === null) {
                    throw 'Cannot calculate array avarage from index ' + from + ' to ' + to + ' since value is null at index ' + i + ', array = ' + this.array;
                }
                sum += this.array[i];
            }
            return sum/(to-from);
        }
    };

    /**
     * Calculate the Simple Moving Avarage
     *
     * SMA = sum of n periods / n
     *
     * For more info see http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:moving_averages
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the Simple Moving Avarage
     */
    TA.fn.sma = function (n, from, to) {
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }
        var ma = [];
        var push = 0;
        for(var i = from; i < to; i++) {
            if (i < (n - 1 + push)) {
                ma[i - from] = null;
                if (this.array[i] === null) {
                    push++;
                }
            } else if (ma[i - from - 1] === null || (i - from - 1) < 0) {
                ma[i - from] = this.sum(i - (n - 1), i + 1) / n;
            } else {
                ma[i - from] = ma[i - from - 1] + (this.array[i] - this.array[i - n]) / n;
            }
        }
        return TA(ma);
    };

    /**
     * Calculate the Exponentially Weighted Moving Average
     *
     * alpha = 2 / (n + 1)
     *
     * EMA = (Close - EMA(previous day)) x alpha + EMA(previous day)
     *
     * For more info see http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:moving_averages
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the Exponentially Weighted Moving Average
     */
    TA.fn.ema = function (n, from, to) {
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }

        var alpha = 2 / (n + 1);
        var ema = [];
        var push = 0;
        for(var i = from; i < to; i++) {
            if (i < (n - 1 + push)) {
                ema[i - from] = null;
                if (this.array[i] === null) {
                    push++;
                }
            } else if (ema[i - from - 1] === null || (i - from - 1) < 0) {
                ema[i - from] = this.sma(n, i, i + 1).asArray()[0];
                //25  - 34
            } else {
                ema[i - from] = (this.array[i] - ema[i - from - 1]) * alpha + ema[i - from - 1];
            }
        }
        return TA(ema);
    };

    /**
     * Calculate the RSI (Relative Strength Index)
     *
     *                  100
     *    RSI = 100 - --------
     *                 1 + RS
     *
     *    RS = Average Gain / Average Loss
     *
     * The very first calculations for average gain and average loss are simple 14 period averages.
     *  - First Average Gain = Sum of Gains over the past 14 periods / 14.
     *  - First Average Loss = Sum of Losses over the past 14 periods / 14
     *
     * The second, and subsequent, calculations are based on the prior averages and the current gain loss:
     *  - Average Gain = [(previous Average Gain) x 13 + current Gain] / 14.
     *  - Average Loss = [(previous Average Loss) x 13 + current Loss] / 14.
     *
     * For more info see http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the RSI (Relative Strength Index)
     */
    TA.fn.rsi = function (n, ema, from, to) {
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }
        var gain;
        var loss;
        var rsi;
        var i;
        if (ema === true) {
            gain = [null];
            loss = [null];
            rsi = [null];
            for (i = from + 1; i < to; i++) {
                if (this.array[i] > this.array[i-1]) {
                    gain[i - from] = this.array[i] - this.array[i-1];
                    loss[i - from] = 0;
                } else {
                    gain[i - from] = 0;
                    loss[i - from] = this.array[i-1] - this.array[i];
                }
            }
            var gainEma = TA(gain.slice(1, gain.length)).ema(n).asArray();
            var lossEma = TA(loss.slice(1, loss.length)).ema(n).asArray();
            gainEma.unshift(null);
            lossEma.unshift(null);
            for (i = from + 1; i < to; i++) {
                if (gainEma === null || lossEma[i] === null) {
                    rsi[i - from] = null;
                } else if (lossEma[i] === 0) {
                    rsi[i - from] = 100;
                } else {
                    rsi[i - from] = 100 - 100 / (1 + gainEma[i] / lossEma[i]);
                }
            }
            return TA(rsi);
        } else {
            gain = 0;
            loss = 0;
            rsi = [];
            for (i = from; i < to; i++) {
                if (i === from) {
                    rsi[i - from] = null;
                } else if (i <= n) {
                    rsi[i - from] = null;
                    if (this.array[i - 1] <= this.array[i]) {
                        gain = gain + this.array[i] - this.array[i - 1];
                    } else {
                        loss = loss + this.array[i - 1] - this.array[i];
                    }
                    if (i === n) {
                        rsi[i - from] = 100 - 100 / (1 + gain / loss);
                    }
                } else {
                    if (this.array[i - 1] <= this.array[i]) {
                        gain = gain / n * (n - 1) + this.array[i] - this.array[i - 1];
                        loss = loss / n * (n - 1);
                    } else {
                        gain = gain / n * (n - 1);
                        loss = loss / n * (n - 1) + this.array[i - 1] - this.array[i];
                    }
                    rsi[i - from] = 100 - 100 / (1 + gain / loss);
                }
            }
            return TA(rsi);
        }
    };

    /**
     * Calculate the Moving Average Convergence/Divergence
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the Moving Average Convergence/Divergence
     */
    TA.fn.macd = function (nFast, nSlow, nSignal, from, to) {
        if (nFast === undefined) {
            nFast = 12;
        }
        if (nSlow === undefined) {
            nSlow = 26;
        }
        if (nSignal === undefined) {
            nSignal = 9;
        }
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }

        var macd = this.ema(nFast, from, to).minus(this.ema(nSlow, from, to));
        var signal = macd.ema(nSignal, from, to);
        var divergence = macd.minus(signal);
        return {
            'macd': macd,
            'signal': signal,
            'divergence': divergence
        };
    };

    // expose the library
    window.TA = TA;
})();

