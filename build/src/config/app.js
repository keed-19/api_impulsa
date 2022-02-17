"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.application = void 0;
const application = {
    cors: {
        server: [
            {
                origin: "*",
                credentials: true,
                "Access-Control-Allow-Methods": 'POST, GET, OPTIONS, DELETE'
            }
        ]
    }
};
exports.application = application;
