const { handler } = require("../lambdas/receiveWebhook");

describe("Test receiveWebhook()", () => {
  test("correct greeting is generated", async () => {
    expect(await handler({ body: { test: 0 } })).toHaveProperty('body.message');
  });
});
