import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Key, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export function IdentityVerification() {
  const [verificationStep, setVerificationStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerification = async () => {
    setIsVerifying(true);
    try {
      // Simulate ZK-SNARK verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVerificationStep(prev => prev + 1);
      toast.success('Identity verification step completed');
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Identity Verification</h2>
        </div>

        <div className="grid gap-6">
          {verificationStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <h3 className="text-lg font-semibold">KYC Verification</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Legal Name</Label>
                <Input id="fullName" placeholder="Enter your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber">Government ID Number</Label>
                <Input id="idNumber" placeholder="Enter ID number" />
              </div>
              <Button onClick={handleVerification} disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Submit KYC'}
              </Button>
            </div>
          )}

          {verificationStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Multi-Factor Authentication</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mfaCode">Enter MFA Code</Label>
                <Input id="mfaCode" placeholder="Enter 6-digit code" />
              </div>
              <Button onClick={handleVerification} disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify MFA'}
              </Button>
            </div>
          )}

          {verificationStep === 3 && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Shield className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-green-500">
                Identity Verified Successfully
              </h3>
              <p className="text-muted-foreground">
                Your identity has been verified. You can now proceed with will creation.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}