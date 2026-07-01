import type { Like, Match, Message } from '@/types';

// El usuario demo (u-me) ya tiene algunos likes y un match con el piso de Gràcia.

export const demoLikes: Like[] = [
  {
    id: 'like-1',
    fromUserId: 'u-me',
    targetType: 'property',
    targetId: 'p-gracia',
    direction: 'like',
    createdAt: '2026-06-16T09:00:00.000Z',
  },
  {
    id: 'like-2',
    fromUserId: 'u-me',
    targetType: 'property',
    targetId: 'p-ruzafa',
    direction: 'save',
    createdAt: '2026-06-16T09:05:00.000Z',
  },
];

export const demoMatches: Match[] = [
  {
    id: 'm-1',
    userAId: 'u-me',
    userBId: 'u-owner-ana',
    propertyId: 'p-gracia',
    status: 'active',
    createdAt: '2026-06-16T09:10:00.000Z',
  },
  {
    id: 'm-2',
    userAId: 'u-me',
    userBId: 'u-lucia',
    status: 'active',
    createdAt: '2026-06-17T18:30:00.000Z',
  },
];

export const demoMessages: Message[] = [
  {
    id: 'msg-1',
    matchId: 'm-1',
    senderId: 'u-owner-ana',
    text: '¡Hola! Gracias por tu interés en la habitación de Gràcia 😊',
    createdAt: '2026-06-16T09:12:00.000Z',
    readAt: '2026-06-16T09:15:00.000Z',
  },
  {
    id: 'msg-2',
    matchId: 'm-1',
    senderId: 'u-me',
    text: '¡Hola Ana! Me encanta. ¿Podríamos agendar una visita esta semana?',
    createdAt: '2026-06-16T09:20:00.000Z',
    readAt: '2026-06-16T09:25:00.000Z',
  },
  {
    id: 'msg-3',
    matchId: 'm-1',
    senderId: 'u-owner-ana',
    text: 'Claro, ¿te va bien el jueves a las 18:00?',
    createdAt: '2026-06-16T09:30:00.000Z',
  },
  {
    id: 'msg-4',
    matchId: 'm-2',
    senderId: 'u-lucia',
    text: '¡Hey! Veo que buscamos zona parecida, ¿te cuento del piso?',
    createdAt: '2026-06-17T18:35:00.000Z',
  },
];
