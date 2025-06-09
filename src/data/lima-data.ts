import type { LimaData } from '@/types';

export const limaData: LimaData = {
  districts: [
    { id: 'miraflores', name: 'Miraflores', lat: -12.1193, lng: -77.0337 },
    { id: 'san_isidro', name: 'San Isidro', lat: -12.0983, lng: -77.0494 },
    { id: 'barranco', name: 'Barranco', lat: -12.1428, lng: -77.0225 },
    { id: 'surco', name: 'Santiago de Surco', lat: -12.1255, lng: -76.9921 },
    { id: 'la_molina', name: 'La Molina', lat: -12.0734, lng: -76.9092 },
    { id: 'lima_centro', name: 'Lima Centro', lat: -12.0464, lng: -77.0428 },
  ],
  connections: [
    { id: 'c1', from: 'miraflores', to: 'san_isidro', distance: 3.5, danger: 2 },
    { id: 'c2', from: 'san_isidro', to: 'miraflores', distance: 3.5, danger: 2 },
    { id: 'c3', from: 'miraflores', to: 'barranco', distance: 2.0, danger: 3 },
    { id: 'c4', from: 'barranco', to: 'miraflores', distance: 2.0, danger: 3 },
    { id: 'c5', from: 'miraflores', to: 'surco', distance: 5.0, danger: 3 },
    { id: 'c6', from: 'surco', to: 'miraflores', distance: 5.0, danger: 3 },
    { id: 'c7', from: 'san_isidro', to: 'lima_centro', distance: 6.0, danger: 4 },
    { id: 'c8', from: 'lima_centro', to: 'san_isidro', distance: 6.0, danger: 4 },
    { id: 'c9', from: 'san_isidro', to: 'surco', distance: 7.0, danger: 2 },
    { id: 'c10', from: 'surco', to: 'san_isidro', distance: 7.0, danger: 2 },
    { id: 'c11', from: 'barranco', to: 'surco', distance: 4.5, danger: 3 },
    { id: 'c12', from: 'surco', to: 'barranco', distance: 4.5, danger: 3 },
    { id: 'c13', from: 'surco', to: 'la_molina', distance: 10.0, danger: 2 },
    { id: 'c14', from: 'la_molina', to: 'surco', distance: 10.0, danger: 2 },
    { id: 'c15', from: 'lima_centro', to: 'la_molina', distance: 15.0, danger: 5 },
    { id: 'c16', from: 'la_molina', to: 'lima_centro', distance: 15.0, danger: 5 },
  ],
};
