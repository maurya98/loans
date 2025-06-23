"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
class Logger {
    constructor(context = 'Application') {
        this.context = context;
        this.logger = this.createLogger();
    }
    createLogger() {
        const logDir = process.env.LOG_FILE_PATH
            ? path_1.default.dirname(process.env.LOG_FILE_PATH)
            : './logs';
        const logLevel = process.env.LOG_LEVEL || 'info';
        const maxSize = process.env.LOG_MAX_SIZE || '20m';
        const maxFiles = process.env.LOG_MAX_FILES || '14';
        const consoleTransport = new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, level, message, context, ...meta }) => {
                return `${timestamp} [${level}] [${context || this.context}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
            }))
        });
        const fileTransport = new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDir, 'api-gateway-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: maxSize,
            maxFiles: maxFiles,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
        });
        const errorFileTransport = new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDir, 'api-gateway-error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: maxSize,
            maxFiles: maxFiles,
            level: 'error',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
        });
        return winston_1.default.createLogger({
            level: logLevel,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { context: this.context },
            transports: [
                consoleTransport,
                fileTransport,
                errorFileTransport
            ],
            exceptionHandlers: [
                new winston_1.default.transports.File({
                    filename: path_1.default.join(logDir, 'exceptions.log')
                })
            ],
            rejectionHandlers: [
                new winston_1.default.transports.File({
                    filename: path_1.default.join(logDir, 'rejections.log')
                })
            ]
        });
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    error(message, error) {
        this.logger.error(message, { error: error?.message || error, stack: error?.stack });
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    verbose(message, meta) {
        this.logger.verbose(message, meta);
    }
    silly(message, meta) {
        this.logger.silly(message, meta);
    }
    log(level, message, meta) {
        this.logger.log(level, message, meta);
    }
    profile(id, meta) {
        this.logger.profile(id, meta);
    }
    startTimer() {
        return this.logger.startTimer();
    }
    child(options) {
        return this.logger.child(options);
    }
    add(transport) {
        return this.logger.add(transport);
    }
    remove(transport) {
        return this.logger.remove(transport);
    }
    clear() {
        return this.logger.clear();
    }
    close() {
        return this.logger.close();
    }
    isLevelEnabled(level) {
        return this.logger.isLevelEnabled(level);
    }
    configure(options) {
        this.logger.configure(options);
    }
    getLogger() {
        return this.logger;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map