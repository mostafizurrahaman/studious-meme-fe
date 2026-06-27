'use client';

import { getCurrentUser } from '@/services/Auth';
import { AuthUser } from '@/types';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

interface IUserProv {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const UserContext = createContext<IUserProv | undefined>(undefined);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleUser = async () => {
  //   const user = await getCurrentUser();
  //   setUser(user);
  //   setIsLoading(false);
  // };

  useEffect(() => {
    if (!isLoading) return;

    const timeout = window.setTimeout(() => {
      void handleUser();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [isLoading]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within the UserProvider context!');
  }

  return context;
};

export default UserProvider;
