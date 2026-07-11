// Catálogo maestro inicial. Lo mantiene el admin desde el panel (Fase 3);
// esto solo puebla lo mínimo para que los filtros funcionen desde el día uno.

export const MARCAS_CON_MODELOS: Record<string, string[]> = {
  Toyota: [
    'Corolla',
    'Corolla Cross',
    'Hilux',
    'RAV4',
    'Yaris',
    'Prado',
    'Fortuner',
    '4Runner',
    'Tacoma',
    'Agya',
  ],
  Honda: ['Civic', 'CR-V', 'HR-V', 'Accord', 'Pilot', 'Fit'],
  Nissan: ['Sentra', 'Frontier', 'Kicks', 'X-Trail', 'Versa', 'Patrol', 'March'],
  Mitsubishi: ['L200', 'Montero', 'Outlander', 'ASX', 'Mirage', 'Xpander'],
  Mazda: ['Mazda 3', 'CX-5', 'CX-30', 'BT-50', 'Mazda 2'],
  Hyundai: ['Tucson', 'Santa Fe', 'Accent', 'Elantra', 'Creta', 'Grand i10', 'H1'],
  Kia: ['Sportage', 'Sorento', 'Rio', 'Picanto', 'Seltos', 'Cerato'],
  Suzuki: ['Grand Vitara', 'Swift', 'Jimny', 'Vitara', 'S-Presso', 'Ertiga'],
  Chevrolet: ['Silverado', 'Colorado', 'Tracker', 'Onix', 'Captiva', 'Tahoe'],
  Ford: ['Ranger', 'F-150', 'Escape', 'Explorer', 'EcoSport', 'Bronco'],
  Volkswagen: ['Jetta', 'Tiguan', 'Amarok', 'Golf', 'T-Cross', 'Saveiro'],
  Isuzu: ['D-Max', 'MU-X'],
  'Mercedes-Benz': ['Clase C', 'Clase E', 'GLC', 'GLE', 'Sprinter'],
  BMW: ['Serie 3', 'Serie 5', 'X1', 'X3', 'X5'],
  Audi: ['A3', 'A4', 'Q3', 'Q5'],
  Jeep: ['Wrangler', 'Grand Cherokee', 'Compass', 'Renegade'],
};

export const CARROCERIAS = ['Sedán', 'SUV', 'Pick-up', 'Hatchback', 'Van', 'Coupé'];

export const COMBUSTIBLES = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico'];

export const TRANSMISIONES = ['Manual', 'Automática', 'CVT'];

export const CARACTERISTICAS: Record<string, string[]> = {
  Confort: [
    'Aire acondicionado',
    'Asientos de cuero',
    'Sunroof',
    'Vidrios eléctricos',
    'Volante multifunción',
    'Cierre central',
  ],
  Seguridad: [
    'Cámara de retroceso',
    'Sensores de parqueo',
    'Frenos ABS',
    'Bolsas de aire',
    'Control de estabilidad',
    'Alarma',
  ],
  Tecnología: [
    'Pantalla táctil',
    'Apple CarPlay / Android Auto',
    'Bluetooth',
    'GPS integrado',
    'Cargador inalámbrico',
  ],
  Exterior: ['Aros de aluminio', 'Barras de techo', 'Halógenos', 'Luces LED'],
};

// Quetzales por dólar al momento del seed; el admin la actualiza (Fase 3)
// o un worker la sincroniza con el Banguat (Fase 4).
export const TASA_USD_GTQ_INICIAL = 7.75;
