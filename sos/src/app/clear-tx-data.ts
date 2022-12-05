import { TransactionsRepository } from "../services/sqlite"

export const clearTxData = async (db: Db) =>
  TransactionsRepository(db).deleteRepositoryForRebuild()
