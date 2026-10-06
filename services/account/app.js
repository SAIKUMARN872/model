"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccountApp = createAccountApp;
var express_1 = require("express");
var config_js_1 = require("./config/config.js");
var index_js_1 = require("./repository/index.js");
var account_events_js_1 = require("./events/account-events.js");
var account_service_js_1 = require("./services/account-service.js");
var profile_service_js_1 = require("./services/profile-service.js");
var index_js_2 = require("./api/index.js");
function createAccountApp() {
    var config = (0, config_js_1.loadAccountConfig)();
    var accountRepository = new index_js_1.InMemoryAccountRepository();
    var profileRepository = new index_js_1.InMemoryProfileRepository();
    var eventBus = new account_events_js_1.AccountEventBus();
    var accountService = new account_service_js_1.AccountService(accountRepository, eventBus);
    var profileService = new profile_service_js_1.ProfileService(profileRepository, accountRepository, eventBus);
    var accountController = new index_js_2.AccountController(accountService);
    var profileController = new index_js_2.ProfileController(profileService);
    var app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: "1mb" }));
    app.get("/health", function (_req, res) {
        res.json({
            success: true,
            service: "modelnow-account",
            status: "healthy",
            environment: config.environment,
            timestamp: new Date().toISOString(),
        });
    });
    app.get("/account", accountController.list);
    app.post("/account", accountController.create);
    app.get("/account/by-email", accountController.getByEmail);
    app.get("/account/:id", accountController.getById);
    app.patch("/account/:id", accountController.update);
    app.delete("/account/:id", accountController.delete);
    app.get("/account/:id/profile", profileController.get);
    app.patch("/account/:id/profile", profileController.update);
    app.get("/account/events/stream", function (req, res) {
        res.status(200);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        var sendEvent = function (event) {
            res.write("id: ".concat(event.id, "\n"));
            res.write("event: ".concat(event.type, "\n"));
            res.write("data: ".concat(JSON.stringify({
                id: event.id,
                type: event.type,
                timestamp: event.timestamp,
                data: event.data,
            }), "\n\n"));
        };
        res.write("event: connected\ndata: ".concat(JSON.stringify({
            service: "modelnow-account",
            connectedAt: new Date().toISOString(),
        }), "\n\n"));
        var unsubscribe = eventBus.subscribe(sendEvent);
        var heartbeat = setInterval(function () {
            res.write("event: heartbeat\ndata: ".concat(JSON.stringify({
                timestamp: new Date().toISOString(),
            }), "\n\n"));
        }, 15000);
        req.on("close", function () {
            clearInterval(heartbeat);
            unsubscribe();
            res.end();
        });
    });
    app.use(function (err, _req, res, _next) {
        var message = err instanceof Error
            ? err.message
            : "Internal server error";
        var status = message === "Account not found"
            ? 404
            : message.includes("already exists")
                ? 409
                : message.includes("Invalid") ||
                    message.includes("required")
                    ? 400
                    : 500;
        res.status(status).json({
            success: false,
            error: message,
        });
    });
    return {
        app: app,
        accountRepository: accountRepository,
        profileRepository: profileRepository,
        eventBus: eventBus,
    };
}
