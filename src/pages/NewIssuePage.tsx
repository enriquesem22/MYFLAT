import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/common/EmptyState';
import { IssueForm } from '@/components/issues/IssueForm';
import { ChevronLeft, WrenchIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyFlat } from '@/hooks/useMyFlat';

export function NewIssuePage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const { property } = useMyFlat();
  const addIssue = useAppStore((s) => s.addIssue);

  return (
    <AppLayout hideHeader hideNav>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-2 h-14 flex items-center gap-2">
        <button onClick={() => navigate('/my-flat/issues')} className="p-2 text-gray-500">
          <ChevronLeft width={22} height={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Reportar problema</h1>
      </header>

      <div className="p-4">
        {!property ? (
          <EmptyState
            icon={<WrenchIcon width={28} height={28} />}
            title="Sin piso asignado"
            description="Necesitas estar en un piso para reportar una incidencia."
          />
        ) : (
          <IssueForm
            onCancel={() => navigate('/my-flat/issues')}
            onSubmit={(draft) => {
              addIssue({
                ...draft,
                propertyId: property.id,
                createdBy: me.id,
                assignedTo: property.ownerId,
              });
              navigate('/my-flat/issues');
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}
