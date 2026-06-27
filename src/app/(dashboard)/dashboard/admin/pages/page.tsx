import { redirect } from 'next/navigation';

export default function AdminPagesIndex() {
  redirect('/dashboard/admin/pages/privacy-policy');
}
