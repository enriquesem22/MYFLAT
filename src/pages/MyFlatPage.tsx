import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/common/EmptyState';
import { Avatar } from '@/components/common/Avatar';
import { PropertyForm, draftToPropertyData } from '@/components/profile/PropertyForm';
import {
  BuildingIcon,
  ChevronRight,
  EuroIcon,
  FileIcon,
  PlusIcon,
  StarIcon,
  WrenchIcon,
} from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyFlat } from '@/hooks/useMyFlat';
import { formatMoney } from '@/utils/formatting';

export function MyFlatPage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const { property, properties, isOwner } = useMyFlat();
  const addProperty = useAppStore((s) => s.addProperty);
  const getUser = useAppStore((s) => s.getUser);
  const payments = useAppStore((s) => s.payments);
  const issues = useAppStore((s) => s.issues);
  const documents = useAppStore((s) => s.documents);
  const inventory = useAppStore((s) => s.inventory);
  const residenceRequests = useAppStore((s) => s.residenceRequests);
  const respondResidence = useAppStore((s) => s.respondResidence);

  const [showForm, setShowForm] = useState(false);

  // Solicitudes de residencia pendientes en los pisos del propietario.
  const myPropertyIds = new Set(properties.map((p) => p.id));
  const pendingRequests = residenceRequests.filter(
    (r) => r.status === 'pendiente' && myPropertyIds.has(r.propertyId),
  );

  // Sin piso todavía.
  if (!property) {
    return (
      <AppLayout title="Mi piso">
        {showForm ? (
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Publicar habitación/piso</h2>
            <PropertyForm
              onCancel={() => setShowForm(false)}
              onSubmit={(draft) => {
                addProperty(draftToPropertyData(draft, me.id));
                setShowForm(false);
              }}
            />
          </div>
        ) : (
          <EmptyState
            icon={<BuildingIcon width={28} height={28} />}
            title={isOwner ? 'Aún no has publicado ningún piso' : 'Todavía no vives en un piso'}
            description={
              isOwner
                ? 'Publica tu primera habitación o piso para empezar a recibir interesados.'
                : 'Cuando entres en un piso a través de Myflat, aquí gestionarás la convivencia, pagos e incidencias.'
            }
            action={
              isOwner ? (
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                  Publicar piso
                </button>
              ) : (
                <button className="btn-primary" onClick={() => navigate('/discover')}>
                  Buscar habitación
                </button>
              )
            }
          />
        )}
      </AppLayout>
    );
  }

  const owner = getUser(property.ownerId);
  const flatPayments = payments.filter((p) => p.propertyId === property.id);
  const openIssues = issues.filter(
    (i) => i.propertyId === property.id && i.status !== 'resuelta' && i.status !== 'rechazada',
  );
  const flatDocs = documents.filter((d) => d.propertyId === property.id);
  const flatInventory = inventory.filter((i) => i.propertyId === property.id);

  // Compañeros = otros inquilinos con pagos en este piso.
  const roommateIds = Array.from(
    new Set(flatPayments.map((p) => p.tenantId).filter((tid) => tid !== me.id)),
  );

  return (
    <AppLayout
      title="Mi piso"
      headerRight={
        isOwner ? (
          <button onClick={() => setShowForm(true)} className="text-brand-500">
            <PlusIcon width={22} height={22} />
          </button>
        ) : undefined
      }
    >
      <div className="p-4 space-y-4">
        {showForm && isOwner && (
          <div className="card p-4">
            <h2 className="font-bold text-gray-900 mb-3">Publicar otro piso</h2>
            <PropertyForm
              onCancel={() => setShowForm(false)}
              onSubmit={(draft) => {
                addProperty(draftToPropertyData(draft, me.id));
                setShowForm(false);
              }}
            />
          </div>
        )}

        {/* Solicitudes de residencia pendientes (propietario) */}
        {isOwner && pendingRequests.length > 0 && (
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-1">
              Solicitudes de residencia ({pendingRequests.length})
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Personas que piden aparecer como residentes de tus pisos.
            </p>
            <div className="space-y-3">
              {pendingRequests.map((r) => {
                const u = getUser(r.userId);
                const prop = properties.find((p) => p.id === r.propertyId);
                return (
                  <div key={r.id} className="flex items-center gap-3">
                    <Avatar name={u?.name ?? '?'} photoUrl={u?.photoUrl} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {u?.name ?? 'Usuario'}
                      </div>
                      <div className="text-xs text-gray-400 truncate">{prop?.title}</div>
                    </div>
                    <button
                      className="btn-primary py-1.5 px-3 text-xs"
                      onClick={() => respondResidence(r.id, true)}
                    >
                      Aceptar
                    </button>
                    <button
                      className="btn-secondary py-1.5 px-3 text-xs"
                      onClick={() => respondResidence(r.id, false)}
                    >
                      Rechazar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Datos del piso */}
        <button
          onClick={() => navigate(`/properties/${property.id}`)}
          className="card overflow-hidden w-full text-left"
        >
          <div className="h-32 bg-gray-100">
            {property.photos[0] && (
              <img src={property.photos[0].url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">{property.title}</div>
              <div className="text-sm text-gray-500">
                {property.neighborhood}, {property.city} · {formatMoney(property.price)}/mes
              </div>
            </div>
            <ChevronRight width={20} height={20} className="text-gray-300" />
          </div>
        </button>

        {/* Anuncios adicionales del propietario */}
        {isOwner && properties.length > 1 && (
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Tus otros anuncios</h3>
            <ul className="space-y-1">
              {properties.slice(1).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => navigate(`/properties/${p.id}`)}
                    className="w-full flex items-center justify-between py-1.5 text-sm text-gray-700"
                  >
                    {p.title}
                    <ChevronRight width={16} height={16} className="text-gray-300" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Accesos rápidos */}
        <div className="grid grid-cols-3 gap-3">
          <QuickAction
            icon={<EuroIcon width={22} height={22} />}
            label="Pagos"
            hint={`${flatPayments.filter((p) => p.status !== 'pagado').length} pendientes`}
            onClick={() => navigate('/my-flat/payments')}
          />
          <QuickAction
            icon={<WrenchIcon width={22} height={22} />}
            label="Incidencias"
            hint={`${openIssues.length} abiertas`}
            onClick={() => navigate('/my-flat/issues')}
          />
          <QuickAction
            icon={<StarIcon width={22} height={22} />}
            label="Valoraciones"
            hint="Ver y crear"
            onClick={() => navigate('/my-flat/reviews')}
          />
        </div>

        {/* Compañeros y propietario */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Personas del piso</h3>
          <div className="space-y-3">
            {owner && (
              <PersonRow
                name={owner.name}
                photo={owner.photoUrl}
                role="Propietario"
                onClick={() => navigate(`/users/${owner.id}`)}
              />
            )}
            {roommateIds.map((rid) => {
              const u = getUser(rid);
              if (!u) return null;
              return (
                <PersonRow
                  key={rid}
                  name={u.name}
                  photo={u.photoUrl}
                  role="Compañero/a"
                  onClick={() => navigate(`/users/${u.id}`)}
                />
              );
            })}
            {roommateIds.length === 0 && !owner && (
              <p className="text-sm text-gray-400">Aún no hay más personas registradas.</p>
            )}
          </div>
        </div>

        {/* Normas de convivencia */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Normas de convivencia</h3>
          <div className="flex flex-wrap gap-1.5 text-sm">
            <span className="chip bg-gray-100 text-gray-600">
              {property.rules.smoking ? 'Se permite fumar' : 'No se fuma'}
            </span>
            <span className="chip bg-gray-100 text-gray-600">
              {property.rules.pets ? 'Mascotas ok' : 'Sin mascotas'}
            </span>
            <span className="chip bg-gray-100 text-gray-600">Visitas: {property.rules.visits}</span>
            <span className="chip bg-gray-100 text-gray-600">Fiestas: {property.rules.parties}</span>
            <span className="chip bg-gray-100 text-gray-600">
              Limpieza: {property.rules.cleaning}
            </span>
          </div>
        </div>

        {/* Documentos */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Documentos</h3>
          {flatDocs.length === 0 ? (
            <p className="text-sm text-gray-400">No hay documentos.</p>
          ) : (
            <ul className="space-y-1">
              {flatDocs.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2 text-sm text-gray-700 py-1">
                  <FileIcon width={16} height={16} className="text-gray-400" />
                  {doc.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Inventario de entrada */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-1">Inventario de entrada</h3>
          <p className="text-xs text-gray-400 mb-2">
            Estado registrado al entrar. Evita discusiones al salir del piso.
          </p>
          {flatInventory.length === 0 ? (
            <p className="text-sm text-gray-400">Sin inventario registrado.</p>
          ) : (
            <ul className="space-y-1.5">
              {flatInventory.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.label}</span>
                  <span
                    className={`chip ${
                      item.condition === 'defectuoso'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    title={item.note}
                  >
                    {item.condition}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function QuickAction({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="card p-3 flex flex-col items-center text-center gap-1">
      <span className="text-brand-500">{icon}</span>
      <span className="text-sm font-semibold text-gray-900">{label}</span>
      <span className="text-[11px] text-gray-400">{hint}</span>
    </button>
  );
}

function PersonRow({
  name,
  photo,
  role,
  onClick,
}: {
  name: string;
  photo?: string;
  role: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 text-left">
      <Avatar name={name} photoUrl={photo} size={42} />
      <div className="flex-1">
        <div className="font-medium text-gray-900">{name}</div>
        <div className="text-xs text-gray-400">{role}</div>
      </div>
      <ChevronRight width={18} height={18} className="text-gray-300" />
    </button>
  );
}
