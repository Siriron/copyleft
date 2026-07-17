import { useCallback, useEffect, useState } from 'react';
import { TransactionStatus } from 'genlayer-js/types';
import { getReadClient, getWriteClient, getContractAddress, ensureChain } from './genlayerClient';
import { NetworkKey } from '../config/chains';

const CONNECT_NAME: Record<NetworkKey, string> = {
  studionet: 'studionet',
  bradbury: 'testnetBradbury',
};

export interface DisputeRecord {
  dispute_id: number;
  claimant: string;
  respondent: string;
  claimant_stake: number;
  respondent_stake: number;
  downstream_repo_url: string;
  disputed_paths: string;
  license_id: string;
  alleged_clause: string;
  claim_text: string;
  counter_evidence_url: string;
  rebuttal_text: string;
  status: string;
  verdict: string;
  confidence_bps: number;
  reasoning_summary: string;
  cure_commit_url: string;
  cure_verdict: string;
  cure_confidence_bps: number;
  filed_at: string;
  resolved_at: string;
}

export function useWallet() {
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Silently pick up an already-authorized account on mount, and stay in
  // sync if the person switches or disconnects accounts in their wallet —
  // without this, every page load or account switch requires re-clicking
  // "Connect Wallet" even when the wallet is already authorized.
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts[0]) setAccount(accounts[0] as `0x${string}`);
    }).catch(() => {});

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount((accounts[0] as `0x${string}`) || null);
    };
    eth.on?.('accountsChanged', handleAccountsChanged);
    return () => eth.removeListener?.('accountsChanged', handleAccountsChanged);
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        setError('No wallet found. Install MetaMask to submit or resolve disputes.');
        return;
      }
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0] as `0x${string}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, []);

  return { account, connect, connecting, error };
}

// Prepares a write client for a given network: switches/adds the chain in
// the wallet first (so the transaction actually lands on the network the
// UI says it will), then binds the client to that same chain.
async function prepareWriteClient(network: NetworkKey, account: `0x${string}`) {
  await ensureChain(network);
  const client = getWriteClient(network, account);
  // Some genlayer-js versions expose an explicit connect step to bind the
  // client to the wallet's now-active chain; call it defensively so this
  // still works on SDK versions that don't have it.
  if (typeof (client as any).connect === 'function') {
    await (client as any).connect(CONNECT_NAME[network]);
  }
  return client;
}

export function useCopyleftContract(network: NetworkKey) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = getContractAddress(network);

  const listDisputes = useCallback(async (): Promise<DisputeRecord[]> => {
    setLoading(true);
    setError(null);
    try {
      const client = getReadClient(network);
      const raw = await client.readContract({
        address: contractAddress as `0x${string}`,
        functionName: 'list_disputes',
        args: [],
      });
      const parsed = JSON.parse(raw as string);
      return parsed;
    } catch (e: any) {
      setError(e?.message || 'Failed to load disputes');
      return [];
    } finally {
      setLoading(false);
    }
  }, [network, contractAddress]);

  const getDispute = useCallback(async (disputeId: number): Promise<DisputeRecord | null> => {
    setLoading(true);
    setError(null);
    try {
      const client = getReadClient(network);
      const raw = await client.readContract({
        address: contractAddress as `0x${string}`,
        functionName: 'get_dispute',
        args: [disputeId],
      });
      return JSON.parse(raw as string);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dispute');
      return null;
    } finally {
      setLoading(false);
    }
  }, [network, contractAddress]);

  const fileDispute = useCallback(async (
    account: `0x${string}`,
    args: { downstreamRepoUrl: string; disputedPaths: string; licenseId: string; allegedClause: string; claimText: string },
    stakeWei: bigint,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const client = await prepareWriteClient(network, account);
      const hash = await client.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: 'file_dispute',
        args: [args.downstreamRepoUrl, args.disputedPaths, args.licenseId, args.allegedClause, args.claimText],
        value: stakeWei,
      });
      await client.waitForTransactionReceipt({ hash, status: TransactionStatus.ACCEPTED });
      return hash;
    } catch (e: any) {
      setError(e?.message || 'Failed to file dispute');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [network, contractAddress]);

  const rebut = useCallback(async (
    account: `0x${string}`,
    disputeId: number,
    counterEvidenceUrl: string,
    rebuttalText: string,
    stakeWei: bigint,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const client = await prepareWriteClient(network, account);
      const hash = await client.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: 'rebut',
        args: [disputeId, counterEvidenceUrl, rebuttalText],
        value: stakeWei,
      });
      await client.waitForTransactionReceipt({ hash, status: TransactionStatus.ACCEPTED });
      return hash;
    } catch (e: any) {
      setError(e?.message || 'Failed to submit rebuttal');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [network, contractAddress]);

  const resolveDispute = useCallback(async (account: `0x${string}`, disputeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const client = await prepareWriteClient(network, account);
      const hash = await client.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: 'resolve_dispute',
        args: [disputeId],
        value: BigInt(0),
      });
      await client.waitForTransactionReceipt({ hash, status: TransactionStatus.ACCEPTED });
      return hash;
    } catch (e: any) {
      setError(e?.message || 'Failed to resolve dispute');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [network, contractAddress]);

  const requestCure = useCallback(async (account: `0x${string}`, disputeId: number, cureCommitUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const client = await prepareWriteClient(network, account);
      const hash = await client.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: 'request_cure',
        args: [disputeId, cureCommitUrl],
        value: BigInt(0),
      });
      await client.waitForTransactionReceipt({ hash, status: TransactionStatus.ACCEPTED });
      return hash;
    } catch (e: any) {
      setError(e?.message || 'Failed to request cure');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [network, contractAddress]);

  return { loading, error, listDisputes, getDispute, fileDispute, rebut, resolveDispute, requestCure };
}

