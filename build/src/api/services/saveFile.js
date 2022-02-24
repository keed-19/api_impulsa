"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
const multer_1 = __importDefault(require("multer"));
const mime_types_1 = __importDefault(require("mime-types"));
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads');
    },
    filename: function (res, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime_types_1.default.extension(file.mimetype));
    }
});
var Upload = (0, multer_1.default)({ storage: storage });
exports.Upload = Upload;
