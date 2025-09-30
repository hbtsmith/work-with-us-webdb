import { useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface FirstLoginGuardProps {
  children: ReactNode;
}

export function FirstLoginGuard({ children }: FirstLoginGuardProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Não redirecionar se ainda está carregando ou se não há usuário
    if (isLoading || !user) return;

    // Não redirecionar se já está na página de alterar senha
    if (location.pathname === '/change-password') return;

    // Se é primeiro login, redirecionar para alterar senha
    if (user.isFirstLogin) {
      navigate('/change-password', { replace: true });
    }
  }, [user, isLoading, navigate, location.pathname]);

  // Se é primeiro login e não está na página de alterar senha, não renderizar nada
  if (user?.isFirstLogin && location.pathname !== '/change-password') {
    return null;
  }

  return <>{children}</>;
}
