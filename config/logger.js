const winston = require("winston");

const MESSAGE = Symbol.for("message");

const replaceNewlinesWithCarriageReturns = winston.format((info, opts) => {
  if(info.message ){
    info.message = info.message.replace(/\n/g, "\r");
    return info;
  }
  if(info[MESSAGE] === undefined) {
    return info;
  }
  info[MESSAGE] = info[MESSAGE].replace(/\n/g, "\r");
  return info;
});

let transports = [
  new winston.transports.Console()
];

if(process.env.NODE_ENV !== "test") {
  transports.push(new winston.transports.File({ filename: "/var/log/webapp/webapplogs.log" }));
}
const logger = winston.createLogger({
  level: 'debug',
  format: 
    winston.format.combine(
    winston.format(log => ({ ...log, level: log.level.toUpperCase() }))(),
    replaceNewlinesWithCarriageReturns(),
    winston.format.timestamp(),
    winston.format.json())
  ,
  transports: transports
});

module.exports = logger;
