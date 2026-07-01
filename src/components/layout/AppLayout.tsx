import type { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface Props {
  children: ReactNode;
  title?: string;
  /** Contenido a la derecha de la cabecera (ej. botón de ajustes). */
  headerRight?: ReactNode;
  /** Oculta la barra de navegación inferior (ej. chat a pantalla completa). */
  hideNav?: boolean;
  /** Oculta la cabecera. */
  hideHeader?: boolean;
}

// Contenedor mobile-first: ancho máximo tipo móvil centrado, cabecera fija y
// navegación inferior de 5 pestañas.
export function AppLayout({
  children,
  title,
  headerRight,
  hideNav = false,
  hideHeader = false,
}: Props) {
  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative flex flex-col">
        {!hideHeader && (
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-4 h-14 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            {headerRight}
          </header>
        )}
        <main className={`flex-1 ${hideNav ? '' : 'pb-20'}`}>{children}</main>
        {!hideNav && <BottomNavigation />}
      </div>
    </div>
  );
}
