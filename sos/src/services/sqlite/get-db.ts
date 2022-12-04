import sqlite3Pre from "sqlite3"
import { open } from "sqlite"

const sqlite3 = sqlite3Pre.verbose()

export const getDb = async (): Promise<Db> => {
  const dbConfig = {
    memory: {
      path: ":memory:",
      connectMsg: "Connected to the in-memory SQLite database.",
    },
    testDisk: {
      path: "test.db",
      connectMsg: "Connected to 'test.db' database.",
    },
  }

  const { path, connectMsg } = dbConfig.testDisk

  const db = await open({
    filename: path,
    driver: sqlite3.Database,
  })
  console.log(connectMsg)

  return db
}
