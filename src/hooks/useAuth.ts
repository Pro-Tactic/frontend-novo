import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    raiseError('useAuth must be used within an AuthProvider');
  }
  return context;
};

function raiseError(message: string): never {
  throw new Error(message);
}
