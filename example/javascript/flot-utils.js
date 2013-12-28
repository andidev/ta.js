function findYaxisMinMax(series, from, to, currentYaxisMinMax) {
    if (!$.isArray(series)) {
        series = [series];
    }
    // Calculate yaxis min/max between from and to xaxis values
    var yaxisMin;
    var yaxisMax;
    if (currentYaxisMinMax !== undefined) {
        yaxisMin = currentYaxisMinMax.min;
        yaxisMax = currentYaxisMinMax.max;
    }

    $.each(series, function(index, serie) {
        $.each(serie.data, function(index, value) {
            // Check for min and max only if value xaxis is between from and to
            if (value[0] > from && value[0] < to && value[1] !== null) {
                // Set initial min/max values
                if (yaxisMin === undefined) {
                    yaxisMin = value[1];
                    yaxisMax = value[1];
                }
                // Update min and max if current value is a new min or max
                if (value[1] < yaxisMin) {
                    yaxisMin = value[1];
                } else if (value[1] > yaxisMax) {
                    yaxisMax = value[1];
                }
            }
        });
    });

    return {min: yaxisMin, max: yaxisMax};
}

function addPaddingsToYaxisMinMax(yaxisMinMax, paddingFactor) {
    var padding = (yaxisMinMax.max - yaxisMinMax.min) * paddingFactor;
    return {
        min: yaxisMinMax.min - padding,
        max: yaxisMinMax.max + padding
    };
}

function convertToFlotFormat(arg1, arg2) {
    if (arg2 === undefined) {
        // YQL Result passed as arg1
        log.trace("Converting YQL Result to Flot format");
        return $.map(arg1, function(value, index) {
            if (index === 0) {
                return;
            }
            return [[moment(value.date), parseFloat(value.close)]];
        }).reverse();
    } else {
        // Array passed as arg1 and price in Flot format as arg2
        log.trace("Converting array to Flot format");
        return $.map(arg1, function(value, index) {
            return [[arg2[index][0], value]];
        });
    }
}

function adjustSplits(data) {
    var previousPrice = data[data.length-1][1];
    var previousDate = data[data.length-1][0];
    var adjustFactor = 1;
    for (i = data.length-2; i >= 0; i--) {
        if (Math.round(data[i][1] / previousPrice) >= 2) {
            console.log("split found between " + data[i][0] + "(" + data[i][1] + ") to " + previousDate + " (" + previousPrice + ")")
            adjustFactor = adjustFactor / Math.round(data[i][1] / previousPrice);
        }
        previousPrice = data[i][1];
        previousDate = data[i][0];
        if (adjustFactor !== 1) {
            data[i][1] = data[i][1] * adjustFactor;
        }
    }
}