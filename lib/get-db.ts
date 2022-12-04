import * as SQLite from "expo-sqlite"
import { SQLResultSetRowList } from "expo-sqlite"

export const SQLiteDb = () => {
  const db = SQLite.openDatabase("sos_arvinda.db")

  const create = async (createQuery: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(createQuery, [])
          resolve()
        },
        (err) => {
          console.log("HERE 20:", err)
          reject(err)
        },
      )
    })
  }

  const insert = async ({ query, row }: { query: string; row: any[] }): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(query, row)
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
    query,
    args = [],
  }: {
    query: string
    args?: any[]
  }): Promise<SQLResultSetRowList["_array"]> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(query, args, (_, { rows }) => {
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
