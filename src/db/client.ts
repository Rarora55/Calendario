import { runMigrations, type DatabaseAdapter } from "@/src/db/migrations";
import { databaseName } from "@/src/db/schema";

type SqlParam = string | number | null;

type ExpoSqliteDatabase = {
  execAsync(sql: string): Promise<void>;
  getAllAsync<T>(sql: string, ...params: SqlParam[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, ...params: SqlParam[]): Promise<T | null>;
  runAsync(sql: string, ...params: SqlParam[]): Promise<unknown>;
  withTransactionAsync<T>(scope: () => Promise<T>): Promise<T>;
};

export type WritableDatabaseAdapter = DatabaseAdapter & {
  getFirstAsync<T>(sql: string, params?: SqlParam[]): Promise<T | null>;
  runAsync(sql: string, params?: SqlParam[]): Promise<unknown>;
};

class ExpoDatabaseAdapter implements WritableDatabaseAdapter {
  constructor(private readonly database: ExpoSqliteDatabase) {}

  execAsync(sql: string) {
    return this.database.execAsync(sql);
  }

  getAllAsync<T>(sql: string, params: SqlParam[] = []) {
    return this.database.getAllAsync<T>(sql, ...params);
  }

  getFirstAsync<T>(sql: string, params: SqlParam[] = []) {
    return this.database.getFirstAsync<T>(sql, ...params);
  }

  runAsync(sql: string, params: SqlParam[] = []) {
    return this.database.runAsync(sql, ...params);
  }

  withTransactionAsync<T>(scope: () => Promise<T>) {
    return this.database.withTransactionAsync(scope);
  }
}

let adapterPromise: Promise<ExpoDatabaseAdapter> | null = null;

export async function getDatabaseAdapter() {
  if (!adapterPromise) {
    adapterPromise = (async () => {
      const sqlite = await import("expo-sqlite");
      const database = (await sqlite.openDatabaseAsync(databaseName)) as ExpoSqliteDatabase;
      const adapter = new ExpoDatabaseAdapter(database);
      await runMigrations(adapter);
      return adapter;
    })();
  }

  return adapterPromise;
}
