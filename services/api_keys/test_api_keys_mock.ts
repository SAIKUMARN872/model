interface ApiKeyMockRequest {
  operation: string;
  keyId: string;
  apiKey: string;
  subject: string;
  scopes: string[];
}

interface ApiKeyMockResponse {
  provider: string;
  operation: string;
  keyId: string;
  subject: string;
  scopes: string[];
  authenticated: boolean;
  valid: boolean;
  active: boolean;
  revoked: boolean;
  done: boolean;
}

function main(): void {
  const request: ApiKeyMockRequest = {
    operation: "validate_api_key",
    keyId: "key_mock_001",
    apiKey: "mn_test_api_key_001",
    subject: "user_mock_001",
    scopes: [
      "chat:read",
      "chat:write",
      "models:read",
    ],
  };

  console.log(`REQUEST OPERATION: ${request.operation}`);
  console.log(`REQUEST KEY ID: ${request.keyId}`);
  console.log(`REQUEST API KEY: ${request.apiKey}`);
  console.log(`REQUEST SUBJECT: ${request.subject}`);
  console.log(`REQUEST SCOPES: ${request.scopes.join(", ")}`);

  const response: ApiKeyMockResponse = {
    provider: "modelnow-api-keys",
    operation: request.operation,
    keyId: request.keyId,
    subject: request.subject,
    scopes: request.scopes,
    authenticated: true,
    valid: true,
    active: true,
    revoked: false,
    done: true,
  };

  console.log(`PROVIDER: ${response.provider}`);
  console.log(`OPERATION: ${response.operation}`);
  console.log(`KEY ID: ${response.keyId}`);
  console.log(`SUBJECT: ${response.subject}`);
  console.log(`SCOPES: ${response.scopes.join(", ")}`);
  console.log(`AUTHENTICATED: ${response.authenticated}`);
  console.log(`VALID: ${response.valid}`);
  console.log(`ACTIVE: ${response.active}`);
  console.log(`REVOKED: ${response.revoked}`);
  console.log(`FINAL DONE: ${response.done}`);

  if (
    response.provider !== "modelnow-api-keys" ||
    response.operation !== "validate_api_key" ||
    response.keyId !== "key_mock_001" ||
    response.subject !== "user_mock_001" ||
    response.scopes.length !== 3 ||
    response.authenticated !== true ||
    response.valid !== true ||
    response.active !== true ||
    response.revoked !== false ||
    response.done !== true
  ) {
    throw new Error("API Keys mock validation failed");
  }

  console.log("MODELNOW API KEYS MOCK TEST: PASS");
}

try {
  main();
} catch (error: unknown) {
  console.error("MODELNOW API KEYS MOCK TEST: FAIL");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
}
