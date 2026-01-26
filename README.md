# vtimestamp

Decentralized document timestamping using VerusID.

## What It Does

vtimestamp lets you create cryptographic timestamps for any document or data, stored permanently on the Verus blockchain. Your documents never leave your device - only the hash is published. Verify timestamps anytime without logging in.

## Status

**Alpha MVP** - Early development. Feedback welcome.

## Requirements

- Node.js >= 20.0.0
- Yarn
- VerusID (for creating timestamps)

## Quick Start

```bash
cd vtimestamp
yarn install
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### Create a Timestamp

1. Login with your VerusID (via Verus Mobile wallet)
2. Upload a file or paste text
3. Approve the signature request in your wallet
4. Your timestamp is published to the blockchain

### Verify a Timestamp

1. No login required
2. Upload a file or paste text
3. View the timestamp proof and blockchain confirmation

## License

[MIT](LICENSE)
