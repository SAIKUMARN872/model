const {
  getDefaultConfig,
  mergeConfig,
} = require("metro-config");

const config = {};

module.exports = mergeConfig(
  getDefaultConfig(__dirname),
  config
);