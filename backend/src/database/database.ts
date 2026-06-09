import sqlite3 from "sqlite3";

sqlite3.verbose();

const databasePath = process.env.DATABASE_PATH ?? "mini-task-manager.sqlite";

export const database = new sqlite3.Database(databasePath);

export function run(sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    database.run(sql, params, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
