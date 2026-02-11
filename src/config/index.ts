import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    network: process.env.SOLANA_NETWORK || 'mainnet-beta',
  },
  challenge: {
    expirationTime: 5 * 60 * 1000, // 5 minutes
  },
  trustLevels: {
    L2_ACTIVE_DAYS: 7,
    L3_TRUSTED_DAYS: 30,
  },
};
