export class DomainError extends Error {
  name: string
  constructor(message?: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class RepositoryError extends DomainError {}
export class TableNotCreatedYetError extends RepositoryError {}
export class LocalBalanceDoesNotMatchSourceError extends RepositoryError {}
export class CalculationsMismatchError extends RepositoryError {}
export class UnknownRepositoryError extends RepositoryError {}
