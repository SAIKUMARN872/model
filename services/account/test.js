"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var strict_1 = require("node:assert/strict");
var app_js_1 = require("./app.js");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function request(path_1) {
            return __awaiter(this, arguments, void 0, function (path, options) {
                var response, text, body;
                if (options === void 0) { options = {}; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(baseUrl_1).concat(path), options)];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.text()];
                        case 2:
                            text = _a.sent();
                            body = null;
                            if (text) {
                                body = JSON.parse(text);
                            }
                            return [2 /*return*/, {
                                    response: response,
                                    body: body,
                                }];
                    }
                });
            });
        }
        var _a, app, eventBus, server, address, baseUrl_1, _b, response, body, create, accountId_1, _c, response, body, _d, response, body, _e, response, body, _f, response, body, _g, response, body, _h, response, body, _j, response, body, _k, response, body, _l, response, body, events_1, unsubscribe, response, _m, response, body;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    _a = (0, app_js_1.createAccountApp)(), app = _a.app, eventBus = _a.eventBus;
                    server = app.listen(0, "127.0.0.1");
                    return [4 /*yield*/, new Promise(function (resolve) {
                            server.once("listening", function () { return resolve(); });
                        })];
                case 1:
                    _o.sent();
                    _o.label = 2;
                case 2:
                    _o.trys.push([2, , 18, 20]);
                    address = server.address();
                    if (!address || typeof address === "string") {
                        throw new Error("Unable to determine test server address");
                    }
                    baseUrl_1 = "http://127.0.0.1:".concat(address.port);
                    console.log("Running ModelNow Account Service tests...\n");
                    return [4 /*yield*/, request("/health")];
                case 3:
                    _b = _o.sent(), response = _b.response, body = _b.body;
                    strict_1.default.equal(response.status, 200);
                    strict_1.default.equal(body.success, true);
                    strict_1.default.equal(body.service, "modelnow-account");
                    strict_1.default.equal(body.status, "healthy");
                    console.log("✓ health");
                    return [4 /*yield*/, request("/account", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                email: "integration@modelnow.ai",
                                name: "Integration User",
                            }),
                        })];
                case 4:
                    create = _o.sent();
                    strict_1.default.equal(create.response.status, 201);
                    strict_1.default.equal(create.body.success, true);
                    strict_1.default.ok(create.body.data.id);
                    strict_1.default.equal(create.body.data.email, "integration@modelnow.ai");
                    strict_1.default.equal(create.body.data.name, "Integration User");
                    strict_1.default.equal(create.body.data.status, "active");
                    strict_1.default.equal(create.body.data.plan, "free");
                    strict_1.default.equal(create.body.data.credits, 500);
                    accountId_1 = create.body.data.id;
                    console.log("✓ create account");
                    return [4 /*yield*/, request("/account/".concat(accountId_1))];
                case 5:
                    _c = _o.sent(), response = _c.response, body = _c.body;
                    strict_1.default.equal(response.status, 200);
                    strict_1.default.equal(body.data.id, accountId_1);
                    strict_1.default.equal(body.data.email, "integration@modelnow.ai");
                    console.log("✓ get account");
                    return [4 /*yield*/, request("/account/by-email?email=integration@modelnow.ai")];
                case 6:
                    _d = _o.sent(), response = _d.response, body = _d.body;
                    strict_1.default.equal(response.status, 200);
                    strict_1.default.equal(body.data.id, accountId_1);
                    console.log("✓ get by email");
                    return [4 /*yield*/, request("/account")];
                case 7:
                    _e = _o.sent(), response = _e.response, body = _e.body;
                    strict_1.default.equal(response.status, 200);
                    strict_1.default.equal(body.success, true);
                    strict_1.default.ok(Array.isArray(body.data));
                    strict_1.default.ok(body.data.some(function (account) {
                        return account.id === accountId_1;
                    }));
                    console.log("✓ list accounts");
                    return [4 /*yield*/, request("/account/".concat(accountId_1), {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                name: "Updated Integration User",
                                plan: "pro",
                            }),
                        })];
                case 8:
                    _f = _o.sent(), response = _f.response, body = _f.body;
                    strict_1.default.equal(response.status, 200);
                    strict_1.default.equal(body.data.name, "Updated Integration User");
                    strict_1.default.equal(body.data.plan, "pro");
                    console.log("✓ update account");
                    return [4 /*yield*/, request("/account/".concat(accountId_1, "/profile"))];
                case 9:
                    _g = _o.sent(), response = _g.response, body = _g.body;
                    strict_1.default.equal(response.status, 200);
                    strict_1.default.equal(body.success, true);
                    strict_1.default.equal(body.data.accountId, accountId_1);
                    strict_1.default.equal(body.data.timezone, "UTC");
                    console.log("✓ get profile");
                    return [4 /*yield*/, request("/account/".concat(accountId_1, "/profile"), {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                displayName: "Integration Profile",
                                timezone: "Asia/Kolkata",
                                preferences: {
                                    theme: "dark",
                                    language: "en",
                                },
                            }),
                        })];
                case 10:
                    _h = _o.sent(), response = _h.response, body = _h.body;
                    strict_1.default.equal(response.status, 200);
                    strict_1.default.equal(body.data.displayName, "Integration Profile");
                    strict_1.default.equal(body.data.timezone, "Asia/Kolkata");
                    strict_1.default.equal(body.data.preferences.theme, "dark");
                    strict_1.default.equal(body.data.preferences.language, "en");
                    console.log("✓ update profile");
                    return [4 /*yield*/, request("/account", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                email: "integration@modelnow.ai",
                                name: "Duplicate User",
                            }),
                        })];
                case 11:
                    _j = _o.sent(), response = _j.response, body = _j.body;
                    strict_1.default.equal(response.status, 409);
                    strict_1.default.equal(body.success, false);
                    strict_1.default.equal(body.error, "An account with this email already exists");
                    console.log("✓ duplicate email protection");
                    return [4 /*yield*/, request("/account", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                email: "invalid-email",
                                name: "Invalid User",
                            }),
                        })];
                case 12:
                    _k = _o.sent(), response = _k.response, body = _k.body;
                    strict_1.default.equal(response.status, 400);
                    strict_1.default.equal(body.success, false);
                    strict_1.default.equal(body.error, "Invalid email address");
                    console.log("✓ invalid email validation");
                    return [4 /*yield*/, request("/account/00000000-0000-0000-0000-000000000000")];
                case 13:
                    _l = _o.sent(), response = _l.response, body = _l.body;
                    strict_1.default.equal(response.status, 404);
                    strict_1.default.equal(body.success, false);
                    strict_1.default.equal(body.error, "Account not found");
                    console.log("✓ missing account handling");
                    events_1 = [];
                    unsubscribe = eventBus.subscribe(function (event) {
                        events_1.push(event.type);
                    });
                    return [4 /*yield*/, request("/account/".concat(accountId_1), {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                name: "Event Test User",
                            }),
                        })];
                case 14:
                    _o.sent();
                    return [4 /*yield*/, request("/account/".concat(accountId_1, "/profile"), {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                preferences: {
                                    eventTest: true,
                                },
                            }),
                        })];
                case 15:
                    _o.sent();
                    unsubscribe();
                    strict_1.default.ok(events_1.includes("account.updated"));
                    strict_1.default.ok(events_1.includes("profile.updated"));
                    console.log("✓ event bus");
                    return [4 /*yield*/, request("/account/".concat(accountId_1), {
                            method: "DELETE",
                        })];
                case 16:
                    response = (_o.sent()).response;
                    strict_1.default.equal(response.status, 204);
                    console.log("✓ delete account");
                    return [4 /*yield*/, request("/account/".concat(accountId_1))];
                case 17:
                    _m = _o.sent(), response = _m.response, body = _m.body;
                    strict_1.default.equal(response.status, 404);
                    strict_1.default.equal(body.success, false);
                    strict_1.default.equal(body.error, "Account not found");
                    console.log("✓ verify deletion");
                    console.log("\nAll ModelNow Account Service tests passed.");
                    return [3 /*break*/, 20];
                case 18: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        server.close(function (error) {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve();
                        });
                    })];
                case 19:
                    _o.sent();
                    return [7 /*endfinally*/];
                case 20: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("\nAccount Service tests failed.");
    console.error(error);
    process.exitCode = 1;
});
