import type { LimaData } from '@/types';

export const limaData: LimaData = {
  districts: [
    { id: 'lima_centro', name: 'Lima Centro', lat: -12.0464, lng: -77.0428 },
    { id: 'miraflores', name: 'Miraflores', lat: -12.1193, lng: -77.0337 },
    { id: 'san_isidro', name: 'San Isidro', lat: -12.0983, lng: -77.0494 },
    { id: 'barranco', name: 'Barranco', lat: -12.1428, lng: -77.0225 },
    { id: 'surco', name: 'Santiago de Surco', lat: -12.1255, lng: -76.9921 },
    { id: 'la_molina', name: 'La Molina', lat: -12.0734, lng: -76.9092 },
    { id: 'san_borja', name: 'San Borja', lat: -12.1083, lng: -77.0039 },
    { id: 'jesus_maria', name: 'Jesús María', lat: -12.0783, lng: -77.0519 },
    { id: 'pueblo_libre', name: 'Pueblo Libre', lat: -12.0750, lng: -77.0664 },
    { id: 'magdalena_del_mar', name: 'Magdalena del Mar', lat: -12.0931, lng: -77.0728 },
    { id: 'lince', name: 'Lince', lat: -12.0858, lng: -77.0403 },
    { id: 'chorrillos', name: 'Chorrillos', lat: -12.1739, lng: -77.0178 },
  ],
  connections: [
    // Connections from Lima Centro
    { id: 'c1', from: 'lima_centro', to: 'san_isidro', distance: 6.0, danger: 4 },
    { id: 'c2', from: 'san_isidro', to: 'lima_centro', distance: 6.0, danger: 4 },
    { id: 'c3', from: 'lima_centro', to: 'jesus_maria', distance: 3.0, danger: 3 },
    { id: 'c4', from: 'jesus_maria', to: 'lima_centro', distance: 3.0, danger: 3 },
    { id: 'c5', from: 'lima_centro', to: 'lince', distance: 4.0, danger: 3 },
    { id: 'c6', from: 'lince', to: 'lima_centro', distance: 4.0, danger: 3 },
    { id: 'c61', from: 'lima_centro', to: 'pueblo_libre', distance: 5.5, danger: 4 },
    { id: 'c62', from: 'pueblo_libre', to: 'lima_centro', distance: 5.5, danger: 4 },


    // Connections from Miraflores
    { id: 'c7', from: 'miraflores', to: 'san_isidro', distance: 3.5, danger: 2 },
    { id: 'c8', from: 'san_isidro', to: 'miraflores', distance: 3.5, danger: 2 },
    { id: 'c9', from: 'miraflores', to: 'barranco', distance: 2.0, danger: 3 },
    { id: 'c10', from: 'barranco', to: 'miraflores', distance: 2.0, danger: 3 },
    { id: 'c11', from: 'miraflores', to: 'surco', distance: 5.0, danger: 3 },
    { id: 'c12', from: 'surco', to: 'miraflores', distance: 5.0, danger: 3 },
    { id: 'c13', from: 'miraflores', to: 'san_borja', distance: 4.0, danger: 2 },
    { id: 'c14', from: 'san_borja', to: 'miraflores', distance: 4.0, danger: 2 },
    { id: 'c15', from: 'miraflores', to: 'lince', distance: 3.0, danger: 2 },
    { id: 'c16', from: 'lince', to: 'miraflores', distance: 3.0, danger: 2 },

    // Connections from San Isidro
    { id: 'c17', from: 'san_isidro', to: 'surco', distance: 7.0, danger: 2 },
    { id: 'c18', from: 'surco', to: 'san_isidro', distance: 7.0, danger: 2 },
    { id: 'c19', from: 'san_isidro', to: 'lince', distance: 1.5, danger: 1 },
    { id: 'c20', from: 'lince', to: 'san_isidro', distance: 1.5, danger: 1 },
    { id: 'c21', from: 'san_isidro', to: 'jesus_maria', distance: 2.5, danger: 2 },
    { id: 'c22', from: 'jesus_maria', to: 'san_isidro', distance: 2.5, danger: 2 },
    { id: 'c23', from: 'san_isidro', to: 'magdalena_del_mar', distance: 4.0, danger: 2 },
    { id: 'c24', from: 'magdalena_del_mar', to: 'san_isidro', distance: 4.0, danger: 2 },
    { id: 'c25', from: 'san_isidro', to: 'san_borja', distance: 5.0, danger: 1 },
    { id: 'c26', from: 'san_borja', to: 'san_isidro', distance: 5.0, danger: 1 },

    // Connections from Barranco
    { id: 'c27', from: 'barranco', to: 'surco', distance: 4.5, danger: 3 },
    { id: 'c28', from: 'surco', to: 'barranco', distance: 4.5, danger: 3 },
    { id: 'c29', from: 'barranco', to: 'chorrillos', distance: 2.5, danger: 4 },
    { id: 'c30', from: 'chorrillos', to: 'barranco', distance: 2.5, danger: 4 },

    // Connections from Surco
    { id: 'c31', from: 'surco', to: 'la_molina', distance: 10.0, danger: 2 },
    { id: 'c32', from: 'la_molina', to: 'surco', distance: 10.0, danger: 2 },
    { id: 'c33', from: 'surco', to: 'san_borja', distance: 3.0, danger: 1 },
    { id: 'c34', from: 'san_borja', to: 'surco', distance: 3.0, danger: 1 },
    { id: 'c35', from: 'surco', to: 'chorrillos', distance: 7.0, danger: 3 },
    { id: 'c36', from: 'chorrillos', to: 'surco', distance: 7.0, danger: 3 },

    // Connections from La Molina
    { id: 'c37', from: 'la_molina', to: 'lima_centro', distance: 15.0, danger: 5 }, // Indirect, placeholder
    { id: 'c38', from: 'lima_centro', to: 'la_molina', distance: 15.0, danger: 5 }, // Indirect, placeholder
    { id: 'c39', from: 'la_molina', to: 'san_borja', distance: 8.0, danger: 2 },
    { id: 'c40', from: 'san_borja', to: 'la_molina', distance: 8.0, danger: 2 },


    // Connections from San Borja
    { id: 'c41', from: 'san_borja', to: 'lince', distance: 4.5, danger: 2 },
    { id: 'c42', from: 'lince', to: 'san_borja', distance: 4.5, danger: 2 },

    // Connections from Jesús María
    { id: 'c43', from: 'jesus_maria', to: 'pueblo_libre', distance: 2.0, danger: 2 },
    { id: 'c44', from: 'pueblo_libre', to: 'jesus_maria', distance: 2.0, danger: 2 },
    { id: 'c45', from: 'jesus_maria', to: 'lince', distance: 1.8, danger: 1 },
    { id: 'c46', from: 'lince', to: 'jesus_maria', distance: 1.8, danger: 1 },
    { id: 'c47', from: 'jesus_maria', to: 'magdalena_del_mar', distance: 3.0, danger: 2 },
    { id: 'c48', from: 'magdalena_del_mar', to: 'jesus_maria', distance: 3.0, danger: 2 },

    // Connections from Pueblo Libre
    { id: 'c49', from: 'pueblo_libre', to: 'magdalena_del_mar', distance: 1.5, danger: 2 },
    { id: 'c50', from: 'magdalena_del_mar', to: 'pueblo_libre', distance: 1.5, danger: 2 },
    
    // Connections from Magdalena del Mar
    // (already connected to San Isidro, Jesus Maria, Pueblo Libre)

    // Connections from Lince
    // (already connected to Lima Centro, Miraflores, San Isidro, San Borja, Jesus Maria)

    // Connections from Chorrillos
    // (already connected to Barranco, Surco)
  ],
};
