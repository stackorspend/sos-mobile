import * as SQLite from "expo-sqlite"
import { SQLResultSetRowList } from "expo-sqlite"

export const SQLiteDb = () => {
  const db = SQLite.openDatabase("sos_arvinda.db")

  const create = async ({ createQuery }: { createQuery: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(createQuery, [])
          // tx.executeSql(insertQuery, row)
          resolve()
        },
        (err) => reject(err),
      )
    })
  }

  const insert = async ({
    insertQuery,
    row,
  }: {
    insertQuery: string
    row: any[]
  }): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(insertQuery, row)
          resolve()
        },
        (err) => {
          console.log(err)
          reject(err)
        },
      )
    })
  }

  const select = async ({
    selectQuery,
  }: {
    selectQuery: string
  }): Promise<SQLResultSetRowList["_array"]> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(selectQuery, [], (_, { rows }) => {
            resolve(rows._array)
          })
        },
        (err) => reject(err),
      )
    })
  }

  return {
    create,
    insert,
    select,
  }
}
