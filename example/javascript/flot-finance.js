(function () {

    // Constructor
    var flotFinance = function (symbol) {
        // Ensure to use the `new` operator
        if (!(this instanceof flotFinance)) {
            return new flotFinance(symbol);
        }

        // Check the argument
        if (typeof symbol === 'string' || symbol instanceof String) {
            // Save symbol if first argument is a String
            this.symbol = symbol;
            this.yahooFinanceData = yahooFinance(symbol).getData();
        } else {
            // Invalid argument value
            throw "First argument must be a String containing a yahoo symbol, search for available symbols at http://finance.yahoo.com/lookup";
        }

        return this;
    };

    // make library public
    window.flotFinance = flotFinance;

    // create `fn` alias to `prototype` property
    flotFinance.fn = flotFinance.prototype = {};

    // Public methods

    /**
     * Get the close price
     *
     * @return     {Array} the close price
     */
    flotFinance.fn.getClosePrice = cached(function (scale, splitDetection) {
        var close = convertYahooFinanceToFlotFormat(this.yahooFinanceData, "close");
        if (splitDetection) {
            close = adjustSplits(close);
        }
        return scaleTo(scale, close);
    }, this.symbol);

    /**
     * Get the adjusted close price
     *
     * @return     {Array} the adjusted close price
     */
    flotFinance.fn.getAdjClosePrice = cached(function (scale, splitDetection) {
        var close = convertYahooFinanceToFlotFormat(this.yahooFinanceData, "adjclose");
        if (splitDetection) {
            close = adjustSplits(close);
        }
        return scaleTo(scale, close);
    }, this.symbol);

    /**
     * Get the (Simple) Mean Avarage
     *
     * @return     {Array} the Simple Mean Avarage
     */
    flotFinance.fn.getMaPrice = cached(function (n, scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var priceTA = this.getPriceTA(scale, splitDetection);
        data = convertToFlotFormat(priceTA.ma(n).asArray(), data);
        return data;
    }, this.symbol);

    /**
     * Get the MACD curve
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getMacd = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var macdTA = this.getMacdTA(nSlow, nFast, nSignal, scale, splitDetection);
        data = convertToFlotFormat(macdTA.macd.asArray(), data);
        return data;
    }, this.symbol);

    /**
     * Get the MACD signal
     *
     * @return     {Array} the MACD signal
     */
    flotFinance.fn.getMacdSignal = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var macdTA = this.getMacdTA(nSlow, nFast, nSignal, scale, splitDetection);
        data = convertToFlotFormat(macdTA.signal.asArray(), data);
        return data;
    }, this.symbol);

    /**
     * Get the MACD histogram
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getMacdHistogram = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var macdTA = this.getMacdTA(nSlow, nFast, nSignal, scale, splitDetection);
        data = convertToFlotFormat(macdTA.histogram.asArray(), data);
        return data;
    }, this.symbol);

    /**
     * Get the Price TA Object
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getPriceTA = cached(function (scale, splitDetection) {
        var data = this.getClosePrice(scale, splitDetection);
        var priceTA = TA(getPricesAsArray(data));
        return priceTA;
    }, this.symbol);

    /**
     * Get the MACD TA Object
     *
     * @return     {Array} the MACD curve
     */
    flotFinance.fn.getMacdTA = cached(function (nSlow, nFast, nSignal, scale, splitDetection) {
        var priceTA = this.getPriceTA(scale, splitDetection);
        var macdTA = priceTA.macd(nSlow, nFast, nSignal);
        return macdTA;
    }, this.symbol);

    flotFinance.fn.isCloseEqualToAdjClose = function (a, b) {
        var close = this.getClosePrice();
        var adjclose = this.getAdjClosePrice();
        for (var i = 0; i < close.length; i++) {
            if (close[i][1] !== adjclose[i][1]) {
                log.info("Close is not equal to Adjusted Close");
                log.info("close[" + i + "][1] = ", close[i][1]);
                log.info("adjclose[" + i + "][1] = ", adjclose[i][1]);
                return false;
            }
        }
        return true;
    };

    // Private methods
    function cached(f) {
        var cache = {};
        return function () {
            var key = this.symbol + JSON.stringify(Array.prototype.slice.call(arguments));
            if (key in cache) {
                log.trace('Loading from cache ' + key, cache[key], cache);
                return cache[key];
            } else {
                var data = f.apply(this, arguments);
                log.trace('Saving to cache ' + key, data, cache);
                cache[key] = data;
                return data;
            }
        };
    }

    /**
     * Convert Yahoo Finance format to Flot format
     * 
     * @param {type} data received from yahooFinance(symbol).getData() call
     * @param {type} column to use (available columns open, high, low, close, volume, adjclose)
     * 
     * @returns {Array}
     */
    var convertYahooFinanceToFlotFormat = function (data, column) {
        log.trace("Converting Yahoo Finance to Flot format");
        return $.map(data, function (value, index) {
            return [[moment(value.date), parseFloat(value[column])]];
        }).reverse();
    };

    var scaleTo = function (scale, data) {
        switch (scale) {
            case undefined:
            case "days":
                // Keep original day scale
                return data;
            case "weeks":
                return scaleToWeek(data);
            case "months":
                return scaleToMonth(data);
            case "years":
                return scaleToYear(data);
        }
    };

    var scaleToWeek = function (data) {
        log.trace("Scaling data to week", data);
        var scaledData = [];
        var currentWeek = data[0][0].isoWeek();
        var currentWeekIndex = 0;
        $.each(data, function (index, value) {
            var week = value[0].isoWeek();
            if (week === currentWeek) {
                scaledData[currentWeekIndex] = [value[0], value[1]];
            } else {
                currentWeek = week;
                currentWeekIndex = currentWeekIndex + 1;
                scaledData[currentWeekIndex] = [value[0], value[1]];
            }
        });
        return scaledData;
    };

    var scaleToMonth = function (data) {
        log.trace("Scaling data to month", data);
        var scaledData = [];
        var currentMonth = data[0][0].month();
        var currentMonthIndex = 0;
        $.each(data, function (index, value) {
            var month = value[0].month();
            if (month === currentMonth) {
                scaledData[currentMonthIndex] = [value[0], value[1]];
            } else {
                currentMonth = month;
                currentMonthIndex++;
                scaledData[currentMonthIndex] = [value[0], value[1]];
            }
        });
        return scaledData;
    };

    var scaleToYear = function (data) {
        log.trace("Scaling data to year", data);
        var scaledData = [];
        var currentYear = data[0][0].year();
        var currentYearIndex = 0;
        $.each(data, function (index, value) {
            var year = value[0].year();
            if (year === currentYear) {
                scaledData[currentYearIndex] = [value[0], value[1]];
            } else {
                currentYear = year;
                currentYearIndex++;
                scaledData[currentYearIndex] = [value[0], value[1]];
            }
        });
        return scaledData;
    };

    var adjustSplits = function (data) {
        log.trace("Adjusting splits to data", data);
        var previousPrice = data[data.length - 1][1];
        var previousDate = data[data.length - 1][0];
        var adjustFactor = 1;
        for (i = data.length - 2; i >= 0; i--) {
            if (Math.round(data[i][1] / previousPrice) >= 2) {
                log.debug("Split found and adjusted between " + data[i][0] + "(" + data[i][1] + ") to " + previousDate + " (" + previousPrice + ")")
                adjustFactor = adjustFactor / Math.round(data[i][1] / previousPrice);
            }
            previousPrice = data[i][1];
            previousDate = data[i][0];
            if (adjustFactor !== 1) {
                data[i][1] = data[i][1] * adjustFactor;
            }
        }
        return data;
    };

    var convertToFlotFormat = function (arg1, arg2) {
        // Array passed as arg1 and price in Flot format as arg2
        log.trace("Converting array to Flot format");
        return $.map(arg1, function (value, index) {
            return [[arg2[index][0], value]];
        });
    };

    var getPricesAsArray = function (data) {
        return $.map(data, function (value) {
            return value[1];
        });
    };

})();
