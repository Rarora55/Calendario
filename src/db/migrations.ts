import { schemaStatements } from "@/src/db/schema";

export type DatabaseAdapter = {
  execAsync(sql: string): Promise<void>;
  getAllAsync<T>(sql: string, params?: unknown[]): Promise<T[]>;
  withTransactionAsync<T>(scope: () => Promise<T>): Promise<T>;
};

export type Migration = {
  id: string;
  statements: string[];
};

export const migrations: Migration[] = [
  {
    id: "001-initial-product-setup",
    statements: schemaStatements,
  },
];

export async function runMigrations(database: DatabaseAdapter) {
  await database.withTransactionAsync(async () => {
    await database.execAsync(
      "CREATE TABLE IF NOT EXISTS migrations (id TEXT PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL);",
    );

    const applied = await database.getAllAsync<{ id: string }>("SELECT id FROM migrations;");
    const appliedIds = new Set(applied.map((item) => item.id));

    for (const migration of migrations) {
      if (appliedIds.has(migration.id)) {
        continue;
      }

      for (const statement of migration.statements) {
        await database.execAsync(statement);
      }

      const now = new Date().toISOString();
      await database.execAsync(
        `INSERT INTO migrations (id, applied_at) VALUES ('${migration.id}', '${now}');`,
      );
    }
  });
}
