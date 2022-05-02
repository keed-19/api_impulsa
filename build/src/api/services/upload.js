"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFilesMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_gridfs_storage_1 = require("multer-gridfs-storage");
const util_1 = __importDefault(require("util"));
// const {GridFsStorage} = require('multer-gridfs-storage');
const url = process.env.DB_URI || '';
// Create a storage object with a given configuration
// const storage = new GridFsStorage({ url });
// Set multer storage engine to the newly created object
var storage = new multer_gridfs_storage_1.GridFsStorage({
    url: url,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (_req, file) => {
        const match = ["application/pdf"];
        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-bezkoder-${file.originalname}`;
            return filename;
        }
        return {
            bucketName: url,
            filename: `${Date.now()}-bezkoder-${file.originalname}`
        };
    }
});
var uploadFiles = (0, multer_1.default)({ storage: storage }).single("file");
var uploadFilesMiddleware = util_1.default.promisify(uploadFiles);
exports.uploadFilesMiddleware = uploadFilesMiddleware;
module.exports = uploadFilesMiddleware;
// export { upload };
