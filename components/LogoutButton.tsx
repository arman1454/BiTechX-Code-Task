'use client';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';

export default function LogoutButton() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <Button onPress={handleLogout} className="bg-accent text-background text-sm font-medium">
      Logout
    </Button>
  );
}
