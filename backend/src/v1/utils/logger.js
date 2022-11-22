const { createLogger, format, transports } = require("winston");
const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.align(),
        format.printf((i) => `${i.level}: ${[i.timestamp]}: ${i.message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: "src/v1/logs/info.log",
            level: "info",
            format: format.combine(
                format.printf((i) =>
                    i.level === "info" ? `${i.level}: ${i.timestamp} ${i.message}` : ""
                )
            ),
            maxsize: 5242880, //5MB
        }),
        new transports.File({
            filename: "src/v1/logs/error.log",
            level: "error",
            maxsize: 5242880, //5MB
        }),
    ],
})

module.exports = logger;