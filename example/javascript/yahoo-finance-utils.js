(function () {

    var finance = function (arg1) { // core constructor
        // ensure to use the `new` operator
        if (!(this instanceof finance)) {
            return new finance(arg1);
        }

        // if first argument is an array
        if (isObject(arg1) && arg1.symbol !== undefined) {
            this.symbol = arg1.symbol;
            this.dataCacheKey = "dataCache." + arg1.symbol;
        // unexpected argument value, return empty finance object
        } else {
            throw "First argument must be an object containing a symbol";
        }
        return this;
    };

    // create `fn` alias to `prototype` property
    finance.fn = finance.prototype = {};

    /**
     * Get the symbol data (downloads it from yahoo finance)
     *
     * @return     {Array} the symbol data
     */
    finance.fn.data = function () {
        try {
            if (this.isDataCacheEmpty()) {
                var fromDate = moment("1900-01-01");
                var toDate = mostRecentWorkingDay();
                var start = moment().valueOf();
                var downloadedData = downloadData(this.symbol, fromDate, toDate);
                var stop = moment().valueOf();
                var executionTime = stop - start;
                log.debug("Downloading data took " + executionTime + " milliseconds");
                this.setDataCache(downloadedData);
            } else if (this.isDataCacheOutOfDate()) {
                var fromDate = moment(this.getDataCache()[0].date).add(1, 'day');
                var toDate = mostRecentWorkingDay();
                var start = moment().valueOf();
                var downloadedData = downloadData(this.symbol, fromDate, toDate);
                var stop = moment().valueOf();
                var executionTime = stop - start;
                log.debug("Downloading data took " + executionTime + " milliseconds");
                if (downloadedData.length > 0) {
                    this.appendDataCache(downloadedData);
                }
            }

            return this.getDataCache();
        } catch (e) {
            alert("Something went wrong. Clearing symbol data cache for symbol = " + this.symbol + " for safety");
            this.clearDataCache();
            throw e;
        }
    };

    /**
     * Get the cached symbol data in localeStorage
     *
     * @param      {Object}   data
     */
    finance.fn.getDataCache = function () {
        return simpleStorage.get(this.dataCacheKey);
    };

    /**
     * Set the cached symbol data in localeStorage
     *
     * @param      {Object}   data
     */
    finance.fn.setDataCache = function (data) {
        simpleStorage.set(this.dataCacheKey, data);
    };

    /**
     * Append data to the cached symbol data in localeStorage
     * @param      {Object}   data to append
     */
    finance.fn.appendDataCache = function (data) {
        Array.prototype.push.apply(data, this.getDataCache());
        this.setDataCache(data);
    };

    /**
     * Clear the currently cached symbol data from localeStorage
     * @return     {finance} returns this finance object
     */
    finance.fn.clearDataCache = function () {
        log.debug("Clearing cached symbol data from localeStorage for symbol " + this.symbol);
        simpleStorage.deleteKey(this.dataCacheKey);
        return this;
    };

    /**
     * Check if cached symbol data in localeStorage does not exist
     *
     * @return     {boolean} true if the data cache is empty
     */
    finance.fn.isDataCacheEmpty = function () {
        if (this.getDataCache() === undefined) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Check if cached symbol data in localeStorage needs to be updated
     *
     * @param      {Object}   data
     * @return     {boolean} true if the data cache needs to be updated
     */
    finance.fn.isDataCacheOutOfDate = function (data) {
        var lastDataCacheDate = moment(this.getDataCache()[0].date);
        if (lastDataCacheDate.isBefore(mostRecentWorkingDay())) {
            return true;
        } else {
            return false;
        }
    };

    // expose the library
    window.finance = finance;


    // helpers
    var toString = Object.prototype.toString;

    // test if object
    var isObject = function (arg) {
        return toString.call(arg) === '[object Object]';
    };

    var mostRecentWorkingDay = function () {
        var currentDate = moment(moment().format("YYYY-MM-DD"));
        if (currentDate.isoWeekday() === 7) {
            currentDate.subtract(2, 'days');
        } else if (currentDate.isoWeekday() === 6) {
            currentDate.subtract(1, 'days');
        }
        return currentDate;
    };

    function downloadData(symbol, fromDate, toDate) {

        function parseYear(date) {
            return date.format('YYYY');
        }
        function parseMonth(date) {
            return parseInt(date.format('MM')) - 1;
        }
        function parseDay(date) {
            return date.format('DD');
        }

        log.debug("Getting historical prices from yahoo finance for symbol " + symbol + " between date " + fromDate.format("YYYY-MM-DD") + " to " + toDate.format("YYYY-MM-DD"));
        var columns = "*";
        var url = "http://ichart.finance.yahoo.com/table.csv?" + $.param({
            s: symbol,
            a: parseMonth(fromDate),
            b: parseDay(fromDate),
            c: parseYear(fromDate),
            d: parseMonth(toDate),
            e: parseDay(toDate),
            f: parseYear(toDate),
            g: "d",
            ignore: ".cvs"
        });
        var columnAliases = "date,open,high,low,close,volume,adjclose";
        var query = "select " + columns + " from csv where url='" + url + "' and columns='" + columnAliases + "'";

        var returnData = [];
        var jqXHR = $.ajax("http://query.yahooapis.com/v1/public/yql", {
            data: {
                q: query,
                ignore: ".cvs",
                format: "json",
                diagnostics: true
            },
            async: false,
            dataType: "json",
            crossDomain: true
        }).done(function(data) {
            if (data.query.results !== null && data.query.results.row !== undefined) {
                if (data.query.results.row.length > 1) {
                    data.query.results.row.shift(); // remove descriptions
                    var from = data.query.results.row[data.query.results.row.length - 1];
                    var to = data.query.results.row[0];
                    log.debug("Historical prices between date " + from.date + " to " + to.date + " (" + from.close + " to " + to.close + ") received");
                    log.debug("data.query.results.row", data.query.results.row);
                    returnData = data.query.results.row;
                }
            }

            if (data.query.diagnostics.csv !== undefined) {
                log.warn("diagnostics.cvs = " + data.query.diagnostics.csv);
            }
            if (data.query.diagnostics.warning !== undefined) {
                if (data.query.diagnostics.warning === "You have reached the maximum number of items which can be returned in a request") {
                    log.debug("Was not able to receive all data in on call");
                    log.debug("Calling downloadData recursively to download the rest of the data");
                    var recursiveToDate = moment(from.date).subtract('days', 1);
                    Array.prototype.push.apply(returnData, downloadData(symbol, fromDate, recursiveToDate));
                } else {
                    alert("diagnostics.warning = " + data.query.diagnostics.warning);
                }
            }
        }).fail(function() {
            alert("Error downloading data");
        }).always(function() {

        });

        return returnData;
    }

})();
