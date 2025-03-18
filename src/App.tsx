import { motion } from 'framer-motion';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import Dashboard from '@/components/Dashboard';
import { WalletProvider } from '@/contexts/WalletContext';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <WalletProvider>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen w-full bg-background text-foreground"
        >
          <Dashboard />
          <Toaster />
        </motion.div>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App