# Myflat 🏠

**Encuentra habitación, compañero o inquilino con confianza.**

Myflat es una plataforma que combina una experiencia de _swipe_ tipo Tinder con
**perfiles verificados, reputación real, pagos de alquiler organizados e
incidencias del piso gestionadas** desde una sola app.

> No es "otro portal de anuncios": la propuesta es encontrar y convivir **con
> confianza** — tan fácil como hacer match, tan claro como pagar por Bizum y tan
> útil como reportar una avería por WhatsApp.

---

## 1. Qué es Myflat

Una app **mobile-first** donde cualquier usuario (estudiante, propietario, joven
profesional, familia, extranjero…) puede:

1. Buscar habitación.
2. Buscar compañero de piso.
3. Alquilar una habitación o piso como propietario.
4. Hacer match mediante swipe (derecha "me interesa", izquierda "no encaja").
5. Ver perfiles con **niveles de confianza**.
6. Conectar redes (Instagram / LinkedIn) — simulado.
7. Verificar identidad (DNI/selfie) — **simulado y opcional**.
8. Valorar compañeros, inquilinos, propietarios y pisos.
9. Gestionar los pagos del alquiler.
10. Reportar incidencias del piso (lavadora, humedad, internet, llaves…).

## 2. Objetivo del MVP

Entregar una **primera versión usable, simple y bonita**, que compile y sea fácil
de probar, con toda la experiencia navegable usando **datos demo** (sin backend).
La app está estructurada para conectar un backend real y pagos reales más
adelante sin reescribir la UI.

## 3. Stack

| Capa        | Tecnología                          |
| ----------- | ----------------------------------- |
| Frontend    | React 18 + TypeScript               |
| Estilos     | Tailwind CSS v3                     |
| Routing     | React Router v6                     |
| Estado      | Zustand (persistido en localStorage)|
| Build/Dev   | Vite                                |
| Backend     | _Mock_ en memoria (preparado para Supabase / API Node) |
| Pagos       | Estructura preparada para Stripe Connect (sin dinero real) |

Sin dependencias innecesarias: los iconos son SVG inline propios.

## 4. Cómo instalar

```bash
npm install
```

## 5. Cómo ejecutar

```bash
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # type-check + build de producción
npm run preview   # sirve el build de producción
```

**Acceso rápido:** en la landing pulsa _"Explorar con cuenta demo"_ o inicia
sesión con `demo@myflat.app` (no se comprueba la contraseña en el MVP).

## 6. Estructura del proyecto

```
src/
  components/
    layout/       AppLayout, BottomNavigation
    swipe/        SwipeDeck, SwipeCard
    cards/        PropertyCard, UserCard
    badges/       TrustBadge, ProfileLevelBadge, PaymentStatusBadge
    profile/      OnboardingFlow, ProfileCompletion, PropertyForm
    payments/     PaymentCard
    issues/       IssueList, IssueCard, IssueForm
    reviews/      ReviewForm, ReviewSummary, ReferenceCard
    matches/      MatchList, ChatView
    common/       Avatar, EmptyState, LoadingState, CompatibilityScore, icons
  pages/          Landing, Login, Register, Onboarding, Discover, Matches, Chat,
                  Profile, ProfileEdit, UserProfile, Property, MyFlat, Payments,
                  Issues, NewIssue, Reviews, Settings
  data/           demoUsers, demoProperties, demoMatches, demoPayments,
                  demoIssues, demoReviews, demoFlat  (datos de prueba)
  hooks/          useCurrentUser, useMyFlat
  store/          useAppStore (Zustand, único punto de acceso a datos)
  types/          modelos tipados (esquema de BD)
  utils/          compatibility, profileLevel, formatting
```

### Rutas principales

`/` · `/login` · `/register` · `/onboarding` · `/discover` · `/matches` ·
`/matches/:id` · `/profile` · `/profile/edit` · `/users/:id` · `/properties/:id`
· `/my-flat` · `/my-flat/payments` · `/my-flat/issues` · `/my-flat/issues/new` ·
`/my-flat/reviews` · `/settings`

### Navegación (5 pestañas)

**Descubrir · Matches · Mi piso · Pagos · Perfil.** El contenido se adapta al rol
del usuario (busca habitación / busca compañero / propietario).

## 7. Funcionalidades implementadas

