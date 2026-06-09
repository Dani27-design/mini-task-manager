import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { validateBody } from "./validate.middleware";

test("validateBody replaces request body with parsed data", () => {
  const request = {
    body: {
      title: "  Trimmed title  "
    }
  };
  const nextCalls: unknown[] = [];
  const middleware = validateBody(
    z.object({
      title: z.string().trim().min(1)
    })
  );

  middleware(request as any, {} as any, (error?: unknown) => {
    nextCalls.push(error);
  });

  assert.deepEqual(request.body, {
    title: "Trimmed title"
  });
  assert.deepEqual(nextCalls, [undefined]);
});

test("validateBody forwards validation errors", () => {
  const request = {
    body: {
      title: ""
    }
  };
  const nextCalls: unknown[] = [];
  const middleware = validateBody(
    z.object({
      title: z.string().trim().min(1)
    })
  );

  middleware(request as any, {} as any, (error?: unknown) => {
    nextCalls.push(error);
  });

  assert.equal(nextCalls.length, 1);
  assert.ok(nextCalls[0] instanceof z.ZodError);
});
