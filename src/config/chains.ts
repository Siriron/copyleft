// Central chain + contract configuration.
// Never hardcode RPC URLs, chain IDs, or contract addresses anywhere else.

export type NetworkKey = 'bradbury' | 'studionet';

export interface NetworkConfig {
  key: NetworkKey;
  label: string;
  rpcUrl: string;
  chainId: number;
  chainIdHex: string;
  explorerUrl: string;
  contractAddress: string;
}

export const NETWORKS: Record<NetworkKey, NetworkConfig> = {
  bradbury: {
    key: 'bradbury',
    label: 'Bradbury (Testnet)',
    rpcUrl: 'https://rpc-bradbury.genlayer.com',
    chainId: 4221,
    chainIdHex: '0x107D',
    explorerUrl: 'https://explorer-bradbury.genlayer.com',
    // Set via VITE_CONTRACT_ADDRESS_BRADBURY after deploying through studio.genlayer.com
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS_BRADBURY || '',
  },
  studionet: {
    key: 'studionet',
    label: 'StudioNet',
    rpcUrl: 'https://studio.genlayer.com/api',
    chainId: 61999,
    chainIdHex: '0xF22F',
    explorerUrl: 'https://explorer-studio.genlayer.com',
    // Set via VITE_CONTRACT_ADDRESS_STUDIONET after deploying through studio.genlayer.com
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS_STUDIONET || '',
  },
};

export const DEFAULT_NETWORK: NetworkKey = 'studionet';

export const FAUCET_URL = 'https://testnet-faucet.genlayer.foundation';
