# Earnings Arena MVP Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox syntax.

**Goal:** Ship a Next.js arena where Pump.fun memecoins duel on upcoming earnings; bigger stock % move at T+4h wins the pooled duel fees into the winner’s treasury.

**Architecture:** Pump.fun remains launch/trade. Next.js owns registry, matchmaking, live quotes UI, duel state machine, oracle snapshots, and settlement. v1 pot is platform-tracked (DB).

**Tech Stack:** Next.js App Router, TypeScript, Prisma + SQLite, Solana wallet-adapter, Finnhub, Vitest.

See also: `docs/superpowers/specs/2026-10-07-earnings-arena-design.md`

## Global Constraints

- Next.js App Router + TypeScript only for the app
- 100% duel fees to pot → winner treasury; no creator skim
- Absolute % move wins; tie epsilon 0.1%
- T+4h after earnings report timestamp
- Pump.fun is external; no custom bonding curves in v1

## Tasks

### Task 0: Spec + scaffold — done via agent execution
### Task 1: Domain core (TDD)
### Task 2: APIs + Finnhub
### Task 3: UI
### Task 4: Verification + README
