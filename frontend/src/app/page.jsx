import { redirect } from 'next/navigation';

export default function RootPage() {
  // In a real app, evaluate auth here. For now, redirect to login as per route map.
  redirect('/login');
}
