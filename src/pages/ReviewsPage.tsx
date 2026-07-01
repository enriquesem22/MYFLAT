import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReviewForm, REVIEW_TYPE_LABELS, type ReviewDraft } from '@/components/reviews/ReviewForm';
import { ReviewSummary } from '@/components/reviews/ReviewSummary';
import { ReferenceCard } from '@/components/reviews/ReferenceCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ChevronLeft, StarIcon, XIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyFlat } from '@/hooks/useMyFlat';
import type { ReviewType } from '@/types';

export function ReviewsPage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const { property, isOwner } = useMyFlat();
  const reviews = useAppStore((s) => s.reviews);
  const references = useAppStore((s) => s.references.filter((r) => r.userId === me.id));
  const getUser = useAppStore((s) => s.getUser);
  const addReview = useAppStore((s) => s.addReview);
  const addReference = useAppStore((s) => s.addReference);

  const [reviewType, setReviewType] = useState<ReviewType | null>(null);
  const [showRefForm, setShowRefForm] = useState(false);

  const flatReviews = reviews.filter(
    (r) => r.propertyId === property?.id || r.reviewedUserId === property?.ownerId,
  );

  // Tipos de valoración que puede crear según su rol.
  const availableTypes: ReviewType[] = isOwner
    ? ['tenant', 'property']
    : ['landlord', 'roommate', 'property'];

  function submitReview(draft: ReviewDraft) {
    addReview({
      reviewerId: me.id,
      reviewType: draft.reviewType,
      ratings: draft.ratings,
      comment: draft.comment,
      // Asignamos objeto según el tipo (demo: propietario/piso del flat).
      reviewedUserId:
        draft.reviewType === 'landlord' && property ? property.ownerId : undefined,
      propertyId: draft.reviewType === 'property' && property ? property.id : undefined,
    });
    setReviewType(null);
  }

  return (
    <AppLayout hideHeader>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-2 h-14 flex items-center gap-2">
        <button onClick={() => navigate('/my-flat')} className="p-2 text-gray-500">
          <ChevronLeft width={22} height={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Valoraciones y referencias</h1>
      </header>

      <div className="p-4 space-y-5">
        {/* Crear valoración */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Escribir una valoración</h3>
          <p className="text-xs text-gray-400 mb-3">
            Valora por categorías. En el futuro solo se podrá valorar tras convivencia o contrato
            verificado.
          </p>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map((t) => (
              <button
                key={t}
                onClick={() => setReviewType(t)}
                className="btn-secondary py-1.5 px-3 text-sm"
              >
                Valorar {REVIEW_TYPE_LABELS[t].toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Pedir referencia */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Referencias ({references.length})</h3>
            <button
              className="text-sm text-brand-500 font-semibold"
              onClick={() => setShowRefForm(true)}
            >
              Pedir referencia
            </button>
          </div>
          {references.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">
              Pide una referencia a un ex-compañero o casero para reforzar tu perfil.
            </p>
          ) : (
            <div className="space-y-2 mt-3">
              {references.map((r) => (
                <ReferenceCard key={r.id} reference={r} />
              ))}
            </div>
          )}
        </div>

        {/* Valoraciones del piso */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 px-1">Valoraciones del piso</h3>
          {flatReviews.length === 0 ? (
            <EmptyState
              icon={<StarIcon width={28} height={28} />}
              title="Todavía no hay valoraciones"
              description="Sé el primero en valorar el piso o al propietario."
            />
          ) : (
            <div className="space-y-2">
              {flatReviews.map((rev) => {
                const reviewer = getUser(rev.reviewerId);
                return (
                  <ReviewSummary
                    key={rev.id}
                    review={rev}
                    reviewerName={reviewer?.name}
                    reviewerPhoto={reviewer?.photoUrl}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal valoración */}
      {reviewType && (
        <Modal title={`Valorar ${REVIEW_TYPE_LABELS[reviewType].toLowerCase()}`} onClose={() => setReviewType(null)}>
          <ReviewForm
            reviewType={reviewType}
            onSubmit={submitReview}
            onCancel={() => setReviewType(null)}
          />
        </Modal>
      )}

      {/* Modal referencia */}
      {showRefForm && (
        <Modal title="Pedir una referencia" onClose={() => setShowRefForm(false)}>
          <ReferenceRequestForm
            onCancel={() => setShowRefForm(false)}
            onSubmit={(data) => {
              addReference(data);
              setShowRefForm(false);
            }}
          />
        </Modal>
      )}
    </AppLayout>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400">
            <XIcon width={22} height={22} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function ReferenceRequestForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    userId: string;
    refereeName: string;
    refereeEmail: string;
    relationshipType: string;
  }) => void;
  onCancel: () => void;
}) {
  const me = useCurrentUser()!;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Ex-compañero/a de piso');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          userId: me.id,
          refereeName: name.trim(),
          refereeEmail: email.trim(),
          relationshipType: relationship,
        });
      }}
      className="space-y-4"
    >
      <p className="text-sm text-gray-500">
        Enviaremos una solicitud a esta persona para que confirme tu referencia.
      </p>
      <div>
        <label className="label">Nombre de quien te referencia</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="label">Su email</label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label">Relación</label>
        <select
          className="input"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
        >
          <option>Ex-compañero/a de piso</option>
          <option>Ex-casero/a</option>
          <option>Responsable de trabajo</option>
          <option>Otro</option>
        </select>
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary flex-1">
          Enviar solicitud
        </button>
      </div>
    </form>
  );
}
