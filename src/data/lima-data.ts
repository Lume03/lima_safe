import type { LimaData } from '@/types';

// Base danger levels for each district (1=safest, 5=most dangerous)
const districtDangers: { [key: string]: number } = {
  lima_centro: 4,
  miraflores: 1,
  san_isidro: 1,
  barranco: 2,
  surco: 2,
  la_molina: 2,
  san_borja: 1,
  jesus_maria: 2,
  pueblo_libre: 3,
  magdalena_del_mar: 3,
  lince: 2,
  chorrillos: 4,
  sjl: 5,
  independencia: 4,
  los_olivos: 4,
  callao: 5,
};

export const limaData: LimaData = {
  districts: [
    { id: 'lima_centro', name: 'Lima Centro', lat: -12.0464, lng: -77.0428, danger: districtDangers.lima_centro },
    { id: 'miraflores', name: 'Miraflores', lat: -12.1193, lng: -77.0337, danger: districtDangers.miraflores },
    { id: 'san_isidro', name: 'San Isidro', lat: -12.0983, lng: -77.0494, danger: districtDangers.san_isidro },
    { id: 'barranco', name: 'Barranco', lat: -12.1428, lng: -77.0225, danger: districtDangers.barranco },
    { id: 'surco', name: 'Santiago de Surco', lat: -12.1255, lng: -76.9921, danger: districtDangers.surco },
    { id: 'la_molina', name: 'La Molina', lat: -12.0734, lng: -76.9092, danger: districtDangers.la_molina },
    { id: 'san_borja', name: 'San Borja', lat: -12.1083, lng: -77.0039, danger: districtDangers.san_borja },
    { id: 'jesus_maria', name: 'Jesús María', lat: -12.0783, lng: -77.0519, danger: districtDangers.jesus_maria },
    { id: 'pueblo_libre', name: 'Pueblo Libre', lat: -12.0750, lng: -77.0664, danger: districtDangers.pueblo_libre },
    { id: 'magdalena_del_mar', name: 'Magdalena del Mar', lat: -12.0931, lng: -77.0728, danger: districtDangers.magdalena_del_mar },
    { id: 'lince', name: 'Lince', lat: -12.0858, lng: -77.0403, danger: districtDangers.lince },
    { id: 'chorrillos', name: 'Chorrillos', lat: -12.1739, lng: -77.0178, danger: districtDangers.chorrillos },
    { id: 'sjl', name: 'San Juan de Lurigancho', lat: -12.0000, lng: -76.9500, danger: districtDangers.sjl },
    { id: 'independencia', name: 'Independencia', lat: -11.9915, lng: -77.0430, danger: districtDangers.independencia },
    { id: 'los_olivos', name: 'Los Olivos', lat: -11.9810, lng: -77.0700, danger: districtDangers.los_olivos },
    { id: 'callao', name: 'Callao', lat: -12.0560, lng: -77.1180, danger: districtDangers.callao },
  ],
  connections: [
    // Connections from Lima Centro (Danger 4)
    { id: 'c1', from: 'lima_centro', to: 'san_isidro', distance: 6.0, danger: 3 },
    { id: 'c2', from: 'san_isidro', to: 'lima_centro', distance: 6.0, danger: 3 },
    { id: 'c3', from: 'lima_centro', to: 'jesus_maria', distance: 3.0, danger: 3 },
    { id: 'c4', from: 'jesus_maria', to: 'lima_centro', distance: 3.0, danger: 3 },
    { id: 'c5', from: 'lima_centro', to: 'lince', distance: 4.0, danger: 4 },
    { id: 'c6', from: 'lince', to: 'lima_centro', distance: 4.0, danger: 4 },
    { id: 'c61', from: 'lima_centro', to: 'pueblo_libre', distance: 5.5, danger: 4 },
    { id: 'c62', from: 'pueblo_libre', to: 'lima_centro', distance: 5.5, danger: 4 },

    // Connections from Miraflores (Danger 1)
    { id: 'c7', from: 'miraflores', to: 'san_isidro', distance: 3.5, danger: 1 },
    { id: 'c8', from: 'san_isidro', to: 'miraflores', distance: 3.5, danger: 1 },
    { id: 'c9', from: 'miraflores', to: 'barranco', distance: 2.0, danger: 2 },
    { id: 'c10', from: 'barranco', to: 'miraflores', distance: 2.0, danger: 2 },
    { id: 'c11', from: 'miraflores', to: 'surco', distance: 5.0, danger: 2 },
    { id: 'c12', from: 'surco', to: 'miraflores', distance: 5.0, danger: 2 },
    { id: 'c13', from: 'miraflores', to: 'san_borja', distance: 4.0, danger: 1 },
    { id: 'c14', from: 'san_borja', to: 'miraflores', distance: 4.0, danger: 1 },
    { id: 'c15', from: 'miraflores', to: 'lince', distance: 3.0, danger: 2 },
    { id: 'c16', from: 'lince', to: 'miraflores', distance: 3.0, danger: 2 },

    // Connections from San Isidro (Danger 1)
    { id: 'c17', from: 'san_isidro', to: 'surco', distance: 7.0, danger: 2 },
    { id: 'c18', from: 'surco', to: 'san_isidro', distance: 7.0, danger: 2 },
    { id: 'c19', from: 'san_isidro', to: 'lince', distance: 1.5, danger: 2 },
    { id: 'c20', from: 'lince', to: 'san_isidro', distance: 1.5, danger: 2 },
    { id: 'c21', from: 'san_isidro', to: 'jesus_maria', distance: 2.5, danger: 2 },
    { id: 'c22', from: 'jesus_maria', to: 'san_isidro', distance: 2.5, danger: 2 },
    { id: 'c23', from: 'san_isidro', to: 'magdalena_del_mar', distance: 4.0, danger: 3 },
    { id: 'c24', from: 'magdalena_del_mar', to: 'san_isidro', distance: 4.0, danger: 3 },
    { id: 'c25', from: 'san_isidro', to: 'san_borja', distance: 5.0, danger: 1 },
    { id: 'c26', from: 'san_borja', to: 'san_isidro', distance: 5.0, danger: 1 },

    // Connections from Barranco (Danger 2)
    { id: 'c27', from: 'barranco', to: 'surco', distance: 4.5, danger: 2 },
    { id: 'c28', from: 'surco', to: 'barranco', distance: 4.5, danger: 2 },
    { id: 'c29', from: 'barranco', to: 'chorrillos', distance: 2.5, danger: 3 },
    { id: 'c30', from: 'chorrillos', to: 'barranco', distance: 2.5, danger: 3 },

    // Connections from Surco (Danger 2)
    { id: 'c31', from: 'surco', to: 'la_molina', distance: 10.0, danger: 2 },
    { id: 'c32', from: 'la_molina', to: 'surco', distance: 10.0, danger: 2 },
    { id: 'c33', from: 'surco', to: 'san_borja', distance: 3.0, danger: 2 },
    { id: 'c34', from: 'san_borja', to: 'surco', distance: 3.0, danger: 2 },
    { id: 'c35', from: 'surco', to: 'chorrillos', distance: 7.0, danger: 3 },
    { id: 'c36', from: 'chorrillos', to: 'surco', distance: 7.0, danger: 3 },

    // Connections from La Molina (Danger 2)
    { id: 'c37', from: 'la_molina', to: 'lima_centro', distance: 15.0, danger: 4 },
    { id: 'c38', from: 'lima_centro', to: 'la_molina', distance: 15.0, danger: 4 },
    { id: 'c39', from: 'la_molina', to: 'san_borja', distance: 8.0, danger: 2 },
    { id: 'c40', from: 'san_borja', to: 'la_molina', distance: 8.0, danger: 2 },

    // Connections from San Borja (Danger 1)
    { id: 'c41', from: 'san_borja', to: 'lince', distance: 4.5, danger: 2 },
    { id: 'c42', from: 'lince', to: 'san_borja', distance: 4.5, danger: 2 },

    // Connections from Jesús María (Danger 2)
    { id: 'c43', from: 'jesus_maria', to: 'pueblo_libre', distance: 2.0, danger: 3 },
    { id: 'c44', from: 'pueblo_libre', to: 'jesus_maria', distance: 2.0, danger: 3 },
    { id: 'c45', from: 'jesus_maria', to: 'lince', distance: 1.8, danger: 2 },
    { id: 'c46', from: 'lince', to: 'jesus_maria', distance: 1.8, danger: 2 },
    { id: 'c47', from: 'jesus_maria', to: 'magdalena_del_mar', distance: 3.0, danger: 3 },
    { id: 'c48', from: 'magdalena_del_mar', to: 'jesus_maria', distance: 3.0, danger: 3 },

    // Connections from Pueblo Libre (Danger 3)
    { id: 'c49', from: 'pueblo_libre', to: 'magdalena_del_mar', distance: 1.5, danger: 3 },
    { id: 'c50', from: 'magdalena_del_mar', to: 'pueblo_libre', distance: 1.5, danger: 3 },
    
    // Connections from Northern/Callao districts
    // SJL (5)
    { id: 'c101', from: 'sjl', to: 'lima_centro', distance: 12.0, danger: 5 },
    { id: 'c102', from: 'lima_centro', to: 'sjl', distance: 12.0, danger: 5 },
    { id: 'c103', from: 'sjl', to: 'la_molina', distance: 10.0, danger: 4 },
    { id: 'c104', from: 'la_molina', to: 'sjl', distance: 10.0, danger: 4 },

    // Independencia (4)
    { id: 'c105', from: 'independencia', to: 'lima_centro', distance: 8.0, danger: 4 },
    { id: 'c106', from: 'lima_centro', to: 'independencia', distance: 8.0, danger: 4 },
    { id: 'c107', from: 'independencia', to: 'los_olivos', distance: 4.0, danger: 4 },
    { id: 'c108', from: 'los_olivos', to: 'independencia', distance: 4.0, danger: 4 },
    { id: 'c109', from: 'independencia', to: 'pueblo_libre', distance: 7.5, danger: 4 },
    { id: 'c110', from: 'pueblo_libre', to: 'independencia', distance: 7.5, danger: 4 },

    // Los Olivos (4)
    { id: 'c111', from: 'los_olivos', to: 'callao', distance: 9.0, danger: 5 },
    { id: 'c112', from: 'callao', to: 'los_olivos', distance: 9.0, danger: 5 },
    { id: 'c113', from: 'los_olivos', to: 'magdalena_del_mar', distance: 10.0, danger: 4 },
    { id: 'c114', from: 'magdalena_del_mar', to: 'los_olivos', distance: 10.0, danger: 4 },

    // Callao (5)
    { id: 'c115', from: 'callao', to: 'lima_centro', distance: 11.0, danger: 5 },
    { id: 'c116', from: 'lima_centro', to: 'callao', distance: 11.0, danger: 5 },
    // This is the direct but now MORE DANGEROUS path
    { id: 'c117', from: 'callao', to: 'magdalena_del_mar', distance: 8.0, danger: 5 },
    { id: 'c118', from: 'magdalena_del_mar', to: 'callao', distance: 8.0, danger: 5 },

    // This is the new SAFER BUT LONGER path
    { id: 'c200', from: 'callao', to: 'san_isidro', distance: 15.0, danger: 2 },
    { id: 'c201', from: 'san_isidro', to: 'callao', distance: 15.0, danger: 2 },
  ],
};
