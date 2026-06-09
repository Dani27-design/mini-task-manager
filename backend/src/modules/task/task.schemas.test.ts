import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createTaskSchema,
  deleteTaskSchema,
  emptyBodySchema,
  updateTaskSchema
} from "./task.schemas";

test("createTaskSchema trims required fields and rejects unknown keys", () => {
  assert.deepEqual(
    createTaskSchema.parse({
      title: "  Write tests  ",
      actorId: "  john-doe  "
    }),
    {
      title: "Write tests",
      actorId: "john-doe"
    }
  );

  assert.equal(
    createTaskSchema.safeParse({
      title: "Write tests",
      actorId: "john-doe",
      extra: true
    }).success,
    false
  );
});

test("updateTaskSchema accepts partial task changes with an actor", () => {
  assert.deepEqual(
    updateTaskSchema.parse({
      title: "  Updated title  ",
      status: "pending",
      actorId: "john-doe"
    }),
    {
      title: "Updated title",
      status: "pending",
      actorId: "john-doe"
    }
  );

  assert.equal(
    updateTaskSchema.safeParse({
      status: "blocked",
      actorId: "john-doe"
    }).success,
    false
  );
});

test("deleteTaskSchema requires actorId only", () => {
  assert.deepEqual(deleteTaskSchema.parse({ actorId: " john-doe " }), {
    actorId: "john-doe"
  });

  assert.equal(
    deleteTaskSchema.safeParse({
      actorId: "john-doe",
      reason: "cleanup"
    }).success,
    false
  );
});

test("emptyBodySchema rejects non-empty bodies", () => {
  assert.deepEqual(emptyBodySchema.parse({}), {});
  assert.equal(emptyBodySchema.safeParse({ actorId: "john-doe" }).success, false);
});
