// Los 22 departamentos de Guatemala. Para el departamento de Guatemala se
// incluyen los municipios metropolitanos (donde está casi todo el mercado);
// para el resto, la cabecera. El catálogo completo de 340 municipios se
// carga desde el panel admin cuando haga falta.

export const DEPARTAMENTOS: Record<string, string[]> = {
  'Alta Verapaz': ['Cobán'],
  'Baja Verapaz': ['Salamá'],
  Chimaltenango: ['Chimaltenango'],
  Chiquimula: ['Chiquimula'],
  'El Progreso': ['Guastatoya'],
  Escuintla: ['Escuintla', 'Santa Lucía Cotzumalguapa'],
  Guatemala: [
    'Guatemala',
    'Mixco',
    'Villa Nueva',
    'San Miguel Petapa',
    'Villa Canales',
    'Amatitlán',
    'Santa Catarina Pinula',
    'San José Pinula',
    'Fraijanes',
    'Chinautla',
  ],
  Huehuetenango: ['Huehuetenango'],
  Izabal: ['Puerto Barrios', 'Morales'],
  Jalapa: ['Jalapa'],
  Jutiapa: ['Jutiapa'],
  Petén: ['Flores', 'San Benito'],
  Quetzaltenango: ['Quetzaltenango', 'Coatepeque'],
  Quiché: ['Santa Cruz del Quiché'],
  Retalhuleu: ['Retalhuleu'],
  Sacatepéquez: ['Antigua Guatemala', 'Ciudad Vieja'],
  'San Marcos': ['San Marcos', 'Malacatán'],
  'Santa Rosa': ['Cuilapa', 'Barberena'],
  Sololá: ['Sololá', 'Panajachel'],
  Suchitepéquez: ['Mazatenango'],
  Totonicapán: ['Totonicapán'],
  Zacapa: ['Zacapa'],
};
