import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Executor {
  address: string;
  hasApproved: boolean;
}

export function MultiSigExecution() {
  const [executors, setExecutors] = useState<Executor[]>([
    { address: '', hasApproved: false }
  ]);
  const [threshold, setThreshold] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addExecutor = () => {
    setExecutors([...executors, { address: '', hasApproved: false }]);
  };

  const updateExecutor = (index: number, address: string) => {
    const newExecutors = [...executors];
    newExecutors[index].address = address;
    setExecutors(newExecutors);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate multi-sig setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Multi-signature setup completed', {
        description: `${executors.length} executors added with threshold of ${threshold}`
      });
    } catch (error) {
      toast.error('Failed to setup multi-signature execution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Multi-Signature Setup</h2>
        </div>

        <div className="space-y-4">
          {executors.map((executor, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`executor-${index}`}>
                Executor {index + 1} Address
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`executor-${index}`}
                  value={executor.address}
                  onChange={(e) => updateExecutor(index, e.target.value)}
                  placeholder="Enter executor's wallet address"
                />
                {executor.hasApproved ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                )}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="threshold">Required Signatures</Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              min={1}
              max={executors.length}
            />
            <p className="text-sm text-muted-foreground">
              Number of signatures required to execute the will
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={addExecutor}
              disabled={executors.length >= 5}
            >
              Add Executor
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}