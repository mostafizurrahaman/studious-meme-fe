'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Address, deleteAddress, setDefaultAddress } from '@/services/Address';
import { AddressFormModal } from '@/components/dashboard/AddressFormModal';

export function AddressClient({ initialAddresses }: { initialAddresses: Address[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (address?: Address) => {
    setAddressToEdit(address || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAddressToEdit(null);
  };

  const handleSuccess = (address: Address, isEditing: boolean, wasDefault: boolean) => {
    let updatedAddresses = addresses;
    if (isEditing) {
      updatedAddresses = addresses.map((addr) => (addr._id === address._id ? address : addr));
    } else {
      updatedAddresses = [address, ...addresses];
    }

    if (wasDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: a._id === address._id }));
    }
    
    setAddresses(updatedAddresses);
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    setLoading(true);
    try {
      const res = await deleteAddress(deletingId);
      if (res.success) {
        toast.success(res.message || 'Address deleted successfully');
        setAddresses((prev) => prev.filter((addr) => addr._id !== deletingId));
        router.refresh();
      } else {
        toast.error(res.message || 'Failed to delete address');
      }
    } catch (err) {
      toast.error('An error occurred while deleting.');
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setLoading(true);
    try {
      const res = await setDefaultAddress(id);
      if (res.success) {
        toast.success(res.message || 'Default address updated');
        setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefault: addr._id === id })));
        router.refresh();
      } else {
        toast.error(res.message || 'Failed to set default address');
      }
    } catch (err) {
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">My Addresses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your delivery addresses</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 cursor-pointer">
          <Plus size={16} /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No addresses found</h3>
          <p className="text-sm text-muted-foreground mb-4">You haven't added any addresses yet.</p>
          <Button variant="outline" className="cursor-pointer" onClick={() => handleOpenModal()}>Add your first address</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card 
              key={address._id} 
              className={`p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${address.isDefault ? 'border-primary/50 bg-primary/5 shadow-sm' : 'hover:border-primary/30'}`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary capitalize tracking-wide">
                      {address.type}
                    </span>
                    {address.isDefault && (
                      <span className="inline-flex items-center rounded-md bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                        ✓ Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!address.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 rounded-full text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground cursor-pointer" 
                        onClick={() => handleSetDefault(address._id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:bg-primary/20 hover:text-primary hover:shadow-sm cursor-pointer" onClick={() => handleOpenModal(address)}>
                        <Edit2 size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:bg-destructive/20 hover:text-destructive hover:shadow-sm cursor-pointer" onClick={() => setDeletingId(address._id)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-3.5 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border shadow-sm text-muted-foreground">
                      <User size={14} />
                    </div>
                    <span className="font-semibold text-foreground">{address.fullName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border shadow-sm text-muted-foreground">
                      <Phone size={14} />
                    </div>
                    <span className="text-foreground/80">{address.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border shadow-sm text-muted-foreground">
                      <Mail size={14} />
                    </div>
                    <span className="text-foreground/80">{address.email}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border shadow-sm text-muted-foreground">
                      <MapPin size={14} />
                    </div>
                    <span className="text-foreground/80 leading-relaxed pt-1.5 line-clamp-2">
                      {address.deliveryAddress}, {address.district}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddressFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        addressToEdit={addressToEdit}
      />

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setDeletingId(null)} disabled={loading} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} loading={loading} disabled={loading} className="cursor-pointer">
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
