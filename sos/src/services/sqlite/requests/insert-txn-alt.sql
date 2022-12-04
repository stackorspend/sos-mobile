INSERT INTO transactions (
    sats_amount_with_fee,
    sats_fee,
    timestamp,
    fiat_per_sat,
    fiat_per_sat_offset,
    fiat_code,
    source_name,
    source_tx_id,
    ln_payment_hash,
    onchain_tx_id,
    tx_status
) VALUES (
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?
)
