"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_gridfs_storage_1 = require("multer-gridfs-storage");
const database_1 = require("../../config/database");
const storage = new multer_gridfs_storage_1.GridFsStorage({
    url: database_1.conection,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (_req, file) => {
        return {
            bucketName: 'insurancePolicies',
            filename: `${Date.now()}-${file.originalname}`
        };
    }
});
const uploadFiles = (0, multer_1.default)({ storage: storage });
exports.uploadFiles = uploadFiles;
