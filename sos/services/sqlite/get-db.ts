import * as SQLite from "expo-sqlite"
import { SQLResultSetRowList } from "expo-sqlite"

//const sqlite3 = sqlite3Pre.verbose()

const queryCreate = `
CREATE TABLE IF NOT EXISTS transactions (
  sats_amount_with_fee INTEGER NOT NULL,
  sats_fee TEXT NOT NULL
);
`

const queryInsert = `
INSERT INTO transactions (
  sats_amount_with_fee,
  sats_fee
) VALUES (
  ?,
  ?
);
`

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

  // const db = await open({
  //   filename: path,
  //   driver: sqlite3.Database,
  // })

  return SQLite.openDatabase("sos_arvinda.db")
}

/** 
export const select = async (
  callback: (rows: SQLResultSetRowList) => void,
) => {
  const db = SQLite.openDatabase("sos_arvinda.db")
  db.transaction(
    (tx) => {
      tx.executeSql(queryCreate, [])
      tx.executeSql(queryInsert, [200, "50"])
      //tx.executeSql("SELECT * FROM transactions;", [], (_, { rows }) => console.log(rows))
    },
    (err) => console.log(err),
  )
  let rowList: SQLResultSetRowList = null

  db.transaction(
    (tx) => {
      tx.executeSql("SELECT * FROM transactions;", [], (_, { rows }) => callback(rows))
    },
    (err) => console.log(err),
  )
} */

export const select = async (): Promise<SQLResultSetRowList> => {
  return new Promise((resolve, reject) => {
    console.log("trax")
    const db = SQLite.openDatabase("sos_arvinda.db")
    db.transaction(
      (tx) => {
        tx.executeSql(queryCreate, [])
        tx.executeSql(queryInsert, [200, "50"])
      },
      (err) => reject(err),
    )

    console.log("trax")

    db.transaction(
      (tx) => {
        tx.executeSql("SELECT * FROM transactions;", [], (_, { rows }) => resolve(rows))
      },
      (err) => reject(err),
    )

    console.log("trax2")
  })
}
