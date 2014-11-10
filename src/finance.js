(function () {

    // helpers
    var toString = Object.prototype.toString;

    // test if object
    var isObject = function (arg) {
        return toString.call(arg) === '[object Object]';
    };

    var finance = function (arg1) { // core constructor
        // ensure to use the `new` operator
        if (!(this instanceof finance)) {
            return new finance(arg1);
        }

        // if first argument is an array
        if (isObject(arg1)) {
            this._symbol = arg1.symbol;
            this._fromDate = arg1.fromDate;
            this._toDate = arg1.toDate;
            this._data = arg1.data !== undefined ? arg1.data : [];
            this._volume = arg1.volume !== undefined ? arg1.volume : [];
            // handle case when finance object is passed to finance
        } else if (arg1 instanceof finance) {
            // duplicate the object and pass it back
            return finance({
                symbol: this._symbol,
                fromDate: this._fromDate,
                toDate: this._toDate,
                price: this._data,
                volume: this._volume
            });
            // unexpected argument value, return empty finance object
        } else {
            this._symbol = '^VIX';
            this._fromDate = moment("1960-09-11");
            this._toDate = moment("2014-11-09");
            this._data = [];
            this._volume = [];
        }
        return this;
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

        var returnData;
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
            if (data.query.results !== undefined && data.query.results.row !== undefined) {
                if (data.query.results.row.length > 0) {
                    data.query.results.row.shift(); // remove descriptions
                    var from = data.query.results.row[data.query.results.row.length - 1];
                    var to = data.query.results.row[0];
                    log.debug("Historical prices between date " + from.date + " to " + to.date + " (" + from.close + " to " + to.close + ") received");
                }
            }
            log.debug("data.query.results.row", data.query.results.row);
            returnData = data.query.results.row;

            if (data.query.diagnostics.csv !== undefined) {
                log.warn("diagnostics.cvs = " + data.query.diagnostics.csv);
            }
            if (data.query.diagnostics.warning !== undefined) {
                log.warn("diagnostics.warning = " + data.query.diagnostics.warning);
                if (data.query.diagnostics.warning === "You have reached the maximum number of items which can be returned in a request") {
                    var recursiveToDate = moment(from.date).subtract('days', 1);
                    Array.prototype.push.apply(returnData, downloadData(symbol, fromDate, recursiveToDate));
                }
            }
        }).fail(function() {
            alert( "Error downloading data" );
        }).always(function() {

        });

        return returnData;
    }

    // create `fn` alias to `prototype` property
    finance.fn = finance.prototype = {};

    /**
     * Get the symbol price
     *
     * @return     {Array}    the Symbol Price
     */
    finance.fn.price = function () {
        var start = moment().valueOf();
        this._data = downloadData(this._symbol, this._fromDate, this._toDate);
        log.info(JSON.stringify(this._data));
        var stop = moment().valueOf();
        var executionTime = stop - start;
        log.debug("Downloading data took " + executionTime + " milliseconds");
        return this._data;
    };

    /**
     * Get the Symbol Volume
     *
     * @return     {Array}    the Symbol Volume
     */
    finance.fn.volume = function () {
        return this._volume;
    };

    // expose the library
    window.finance = finance;
})();

var log = log4javascript.getDefaultLogger();
var consoleAppender = new log4javascript.BrowserConsoleAppender()
log.removeAllAppenders();
log.addAppender(consoleAppender);
consoleAppender.setThreshold(log4javascript.Level.DEBUG);
log.setLevel(log4javascript.Level.TRACE);
log.trace("Document Ready");

log.info(finance().price());