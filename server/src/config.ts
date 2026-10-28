import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databasePath: process.env.DATABASE_PATH ?? "./data/taskflow.db",
  isProduction: process.env.NODE_ENV === "production",
};
