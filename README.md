# vtimestamp

Decentralized document timestamping on the Verus blockchain. Prove any document existed at a specific point in time — without uploading it anywhere.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Verus](https://img.shields.io/badge/Built%20on-Verus-3B82F6)](https://verus.io)

**[Live App](https://vtimestamp.com)** · **[Verify a Timestamp](https://vtimestamp.com/verify)** · **[How It Works](https://vtimestamp.com/how-it-works)** · **[Compare](https://vtimestamp.com/compare)**

> **Status:** Alpha MVP — functional on mainnet and testnet. Feedback and contributions welcome.

---

## What Is vtimestamp?

vtimestamp creates cryptographic proof that a document existed at a specific point in time. Your browser computes a SHA-256 hash of your file locally — the document never leaves your device, is never uploaded, and is never stored anywhere. Only the hash is published to the Verus blockchain, permanently tied to your [VerusID](https://verus.io).

The result is a timestamp that:

- **Can't be backdated** — the block time is set by blockchain consensus
- **Can't be altered** — each identity update is immutable on-chain
- **Can't be deleted** — blockchain data is append-only and permanent
- **Can be verified by anyone** — no account, no login, no trust required

Your proof lives on the blockchain. If vtimestamp disappears tomorrow, your timestamps are still there and still verifiable by anyone running a Verus node.

## Why This Matters

Timestamping proves one thing: **this data existed before this moment.**

- **Intellectual property** — prove you had an idea, design, or manuscript before a specific date
- **Legal documents** — establish when a contract, agreement, or notice was created
- **Research data** — record when experimental results or datasets were produced
- **Creative work** — prove authorship timing for music, art, code, or writing
- **Compliance** — demonstrate that records existed at required times

Traditional timestamping requires trusting a third party — a notary, a service, a company. If that party disappears, your proof disappears. vtimestamp removes the middleman.

## How It Works

### 1. Hash Your Document
Your browser computes a SHA-256 hash using the Web Crypto API. This happens entirely on your device. The document is never transmitted.

### 2. Add Metadata
You provide a title (required) and optionally a description. Filename and file size are captured automatically for file uploads.

### 3. Sign with Your VerusID
vtimestamp constructs an identity update request containing your hash and metadata as VDXF data. You approve it in Verus Mobile — your wallet builds and broadcasts the `updateidentity` transaction.

### 4. Blockchain Confirmation
Once included in a block, your timestamp is permanent. The block provides the height, hash, consensus-verified time, and transaction ID. These values are immutable.

### Verification
Anyone can verify — no login needed. Upload the same file (or paste the same text), enter the identity name, and the system searches the identity's blockchain history for a matching hash. If found, it returns the block time, height, and transaction details.

If the document has been modified by even a single byte, the hash won't match. This is by design.

## Features

- **Privacy-first** — documents never leave your device; only a SHA-256 hash is published
- **Self-sovereign** — timestamps are stored on your own VerusID, which you own and control
- **Permissionless verification** — anyone can verify using just the file and the identity name
- **Identity-bound** — proof answers both "when" and "who" (unlike Bitcoin OP_RETURN)
- **Structured metadata** — title, description, filename, and file size stored on-chain alongside the hash
- **Immutable** — once in a block, the timestamp cannot be changed, backdated, or deleted
- **Free to verify** — verification requires no account and costs nothing
- **Database-free** — all data lives on the blockchain; no central server to compromise or maintain

## Comparison with Alternatives

| | vtimestamp | Traditional Notary | Centralized Service | Bitcoin OP_RETURN |
|---|---|---|---|---|
| **Document privacy** | Hash only, never uploaded | Seen by notary | Often uploaded | Hash only |
| **Proof ownership** | Your VerusID | Paper certificate | Service account | Bitcoin address |
| **Verification** | Anyone, anytime, free | Requires notary records | Requires service to exist | Anyone with a node |
| **Metadata** | Title, description, filename on-chain | Notary's records | Service database | Raw hash only |
| **Identity** | Self-sovereign VerusID | Government ID | Email/password | Pseudonymous address |
| **Cost** | Verus tx fee (~0.0001 VRSC) | $5-50+ | Subscription/per-stamp | Bitcoin tx fee |
| **Durability** | Blockchain permanent | Paper degrades | Company may shut down | Blockchain permanent |
| **Human readable** | Yes (metadata + identity name) | Yes (paper) | Depends on service | No (raw hex) |

### Compared to Other Blockchains

| | **Verus (vtimestamp)** | **Ethereum** | **Solana** | **Cardano** |
|---|---|---|---|---|
| **Mechanism** | Native identity update | Smart contract | Memo Program | Transaction metadata |
| **Smart contract needed?** | No | Yes | No (but 566 byte limit) | No |
| **Identity** | VerusID (native, protocol-level) | ENS (separate smart contract) | SNS (separate program) | ADA Handle (native token) |
| **Cost** | ~0.0001 VRSC (stable) | Variable gas (volatile) | ~0.000005 SOL | ~0.18 ADA |
| **Structured metadata** | Yes (VDXF DataDescriptors) | You design your own | 566 bytes unstructured | Yes (native JSON) |
| **Data lives on** | Your VerusID (you own it) | A smart contract | Transaction logs | Transaction record |

The key difference: on other chains, identity is an add-on. On Verus, identity is the foundation. Your timestamp is stored *on* your VerusID — a self-sovereign identity with a human-readable name. Verification looks up `alice@`, not `0x7a3b...`.

## On-Chain Data Structure

Timestamps are stored under the `proof.basic` VDXF key on your VerusID's `contentmultimap`. Each timestamp is a group of DataDescriptor entries:

| Field | VDXF Label | Required | Description |
|-------|-----------|----------|-------------|
| Hash | `.sha256` | Yes | SHA-256 hex hash (64 characters) |
| Title | `.title` | Yes | Human-readable label |
| Description | `.description` | No | Additional context |
| Filename | `.filename` | No | Original filename |
| File Size | `.filesize` | No | File size in bytes |

Block time and height are derived from the blockchain — they are not stored in the data but come from the block that contains the transaction.

## Quick Start

### Requirements

- Node.js >= 20.0.0
- Yarn
- A VerusID (for creating timestamps — verification requires nothing)

### Development

```bash
git clone https://github.com/vdappdev2/vtimestamp.git
cd vtimestamp
cp .env.example .env    # Configure RPC endpoints and service identity
yarn install
yarn dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment Variables

See `.env.example` for required configuration:
- Verus RPC endpoint (mainnet or testnet)
- Service identity for signing login challenges

## Verify from the Command Line

You don't need vtimestamp (or any website) to verify a timestamp. Using the Verus CLI directly:

```bash
# 1. Get the identity's full history
./verus getidentityhistory "alice@" 0 999999999 0 999999999

# 2. Look for contentmultimap entries with the proof.basic VDXF key
# 3. Find the .sha256 label and compare with your document's hash
# 4. Get the block time from the blockhash in the history entry
./verus getblock "<blockhash>"
```

The proof is on the public blockchain. Any Verus node can verify it.

## Tech Stack

- **Frontend:** SvelteKit + Svelte 5 + TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Verus (verus-typescript-primitives, verusid-ts-client)
- **Hashing:** Web Crypto API (SHA-256, client-side)
- **Deployment:** Vercel

## Privacy

| Public (on-chain) | Private (never leaves your device) |
|---|---|
| SHA-256 hash | The actual document |
| Title you chose | Full document contents |
| Description you wrote | Any data not in the hash |
| Filename (if provided) | |
| File size (if provided) | |
| Block time and height | |
| Your VerusID name | |

The hash is a one-way function. Given the hash, no one can determine whether the original was a PDF, a photo, a text file, or a novel.

## Contributing

Issues and pull requests welcome. See the [issues page](https://github.com/vdappdev2/vtimestamp/issues) for open items.

To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a pull request

## License

[MIT](LICENSE)

---

Built on [Verus](https://verus.io) — a decentralized blockchain with native self-sovereign identity.
