(function() {

    // helpers
    var toString = Object.prototype.toString;

    // test if array
    var isArray = Array.isArray || function(arg) {
        return toString.call(arg) === '[object Array]';
    };

    // test if function
    var isFunction = function(arg) {
        return toString.call(arg) === '[object Function]';
    };

    // test if number and not NaN
    var isNumber = function(arg) {
        return toString.call(arg) === '[object Number]' && !isNaN(arg);
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
                sum += this.array[i];
            }
            return sum/(to-from);
        }
    };

    /**
     * Calculate the (Simple) Moving Avarage
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the (Simple) Moving Avarage
     */
     TA.fn.ma = function (n, from, to) {
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }
        var ma = [];
        for(var i = from; i < to; i++) {
            if (i < (n - 1)) {
                ma[i - from] = null;
            } else {
                ma[i - from] = this.sum(i - (n - 1), i + 1) / n;
            }
        }
        return TA(ma);
    };

    /**
     * Calculate the Exponentially (Weighted) Moving Average
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the Exponentially (Weighted) Moving Average
     */
    TA.fn.ema = function (n, from, to) {
        if (from === undefined && to === undefined) {
            from = 0;
            to = this.array.length;
        }

        var alpha = 2 / (n + 1);
        var ema = [];
        for(var i = from; i < to; i++) {
            if (i < (n - 1)) {
                ema[i - from] = null;
            } else if (i === (n - 1)) {
                ema[i - from] = this.ma(n, i, i + 1).asArray()[0];
            } else {
                ema[i - from] = alpha * this.array[i] + (1 - alpha) * ema[i - from - 1];
            }
        }
        return TA(ema);
    };

    /**
     * Calculate the Moving Average Convergence/Divergence
     *
     * @param      {Number}   n
     * @param      {Number}   from
     * @param      {Number}   to
     * @return     {TA} the Moving Average Convergence/Divergence
     */
    TA.fn.macd = function (nSlow, nFast, nSignal, from, to) {
        if (nSlow === undefined) {
            nSlow = 26;
        }
        if (nFast === undefined) {
            nFast = 12;
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
        var histogram = macd.minus(signal);
        return {
            "macd": macd,
            "signal": signal,
            "histogram": histogram
        };
    };

    // expose the library
    window.TA = TA;
})();