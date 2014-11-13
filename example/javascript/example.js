var viewModel;
$(function() {

    viewModel = new ViewModel();
    ko.applyBindings(viewModel);

    function ViewModel() {
        var self = this;
        var url = $.url();

        // Data
        self.debug = ko.observable(defaultBooleanValue(false, url.param("debug")));
        self.symbols = ko.observableArray([
            {id: '^OMX', text: "OMXS30"},
            {id: 'PXX.TO', text: "Black Pearl Resources"},
            {id: 'AOI.ST', text: "Africa Oil"},
            {id: 'GIX.TO', text: "Geologix Explorations Inc."},
            {id: 'FOE.OL', text: "F.OLSEN ENERGY"},
            {id: 'HM-B.ST', text: "HM-B"},
            {id: '^GSPC', text: "S&P-500"},
            {id: '^VIX', text: "VOLATILITY S&P-500"}
        ]);
        self.symbol = ko.observable(defaultValue("^OMX", url.param("symbol")));
        self.symbolName = ko.computed(function() {
            var symbolName = self.symbol();
            $.each(self.symbols(), function(index, symbol) {
                if (symbol.id === self.symbol()) {
                    symbolName = symbol.text;
                    return;
                }
            });
            return symbolName;
        });
        self.downloadedData;
        self.price = ko.observable({
            label: self.symbol(),
            data: [],
            color: "rgba(51, 120, 190, 1)",
            lines: {
                fill: true,
                fillColor: "rgba(51, 120, 190, 0.09)"
            }
        });
        self.showMa5Ma14 = ko.observable(defaultBooleanValue(true, url.param("showMa5Ma14")));
        self.maFastestDatumPoints = ko.observable(defaultNumberValue(5, url.param("maFastestDatumPoints")));
        self.maFastest = ko.observable({
            label: "MA " + self.maFastestDatumPoints(),
            data: [],
            color: "rgba(51, 120, 190, 0.4)",
            shadowSize: 1,
            lines: {
                show: true,
                lineWidth: 1
            }
        });
        self.maFastDatumPoints = ko.observable(defaultNumberValue(14, url.param("maFastDatumPoints")));
        self.maFast = ko.observable({
            label: "MA " + self.maFastDatumPoints(),
            data: [],
            color: "rgba(178, 56, 59, 0.4)",
            shadowSize: 1,
            lines: {
                show: true,
                lineWidth: 1
            }
        });

        self.showMa50Ma100Ma200 = ko.observable(defaultBooleanValue(true, url.param("showMa50Ma100Ma200")));
        self.maSlowDatumPoints = ko.observable(defaultNumberValue(50, url.param("maSlowDatumPoints")));
        self.maSlow = ko.observable({
            label: "MA " + self.maSlowDatumPoints(),
            data: [],
            color: "rgba(0, 0, 0, 0.4)",
            shadowSize: 1,
            lines: {
                show: true,
                lineWidth: 1
            }
        });
        self.maSlowerDatumPoints = ko.observable(defaultNumberValue(100, url.param("maSlowerDatumPoints")));
        self.maSlower = ko.observable({
            label: "MA " + self.maSlowerDatumPoints(),
            data: [],
            color: "rgba(0, 0, 0, 0.2)",
            shadowSize: 1,
            lines: {
                show: true,
                lineWidth: 1
            }
        });
        self.maSlowestDatumPoints = ko.observable(defaultNumberValue(200, url.param("maSlowestDatumPoints")));
        self.maSlowest = ko.observable({
            label: "MA " + self.maSlowestDatumPoints(),
            data: [],
            color: "rgba(0, 0, 0, 0.1)",
            shadowSize: 1,
            lines: {
                show: true,
                lineWidth: 1
            }
        });
        self.showMacd = ko.observable(defaultBooleanValue(false, url.param("showMacd")));
        self.macd = ko.observable({
            label: "MACD 12,26",
            data: [],
            color: "rgba(51, 120, 190, 0.4)",
            shadowSize: 1,
            lines: {
                show: true,
                lineWidth: 1
            }
        });
        self.macdSignal = ko.observable({
            label: "Signal 9",
            data: [],
            color: "rgba(178, 56, 59, 0.4)",
            shadowSize: 1,
            lines: {
                show: true,
                lineWidth: 1
            }
        });
        self.macdHistogram = ko.observable({
            label: "Histogram",
            data: [],
            color: "rgba(56, 174, 17, 0.2)",
            shadowSize: 1,
            yaxis: 2,
            lines: {
                show: true,
                lineWidth: 1,
                fill: true,
                fillColor: "rgba(56, 174, 17, 0.09)"
            }

        });
        self.enableSplitDetection = ko.observable(defaultBooleanValue(true, url.param("enableSplitDetection")));
        self.scale = ko.observable(defaultValue("day", url.param("scale")));
        self.timePeriod = ko.observable(defaultValue("3years", url.param("timePeriod")));
        self.zoomHistory = ko.observableArray();
        self.toDate = ko.observable();
        self.formattedToDate = ko.computed(function() {
            if (self.toDate() === undefined) {
                return "";
            }
            $("#to-date").datepicker("setDate", self.toDate().toDate());
            return formatDate(self.toDate());
        });
        self.fromDate = ko.observable();
        self.formattedFromDate = ko.computed(function() {
            if (self.fromDate() === undefined) {
                return "";
            }
            $("#from-date").datepicker("setDate", self.fromDate().toDate());
            return formatDate(self.fromDate());
        });
        self.settings = {
            showXaxisTicksInGrid: true,
            paddingFactor: 0.05
        };
        self.commonPlotOptions = {
            xaxis: {
                mode: "time",
                reserveSpace: true,
                min: null,
                max: null
            },
            yaxes: [{
                    position: "left",
                    reserveSpace: true,
                    labelWidth: 30

                }, {
                    position: "right",
                    reserveSpace: true,
                    labelWidth: 30,
                    color: "rgba(56, 174, 17, 0.5)",
                    tickColor: "rgba(56, 174, 17, 0.5)",
                }
            ],
            selection: {
                mode: "x",
                color: "rgba(0, 0, 0, 0.3)"
            },
            crosshair: {
                mode: "x",
                color: "#428bca",
                lineWidth: 3
            },
            grid: {
                hoverable: true,
                autoHighlight: false
            },
            legend: {
                position: "nw"
            },
            highlightColor: "#428bca"
        };
        self.plotArgs = {
            placeholder: $("#plot"),
            series: [],
            options: jQuery.extend(true, {}, self.commonPlotOptions)
        };
        self.macdPlotArgs = {
            placeholder: $("#macd-plot"),
            series: [],
            options: jQuery.extend(true, {
                grid: {
                    markings: [{
                            color: 'rgba(51, 120, 190, 0.2)',
                            lineWidth: 1,
                            yaxis: {from: 0, to: 0}
                        }, {
                            color: 'rgba(56, 174, 17, 0.15)',
                            lineWidth: 1,
                            y2axis: {from: 0, to: 0}
                        }]
                }}, self.commonPlotOptions)
        };
        self.$plot;
        self.$macdPlot;

        self.percent = ko.observable(0);
        self.formattedPercent = ko.computed(function() {
            return formatPercent(self.percent());
        });
        self.percentArrowClass = ko.computed(function() {
            if (self.percent() > 0) {
                return "fa-arrow-up";
            } else if (self.percent() < 0) {
                return "fa-arrow-down";
            } else {
                return "fa-arrow-right";
            }
        });
        self.percentColorClass = ko.computed(function() {
            if (self.percent() > 0) {
                return "text-success";
            } else if (self.percent() < 0) {
                return "text-danger";
            } else {
                return "";
            }
        });
        self.highest = ko.observable(0);
        self.formattedHighest = ko.computed(function() {
            return formatPrice(self.highest());
        });
        self.lowest = ko.observable(0);
        self.formattedLowest = ko.computed(function() {
            return formatPrice(self.lowest());
        });
        self.profit = ko.observable();
        self.formattedProfit = ko.computed(function() {
            return formatPercent(self.profit());
        });
        self.profitColorClass = ko.computed(function() {
            if (self.profit() > 0) {
                return "text-success";
            } else if (self.profit() < 0) {
                return "text-danger";
            } else {
                return "";
            }
        });

        // Behaviors
        self.changeScaleToAuto = function() {
            if (self.scale() !== "auto") {
                log.debug("Changing scale to Auto");
                self.scale("auto");
                self.processData();
                self.plot();
            }
        };
        self.changeScaleToDay = function() {
            if (self.scale() !== "day") {
                log.debug("Changing scale to Day");
                self.scale("day");
                self.processData();
                self.plot();
            }
        };
        self.changeScaleToWeek = function() {
            if (self.scale() !== "week") {
                log.debug("Changing scale to Week");
                self.scale("week");
                self.processData();
                self.plot();
            }
        };
        self.changeScaleToMonth = function() {
            if (self.scale() !== "month") {
                log.debug("Changing scale to Month");
                self.scale("month");
                self.processData();
                self.plot();
            }
        };
        self.changeScaleToYear = function() {
            if (self.scale() !== "year") {
                log.debug("Changing scale to Year");
                self.scale("year");
                self.processData();
                self.plot();
            }
        };

        self.changeTimePeriodToAll = function() {
            log.debug("Changing time period to All");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            self.timePeriod("all");
            self.toDate(getLastPriceDate());
            self.fromDate(getFromDateForTimePeriod());
            self.plot();
        };
        self.changeTimePeriodTo10Years = function() {
            log.debug("Changing time period to 10 Years");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            self.timePeriod("10years");
            self.toDate(getLastPriceDate());
            self.fromDate(getFromDateForTimePeriod());
            self.plot();
        };
        self.changeTimePeriodTo3Years = function() {
            log.debug("Changing time period to 3 Years");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            self.timePeriod("3years");
            self.toDate(getLastPriceDate());
            self.fromDate(getFromDateForTimePeriod());
            self.plot();
        };
        self.changeTimePeriodToYear = function() {
            log.debug("Changing time period to Year");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            self.timePeriod("year");
            self.toDate(getLastPriceDate());
            self.fromDate(getFromDateForTimePeriod());
            self.plot();
        };
        self.changeTimePeriodTo3Months = function() {
            log.debug("Changing time period to 3 Month");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            self.timePeriod("3months");
            self.toDate(getLastPriceDate());
            self.fromDate(getFromDateForTimePeriod());
            self.plot();
        };
        self.changeTimePeriodToMonth = function() {
            log.debug("Changing time period to Month");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            self.timePeriod("month");
            self.toDate(getLastPriceDate());
            self.fromDate(getFromDateForTimePeriod());
            self.plot();
        };
        self.changeTimePeriodToWeek = function() {
            log.debug("Changing time period to Week");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            self.timePeriod("week");
            self.toDate(getLastPriceDate());
            self.fromDate(getFromDateForTimePeriod());
            self.plot();
        };

        self.toggleSplitDetection = function() {
            if (self.enableSplitDetection() === false) {
                log.debug("Enabling Split Detection");
                self.enableSplitDetection(true);
            } else {
                log.debug("Disabling Split Detection");
                self.enableSplitDetection(false);
            }
            self.processData();
            self.plot();
        };
        self.toggleMa5Ma14 = function() {
            if (self.showMa5Ma14() === true) {
                log.debug("Hiding MA5/MA14");
                self.showMa5Ma14(false);
            } else {
                log.debug("Showing MA5/MA14");
                self.showMa5Ma14(true);
            }
            self.plot();
        };
        self.toggleMa50Ma100Ma200 = function() {
            if (self.showMa50Ma100Ma200() === true) {
                log.debug("Hiding MA50/MA100/MA200");
                self.showMa50Ma100Ma200(false);
            } else {
                log.debug("Showing MA50/MA100/MA200");
                self.showMa50Ma100Ma200(true);
            }
            self.plot();
        };
        self.toggleMacd = function() {
            if (self.showMacd() === true) {
                log.debug("Hiding MACD 12,26,9");
                self.showMacd(false);
            } else {
                log.debug("Showing MACD 12,26,9");
                self.showMacd(true);
            }
            self.plot();
        };


        self.slideMaFastest = function(viewModel, event, ranges) {
            log.debug("Sliding MA Fastest");
            var newDatumPoints = event.value;
            if (self.maFastestDatumPoints() !== newDatumPoints) {
                self.maFastestDatumPoints(newDatumPoints);
                var priceTA = TA(getPricesAsArray(self.price().data));
                self.maFastest().data = convertToFlotFormat(priceTA.ma(newDatumPoints).asArray(), self.price().data);
                self.plotArgs.series[1] = self.maFastest();
                self.plot();
            }
        };
        self.slideMaFast = function(viewModel, event, ranges) {
            log.debug("Sliding MA Fast");
            var newDatumPoints = event.value;
            if (self.maFastDatumPoints() !== newDatumPoints) {
                self.maFastDatumPoints(newDatumPoints);
                var priceTA = TA(getPricesAsArray(self.price().data));
                self.maFast().data = convertToFlotFormat(priceTA.ma(newDatumPoints).asArray(), self.price().data);
                self.plotArgs.series[2] = self.maFast();
                self.plot();
            }
        };
        self.slideMaSlow = function(viewModel, event, ranges) {
            log.debug("Sliding MA Slow");
            var newDatumPoints = event.value;
            if (self.maSlowDatumPoints() !== newDatumPoints) {
                self.maSlowDatumPoints(newDatumPoints);
                var priceTA = TA(getPricesAsArray(self.price().data));
                self.maSlow().data = convertToFlotFormat(priceTA.ma(newDatumPoints).asArray(), self.price().data);
                self.plotArgs.series[3] = self.maSlow();
                self.plot();
            }
        };
        self.slideMaSlower = function(viewModel, event, ranges) {
            log.debug("Sliding MA Slower");
            var newDatumPoints = event.value;
            if (self.maSlowerDatumPoints() !== newDatumPoints) {
                self.maSlowerDatumPoints(newDatumPoints);
                var priceTA = TA(getPricesAsArray(self.price().data));
                self.maSlower().data = convertToFlotFormat(priceTA.ma(newDatumPoints).asArray(), self.price().data);
                self.plotArgs.series[4] = self.maSlower();
                self.plot();
            }
        };
        self.slideMaSlowest = function(viewModel, event, ranges) {
            log.debug("Sliding MA Slowest");
            var newDatumPoints = event.value;
            if (self.maSlowestDatumPoints() !== newDatumPoints) {
                self.maSlowestDatumPoints(newDatumPoints);
                var priceTA = TA(getPricesAsArray(self.price().data));
                self.maSlowest().data = convertToFlotFormat(priceTA.ma(newDatumPoints).asArray(), self.price().data);
                self.plotArgs.series[5] = self.maSlowest();
                self.plot();
            }
        };

        self.updateFromDate = function(date) {
            log.trace("Updating from date");
            var bouncedMillis = null;
            var minDate = self.price().data[0][0];
            if (date.isBefore(minDate)) {
                bouncedMillis = minDate.diff(self.fromDate());
                date = minDate.clone();
            }
            self.fromDate(date);
            return bouncedMillis;
        };
        self.updateToDate = function(date) {
            log.trace("Updating to date");
            var bouncedMillis = null;
            var maxDate = self.price().data[self.price().data.length - 1][0];
            if (date.isAfter(maxDate)) {
                bouncedMillis = maxDate.diff(self.toDate());
                date = maxDate.clone();
            }
            self.toDate(date);
            return bouncedMillis;
        };

        self.changeFromDate = function(viewModel, event) {
            var isFromDateUpdated = !moment(event.date).isSame(self.fromDate());
            if (isFromDateUpdated) {
                log.debug("Changing From Date");
                self.updateFromDate(moment(event.date));
                self.timePeriod("custom");
                self.plot();
            }
        };
        self.changeToDate = function(viewModel, event) {
            var isToDateUpdated = !moment(event.date).isSame(self.toDate());
            if (isToDateUpdated) {
                log.debug("Changing To Date");
                self.updateToDate(moment(event.date));
                self.timePeriod("custom");
                self.plot();
            }
        };

        self.zoomSelectionFrom;
        self.zoomSelectionTo;
        self.mouseDown = function(viewModel, event) {
            log.debug("Mouse key pressed, which = " + event.which);
            if (event.which === 1) {
                log.debug("Left mouse key pressed");
                self.zoomSelectionFrom = event.clientX;
            }
        };
        self.mouseMove = function(viewModel, event) {
            if (event.which === 1) {
                log.debug("Mouse is moved with left mouse key pressed");
                self.zoomSelectionTo = event.clientX;
            }
        };
        self.zoomSelection = function(viewModel, event, ranges) {
            log.debug("Zooming selected");
            var zoomDirection = (self.zoomSelectionTo - self.zoomSelectionFrom) < 0 ? "left" : "right";
            var fromIndex = self.findClosestDatapoint(ranges.xaxis.from);
            var toIndex = self.findClosestDatapoint(ranges.xaxis.to);
            if ((toIndex - fromIndex) >= 2) {
                if (zoomDirection === "left") {
                    self.undoZoom();
                } else if (zoomDirection === "right"){
                    self.zoomHistory.push({
                        fromDate: self.fromDate().clone(),
                        toDate: self.toDate().clone(),
                        timePeriod: self.timePeriod()
                    });
                    var from = self.price().data[fromIndex][0].clone();
                    var to = self.price().data[toIndex][0].clone();
                    self.updateFromDate(from);
                    self.updateToDate(to);
                    self.timePeriod("custom");
                    self.plot();
                }
            }
            if (ranges !== null) {
                self.$plot.clearSelection();
                if (self.showMacd()) {
                    self.$macdPlot.clearSelection();
                }
            }
        };
        self.syncSelectionInPlot = function(viewModel, event, ranges) {
            if (ranges !== null) {
                self.$plot.setSelection(ranges, true);
            }
        };
        self.syncSelectionInMacdPlot = function(viewModel, event, ranges) {
            if (self.showMacd() && ranges !== null) {
                self.$macdPlot.setSelection(ranges, true);
            }
        };

        self.scrollPanZoom = _.throttle(function(viewModel, event) {
            if (event.ctrlKey) {
                log.debug("Scroll zooming");
                var SCROLL_ZOOM_THRESHOLD = 2;
                if (event.originalEvent.wheelDeltaY < -SCROLL_ZOOM_THRESHOLD) {
                    self.zoomOut();
                } else if (event.originalEvent.wheelDeltaY > SCROLL_ZOOM_THRESHOLD) {
                    self.zoomIn();
                } else if (event.originalEvent.wheelDeltaX < -SCROLL_ZOOM_THRESHOLD) {
                    self.panRight();
                } else if (event.originalEvent.wheelDeltaX > SCROLL_ZOOM_THRESHOLD) {
                    self.panLeft();
                }
                return false;
            }
            return true;
        });
        self.undoZoom = function() {
            log.debug("Undoing zoom pressed, zoomHistory: " + JSON.stringify(self.zoomHistory()));
            var lastZoomHistory = self.zoomHistory.pop();
            if (lastZoomHistory !== undefined) {
                log.debug("Undoing zoom");
                self.updateFromDate(lastZoomHistory.fromDate);
                self.updateToDate(lastZoomHistory.toDate);
                self.timePeriod(lastZoomHistory.timePeriod);
                self.plot();
            }
        };
        self.zoomOut = function() {
            log.debug("Zooming out");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            var delta = getZoomOutDeltaForTimePeriod();
            if (self.toDate().isSame(self.price().data[self.price().data.length - 1][0])) {
                self.updateFromDate(self.fromDate().subtract(delta.timeUnit, delta.value * 2));
            } else if (self.fromDate().isSame(self.price().data[0][0])) {
                self.updateToDate(self.toDate().add(delta.timeUnit, delta.value * 2));
            } else {
                self.updateFromDate(self.fromDate().subtract(delta.timeUnit, delta.value));
                self.updateToDate(self.toDate().add(delta.timeUnit, delta.value));
            }
            self.timePeriod("custom");
            self.plot();
        };
        self.zoomIn = function() {
            log.debug("Zooming in");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            var delta = getZoomInDeltaForTimePeriod();
            if (self.toDate().isSame(self.price().data[self.price().data.length - 1][0])) {
                self.updateFromDate(self.fromDate().add(delta.timeUnit, delta.value * 2));
            } else if (self.fromDate().isSame(self.price().data[0][0])) {
                self.updateToDate(self.toDate().subtract(delta.timeUnit, delta.value * 2));
            } else {
                self.updateFromDate(self.fromDate().add(delta.timeUnit, delta.value));
                self.updateToDate(self.toDate().subtract(delta.timeUnit, delta.value));
            }
            self.timePeriod("custom");
            self.plot();
        };

        self.panLeft = function() {
            log.debug("Panning left");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            var delta = getPanDeltaForTimePeriod();
            var bouncedDuration = self.updateFromDate(self.fromDate().clone().subtract(delta.timeUnit, delta.value));
            if (bouncedDuration !== null) {
                self.updateToDate(self.toDate().clone().add(bouncedDuration));
            } else {
                self.updateToDate(self.toDate().clone().subtract(delta.timeUnit, delta.value));
            }
            self.timePeriod("custom");
            self.plot();
        };
        self.panRight = function() {
            log.debug("Panning right");
            self.zoomHistory.push({
                fromDate: self.fromDate().clone(),
                toDate: self.toDate().clone(),
                timePeriod: self.timePeriod()
            });
            var delta = getPanDeltaForTimePeriod();
            var bouncedDuration = self.updateToDate(self.toDate().clone().add(delta.timeUnit, delta.value));
            if (bouncedDuration !== null) {
                self.updateFromDate(self.fromDate().clone().add(bouncedDuration));
            } else {
                self.updateFromDate(self.fromDate().clone().add(delta.timeUnit, delta.value));
            }
            self.timePeriod("custom");
            self.plot();
        };
        self.ctrlKeyDown = false;
        self.keyboardShortcutsHandler = _.throttle(function(viewModel, event) {
            if (event.target.tagName === "INPUT") {
                return true;
            }
            var keyCode = (event.which ? event.which : event.keyCode);
            log.debug("Handling keyboard shortcuts (keyCode = " + keyCode + ")");
            if (keyCode === 37) { // Left arrow
                log.debug("Left arrow key pressed");
                self.panLeft();
                return false;
            } else if (keyCode === 39) { // Right arrow
                log.debug("Right arrow key pressed");
                self.panRight();
                return false;
            } else if (keyCode === 40) { // Down arrow
                log.debug("Down arrow key pressed");
                self.zoomOut();
                return false;
            } else if (keyCode === 38) { // Up arrow
                log.debug("Up arrow key pressed");
                self.zoomIn();
                return false;
            } else if (keyCode === 189) { // Minus sign
                log.debug("Minus sign key pressed");
                self.zoomOut();
                return false;
            } else if (keyCode === 187) { // Plus sign
                log.debug("Plus sign key pressed");
                self.zoomIn();
                return false;
            } else if (keyCode === 27) { // Escape
                log.debug("Escape key pressed");
                self.changeTimePeriodToAll();
                return false;
            } else if (keyCode === 8) { // Backspace
                log.debug("Backspace key pressed");
                self.undoZoom();
                return false;
            } else if (keyCode === 17) { // Ctrl
                log.debug("Ctrl key pressed");
                self.ctrlKeyDown = true;
                self.hoverPopoverDate(self.hoverPopoverDate()); // Refresh hover popover date
                return true;
            }
            return true;
        });
        self.resetCtrlKeyDown = _.throttle(function(viewModel, event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 17) { // Ctrl
                log.debug("Ctrl key released");
                self.ctrlKeyDown = false;
                self.hoverPopoverDate(self.hoverPopoverDate()); // Refresh hover popover date
                return true;
            }
            return true;
        });

        self.previousPriceInfoIndex;
        self.hoverPopoverPercent = ko.observable("");
        self.hoverPopoverFormattedPercent = ko.computed(function() {
            return formatPercent(self.hoverPopoverPercent());
        });
        self.hoverPopoverPercentArrowClass = ko.computed(function() {
            if (self.hoverPopoverPercent() > 0) {
                return "fa-arrow-up";
            } else if (self.hoverPopoverPercent() < 0) {
                return "fa-arrow-down";
            } else {
                return "fa-arrow-right";
            }
        });
        self.hoverPopoverPercentColorClass = ko.computed(function() {
            if (self.hoverPopoverPercent() > 0) {
                return "text-success";
            } else if (self.hoverPopoverPercent() < 0) {
                return "text-danger";
            } else {
                return "";
            }
        });
        self.hoverPopoverPrice = ko.observable("");
        self.hoverPopoverFormattedPrice = ko.computed(function() {
            return formatPrice(self.hoverPopoverPrice());
        });
        self.hoverPopoverDate = ko.observable();
        self.hoverPopoverFormattedDate = ko.computed(function() {
            if (self.hoverPopoverDate() === undefined) {
                return "";
            } else if (self.ctrlKeyDown) {
                // Show detailed format
                return formatLongDate(self.hoverPopoverDate());
            } else {
                return formatDate(self.hoverPopoverDate());
            }
        });
        self.showPriceInfo = function(viewModel, event, pos, item) {
            if (self.$plot !== undefined) {
                var priceInfoIndex = self.findClosestDatapoint(pos.x);
                if (priceInfoIndex !== self.previousPriceInfoIndex) {
                    log.trace("Showing price info");
                    self.$plot.unhighlight(0, self.previousPriceInfoIndex);
                    var date = self.plotArgs.series[0].data[priceInfoIndex][0];
                    var price = self.plotArgs.series[0].data[priceInfoIndex][1];
                    var priceToTheLeft = priceInfoIndex > 0 ? self.plotArgs.series[0].data[priceInfoIndex - 1][1] : null;

                    // Lock the crosshair to the closest data point being hovered
                    self.$plot.lockCrosshair({
                        x: date,
                        y: price
                    });
                    if (self.showMacd() && self.$macdPlot !== undefined) {
                        self.$macdPlot.lockCrosshair({
                            x: date,
                            y: price
                        });
                    }
                    self.$plot.highlight(0, priceInfoIndex);

                    var percent = null;
                    if (priceToTheLeft !== null) {
                        var percent = (price - priceToTheLeft) / priceToTheLeft;
                    }
                    self.hoverPopoverPercent(percent);
                    self.hoverPopoverPrice(price);
                    self.hoverPopoverDate(date);
                    var pointOffset = self.$plot.pointOffset({x: date, y: price});

                    $("#hover-popover").show().css({
                        top: pointOffset.top - 21,
                        left: pointOffset.left + 30
                    });
                    self.previousPriceInfoIndex = priceInfoIndex;
                }
            }
        };

        self.hidePriceInfo = function() {
            if (self.$plot !== undefined) {
                self.$plot.clearCrosshair();
                if (self.showMacd() && self.$macdPlot !== undefined) {
                    self.$macdPlot.clearCrosshair();
                }
                self.$plot.unhighlight(0, self.previousPriceInfoIndex);
                $("#hover-popover").hide();
                self.previousPriceInfoIndex = null;
            }
        };

        // Functions
        self.init = function() {
            $("#symbol").select2({
                width: "200px",
                data: function() {
                    var data = [];
                    $(self.symbols()).each(function(index, symbol) {
                        data.push(symbol);
                    });
                    return {text: 'text', results: data};
                },
                createSearchChoice: function(term, data) {
                    if ($(data).filter(function() {
                        return this.text.localeCompare(term) === 0;
                    }).length === 0) {
                        return {id: term, text: term};
                    }
                }
            });
            $("#symbol").select2("val", self.symbol()).on("select2-close", function () {
                setTimeout(function () {
                    $('.select2-container-active').removeClass('select2-container-active');
                    // Manually blur search input on close to let placeholder reappear
                    // See https://github.com/ivaynberg/select2/issues/1545
                    $(':focus').blur();
                }, 1);
            });
            $("#symbol").on("change", function(event) {
                self.symbol(event.val);
                self.downloadData(function(data) {
                    self.downloadedData = data;
                    self.processData();
                    self.plot();
                });
            });

            self.downloadData(function(data) {
                self.downloadedData = data;
                self.processData();
                self.plot();
            });
        };

        self.downloadData = function(callback) {
            log.debug("Downloading data for symbol " + self.symbol());
            var data = convertToFlotFormat(yahooFinance(self.symbol()).getData());
            callback(data);
        };

        self.processData = function() {
            log.debug("Processing data");
            var start = moment().valueOf();
            self.plotArgs.series = [];

            self.price().data = jQuery.extend(true, [], self.downloadedData);
            if (self.enableSplitDetection()) {
                log.debug("Adjusting splits");
                adjustSplits(self.price().data);

            }
            switch (self.scale()) {
                case "day":
                    // Keeping original self.price().data
                    break;
                case "week":
                    self.price().data = scaleToWeek(self.price().data);
                    break;
                case "month":
                    self.price().data = scaleToMonth(self.price().data);
                    break;
                case "year":
                    self.price().data = scaleToYear(self.price().data);
                    break;
            }

            // Init from and to date
            self.toDate(getLastPriceDate());
            self.fromDate(getFromDateForTimePeriod());


            // Get Price
            self.price().label = self.symbolName();
            self.plotArgs.series.push(self.price());

            var priceTA = TA(getPricesAsArray(self.price().data));
            // Calculate MA Fastest
            self.maFastest().data = convertToFlotFormat(priceTA.ma(self.maFastestDatumPoints()).asArray(), self.price().data);
            self.plotArgs.series.push(self.maFastest());

            // Calculate MA Fast
            self.maFast().data = convertToFlotFormat(priceTA.ma(self.maFastDatumPoints()).asArray(), self.price().data);
            self.plotArgs.series.push(self.maFast());

            // Calculate MA Slow
            self.maSlow().data = convertToFlotFormat(priceTA.ma(self.maSlowDatumPoints()).asArray(), self.price().data);
            self.plotArgs.series.push(self.maSlow());

            // Calculate MA Slower
            self.maSlower().data = convertToFlotFormat(priceTA.ma(self.maSlowerDatumPoints()).asArray(), self.price().data);
            self.plotArgs.series.push(self.maSlower());

            // Calculate MA Slowest
            self.maSlowest().data = convertToFlotFormat(priceTA.ma(self.maSlowestDatumPoints()).asArray(), self.price().data);
            self.plotArgs.series.push(self.maSlowest());

            var macdTA = priceTA.macd(26, 12, 9);
            // Calculate MACD
            self.macd().data = convertToFlotFormat(macdTA.macd.asArray(), self.price().data);
            self.macdPlotArgs.series.push(self.macd());

            // Calculate MACD Signal
            self.macdSignal().data = convertToFlotFormat(macdTA.signal.asArray(), self.price().data);
            self.macdPlotArgs.series.push(self.macdSignal());

            // Calculate MACD Histogram
            self.macdHistogram().data = convertToFlotFormat(macdTA.histogram.asArray(), self.price().data);
            self.macdPlotArgs.series.push(self.macdHistogram());

            var stop = moment().valueOf();
            var executionTime = stop - start;
            log.debug("Processing data took " + executionTime + " milliseconds");
        };

        self.plot = function() {
            log.debug("Plotting");
            var start = moment().valueOf();
            self.plotMain();
            self.plotMacd();
            var stop = moment().valueOf();
            var executionTime = stop - start;
            log.debug("Plotting took " + executionTime + " milliseconds");
        };

        self.plotMain = function() {
            log.debug("Plotting Main");
            self.updatePlotAxisMinAndMax();
            self.updatePercentAndHighestAndLowest();
            if (self.showMa5Ma14()) {
                self.maFastest().lines.show = true;
                self.maFastest().label = "MA " + self.maFastestDatumPoints();
                self.maFast().lines.show = true;
                self.maFast().label = "MA " + self.maFastDatumPoints();
            } else {
                self.maFastest().lines.show = false;
                self.maFastest().label = null;
                self.maFast().lines.show = false;
                self.maFast().label = null;
            }
            if (self.showMa50Ma100Ma200()) {
                self.maSlow().lines.show = true;
                self.maSlow().label = "MA " + self.maSlowDatumPoints();
                self.maSlower().lines.show = true;
                self.maSlower().label = "MA " + self.maSlowerDatumPoints();
                self.maSlowest().lines.show = true;
                self.maSlowest().label = "MA " + self.maSlowestDatumPoints();
            } else {
                self.maSlow().lines.show = false;
                self.maSlow().label = null;
                self.maSlower().lines.show = false;
                self.maSlower().label = null;
                self.maSlowest().lines.show = false;
                self.maSlowest().label = null;
            }
            if (self.settings.showXaxisTicksInGrid) {
                self.plotArgs.options.xaxis.tickColor = null;
            } else {
                self.plotArgs.options.xaxis.tickColor = "transparent";
            }
            if (self.showMacd()) {
                self.plotArgs.options.xaxis.font = {color: "transparent"};
            } else {
                self.plotArgs.options.xaxis.font = null;
            }
            self.$plot = $.plot(self.plotArgs.placeholder, self.plotArgs.series, self.plotArgs.options);
        };

        self.plotMacd = function() {
            log.debug("Plotting MACD");
            self.updateMacdPlotAxisMinAndMax();
            if (self.showMacd()) {
                if (self.settings.showXaxisTicksInGrid) {
                    self.macdPlotArgs.options.xaxis.tickColor = null;
                } else {
                    self.macdPlotArgs.options.xaxis.tickColor = "transparent";
                }

                self.macdPlotArgs.series = [self.macdHistogram(), self.macd(), self.macdSignal()];
                $("#macd-plot").css("margin-top", "-26px");
                $("#macd-plot").slideDown('fast', function() {
                    self.$macdPlot = $.plot(this, self.macdPlotArgs.series, self.macdPlotArgs.options);
                    self.updateProfit();
                });
            } else {
                $('#macd-plot').slideUp('fast', function() {
                    $('#macd-plot').html("");
                });
            }
        };

        self.updatePlotAxisMinAndMax = function() {
            log.trace("updatePlotAxisMinAndMax()");
            // Update xaxis min/max
            self.plotArgs.options.xaxis.min = self.fromDate();
            self.plotArgs.options.xaxis.max = self.toDate();

            // Find yaxis min/max
            var yaxisMinMax = findYaxisMinMax(self.price(), self.fromDate(), self.toDate());
            if (self.showMa5Ma14()) {
                yaxisMinMax = findYaxisMinMax([self.maFastest(), self.maFast()], self.fromDate(), self.toDate(), yaxisMinMax);
            }
            if (self.showMa50Ma100Ma200()) {
                yaxisMinMax = findYaxisMinMax([self.maSlow(), self.maSlower(), self.maSlowest()], self.fromDate(), self.toDate(), yaxisMinMax);
            }
            yaxisMinMax = addPaddingsToYaxisMinMax(yaxisMinMax, self.settings.paddingFactor);

            // Update yaxis min/max
            self.plotArgs.options.yaxes[0].min = yaxisMinMax.min;
            self.plotArgs.options.yaxes[0].max = yaxisMinMax.max;
        };

        self.updateMacdPlotAxisMinAndMax = function() {
            log.trace("updateMacdPlotAxisMinAndMax()");
            // Update xaxis min/max
            self.macdPlotArgs.options.xaxis.min = self.fromDate();
            self.macdPlotArgs.options.xaxis.max = self.toDate();

            // Find yaxis min/max for left yaxis
            var yaxisLeftMinMax = findYaxisMinMax([self.macd(), self.macdSignal()], self.fromDate(), self.toDate());
            yaxisLeftMinMax = addPaddingsToYaxisMinMax(yaxisLeftMinMax, self.settings.paddingFactor);

            // Update yaxis min/max for left yaxis
            self.macdPlotArgs.options.yaxes[0].min = yaxisLeftMinMax.min;
            self.macdPlotArgs.options.yaxes[0].max = yaxisLeftMinMax.max;

            // Find yaxis min/max for right yaxis
            var yaxisRightMinMax = findYaxisMinMax(self.macdHistogram(), self.fromDate(), self.toDate());
            yaxisRightMinMax = addPaddingsToYaxisMinMax(yaxisRightMinMax, self.settings.paddingFactor);

            // Update yaxis min/max for right yaxis
            self.macdPlotArgs.options.yaxes[1].min = yaxisRightMinMax.min;
            self.macdPlotArgs.options.yaxes[1].max = yaxisRightMinMax.max;
        };

        self.findClosestDatapoint = function(date) {
            log.trace("findClosestDatapoint()");
            var data = self.plotArgs.series[0].data;
            var minIndex = 0;
            var maxIndex = data.length - 1;
            var currentIndex;
            var currentDate;
            var currentDateToLeft;
            var currentDateToRight;

            while (minIndex <= maxIndex) {
                currentIndex = (minIndex + maxIndex) / 2 | 0;
                if (data[currentIndex - 1] === undefined) {
                    return 0;
                } else if (data[currentIndex + 1] === undefined) {
                    return data.length - 1;
                }

                currentDate = data[currentIndex][0].valueOf();
                currentDateToLeft = currentDate - (currentDate - data[currentIndex - 1][0].valueOf()) / 2;
                currentDateToRight = currentDate + (data[currentIndex + 1][0].valueOf() - currentDate) / 2;

                if (date < currentDateToLeft) {
                    maxIndex = currentIndex - 1;
                } else if (date >= currentDateToRight) {
                    minIndex = currentIndex + 1;
                } else {
                    return currentIndex;
                }
            }
            return null;
        };

        self.highestIndex;
        self.lowestIndex;
        self.updatePercentAndHighestAndLowest = function() {
            log.trace("updateLowestAndHighest()");

            // Find highest and lowest
            var first;
            var last;
            var highest;
            var lowest;
            var data = self.plotArgs.series[0].data;
            $.each(data, function(index, value) {
                if (first === undefined && value[0].valueOf() >= self.plotArgs.options.xaxis.min.valueOf()) {
                    first = value[1];
                }
                if (value[0].valueOf() <= self.plotArgs.options.xaxis.max.valueOf()) {
                    last = value[1];
                }

                // Check if value is within current time period
                if (value[0].valueOf() >= self.plotArgs.options.xaxis.min.valueOf() && value[0].valueOf() <= self.plotArgs.options.xaxis.max.valueOf()) {
                    // Set initial min/max values
                    if (highest === undefined) {
                        highest = value[1];
                        self.highestIndex = index;
                        lowest = value[1];
                        self.lowestIndex = index;
                    }
                    // Update min and max if current value is a new min or max
                    if (value[1] > highest) {
                        highest = value[1];
                        self.highestIndex = index;
                    } else if (value[1] < lowest) {
                        lowest = value[1];
                        self.lowestIndex = index;
                    }
                }
            });
            self.percent((last - first) / first);
            self.highest(highest);
            self.lowest(lowest);
        };

        self.updateProfit = function() {
            log.trace("updateProfit()");

            // Find highest and lowest
            var lastMacd;
            var macd;
            var stocks = 0;
            var money = 1000;
            var profit;
            var data = self.plotArgs.series[0].data;
            $.each(data, function(index, value) {
                if (value[0].valueOf() < self.plotArgs.options.xaxis.min.valueOf() || value[0].valueOf() > self.plotArgs.options.xaxis.max.valueOf()) {
                    return true;
                }
                if (index == 0 || self.macdHistogram().data[index][1] === null) {
                    return true;
                }
                if (lastMacd === undefined) {
                    lastMacd = self.macdHistogram().data[index][1];
                    return true;
                }

                macd = self.macdHistogram().data[index][1];
                if (lastMacd < 0 && macd > 0) {
                    log.trace("positive trend detected");
                    if (money != 0) {
                        stocks = money / value[1];
                        money = 0;
                        log.trace("bougth for price " + value[1] + " on " + value[0].format());
                    }
                } else if (lastMacd > 0 && macd < 0) {
                    log.trace("negative trend detected");
                    if (stocks != 0) {
                        money = stocks * value[1];
                        profit = money / 1000 - 1;
                        stocks = 0;
                        log.trace("sold for price " + value[1] + " on " + value[0].format() + " with profit " + numeral(profit).format("0.00%"));
                    }
                }
                lastMacd = self.macdHistogram().data[index][1];
            });
            self.profit(profit);
        };

        // Initialize
        self.init();
        function getLastPriceDate() {
            return self.price().data[self.price().data.length - 1][0].clone();
        }
        function getFromDateForTimePeriod() {
            if (self.timePeriod() === "all") {
                return self.price().data[0][0].clone();
            } else if (self.timePeriod() === "10years") {
                return self.toDate().clone().subtract("years", 10);
            } else if (self.timePeriod() === "3years") {
                return self.toDate().clone().subtract("years", 3);
            } else if (self.timePeriod() === "year") {
                return self.toDate().clone().subtract("years", 1);
            } else if (self.timePeriod() === "3months") {
                return self.toDate().clone().subtract("months", 3);
            } else if (self.timePeriod() === "month") {
                return self.toDate().clone().subtract("months", 1);
            } else if (self.timePeriod() === "week") {
                return self.toDate().clone().subtract("weeks", 1);
            } else {
                return self.fromDate().clone();
            }
        }
        function getDeltaForTimePeriod(factor) {
            var delta = self.toDate().diff(self.fromDate()) / factor;
            if (moment.duration(delta).asYears() > 1) {
                return {
                    timeUnit: "years",
                    value: Math.round(moment.duration(delta).asYears())
                };
            } else if (moment.duration(delta).asMonths() > 1) {
                return {
                    timeUnit: "months",
                    value: Math.round(moment.duration(delta).asMonths())
                };
            } else if (moment.duration(delta).asWeeks() > 1) {
                return {
                    timeUnit: "weeks",
                    value: Math.round(moment.duration(delta).asWeeks())
                };
            } else if (moment.duration(delta).asDays() > 1) {
                return {
                    timeUnit: "days",
                    value: Math.round(moment.duration(delta).asDays())
                };
            } else {
                return {
                    timeUnit: "days",
                    value: 1
                };
            }
        }
        function getZoomInDeltaForTimePeriod() {
            console.log("Zooming in " + getDeltaForTimePeriod(14).value + " " + getDeltaForTimePeriod(14).timeUnit);
            return getDeltaForTimePeriod(14);
        }
        function getZoomOutDeltaForTimePeriod() {
            console.log("Zooming out " + getDeltaForTimePeriod(12).value + " " + getDeltaForTimePeriod(12).timeUnit);
            return getDeltaForTimePeriod(12);
        }
        function getPanDeltaForTimePeriod() {
            return getZoomOutDeltaForTimePeriod();
        }
    }

    function getPricesAsArray(data) {
        return $.map(data, function(value) {
            return value[1];
        });
    }


});
