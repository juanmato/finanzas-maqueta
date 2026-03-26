const CATEGORY_RULES: { keywords: string[]; category: string; type: 'expense' | 'income' }[] = [
  // Alimentacion
  { keywords: ['super', 'walmart', 'soriana', 'chedraui', 'costco', 'sam\'s', 'oxxo', 'seven', '7-eleven', 'restaur', 'comida', 'cafe', 'starbucks', 'mcdonalds', 'mcdonald', 'burger', 'pizza', 'tacos', 'uber eats', 'didi food', 'rappi', 'carniceria', 'panaderia', 'food', 'grocery', 'delibest', 'pedidosya', 'ifood', 'glovo', 'devoto', 'tata', 'disco', 'tienda inglesa', 'kinko', 'multiahorro', 'macro'], category: 'Alimentacion', type: 'expense' },
  // Transporte
  { keywords: ['uber', 'didi', 'cabify', 'gasolina', 'gas station', 'pemex', 'estacionamiento', 'parking', 'peaje', 'caseta', 'autobus', 'metro', 'taxi', 'bolt', 'ancap', 'combustible'], category: 'Transporte', type: 'expense' },
  // Vivienda
  { keywords: ['renta', 'hipoteca', 'alquiler', 'luz', 'cfe', 'agua', 'gas natural', 'predial', 'mantenimiento', 'inmobiliaria', 'ute', 'ose', 'antel'], category: 'Vivienda', type: 'expense' },
  // Entretenimiento
  { keywords: ['netflix', 'spotify', 'disney', 'hbo', 'amazon prime', 'cine', 'cinepolis', 'cinemex', 'teatro', 'concierto', 'videojuego', 'steam', 'playstation', 'xbox', 'nintendo', 'movie'], category: 'Entretenimiento', type: 'expense' },
  // Salud
  { keywords: ['farmacia', 'doctor', 'hospital', 'clinica', 'medic', 'consultorio', 'laboratorio', 'salud', 'dentista', 'optica', 'gym', 'gimnasio', 'farmashop', 'san roque'], category: 'Salud', type: 'expense' },
  // Educacion
  { keywords: ['escuela', 'universidad', 'colegiatura', 'curso', 'udemy', 'coursera', 'libro', 'papeleria', 'educacion'], category: 'Educacion', type: 'expense' },
  // Ropa
  { keywords: ['zara', 'h&m', 'liverpool', 'palacio', 'ropa', 'zapatos', 'tenis', 'nike', 'adidas', 'shein', 'fashion', 'store'], category: 'Ropa', type: 'expense' },
  // Servicios
  { keywords: ['telcel', 'telmex', 'izzi', 'totalplay', 'megacable', 'internet', 'telefono', 'celular', 'seguro', 'tenencia tarjeta', 'bonificacion tenencia', 'comision'], category: 'Servicios', type: 'expense' },
  // Suscripciones
  { keywords: ['suscripcion', 'subscription', 'mensualidad', 'membresia', 'apple', 'google storage', 'icloud', 'chatgpt', 'premium', 'merpago'], category: 'Suscripciones', type: 'expense' },
  // Ingresos
  { keywords: ['nomina', 'salario', 'sueldo', 'payroll', 'quincena'], category: 'Salario', type: 'income' },
  { keywords: ['freelance', 'honorarios', 'factura', 'proyecto'], category: 'Freelance', type: 'income' },
  { keywords: ['dividendo', 'rendimiento', 'interes', 'inversion'], category: 'Inversiones', type: 'income' },
  { keywords: ['venta', 'mercadolibre', 'mercado libre'], category: 'Ventas', type: 'income' },
  { keywords: ['transferencia recibida', 'trf e-brou', 'trf brou', 'deposito', 'bonificacion'], category: 'Otros', type: 'income' },
];

export function categorizeDescription(description: string): { category: string; type: 'income' | 'expense' } {
  const lower = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return { category: rule.category, type: rule.type };
    }
  }

  return { category: 'Otros', type: 'expense' };
}
