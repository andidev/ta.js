var log = log4javascript.getDefaultLogger();
var consoleAppender = new log4javascript.BrowserConsoleAppender()
log.removeAllAppenders();
log.addAppender(consoleAppender);
consoleAppender.setThreshold(log4javascript.Level.TRACE);
log.setLevel(log4javascript.Level.TRACE);
log.trace("Document Ready");