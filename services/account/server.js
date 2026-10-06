"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_js_1 = require("./app.js");
var config_js_1 = require("./config/config.js");
var config = (0, config_js_1.loadAccountConfig)();
var app = (0, app_js_1.createAccountApp)().app;
app.listen(config.port, config.host, function () {
    console.log("ModelNow Account Service listening on http://localhost:".concat(config.port));
});
