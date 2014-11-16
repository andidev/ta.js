function defaultValue(defaultValue, data) {
    if (data === undefined) {
        return defaultValue;
    } else {
        return data;
    }
}

function defaultBooleanValue(defaultValue, data) {
    if (data === undefined) {
        return defaultValue;
    } else {
        if (data === "true") {
            return true;
        }
        return false;
    }
}

function defaultNumberValue(defaultValue, data) {
    if (data === undefined) {
        return defaultValue;
    } else {
        return parseInt(data);
    }
}

function scaleToWeek(data) {
    var scaledData = [];
    var currentWeek = data[0][0].isoWeek();
    var currentWeekIndex = 0;
    $.each(data, function(index, value) {
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
}

function scaleToMonth(data) {
    var scaledData = [];
    var currentMonth = data[0][0].month();
    var currentMonthIndex = 0;
    $.each(data, function(index, value) {
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
}

function scaleToYear(data) {
    var scaledData = [];
    var currentYear = data[0][0].year();
    var currentYearIndex = 0;
    $.each(data, function(index, value) {
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
}


function scaleTo(scale, data) {
    switch (scale) {
        case "day":
            // Keep original day scale
            return data;
        case "week":
            return scaleToWeek(data);
        case "month":
            return scaleToMonth(data);
        case "year":
            return scaleToYear(data);
    }
}