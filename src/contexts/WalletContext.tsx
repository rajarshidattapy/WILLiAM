import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface WalletContextType {
  account: string | null;
  balance: string | null;
  chainId: number | null;
  connectWallet: (type: 'metamask' | 'core' | 'bitcoin') => Promise<string>;
  disconnect: () => void;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
          handleAccountsChanged([accounts[0].address]);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setBalance(null);
    } else {
      setAccount(accounts[0]);
      updateBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
    window.location.reload();
  };

  const updateBalance = async (address: string) => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    }
  };

  const connectCoreWallet = async () => {
    try {
      if (typeof window.avalanche === 'undefined') {
        window.open('https://core.app/download', '_blank');
        throw new Error('Please install Core Wallet to continue');
      }

      const accounts = await window.avalanche.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.avalanche);
      const network = await provider.getNetwork();
      
      setChainId(Number(network.chainId));
      setAccount(accounts[0]);
      updateBalance(accounts[0]);

      window.avalanche.on('accountsChanged', handleAccountsChanged);
      window.avalanche.on('chainChanged', handleChainChanged);

      toast.success('Core Wallet connected successfully!');
      return accounts[0];
    } catch (error: any) {
      console.error('Core Wallet connection error:', error);
      toast.error(error.message || 'Failed to connect Core Wallet');
      throw error;
    }
  };

  const connectWallet = async (type: 'metamask' | 'core' | 'bitcoin') => {
    setIsConnecting(true);
    try {
      if (type === 'metamask') {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('MetaMask is not installed');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();
        
        setChainId(Number(network.chainId));
        setAccount(accounts[0]);
        updateBalance(accounts[0]);
        
        toast.success('Wallet connected successfully!');
        return accounts[0];
      } else if (type === 'core') {
        return await connectCoreWallet();
      } else if (type === 'bitcoin') {
        toast.error('Bitcoin wallet connection coming soon');
        throw new Error('Bitcoin wallet connection not implemented');
      }
      throw new Error('Invalid wallet type');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setBalance(null);
    setChainId(null);
    toast.success('Wallet disconnected');
  };

  return (
    <WalletContext.Provider 
      value={{ 
        account, 
        balance, 
        chainId, 
        connectWallet, 
        disconnect, 
        isConnecting 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

declare global {
  interface Window {
    avalanche?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeListener: (event: string, callback: (params: any) => void) => void;
    };
  }
}