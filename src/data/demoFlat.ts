import type { FlatDocument, InventoryItem } from '@/types';

// Documentos e inventario de entrada del piso demo (Gràcia).
export const demoDocuments: FlatDocument[] = [
  {
    id: 'doc-1',
    propertyId: 'p-gracia',
    userId: 'u-owner-ana',
    type: 'contrato',
    title: 'Contrato de arrendamiento',
    url: 'contrato-gracia.pdf',
    createdAt: '2026-04-30T10:00:00.000Z',
  },
  {
    id: 'doc-2',
    propertyId: 'p-gracia',
    userId: 'u-owner-ana',
    type: 'normas',
    title: 'Normas de convivencia',
    url: 'normas-convivencia.pdf',
    createdAt: '2026-04-30T10:00:00.000Z',
  },
  {
    id: 'doc-3',
    propertyId: 'p-gracia',
    userId: 'u-me',
    type: 'inventario',
    title: 'Inventario de entrada (fotos)',
    url: 'inventario-entrada.pdf',
    createdAt: '2026-05-01T10:00:00.000Z',
  },
];

export const demoInventory: InventoryItem[] = [
  { id: 'inv-1', propertyId: 'p-gracia', label: 'Cama y colchón', condition: 'bueno' },
  { id: 'inv-2', propertyId: 'p-gracia', label: 'Armario habitación', condition: 'bueno' },
  { id: 'inv-3', propertyId: 'p-gracia', label: 'Nevera cocina', condition: 'usado', note: 'Pequeño golpe en la puerta' },
  { id: 'inv-4', propertyId: 'p-gracia', label: 'Sofá salón', condition: 'nuevo' },
  { id: 'inv-5', propertyId: 'p-gracia', label: 'Lavadora', condition: 'defectuoso', note: 'No centrifuga bien (incidencia abierta)' },
];
