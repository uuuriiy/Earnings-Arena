use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("11111111111111111111111111111111");

pub const DUEL_SEED: &[u8] = b"duel";

#[program]
pub mod arena_escrow {
    use super::*;

    pub fn create_duel(
        ctx: Context<CreateDuel>,
        duel_id: String,
        side_a_mint: Pubkey,
        side_a_treasury: Pubkey,
    ) -> Result<()> {
        require!(duel_id.len() <= 64, ArenaError::DuelIdTooLong);
        let vault = &mut ctx.accounts.vault;
        vault.duel_id = duel_id;
        vault.bump = ctx.bumps.vault;
        vault.keeper = ctx.accounts.keeper.key();
        vault.side_a_mint = side_a_mint;
        vault.side_a_treasury = side_a_treasury;
        vault.side_b_mint = Pubkey::default();
        vault.side_b_treasury = Pubkey::default();
        vault.status = DuelStatus::Open as u8;
        vault.pot_lamports = 0;
        vault.winner_treasury = Pubkey::default();
        Ok(())
    }

    pub fn join_duel(
        ctx: Context<JoinDuel>,
        side_b_mint: Pubkey,
        side_b_treasury: Pubkey,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.status == DuelStatus::Open as u8, ArenaError::BadStatus);
        vault.side_b_mint = side_b_mint;
        vault.side_b_treasury = side_b_treasury;
        vault.status = DuelStatus::Challenged as u8;
        Ok(())
    }

    pub fn lock_duel(ctx: Context<LockDuel>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(
            vault.status == DuelStatus::Challenged as u8,
            ArenaError::BadStatus
        );
        require_keys_eq!(
            ctx.accounts.side_a_authority.key(),
            vault.side_a_treasury,
            ArenaError::Unauthorized
        );
        vault.status = DuelStatus::AwaitingPrint as u8;
        Ok(())
    }

    pub fn credit_fees(ctx: Context<CreditFees>, lamports: u64) -> Result<()> {
        require!(lamports > 0, ArenaError::ZeroAmount);
        let vault = &mut ctx.accounts.vault;
        require!(
            vault.status == DuelStatus::AwaitingPrint as u8
                || vault.status == DuelStatus::Settling as u8
                || vault.status == DuelStatus::Challenged as u8
                || vault.status == DuelStatus::Locked as u8,
            ArenaError::BadStatus
        );
        require_keys_eq!(ctx.accounts.keeper.key(), vault.keeper, ArenaError::Unauthorized);

        let cpi = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: vault.to_account_info(),
            },
        );
        transfer(cpi, lamports)?;
        vault.pot_lamports = vault
            .pot_lamports
            .checked_add(lamports)
            .ok_or(ArenaError::Overflow)?;
        Ok(())
    }

    pub fn mark_settling(ctx: Context<KeeperOnly>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(
            vault.status == DuelStatus::AwaitingPrint as u8,
            ArenaError::BadStatus
        );
        vault.status = DuelStatus::Settling as u8;
        Ok(())
    }

    pub fn settle_payout(ctx: Context<SettlePayout>, winner_is_a: bool) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(
            vault.status == DuelStatus::Settling as u8
                || vault.status == DuelStatus::AwaitingPrint as u8,
            ArenaError::BadStatus
        );
        require_keys_eq!(ctx.accounts.keeper.key(), vault.keeper, ArenaError::Unauthorized);

        let winner = if winner_is_a {
            vault.side_a_treasury
        } else {
            vault.side_b_treasury
        };
        require_keys_eq!(ctx.accounts.winner_treasury.key(), winner, ArenaError::BadWinner);

        let amount = vault.pot_lamports;
        **vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx
            .accounts
            .winner_treasury
            .to_account_info()
            .try_borrow_mut_lamports()? += amount;

        vault.pot_lamports = 0;
        vault.winner_treasury = winner;
        vault.status = DuelStatus::Resolved as u8;
        Ok(())
    }

    pub fn void_refund(ctx: Context<VoidRefund>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require_keys_eq!(ctx.accounts.keeper.key(), vault.keeper, ArenaError::Unauthorized);
        require_keys_eq!(
            ctx.accounts.side_a_treasury.key(),
            vault.side_a_treasury,
            ArenaError::Unauthorized
        );
        require_keys_eq!(
            ctx.accounts.side_b_treasury.key(),
            vault.side_b_treasury,
            ArenaError::Unauthorized
        );

        let total = vault.pot_lamports;
        let half = total / 2;
        let other = total - half;

        **vault.to_account_info().try_borrow_mut_lamports()? -= total;
        **ctx
            .accounts
            .side_a_treasury
            .to_account_info()
            .try_borrow_mut_lamports()? += half;
        **ctx
            .accounts
            .side_b_treasury
            .to_account_info()
            .try_borrow_mut_lamports()? += other;

        vault.pot_lamports = 0;
        vault.status = DuelStatus::Voided as u8;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum DuelStatus {
    Open = 0,
    Challenged = 1,
    Locked = 2,
    AwaitingPrint = 3,
    Settling = 4,
    Resolved = 5,
    Voided = 6,
}

#[account]
pub struct DuelVault {
    pub duel_id: String,
    pub bump: u8,
    pub keeper: Pubkey,
    pub side_a_mint: Pubkey,
    pub side_a_treasury: Pubkey,
    pub side_b_mint: Pubkey,
    pub side_b_treasury: Pubkey,
    pub status: u8,
    pub pot_lamports: u64,
    pub winner_treasury: Pubkey,
}

impl DuelVault {
    pub const MAX_ID: usize = 64;
    pub fn space() -> usize {
        8 + 4 + Self::MAX_ID + 1 + 32 * 6 + 1 + 8 + 32
    }
}

#[derive(Accounts)]
#[instruction(duel_id: String)]
pub struct CreateDuel<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub keeper: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = DuelVault::space(),
        seeds = [DUEL_SEED, duel_id.as_bytes()],
        bump
    )]
    pub vault: Account<'info, DuelVault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinDuel<'info> {
    pub authority: Signer<'info>,
    #[account(mut, seeds = [DUEL_SEED, vault.duel_id.as_bytes()], bump = vault.bump)]
    pub vault: Account<'info, DuelVault>,
}

