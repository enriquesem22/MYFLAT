import { Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { OnboardingFlow } from '@/components/profile/OnboardingFlow';

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);

  // Si no hay sesión, al login.
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingFlow
        initialName={user.name === 'Tú (demo)' ? '' : user.name}
        onComplete={(data) => {
          updateCurrentUser(data);
          setOnboardingDone(true);
          navigate('/discover');
        }}
      />
    </div>
  );
}
