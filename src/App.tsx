import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { LoadingState } from '@/components/common/LoadingState';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { MatchesPage } from '@/pages/MatchesPage';
import { ChatPage } from '@/pages/ChatPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ProfileEditPage } from '@/pages/ProfileEditPage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { PropertyPage } from '@/pages/PropertyPage';
import { MyFlatPage } from '@/pages/MyFlatPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { IssuesPage } from '@/pages/IssuesPage';
import { NewIssuePage } from '@/pages/NewIssuePage';
import { ReviewsPage } from '@/pages/ReviewsPage';
import { SettingsPage } from '@/pages/SettingsPage';

/** Protege rutas que requieren sesión iniciada. */
function RequireAuth({ children }: { children: ReactNode }) {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const location = useLocation();

  if (!currentUserId) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!onboardingDone && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const ready = useAppStore((s) => s.ready);
  const hydrate = useAppStore((s) => s.hydrate);

  // Carga inicial de datos (solo hace algo en modo Supabase).
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState label="Cargando Myflat…" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Onboarding (requiere cuenta pero no perfil completo) */}
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* App (requiere sesión + onboarding) */}
      <Route path="/discover" element={<RequireAuth><DiscoverPage /></RequireAuth>} />
      <Route path="/matches" element={<RequireAuth><MatchesPage /></RequireAuth>} />
      <Route path="/matches/:id" element={<RequireAuth><ChatPage /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      <Route path="/profile/edit" element={<RequireAuth><ProfileEditPage /></RequireAuth>} />
      <Route path="/users/:id" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
      <Route path="/properties/:id" element={<RequireAuth><PropertyPage /></RequireAuth>} />
      <Route path="/my-flat" element={<RequireAuth><MyFlatPage /></RequireAuth>} />
      <Route path="/my-flat/payments" element={<RequireAuth><PaymentsPage /></RequireAuth>} />
      <Route path="/my-flat/issues" element={<RequireAuth><IssuesPage /></RequireAuth>} />
      <Route path="/my-flat/issues/new" element={<RequireAuth><NewIssuePage /></RequireAuth>} />
      <Route path="/my-flat/reviews" element={<RequireAuth><ReviewsPage /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
