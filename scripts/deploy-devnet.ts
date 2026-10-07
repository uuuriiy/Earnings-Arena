/**
 * Prints deploy steps for the Anchor escrow program.
 * Full deploy requires Solana CLI + Anchor locally:
 *   anchor build && anchor deploy --provider.cluster devnet
 */
import { DEFAULT_PROGRAM_ID } from "../src/shared/lib/solana/escrow";

console.log(`
Arena escrow — devnet deploy
============================
1. Install Solana CLI + Anchor 0.30.x
2. solana config set --url devnet
3. solana airdrop 2
4. cd programs/arena_escrow && anchor build (from repo root: anchor build)
5. anchor deploy --provider.cluster devnet
6. Set in .env:
   NEXT_PUBLIC_ARENA_PROGRAM_ID=<deployed program id>
   KEEPER_SECRET_KEY=<base58 or JSON secret key>
   NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

Placeholder program id until deploy: ${DEFAULT_PROGRAM_ID}
See docs/ESCROW.md
`);
