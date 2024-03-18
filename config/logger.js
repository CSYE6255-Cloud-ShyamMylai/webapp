const winston = require("winston");

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
    winston.format.timestamp(),
    winston.format.json())
  ,
  transports: transports
});

module.exports = logger;
