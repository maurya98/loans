import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

export class Logger {
  private logger: winston.Logger;
  private context: string;

  constructor(context: string = 'Application') {
    this.context = context;
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logDir = process.env.LOG_FILE_PATH 
      ? path.dirname(process.env.LOG_FILE_PATH)
      : './logs';

    const logLevel = process.env.LOG_LEVEL || 'info';
    const maxSize = process.env.LOG_MAX_SIZE || '20m';
    const maxFiles = process.env.LOG_MAX_FILES || '14';

    // Console transport
    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          return `${timestamp} [${level}] [${context || this.context}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      )
    });

    // File transport with rotation
    const fileTransport = new DailyRotateFile({
      filename: path.join(logDir, 'api-gateway-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: maxSize,
      maxFiles: maxFiles,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    });

    // Error file transport
    const errorFileTransport = new DailyRotateFile({
      filename: path.join(logDir, 'api-gateway-error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: maxSize,
      maxFiles: maxFiles,
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    });

    return winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { context: this.context },
      transports: [
        consoleTransport,
        fileTransport,
        errorFileTransport
      ],
      exceptionHandlers: [
        new winston.transports.File({ 
          filename: path.join(logDir, 'exceptions.log') 
        })
      ],
      rejectionHandlers: [
        new winston.transports.File({ 
          filename: path.join(logDir, 'rejections.log') 
        })
      ]
    });
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public error(message: string, error?: any): void {
    this.logger.error(message, { error: error?.message || error, stack: error?.stack });
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }

  public silly(message: string, meta?: any): void {
    this.logger.silly(message, meta);
  }

  public log(level: string, message: string, meta?: any): void {
    this.logger.log(level, message, meta);
  }

  public profile(id: string, meta?: any): void {
    this.logger.profile(id, meta);
  }

  public startTimer(): winston.Profiler {
    return this.logger.startTimer();
  }

  public child(options: winston.LoggerOptions): winston.Logger {
    return this.logger.child(options);
  }

  public add(transport: winston.transport): winston.Logger {
    return this.logger.add(transport);
  }

  public remove(transport: winston.transport): winston.Logger {
    return this.logger.remove(transport);
  }

  public clear(): winston.Logger {
    return this.logger.clear();
  }

  public close(): winston.Logger {
    return this.logger.close();
  }

  public isLevelEnabled(level: string): boolean {
    return this.logger.isLevelEnabled(level);
  }

  public configure(options: winston.LoggerOptions): void {
    this.logger.configure(options);
  }

  public getLogger(): winston.Logger {
    return this.logger;
  }
} 