"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSLTermination = void 0;
const logger_1 = require("../utils/logger");
class SSLTermination {
    static handle() {
        return (req, res, next) => {
            if (req.headers['x-forwarded-proto'] === 'https') {
                return next();
            }
            if (process.env.SSL_REQUIRED === 'true') {
                const httpsUrl = `https://${req.headers.host}${req.url}`;
                this.logger.info(`Redirecting HTTP to HTTPS: ${httpsUrl}`);
                return res.redirect(httpsUrl);
            }
            next();
        };
    }
}
exports.SSLTermination = SSLTermination;
SSLTermination.logger = new logger_1.Logger('SSLTermination');
//# sourceMappingURL=ssl-termination.js.map