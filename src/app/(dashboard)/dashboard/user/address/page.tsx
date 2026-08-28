import { Metadata } from 'next';
import { getMyAddresses } from '@/services/Address';
import { AddressClient } from './AddressClient';

export const metadata: Metadata = {
  title: 'My Addresses | Dashboard',
};

export default async function AddressPage() {
  const result = await getMyAddresses();
  const addresses = result.data || [];

  return <AddressClient initialAddresses={addresses} />;
}
