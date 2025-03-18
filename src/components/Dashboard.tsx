import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletConnection } from '@/components/WalletConnection';
import { WillCreation } from '@/components/WillCreation';
import { AssetManagement } from '@/components/AssetManagement';
import { Analytics } from '@/components/Analytics';
import { NFTInheritance } from '@/components/NFTInheritance';
import { VaultManagement } from '@/components/VaultManagement';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  FileText,
  Wallet,
  BarChart3,
  Image,
  PiggyBank,
  LogOut,
  Menu
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Dashboard() {
  const { account, disconnect } = useWallet();
  const [yieldGenerated, setYieldGenerated] = useState<string>('0');
  const [activeWills, setActiveWills] = useState<number>(0);
  const [totalAssets, setTotalAssets] = useState<string>('0');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, [account]);

  const fetchDashboardData = async () => {
    if (!account) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', account)
        .single();

      if (!userData) return;

      const { count: willsCount } = await supabase
        .from('wills')
        .select('*', { count: 'exact' })
        .eq('creator_id', userData.id)
        .eq('status', 'active');

      setActiveWills(willsCount || 0);

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

      setTotalAssets(total.toString());
      setYieldGenerated(yieldTotal.toString());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (!account) {
    return <WalletConnection />;
  }

  const TabNavigation = () => (
    <TabsList className="hidden md:grid md:grid-cols-6 gap-4 bg-background">
      <TabsTrigger value="dashboard" className="flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </TabsTrigger>
      <TabsTrigger value="wills" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Wills
      </TabsTrigger>
      <TabsTrigger value="assets" className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Assets
      </TabsTrigger>
      <TabsTrigger value="vaults" className="flex items-center gap-2">
        <PiggyBank className="h-4 w-4" />
        Vaults
      </TabsTrigger>
      <TabsTrigger value="analytics" className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Analytics
      </TabsTrigger>
      <TabsTrigger value="nft" className="flex items-center gap-2">
        <Image className="h-4 w-4" />
        NFTs
      </TabsTrigger>
    </TabsList>
  );

  const MobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4 mt-8">
          {[
            { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { value: 'wills', label: 'Wills', icon: FileText },
            { value: 'assets', label: 'Assets', icon: Wallet },
            { value: 'vaults', label: 'Vaults', icon: PiggyBank },
            { value: 'analytics', label: 'Analytics', icon: BarChart3 },
            { value: 'nft', label: 'NFTs', icon: Image },
          ].map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={activeTab === value ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab(value);
              }}
            >
              <Icon className="mr-2 h-5 w-5" />
              {label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full"
    >
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <MobileNavigation />
            <h1 className="text-2xl sm:text-3xl font-bold">WillIAm</h1>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Button variant="outline" className="hidden sm:flex">
              {account.slice(0, 6)}...{account.slice(-4)}
            </Button>
            <Button variant="destructive" onClick={disconnect} className="px-2 sm:px-4">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabNavigation />

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-2">Active Wills</h3>
                  <p className="text-2xl sm:text-3xl font-bold">{activeWills}</p>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Assets</h3>
                  <p className="text-2xl sm:text-3xl font-bold">{totalAssets} CORE</p>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-2">Yield Generated</h3>
                  <p className="text-2xl sm:text-3xl font-bold">{yieldGenerated} CORE</p>
                  <p className="text-sm text-muted-foreground mt-1">12.5% APY</p>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="wills">
            <WillCreation />
          </TabsContent>

          <TabsContent value="assets">
            <AssetManagement />
          </TabsContent>

          <TabsContent value="vaults">
            <VaultManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="nft">
            <NFTInheritance />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}