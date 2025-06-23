"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseTransformation = void 0;
class ResponseTransformation {
    static transform() {
        return (req, res, next) => {
            next();
        };
    }
}
exports.ResponseTransformation = ResponseTransformation;
//# sourceMappingURL=response-transformation.js.map