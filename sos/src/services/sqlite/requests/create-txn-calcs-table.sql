CREATE TABLE IF NOT EXISTS txn_calculations (
    source_tx_id TEXT NOT NULL UNIQUE,
    timestamp TEXT NOT NULL,

    aggregate_sats INTEGER NOT NULL,
    aggregate_fiat_amount REAL NOT NULL,
    stack_price_with_pl_included REAL,

    fiat_amount_less_pl REAL NOT NULL,
    fiat_pl REAL NOT NULL,
    fiat_pl_percentage TEXT NOT NULL,
    aggregate_fiat_amount_less_pl REAL NOT NULL,
    stack_price_without_pl REAL NOT NULL
)
