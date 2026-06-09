import sqlite3 from "sqlite3";

sqlite3.verbose();

const databasePath = process.env.DATABASE_PATH ?? "mini-task-manager.sqlite";

export const database = new sqlite3.Database(databasePath);

export function run(sql: string, params: unknown[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function handleRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve(this);
    });
  });
}

export function get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (error, row: T | undefined) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

export async function transaction<T>(operation: () => Promise<T>): Promise<T> {
  await run("BEGIN");

  try {
    const result = await operation();
    await run("COMMIT");
    return result;
  } catch (error) {
    await run("ROLLBACK");
    throw error;
  }
}
