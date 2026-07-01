import type { Reference, Review } from '@/types';

export const demoReviews: Review[] = [
  {
    id: 'rev-1',
    reviewerId: 'u-marta',
    reviewedUserId: 'u-me',
    reviewType: 'roommate',
    ratings: { Limpieza: 5, Pagos: 5, Ruido: 4, Comunicación: 5, Respeto: 5, Fiabilidad: 5 },
    comment: 'Compañera ideal, muy ordenada y siempre puntual con los pagos.',
    createdAt: '2026-05-20T10:00:00.000Z',
  },
  {
    id: 'rev-2',
    reviewerId: 'u-me',
    reviewedUserId: 'u-owner-ana',
    reviewType: 'landlord',
    ratings: {
      Reparaciones: 5,
      'Devolución de fianza': 5,
      Comunicación: 5,
      Transparencia: 4,
      'Contrato claro': 5,
      Privacidad: 5,
    },
    comment: 'Ana responde rapidísimo a las incidencias. Muy recomendable.',
    response: '¡Gracias! Un placer teneros en el piso 😊',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'rev-3',
    reviewerId: 'u-me',
    propertyId: 'p-gracia',
    reviewType: 'property',
    ratings: { 'Estado real': 5, Ruido: 4, Humedades: 4, Temperatura: 4, Internet: 3, Comunidad: 5 },
    comment: 'Piso muy bonito y luminoso. El internet mejora tras la última incidencia.',
    createdAt: '2026-06-12T10:00:00.000Z',
  },
];

export const demoReferences: Reference[] = [
  {
    id: 'ref-1',
    userId: 'u-me',
    refereeName: 'Elena (ex-compañera)',
    refereeEmail: 'elena@example.com',
    relationshipType: 'Ex-compañera de piso',
    status: 'confirmada',
    rating: 5,
    comment: 'Vivimos 2 años juntas, todo perfecto. Muy responsable.',
    createdAt: '2026-04-10T10:00:00.000Z',
  },
  {
    id: 'ref-2',
    userId: 'u-marta',
    refereeName: 'Dr. Ramírez',
    refereeEmail: 'ramirez@example.com',
    relationshipType: 'Responsable de trabajo',
    status: 'confirmada',
    rating: 5,
    comment: 'Persona seria y de confianza.',
    createdAt: '2026-03-15T10:00:00.000Z',
  },
];
