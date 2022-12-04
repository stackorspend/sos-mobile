INSERT INTO txn_calculations (
    source_tx_id,
    timestamp,

    aggregate_sats,
    aggregate_fiat_amount,
    stack_price_with_pl_included,
    fiat_amount_less_pl,
    fiat_pl,
    fiat_pl_percentage,
    aggregate_fiat_amount_less_pl,
    stack_price_without_pl
) VALUES (
    :source_tx_id,
    :timestamp,

    :aggregate_sats,
    :aggregate_fiat_amount,
    :stack_price_with_pl_included,
    :fiat_amount_less_pl,
    :fiat_pl,
    :fiat_pl_percentage,
    :aggregate_fiat_amount_less_pl,
    :stack_price_without_pl
)
  ON CONFLICT(source_tx_id) DO UPDATE SET
    aggregate_sats = :aggregate_sats,
    aggregate_fiat_amount = :aggregate_fiat_amount,
    stack_price_with_pl_included = :stack_price_with_pl_included,
    fiat_amount_less_pl = :fiat_amount_less_pl,
    fiat_pl = :fiat_pl,
    fiat_pl_percentage = :fiat_pl_percentage,
    aggregate_fiat_amount_less_pl = :aggregate_fiat_amount_less_pl,
    stack_price_without_pl = :stack_price_without_pl
