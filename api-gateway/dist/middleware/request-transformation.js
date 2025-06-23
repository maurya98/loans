"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestTransformation = void 0;
class RequestTransformation {
    static transform() {
        return (req, res, next) => {
            next();
        };
    }
}
exports.RequestTransformation = RequestTransformation;
//# sourceMappingURL=request-transformation.js.map