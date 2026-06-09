import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { AppError, errorMiddleware } from "./error.middleware";

function createMockResponse() {
  return {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    }
  };
}

test("errorMiddleware formats AppError responses", () => {
  const response = createMockResponse();

  errorMiddleware(
    new AppError("TASK_NOT_FOUND", "Task not found", 404),
    {} as any,
    response as any,
    (() => undefined) as any
  );

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    error: {
      code: "TASK_NOT_FOUND",
      message: "Task not found"
    }
  });
});

test("errorMiddleware formats validation errors", () => {
  const response = createMockResponse();
  const validationResult = z.object({ title: z.string() }).safeParse({});

  assert.equal(validationResult.success, false);

  if (validationResult.success) {
    throw new Error("Expected validation to fail");
  }

  errorMiddleware(
    validationResult.error,
    {} as any,
    response as any,
    (() => undefined) as any
  );

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed"
    }
  });
});

test("errorMiddleware hides unexpected error details", () => {
  const response = createMockResponse();

  errorMiddleware(
    new Error("database connection details"),
    {} as any,
    response as any,
    (() => undefined) as any
  );

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error"
    }
  });
});
