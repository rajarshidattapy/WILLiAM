import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { willSystem } from '@/lib/contract';
import { toast } from 'sonner';
import { Mail, Phone, User, Wallet, Trash2, Plus, Skull, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Beneficiary {
  name: string;
  email: string;
  phone: string;
  address: string;
  share: string;
}

interface DeathVote {
  beneficiary_id: string;
  voted_at: string;
}

export function WillCreation() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([{
    name: '',
    email: '',
    phone: '',
    address: '',
    share: ''
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deathVotes, setDeathVotes] = useState<DeathVote[]>([]);
  const [willId, setWillId] = useState<string | null>(null);
  const [lastAliveCheck, setLastAliveCheck] = useState<string | null>(null);

  useEffect(() => {
    fetchWillDetails();
  }, []);

  const fetchWillDetails = async () => {
    try {
      // Get user's active will
      const { data: willData } = await supabase
        .from('wills')
        .select('id, created_at')
        .eq('status', 'active')
        .single();

      if (willData) {
        setWillId(willData.id);
        
        // Fetch death votes
        const { data: votesData } = await supabase
          .from('death_votes')
          .select('beneficiary_id, voted_at')
          .eq('will_id', willData.id);

        if (votesData) {
          setDeathVotes(votesData);
        }

        // Fetch last alive check
        const { data: userData } = await supabase
          .from('users')
          .select('last_alive_check')
          .single();

        if (userData) {
          setLastAliveCheck(userData.last_alive_check);
        }
      }
    } catch (error) {
      console.error('Error fetching will details:', error);
    }
  };

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, {
      name: '',
      email: '',
      phone: '',
      address: '',
      share: ''
    }]);
  };

  const updateBeneficiary = (index: number, field: keyof Beneficiary, value: string) => {
    const newBeneficiaries = [...beneficiaries];
    newBeneficiaries[index] = {
      ...newBeneficiaries[index],
      [field]: value
    };
    setBeneficiaries(newBeneficiaries);
  };

  const removeBeneficiary = (index: number) => {
    if (beneficiaries.length > 1) {
      const newBeneficiaries = beneficiaries.filter((_, i) => i !== index);
      setBeneficiaries(newBeneficiaries);
    }
  };

  const validateBeneficiaries = () => {
    // Check if all fields are filled
    const isComplete = beneficiaries.every(b => 
      b.name && b.email && b.phone && b.address && b.share
    );
    if (!isComplete) {
      toast.error('Please fill in all beneficiary information');
      return false;
    }

    // Validate share percentages total 100
    const totalShares = beneficiaries.reduce((sum, b) => sum + Number(b.share), 0);
    if (totalShares !== 100) {
      toast.error('Share percentages must total 100%');
      return false;
    }

    return true;
  };

  const handleDissipate = async () => {
    if (!willId) return;

    const totalVotes = deathVotes.length;
    const requiredVotes = Math.ceil(beneficiaries.length / 2);

    if (totalVotes < requiredVotes) {
      toast.error(`Need at least ${requiredVotes} votes to dissipate funds`);
      return;
    }

    try {
      await willSystem.executeWill(Number(willId));
      toast.success('Funds have been dissipated to beneficiaries');
    } catch (error) {
      console.error('Error dissipating funds:', error);
      toast.error('Failed to dissipate funds');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBeneficiaries()) return;
    
    setIsSubmitting(true);

    try {
      await willSystem.connect();
      
      // Create will on blockchain
      const { willId, transactionHash } = await willSystem.createWill(
        beneficiaries.map(b => b.address),
        beneficiaries.map(b => parseInt(b.share))
      );

      // Store additional beneficiary information in Supabase
      const { data: willData, error: willError } = await supabase
        .from('wills')
        .insert({
          contract_will_id: willId,
          status: 'active'
        })
        .select()
        .single();

      if (willError) throw willError;

      // Store beneficiary details
      const beneficiaryPromises = beneficiaries.map(beneficiary =>
        supabase.from('beneficiaries').insert({
          will_id: willData.id,
          wallet_address: beneficiary.address,
          share_percentage: parseInt(beneficiary.share),
          name: beneficiary.name,
          email: beneficiary.email,
          phone: beneficiary.phone
        })
      );

      await Promise.all(beneficiaryPromises);
      
      toast.success('Will created successfully!');
      setBeneficiaries([{
        name: '',
        email: '',
        phone: '',
        address: '',
        share: ''
      }]);

      // Refresh will details
      await fetchWillDetails();
    } catch (error) {
      console.error('Error creating will:', error);
      toast.error('Failed to create will. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Create New Will</h2>
          {lastAliveCheck && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
              <Clock className="h-4 w-4" />
              Last alive check: {new Date(lastAliveCheck).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          {willId && (
            <Button
              variant="destructive"
              onClick={handleDissipate}
              className="flex items-center gap-2"
            >
              <Skull className="h-4 w-4" />
              Dissipate Funds
              {deathVotes.length > 0 && (
                <span className="ml-2 bg-white/10 px-2 py-1 rounded-full text-xs">
                  {deathVotes.length} votes
                </span>
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={addBeneficiary}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Beneficiary
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {beneficiaries.map((beneficiary, index) => (
            <div 
              key={index} 
              className="space-y-4 p-4 border rounded-lg relative bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Beneficiary {index + 1}</h3>
                {beneficiaries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBeneficiary(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id={`name-${index}`}
                    value={beneficiary.name}
                    onChange={(e) => updateBeneficiary(index, 'name', e.target.value)}
                    placeholder="Enter full name"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`} className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={beneficiary.email}
                    onChange={(e) => updateBeneficiary(index, 'email', e.target.value)}
                    placeholder="Enter email address"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`phone-${index}`} className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id={`phone-${index}`}
                    value={beneficiary.phone}
                    onChange={(e) => updateBeneficiary(index, 'phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`address-${index}`} className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Wallet Address
                  </Label>
                  <Input
                    id={`address-${index}`}
                    value={beneficiary.address}
                    onChange={(e) => updateBeneficiary(index, 'address', e.target.value)}
                    placeholder="0x..."
                    className="w-full font-mono"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`share-${index}`}>Share Percentage</Label>
                  <Input
                    id={`share-${index}`}
                    type="number"
                    value={beneficiary.share}
                    onChange={(e) => updateBeneficiary(index, 'share', e.target.value)}
                    placeholder="Share percentage"
                    min="0"
                    max="100"
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'Creating...' : 'Create Will'}
        </Button>
      </form>
    </Card>
  );
}