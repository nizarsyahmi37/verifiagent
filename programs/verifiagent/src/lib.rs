use anchor_lang::prelude::*;

declare_id!("G6cYQD4sC5aoVipQveiSrB3ccrocmjoz1f7P83nS2RVP");

#[program]
pub mod verifiagent {
    use super::*;

    /// Initialize a new agent identity on-chain
    pub fn initialize_agent(ctx: Context<InitializeAgent>) -> Result<()> {
        let agent = &mut ctx.accounts.agent;
        agent.wallet_address = ctx.accounts.wallet.key();
        agent.trust_level = TrustLevel::L0Registered;
        agent.total_activities = 0;
        agent.created_at = Clock::get()?.unix_timestamp;
        agent.last_activity = Clock::get()?.unix_timestamp;

        msg!("Agent initialized: {}", agent.wallet_address);
        Ok(())
    }

    /// Log an activity trace on-chain
    pub fn log_activity(
        ctx: Context<LogActivity>,
        action_hash: [u8; 32],
        action_type: String,
    ) -> Result<()> {
        let trace = &mut ctx.accounts.trace;
        let agent = &mut ctx.accounts.agent;

        trace.agent = agent.key();
        trace.action_hash = action_hash;
        trace.action_type = action_type;
        trace.timestamp = Clock::get()?.unix_timestamp;
        trace.verified = true;
        trace.index = agent.total_activities;

        // Increment total activities
        agent.total_activities = agent.total_activities.checked_add(1).unwrap();
        agent.last_activity = Clock::get()?.unix_timestamp;

        // Update trust level based on activity count and time
        agent.trust_level = calculate_trust_level(
            agent.total_activities,
            agent.created_at,
            agent.last_activity,
        );

        msg!("Activity logged: {} (hash: {:?})", trace.action_type, trace.action_hash);
        Ok(())
    }

    /// Verify a trace (read-only query)
    pub fn verify_trace(ctx: Context<VerifyTrace>) -> Result<()> {
        let trace = &ctx.accounts.trace;
        msg!("Trace verified: agent={}, hash={:?}, timestamp={}",
             trace.agent, trace.action_hash, trace.timestamp);
        Ok(())
    }
}

// Account Structures

#[account]
pub struct Agent {
    pub wallet_address: Pubkey,
    pub trust_level: TrustLevel,
    pub total_activities: u64,
    pub created_at: i64,
    pub last_activity: i64,
}

impl Agent {
    pub const LEN: usize = 32 + 1 + 8 + 8 + 8; // 57 bytes
}

#[account]
pub struct ActivityTrace {
    pub agent: Pubkey,
    pub action_hash: [u8; 32],
    pub action_type: String,
    pub timestamp: i64,
    pub verified: bool,
    pub index: u64,
}

impl ActivityTrace {
    pub const LEN: usize = 32 + 32 + 100 + 8 + 1 + 8; // 181 bytes (100 for string)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TrustLevel {
    L0Registered = 0,
    L1Confirmed = 1,
    L2Active = 2,
    L3Trusted = 3,
}

// Context Structures

#[derive(Accounts)]
pub struct InitializeAgent<'info> {
    #[account(
        init,
        payer = wallet,
        space = 8 + Agent::LEN,
        seeds = [b"agent", wallet.key().as_ref()],
        bump
    )]
    pub agent: Account<'info, Agent>,

    #[account(mut)]
    pub wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LogActivity<'info> {
    #[account(
        mut,
        seeds = [b"agent", wallet.key().as_ref()],
        bump
    )]
    pub agent: Account<'info, Agent>,

    #[account(
        init,
        payer = wallet,
        space = 8 + ActivityTrace::LEN,
        seeds = [b"trace", wallet.key().as_ref(), &agent.total_activities.to_le_bytes()],
        bump
    )]
    pub trace: Account<'info, ActivityTrace>,

    #[account(mut)]
    pub wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyTrace<'info> {
    pub trace: Account<'info, ActivityTrace>,
}

// Helper Functions

fn calculate_trust_level(
    total_activities: u64,
    created_at: i64,
    last_activity: i64,
) -> TrustLevel {
    let now = Clock::get().unwrap().unix_timestamp;
    let days_active = (now - created_at) / 86400;

    // L3: 30+ days active AND 100+ activities
    if days_active >= 30 && total_activities >= 100 {
        return TrustLevel::L3Trusted;
    }

    // L2: 7+ days active AND 20+ activities
    if days_active >= 7 && total_activities >= 20 {
        return TrustLevel::L2Active;
    }

    // L1: 1+ activities (confirmed)
    if total_activities >= 1 {
        return TrustLevel::L1Confirmed;
    }

    // L0: Just registered
    TrustLevel::L0Registered
}
