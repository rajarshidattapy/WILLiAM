import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Coins, Plus, ArrowUpDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@/contexts/WalletContext';
import { willSystem } from '@/lib/contract';

interface Asset {
  id: string;
  name: string;
  type: string;
  value: string;
  status: string;
}

const mockAssets: Asset[] = [
  { id: '1', name: 'ETH Balance', type: 'Cryptocurrency', value: '2.5 ETH', status: 'Active' },
  { id: '2', name: 'USDC Holdings', type: 'Stablecoin', value: '5000 USDC', status: 'Active' },
  { id: '3', name: 'Digital Art Collection', type: 'NFT', value: '3 Items', status: 'Locked' },
];

export function AssetManagement() {
  const { account } = useWallet();
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [newToken, setNewToken] = useState({
    name: '',
    symbol: '',
    initialSupply: '',
  });

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingToken(true);

    try {
      // Here we would normally interact with the smart contract
      await willSystem.connect();
      // Simulated delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Token created successfully!', {
        description: `Created ${newToken.name} (${newToken.symbol})`,
      });

      setNewToken({ name: '', symbol: '', initialSupply: '' });
    } catch (error) {
      toast.error('Failed to create token', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setIsCreatingToken(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Management</h2>
          <p className="text-muted-foreground">Manage your digital assets and tokens</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Token</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateToken} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenName">Token Name</Label>
                <Input
                  id="tokenName"
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  placeholder="My Token"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tokenSymbol">Token Symbol</Label>
                <Input
                  id="tokenSymbol"
                  value={newToken.symbol}
                  onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
                  placeholder="MTK"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialSupply">Initial Supply</Label>
                <Input
                  id="initialSupply"
                  type="number"
                  value={newToken.initialSupply}
                  onChange={(e) => setNewToken({ ...newToken, initialSupply: e.target.value })}
                  placeholder="1000000"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreatingToken}>
                {isCreatingToken ? 'Creating...' : 'Create Token'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">2.5 ETH</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Token Balance</p>
                <p className="text-2xl font-bold">5000 USDC</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <ArrowUpDown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">24h Change</p>
                <p className="text-2xl font-bold text-green-500">+5.2%</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="assets" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="assets">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell>{asset.value}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        asset.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {asset.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="text-center py-8 text-muted-foreground">
              Transaction history will be available soon
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}