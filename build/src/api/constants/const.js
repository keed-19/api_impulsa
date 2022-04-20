"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
var Status;
(function (Status) {
    Status[Status["active"] = 1] = "active";
    Status[Status["cancelled"] = 2] = "cancelled";
    Status[Status["renewed"] = 3] = "renewed";
    Status[Status["changeOfDuct"] = 4] = "changeOfDuct";
    Status[Status["notRenewed"] = 5] = "notRenewed";
    Status[Status["wasNotPaid"] = 6] = "wasNotPaid";
})(Status = exports.Status || (exports.Status = {}));
