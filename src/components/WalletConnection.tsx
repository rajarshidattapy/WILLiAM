import { motion } from 'framer-motion';
import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Shield, Mail, Phone, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function WalletConnection() {
  const { connectWallet, isConnecting, account } = useWallet();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet('metamask');
    } catch (error) {
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask to continue', {
          description: 'Visit metamask.io to install the extension',
          action: {
            label: 'Install',
            onClick: () => window.open('https://metamask.io', '_blank'),
          },
        });
      } else {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet. Please try again.');
      }
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !phone) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert new user without selecting
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email,
          phone_number: phone
        });

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          toast.error('This email is already registered');
        } else {
          throw insertError;
        }
        return;
      }

      toast.success('Contact details saved successfully');
      setContactSaved(true);
    } catch (error) {
      console.error('Error saving contact details:', error);
      toast.error('Failed to save contact details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md p-6 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome to WillIAm</h1>
            <p className="text-muted-foreground">
              {!contactSaved 
                ? "First, let's save your contact information"
                : "Now, connect your wallet to continue"}
            </p>
          </div>

          {!contactSaved ? (
            <form onSubmit={handleSubmitDetails} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Saving...'
                  ) : (
                    <>
                      Save Contact Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : !account ? (
            <div className="space-y-4">
              <Button
                onClick={handleConnect}
                className="w-full"
                size="lg"
                disabled={isConnecting}
              >
                <Wallet className="mr-2 h-5 w-5" />
                {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => window.open('https://core.app/download', '_blank')}
              >
                <Shield className="mr-2 h-5 w-5" />
                Download Core Wallet
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-green-500 font-medium">
                Wallet connected successfully!
              </p>
              <p className="font-mono text-sm">
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>
          )}

          <p className="text-sm text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </motion.div>
    </div>
  );
}