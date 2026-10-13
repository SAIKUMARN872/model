import assert from "node:assert/strict";
import { createAccountApp } from "./app.js";

async function main(): Promise<void> {
  const { app, eventBus } = createAccountApp();

  const server = app.listen(0, "127.0.0.1");

  await new Promise<void>((resolve) => {
    server.once("listening", () => resolve());
  });

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Unable to determine test server address");
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;

    async function request(
      path: string,
      options: RequestInit = {},
    ): Promise<{
      response: Response;
      body: any;
    }> {
      const response = await fetch(`${baseUrl}${path}`, options);
      const text = await response.text();

      let body: any = null;

      if (text) {
        body = JSON.parse(text);
      }

      return {
        response,
        body,
      };
    }

    console.log("Running ModelNow Account Service tests...\n");

    // 1. Health
    {
      const { response, body } = await request("/health");

      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.service, "modelnow-account");
      assert.equal(body.status, "healthy");

      console.log("✓ health");
    }

    // 2. Create account
    const create = await request("/account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "integration@modelnow.ai",
        name: "Integration User",
      }),
    });

    assert.equal(create.response.status, 201);
    assert.equal(create.body.success, true);
    assert.ok(create.body.data.id);
    assert.equal(create.body.data.email, "integration@modelnow.ai");
    assert.equal(create.body.data.name, "Integration User");
    assert.equal(create.body.data.status, "active");
    assert.equal(create.body.data.plan, "free");
    assert.equal(create.body.data.credits, 500);

    const accountId = create.body.data.id;

    console.log("✓ create account");

    // 3. Get account
    {
      const { response, body } = await request(
        `/account/${accountId}`,
      );

      assert.equal(response.status, 200);
      assert.equal(body.data.id, accountId);
      assert.equal(body.data.email, "integration@modelnow.ai");

      console.log("✓ get account");
    }

    // 4. Get by email
    {
      const { response, body } = await request(
        "/account/by-email?email=integration@modelnow.ai",
      );

      assert.equal(response.status, 200);
      assert.equal(body.data.id, accountId);

      console.log("✓ get by email");
    }

    // 5. List accounts
    {
      const { response, body } = await request("/account");

      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(
        body.data.some(
          (account: { id: string }) =>
            account.id === accountId,
        ),
      );

      console.log("✓ list accounts");
    }

    // 6. Update account
    {
      const { response, body } = await request(
        `/account/${accountId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Updated Integration User",
            plan: "pro",
          }),
        },
      );

      assert.equal(response.status, 200);
      assert.equal(
        body.data.name,
        "Updated Integration User",
      );
      assert.equal(body.data.plan, "pro");

      console.log("✓ update account");
    }

    // 7. Get profile
    {
      const { response, body } = await request(
        `/account/${accountId}/profile`,
      );

      assert.equal(response.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.accountId, accountId);
      assert.equal(body.data.timezone, "UTC");

      console.log("✓ get profile");
    }

    // 8. Update profile
    {
      const { response, body } = await request(
        `/account/${accountId}/profile`,
        {
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
        },
      );

      assert.equal(response.status, 200);
      assert.equal(
        body.data.displayName,
        "Integration Profile",
      );
      assert.equal(body.data.timezone, "Asia/Kolkata");
      assert.equal(body.data.preferences.theme, "dark");
      assert.equal(body.data.preferences.language, "en");

      console.log("✓ update profile");
    }

    // 9. Duplicate email
    {
      const { response, body } = await request("/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "integration@modelnow.ai",
          name: "Duplicate User",
        }),
      });

      assert.equal(response.status, 409);
      assert.equal(body.success, false);
      assert.equal(
        body.error,
        "An account with this email already exists",
      );

      console.log("✓ duplicate email protection");
    }

    // 10. Invalid email
    {
      const { response, body } = await request("/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "invalid-email",
          name: "Invalid User",
        }),
      });

      assert.equal(response.status, 400);
      assert.equal(body.success, false);
      assert.equal(body.error, "Invalid email address");

      console.log("✓ invalid email validation");
    }

    // 11. Missing account
    {
      const { response, body } = await request(
        "/account/00000000-0000-0000-0000-000000000000",
      );

      assert.equal(response.status, 404);
      assert.equal(body.success, false);
      assert.equal(body.error, "Account not found");

      console.log("✓ missing account handling");
    }

    // 12. Event bus
    {
      const events: string[] = [];

      const unsubscribe = eventBus.subscribe((event) => {
        events.push(event.type);
      });

      await request(`/account/${accountId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Event Test User",
        }),
      });

      await request(`/account/${accountId}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: {
            eventTest: true,
          },
        }),
      });

      unsubscribe();

      assert.ok(events.includes("account.updated"));
      assert.ok(events.includes("profile.updated"));

      console.log("✓ event bus");
    }

    // 13. Delete account
    {
      const { response } = await request(
        `/account/${accountId}`,
        {
          method: "DELETE",
        },
      );

      assert.equal(response.status, 204);

      console.log("✓ delete account");
    }

    // 14. Verify deletion
    {
      const { response, body } = await request(
        `/account/${accountId}`,
      );

      assert.equal(response.status, 404);
      assert.equal(body.success, false);
      assert.equal(body.error, "Account not found");

      console.log("✓ verify deletion");
    }

    console.log(
      "\nAll ModelNow Account Service tests passed.",
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

main().catch((error) => {
  console.error("\nAccount Service tests failed.");
  console.error(error);
  process.exitCode = 1;
});
