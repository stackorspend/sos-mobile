CREATE TABLE IF NOT EXISTS transactions (
    sats_amount_with_fee INTEGER NOT NULL,
    sats_fee INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    fiat_per_sat INTEGER NOT NULL,
    fiat_per_sat_offset INTEGER NOT NULL,
    fiat_code TEXT NOT NULL,
    fiat_amount_with_fee REAL GENERATED ALWAYS AS (
        ROUND(
            sats_amount_with_fee * fiat_per_sat / POWER(10, fiat_per_sat_offset),
            4
        )
    ) STORED,
    fiat_fee REAL GENERATED ALWAYS AS (
        ROUND(
            sats_fee * fiat_per_sat / POWER(10, fiat_per_sat_offset),
            4
        )
    ) STORED,
    source_name TEXT NOT NULL,
    source_tx_id TEXT NOT NULL UNIQUE,
    tx_status TEXT NOT NULL,
    tx_description TEXT NOT NULL,
    ln_payment_hash TEXT,
    onchain_tx_id TEXT
)
