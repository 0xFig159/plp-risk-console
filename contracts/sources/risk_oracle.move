/// PLP Risk Console — on-chain risk snapshot anchoring.
///
/// Records Walrus blob references for vault risk snapshots so LPs can
/// verify that a snapshot existed at a given point on-chain. No funds
/// or positions are managed — this is a pure attestation ledger.
module plp_risk_console::risk_oracle;

use std::string::String;
use sui::clock::Clock;
use sui::event;
use sui::tx_context::TxContext;

// ─── Events ────────────────────────────────────────────────────────────

/// Emitted when a new risk snapshot is recorded.
public struct RiskSnapshotRecord has copy, drop {
    /// Walrus blob ID containing the full risk snapshot JSON
    blob_id: String,
    /// Vault this snapshot describes
    vault_id: String,
    /// Unix timestamp (ms) of the snapshot
    timestamp_ms: u64,
    /// Snapshot content hash (SHA-256 hex) for integrity check
    content_hash: String,
    /// Epoch when this was recorded
    epoch: u64,
}

// ─── Public read / write ───────────────────────────────────────────────

/// Record a risk snapshot blob reference.
///
/// Anyone can call this — risk snapshots are public attestation data.
/// The blob_id should point to a Walrus-stored JSON snapshot.
public fun record_snapshot(
    blob_id: String,
    vault_id: String,
    content_hash: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let epoch = ctx.epoch();
    event::emit(RiskSnapshotRecord {
        blob_id,
        vault_id,
        timestamp_ms: clock.timestamp_ms(),
        content_hash,
        epoch,
    });
}

// ─── Tests ─────────────────────────────────────────────────────────────

#[test]
fun test_record_snapshot() {
    use sui::test_scenario as ts;
    use std::string;

    let mut scenario = ts::begin(@0x0);
    scenario.create_system_objects();

    let clock = scenario.take_shared<sui::clock::Clock>();
    {
        let ctx = scenario.ctx();
        record_snapshot(
            string::utf8(b"test-blob-id-12345"),
            string::utf8(b"test-vault-0xabc"),
            string::utf8(b"abc123def456"),
            &clock,
            ctx,
        );
    };
    ts::return_shared(clock);

    // succeeded if no abort
    scenario.end();
}
