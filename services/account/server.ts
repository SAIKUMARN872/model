import { createAccountApp } from "./app.js";
import { loadAccountConfig } from "./config/config.js";

const config = loadAccountConfig();
const { app } = createAccountApp();

app.listen(config.port, config.host, () => {
  console.log(
    `ModelNow Account Service listening on http://localhost:${config.port}`,
  );
});
