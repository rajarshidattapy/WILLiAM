import { ethers } from 'ethers';
import WillSystemABI from '../contracts/WillSystem.json';

// After deploying your contract, replace this with your deployed contract address
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

class WillSystemContract {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    // Don't initialize in constructor - wait for explicit connect call
  }

  async connect() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask to use this application');
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        WillSystemABI.abi,
        this.signer
      );

      // Listen for account changes
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Error connecting to Ethereum:', error);
      throw new Error('Failed to connect to Ethereum network');
    }
  }

  async createWill(beneficiaries: string[], shares: number[]) {
    if (!this.contract || !this.signer) {
      await this.connect();
    }
    
    try {
      // Validate shares total to 100
      const totalShares = shares.reduce((a, b) => a + b, 0);
      if (totalShares !== 100) {
        throw new Error('Total shares must equal 100');
      }

      const tx = await this.contract!.createWill(beneficiaries, shares);
      const receipt = await tx.wait();
      
      // Get the WillCreated event from the receipt
      const event = receipt.logs.find(
        (log: any) => log.eventName === 'WillCreated'
      );
      
      return {
        willId: event?.args?.willId,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error('Error creating will:', error);
      throw error;
    }
  }

  async createToken(name: string, symbol: string, initialSupply: string) {
    if (!this.contract || !this.signer) {
      await this.connect();
    }

    try {
      // This would normally call a token factory contract
      // For demo purposes, we'll just simulate the call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        tokenAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
      };
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }

  async getWillDetails(willId: number) {
    if (!this.contract) {
      await this.connect();
    }

    try {
      const details = await this.contract!.getWillDetails(willId);
      return {
        creator: details.creator,
        beneficiaries: details.beneficiaries,
        shares: details.shares.map((share: bigint) => Number(share)),
        executed: details.executed
      };
    } catch (error) {
      console.error('Error getting will details:', error);
      throw error;
    }
  }

  async executeWill(willId: number) {
    if (!this.contract || !this.signer) {
      await this.connect();
    }
    
    try {
      const tx = await this.contract!.executeWill(willId);
      const receipt = await tx.wait();
      return {
        transactionHash: receipt.hash,
        executed: true
      };
    } catch (error) {
      console.error('Error executing will:', error);
      throw error;
    }
  }

  async getWillCount(): Promise<number> {
    if (!this.contract) {
      await this.connect();
    }

    try {
      const count = await this.contract!.willCount();
      return Number(count);
    } catch (error) {
      console.error('Error getting will count:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.contract !== null && this.signer !== null;
  }

  async getCurrentBalance(): Promise<string> {
    if (!this.signer) {
      await this.connect();
    }
    const balance = await this.provider!.getBalance(await this.signer!.getAddress());
    return ethers.formatEther(balance);
  }
}

export const willSystem = new WillSystemContract();