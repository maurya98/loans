"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORSHandler = void 0;
const cors_1 = __importDefault(require("cors"));
class CORSHandler {
    static handle() {
        const options = {};
        return (0, cors_1.default)(options);
    }
}
exports.CORSHandler = CORSHandler;
//# sourceMappingURL=cors.js.map