import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PiggyBank, ArrowUpDown, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useWallet } from '@/contexts/WalletContext';

export function VaultManagement() {
  const { account } = useWallet();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState('0');
  const [yieldEarned, setYieldEarned] = useState('0');

  useEffect(() => {
    fetchVaultData();
  }, [account]);

  const fetchVaultData = async () => {
    if (!account) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', account)
        .single();

      if (!userData) return;

      const { data: vaultData } = await supabase
        .from('vault_transactions')
        .select('amount, transaction_type')
        .eq('user_id', userData.id);

      let total = 0;
      let yieldTotal = 0;

      vaultData?.forEach(tx => {
        if (tx.transaction_type === 'deposit') {
          total += Number(tx.amount);
        } else if (tx.transaction_type === 'yield') {
          yieldTotal += Number(tx.amount);
        } else if (tx.transaction_type === 'withdraw') {
          total -= Number(tx.amount);
        }
      });

      setBalance(total.toString());
      setYieldEarned(yieldTotal.toString());
    } catch (error) {
      console.error('Error fetching vault data:', error);
    }
  };

  const handleTransaction = async (type: 'deposit' | 'withdraw') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', account)
        .single();

      if (!userData) throw new Error('User not found');

      const { error } = await supabase
        .from('vault_transactions')
        .insert({
          user_id: userData.id,
          amount: Number(amount),
          transaction_type: type
        });

      if (error) throw error;

      toast.success(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`, {
        description: `${amount} CORE has been ${type === 'deposit' ? 'added to' : 'removed from'} your vault`
      });

      setAmount('');
      fetchVaultData();
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error(`Failed to ${type}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <PiggyBank className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Vault Management</h2>
        </div>

        <Tabs defaultValue="deposit" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="yield">Yield</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Deposit Amount (CORE)</Label>
              <Input
                id="depositAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to deposit"
              />
            </div>
            <Button 
              onClick={() => handleTransaction('deposit')} 
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? 'Processing...' : 'Deposit to Vault'}
            </Button>
          </TabsContent>

          <TabsContent value="yield" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current APY</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-500">12.5%</p>
                  </div>
                  <Coins className="h-8 w-8 text-primary" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Earned Yield</p>
                    <p className="text-xl sm:text-2xl font-bold">{yieldEarned} CORE</p>
                  </div>
                  <ArrowUpDown className="h-8 w-8 text-primary" />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Withdraw Amount (CORE)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
              />
              <p className="text-sm text-muted-foreground">
                Available balance: {balance} CORE
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => handleTransaction('withdraw')}
              disabled={isProcessing || Number(amount) > Number(balance)}
              className="w-full sm:w-auto"
            >
              {isProcessing ? 'Processing...' : 'Withdraw from Vault'}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}