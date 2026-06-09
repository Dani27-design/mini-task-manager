import { run } from "./database";

export async function initDatabase(): Promise<void> {
  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      deletedAt TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      actorId TEXT NOT NULL,
      action TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (taskId) REFERENCES tasks(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS audit_log_changes (
      id TEXT PRIMARY KEY,
      auditLogId TEXT NOT NULL,
      fieldName TEXT NOT NULL,
      previousValue TEXT,
      currentValue TEXT,
      FOREIGN KEY (auditLogId) REFERENCES audit_logs(id)
    )
  `);
}