- ✅ Registro / login (email; sin verificación de contraseña en el MVP).
- ✅ Onboarding corto: elección de objetivo + datos básicos.
- ✅ Perfil editable con preferencias de convivencia.
- ✅ **Niveles de confianza** automáticos: básico → social (azul) → identidad
  verificada (dorado) → recomendado (dorado + estrella).
- ✅ Conectar Instagram/LinkedIn y verificar identidad (simulado).
- ✅ Swipe (like / dislike / guardar) con tarjetas de piso y de candidato.
- ✅ **Compatibilidad** calculada con razones y avisos.
- ✅ Match mutuo → chat.
- ✅ Perfil completo de piso y de usuario (redes ocultas antes del match).
- ✅ Panel **"Mi piso"**: compañeros, propietario, normas, documentos, inventario.
- ✅ **Pagos** manuales: marcar pagado, subir justificante, confirmar (propietario).
- ✅ **Incidencias** tipo ticket: crear, comentar, cambiar estado, resolver.
- ✅ **Valoraciones** por categorías + **referencias** con derecho de respuesta.
- ✅ Publicación de pisos (propietario).
- ✅ Estados vacíos y de carga cuidados.

## 8. Datos demo

Al arrancar (sin backend) se cargan: 10 usuarios (5 seekers + 5 propietarios y
una cuenta demo), 6 pisos en Barcelona, Madrid, Valencia y Sevilla (Gràcia,
Poblenou, Chamberí, Malasaña, Ruzafa, Triana), además de likes, matches, chats,
pagos, incidencias, valoraciones y referencias de ejemplo.

Los datos se persisten en `localStorage`. Puedes restablecerlos desde
**Ajustes → Restablecer datos demo**.

## 9. Próximos pasos

- Búsqueda/filtros avanzados y geolocalización.
- Notificaciones push y chat en tiempo real.
- Firma de contratos e inventario con fotos reales.
- Verificación de identidad con proveedor externo.
- Reputación ponderada y anti-fraude.

## 10. Cómo conectar un backend real

Toda la lectura/escritura pasa por `src/store/useAppStore.ts`. Para migrar a
**Supabase** (recomendado) o a una API Node/Express:

1. Crea las tablas según `src/types/index.ts` (users, user_preferences,
   properties, likes, matches, messages, payments, issues, reviews,
   references, documents, inventory).

La integración con **Supabase ya está incluida** y se activa por variables de
entorno (sin ellas, la app funciona en modo demo). Pasos:

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta `supabase/schema.sql` (crea las tablas y
   las políticas RLS del MVP).
3. En **Project Settings → API**, copia la **Project URL** y la **anon public
   key** (la anon key es pública por diseño; nunca uses la `service_role`).
4. Define esas dos variables:
   - Local: crea un archivo `.env` (ver `.env.example`) con `VITE_SUPABASE_URL`
     y `VITE_SUPABASE_ANON_KEY`.
   - Despliegue (GitHub Pages): añádelas como **Secrets** del repositorio
     (`Settings → Secrets and variables → Actions`) con esos mismos nombres.
     El workflow las inyecta en el build.

Al arrancar con Supabase activo, la app **hidrata** los datos desde la base y,
si está vacía, **siembra automáticamente** los datos demo. Todas las escrituras
se replican en Supabase, por lo que **los datos se comparten entre dispositivos**.
Los componentes no cambian: siguen usando el store (`src/store/useAppStore.ts`),
que es el único punto de acceso a datos (`src/lib/backend.ts`).

## 11. Cómo integrar pagos reales en el futuro

El modelo `Payment` ya incluye los campos necesarios: `paymentProvider`,
`paymentIntentId`, `platformFee` y `landlordPayoutStatus`. El flujo previsto:

1. El inquilino paga el alquiler desde Myflat (**Stripe Connect** / Mangopay /
   Lemonway / Adyen for Platforms).
2. El propietario recibe el dinero; Myflat retiene una pequeña comisión
   (p. ej. 1 %, cuota fija o comisión de éxito al cerrar el alquiler).
3. Se genera recibo automático y se suma **historial positivo de buen inquilino**.

El botón _"Pagar por la app — próximamente"_ ya está presente como marcador.

## 12. ⚠️ Advertencia

Esta es una versión de **demostración (MVP)**:

- **No** se realiza verificación de identidad real ni se guardan DNI o datos
  biométricos.
- **No** se mueve dinero real ni se guardan tarjetas.
- Las valoraciones/referencias demo son de ejemplo.

No usar en producción tal cual: conecta antes un backend, autenticación real,
un proveedor de verificación y un proveedor de pagos regulado.
