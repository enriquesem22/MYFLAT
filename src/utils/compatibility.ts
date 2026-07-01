import type { Property, User } from '@/types';

export interface CompatibilityResult {
  score: number; // 0..100
  reasons: string[];
  warnings: string[];
}

// Compatibilidad simple por coincidencias (sin IA). Cada criterio suma puntos;
// el resultado se normaliza a 0..100. Se acompaña de razones y avisos legibles.

/** Compatibilidad entre un usuario (que busca) y un piso/habitación. */
export function calculateUserPropertyCompatibility(
  user: User,
  property: Property,
): CompatibilityResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;
  let max = 0;

  // Presupuesto (peso alto)
  max += 30;
  if (property.price <= user.budget) {
    score += 30;
    reasons.push('Presupuesto compatible');
  } else if (property.price <= user.budget * 1.1) {
    score += 18;
    warnings.push('El precio supera algo tu presupuesto');
  } else {
    warnings.push('El precio está por encima de tu presupuesto');
  }

  // Ciudad
  max += 20;
  if (norm(property.city) === norm(user.city)) {
    score += 20;
    reasons.push(`Está en ${property.city}, tu ciudad`);
  } else {
    warnings.push(`El piso está en ${property.city}`);
  }

  // Fecha de entrada / disponibilidad
  max += 15;
  const userDate = new Date(user.moveInDate).getTime();
  const propDate = new Date(property.availableFrom).getTime();
  const diffDays = Math.abs(userDate - propDate) / 86_400_000;
  if (diffDays <= 15) {
    score += 15;
    reasons.push('Las fechas de entrada encajan');
  } else if (diffDays <= 45) {
    score += 8;
    warnings.push('Fecha de entrada no coincide del todo');
  } else {
    warnings.push('Las fechas de entrada difieren bastante');
  }

  // Fumador
  max += 10;
  if (!user.preferences.smoking && !property.rules.smoking) {
    score += 10;
    reasons.push('No fumador compatible');
  } else if (user.preferences.smoking && property.rules.smoking) {
    score += 10;
    reasons.push('Se permite fumar');
  } else if (user.preferences.smoking && !property.rules.smoking) {
    warnings.push('En el piso no se puede fumar');
  } else {
    score += 6;
  }

  // Mascotas
  max += 10;
  if (!user.preferences.pets || property.rules.pets) {
    score += 10;
    if (user.preferences.pets && property.rules.pets) {
      reasons.push('Admite mascotas');
    }
  } else {
    warnings.push('El piso no admite mascotas');
  }

  // Convivencia (fiestas / preferencia)
  max += 15;
  const socialUser = user.preferences.lifestylePreference;
  const flatParty = property.rules.parties;
  if (
    (socialUser === 'tranquila' && flatParty === 'nunca') ||
    (socialUser === 'social' && flatParty !== 'nunca') ||
    socialUser === 'mixta'
  ) {
    score += 15;
    reasons.push(`Encaja con una convivencia ${socialUser}`);
  } else {
    score += 6;
    warnings.push('El ambiente del piso puede no encajar con tu estilo');
  }

  return finalize(score, max, reasons, warnings);
}

/** Compatibilidad entre dos usuarios (candidato / compañero). */
export function calculateUserUserCompatibility(
  a: User,
  b: User,
): CompatibilityResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;
  let max = 0;

  // Presupuesto similar
  max += 25;
  const budgetDiff = Math.abs(a.budget - b.budget);
  if (budgetDiff <= 100) {
    score += 25;
    reasons.push('Presupuesto compatible');
  } else if (budgetDiff <= 200) {
    score += 14;
    warnings.push('Vuestro presupuesto difiere algo');
  } else {
    warnings.push('Vuestro presupuesto difiere bastante');
  }

  // Ciudad
  max += 20;
  if (norm(a.city) === norm(b.city)) {
    score += 20;
    reasons.push(`Ambos en ${a.city}`);
  } else {
    warnings.push('Buscáis en ciudades distintas');
  }

  // Fumador
  max += 15;
  if (a.preferences.smoking === b.preferences.smoking) {
    score += 15;
    reasons.push(a.preferences.smoking ? 'Ambos fumáis' : 'Ambos no fumáis');
  } else {
    warnings.push('Uno fuma y el otro no');
  }

  // Limpieza
  max += 15;
  if (a.preferences.cleaningLevel === b.preferences.cleaningLevel) {
    score += 15;
    reasons.push('Mismo nivel de limpieza');
  } else {
    score += 6;
  }

  // Ruido
  max += 10;
  if (a.preferences.noiseLevel === b.preferences.noiseLevel) {
    score += 10;
    reasons.push('Tolerancia al ruido similar');
  } else {
    score += 4;
  }

  // Preferencia de convivencia
  max += 15;
  if (a.preferences.lifestylePreference === b.preferences.lifestylePreference) {
    score += 15;
    reasons.push(`Ambos buscáis convivencia ${a.preferences.lifestylePreference}`);
  } else if (
    a.preferences.lifestylePreference === 'mixta' ||
    b.preferences.lifestylePreference === 'mixta'
  ) {
    score += 9;
  } else {
    warnings.push('Estilo de convivencia diferente');
  }

  return finalize(score, max, reasons, warnings);
}

function finalize(
  score: number,
  max: number,
  reasons: string[],
  warnings: string[],
): CompatibilityResult {
  const pct = max === 0 ? 0 : Math.round((score / max) * 100);
  return { score: pct, reasons: reasons.slice(0, 3), warnings: warnings.slice(0, 2) };
}

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
