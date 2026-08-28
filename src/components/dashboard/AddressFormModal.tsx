'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BANGLADESH_DISTRICTS } from '@/lib/bangladesh-districts';
import { Address, createAddress, updateAddress } from '@/services/Address';
import { addressSchema, type TAddressSchema } from '@/schemas/address';
import { handleFormError } from '@/lib/handle-zod-error';

export interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (address: Address, isEditing: boolean, wasDefault: boolean) => void;
  addressToEdit?: Address | null;
}

export function AddressFormModal({
  isOpen,
  onClose,
  onSuccess,
  addressToEdit,
}: AddressFormModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<TAddressSchema>({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      district: '',
      deliveryAddress: '',
      type: 'home',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (addressToEdit) {
        form.reset({
          fullName: addressToEdit.fullName,
          phoneNumber: addressToEdit.phoneNumber,
          email: addressToEdit.email,
          district: addressToEdit.district,
          deliveryAddress: addressToEdit.deliveryAddress,
          type: (addressToEdit.type as any) || 'home',
          isDefault: !!addressToEdit.isDefault,
        });
      } else {
        form.reset({
          fullName: '',
          phoneNumber: '',
          email: '',
          district: '',
          deliveryAddress: '',
          type: 'home',
          isDefault: false,
        });
      }
    }
  }, [isOpen, addressToEdit, form]);

  const onSubmit: SubmitHandler<TAddressSchema> = async (data) => {
    setLoading(true);
    try {
      if (addressToEdit) {
        const res = await updateAddress(addressToEdit._id, data);
        if (res.success && res.data) {
          toast.success(res.message || 'Address updated successfully');
          onSuccess(res.data, true, !!data.isDefault);
          onClose();
        } else {
          toast.error(res.message || 'Failed to update address');
        }
      } else {
        const res = await createAddress(data);
        if (res.success && res.data) {
          toast.success(res.message || 'Address added successfully');
          onSuccess(res.data, false, !!data.isDefault);
          onClose();
        } else {
          toast.error(res.message || 'Failed to add address');
        }
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit, handleFormError)} className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{addressToEdit ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input {...field} id="fullName" placeholder="John Doe" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="phoneNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                    <Input {...field} id="phoneNumber" placeholder="01XXXXXXXXX" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input {...field} id="email" type="email" placeholder="john@example.com" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="district"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="district">District</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-11 text-sm bg-background border-input cursor-pointer" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={4}>
                        {BANGLADESH_DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="type">Address Type</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-11 text-sm bg-background border-input capitalize cursor-pointer" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={4}>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="deliveryAddress"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="deliveryAddress">Delivery Address</FieldLabel>
                  <Textarea {...field} id="deliveryAddress" placeholder="House, Road, Area..." className="resize-none" rows={3} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="isDefault"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox id="isDefault" checked={field.value} onCheckedChange={field.onChange} className="cursor-pointer" />
                  <label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    Set as default address
                  </label>
                </div>
              )}
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={loading} className="cursor-pointer">
              {loading ? 'Saving...' : 'Save Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