#[derive(Accounts)]
pub struct LockDuel<'info> {
    pub side_a_authority: Signer<'info>,
    #[account(mut, seeds = [DUEL_SEED, vault.duel_id.as_bytes()], bump = vault.bump)]
    pub vault: Account<'info, DuelVault>,
}

#[derive(Accounts)]
pub struct CreditFees<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub keeper: Signer<'info>,
    #[account(mut, seeds = [DUEL_SEED, vault.duel_id.as_bytes()], bump = vault.bump)]
    pub vault: Account<'info, DuelVault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct KeeperOnly<'info> {
    pub keeper: Signer<'info>,
    #[account(mut, seeds = [DUEL_SEED, vault.duel_id.as_bytes()], bump = vault.bump)]
    pub vault: Account<'info, DuelVault>,
}

#[derive(Accounts)]
pub struct SettlePayout<'info> {
    pub keeper: Signer<'info>,
    /// CHECK: validated against vault.winner
    #[account(mut)]
    pub winner_treasury: AccountInfo<'info>,
    #[account(mut, seeds = [DUEL_SEED, vault.duel_id.as_bytes()], bump = vault.bump)]
    pub vault: Account<'info, DuelVault>,
}

#[derive(Accounts)]
pub struct VoidRefund<'info> {
    pub keeper: Signer<'info>,
    /// CHECK: vault side A
    #[account(mut)]
    pub side_a_treasury: AccountInfo<'info>,
    /// CHECK: vault side B
    #[account(mut)]
    pub side_b_treasury: AccountInfo<'info>,
    #[account(mut, seeds = [DUEL_SEED, vault.duel_id.as_bytes()], bump = vault.bump)]
    pub vault: Account<'info, DuelVault>,
}

#[error_code]
pub enum ArenaError {
    #[msg("Duel id too long")]
    DuelIdTooLong,
    #[msg("Invalid duel status for this instruction")]
    BadStatus,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Amount must be > 0")]
    ZeroAmount,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Winner treasury mismatch")]
    BadWinner,
}
