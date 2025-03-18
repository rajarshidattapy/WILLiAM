import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Gift, Shield, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { NFTStorage } from 'nft.storage';

interface NFTCard {
  id: string;
  name: string;
  image: string;
  type: string;
}

const mockNFTs: NFTCard[] = [
  {
    id: '1',
    name: 'Digital Legacy #001',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=800&auto=format&fit=crop&q=60',
    type: 'Inheritance Token'
  },
  {
    id: '2',
    name: 'Asset Claim #123',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    type: 'Claim Token'
  },
  {
    id: '3',
    name: 'Soulbound Will #045',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60',
    type: 'Soulbound Token'
  },
];

const NFT_STORAGE_KEY = '9d44e192.44aa8aadd0f84693b8bf663370d756ed';
const client = new NFTStorage({ token: NFT_STORAGE_KEY });

export function NFTInheritance() {
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0],
      });
    }
  };

  const handleMint = async () => {
    if (!formData.file || !formData.name || !formData.description) {
      toast.error('Please fill in all fields and upload a file');
      return;
    }

    setIsUploading(true);
    try {
      const metadata = await client.store({
        name: formData.name,
        description: formData.description,
        image: formData.file,
      });

      toast.success('NFT created successfully!', {
        description: `Your NFT has been minted and stored on IPFS`,
      });

      setShowMintDialog(false);
      setFormData({
        name: '',
        description: '',
        file: null,
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">NFT Inheritance</h2>
          <Button onClick={() => setShowMintDialog(true)} className="w-full sm:w-auto">
            <Gift className="mr-2 h-4 w-4" />
            Mint New Token
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {mockNFTs.map((nft) => (
            <motion.div
              key={nft.id}
              whileHover={{ scale: 1.02 }}
              className="group relative"
            >
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary">
                      <Shield className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{nft.name}</h3>
                  <p className="text-sm text-muted-foreground">{nft.type}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>

      <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mint New NFT</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nft-name">NFT Name</Label>
              <Input
                id="nft-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter NFT name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nft-description">Description</Label>
              <Textarea
                id="nft-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter NFT description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nft-file">Upload File</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Input
                  id="nft-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <label htmlFor="nft-file" className="cursor-pointer">
                  <Upload className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
                  </p>
                </label>
              </div>
            </div>
            <Button
              onClick={handleMint}
              disabled={isUploading || !formData.file}
              className="w-full"
            >
              {isUploading ? 'Minting...' : 'Mint NFT'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}