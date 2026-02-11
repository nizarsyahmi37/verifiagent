use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    clock::Clock,
    sysvar::Sysvar,
};

// Declare program ID (will be updated after deployment)
solana_program::declare_id!("G6cYQD4sC5aoVipQveiSrB3ccrocmjoz1f7P83nS2RVP");

entrypoint!(process_instruction);

/// Instructions supported by the program
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum VerifiAgentInstruction {
    /// Initialize agent
    /// Accounts:
    /// 0. [writable] Agent account
    /// 1. [signer] Wallet account
    InitializeAgent,

    /// Log activity
    /// Accounts:
    /// 0. [writable] Activity account
    /// 1. [writable] Agent account
    /// 2. [signer] Wallet account
    LogActivity {
        action_hash: [u8; 32],
        action_type: String,
    },
}

/// Agent account data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Agent {
    pub wallet: Pubkey,
    pub trust_level: u8,
    pub total_activities: u64,
    pub created_at: i64,
    pub last_activity: i64,
}

/// Activity trace account data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ActivityTrace {
    pub agent: Pubkey,
    pub action_hash: [u8; 32],
    pub action_type: String,
    pub timestamp: i64,
    pub verified: bool,
    pub index: u64,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = VerifiAgentInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        VerifiAgentInstruction::InitializeAgent => {
            msg!("Instruction: InitializeAgent");
            process_initialize_agent(program_id, accounts)
        }
        VerifiAgentInstruction::LogActivity { action_hash, action_type } => {
            msg!("Instruction: LogActivity");
            process_log_activity(program_id, accounts, action_hash, action_type)
        }
    }
}

fn process_initialize_agent(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let agent_account = next_account_info(account_info_iter)?;
    let wallet_account = next_account_info(account_info_iter)?;

    if !wallet_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let clock = Clock::get()?;

    let agent = Agent {
        wallet: *wallet_account.key,
        trust_level: 0, // L0-Registered
        total_activities: 0,
        created_at: clock.unix_timestamp,
        last_activity: clock.unix_timestamp,
    };

    agent.serialize(&mut &mut agent_account.data.borrow_mut()[..])?;

    msg!("Agent initialized: {}", wallet_account.key);
    Ok(())
}

fn process_log_activity(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    action_hash: [u8; 32],
    action_type: String,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let activity_account = next_account_info(account_info_iter)?;
    let agent_account = next_account_info(account_info_iter)?;
    let wallet_account = next_account_info(account_info_iter)?;

    if !wallet_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Load and update agent
    let mut agent = Agent::try_from_slice(&agent_account.data.borrow())?;

    let clock = Clock::get()?;

    // Create activity trace
    let trace = ActivityTrace {
        agent: *agent_account.key,
        action_hash,
        action_type: action_type.clone(),
        timestamp: clock.unix_timestamp,
        verified: true,
        index: agent.total_activities,
    };

    // Update agent
    agent.total_activities += 1;
    agent.last_activity = clock.unix_timestamp;

    // Update trust level based on activities and time
    let days_active = (clock.unix_timestamp - agent.created_at) / 86400;
    agent.trust_level = calculate_trust_level(agent.total_activities, days_active);

    // Serialize
    trace.serialize(&mut &mut activity_account.data.borrow_mut()[..])?;
    agent.serialize(&mut &mut agent_account.data.borrow_mut()[..])?;

    msg!("Activity logged: {} (index: {})", action_type, trace.index);
    Ok(())
}

fn calculate_trust_level(total_activities: u64, days_active: i64) -> u8 {
    if days_active >= 30 && total_activities >= 100 {
        3 // L3-Trusted
    } else if days_active >= 7 && total_activities >= 20 {
        2 // L2-Active
    } else if total_activities >= 1 {
        1 // L1-Confirmed
    } else {
        0 // L0-Registered
    }
}
