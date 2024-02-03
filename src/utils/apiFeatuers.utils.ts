// import axios from 'axios';
// import NodeGeocoder from 'node-geocoder';
// // import { Location } from '../restaurants/schemas/restaurant.schema';

// export default class APIFeatures {
//   static async getRestaurantLocation(address) {
//     const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
//     const response = await axios.get(url);

//     try {
//       const loc = response.data[0];

//       if (loc.length === 0) {
//         throw new Error('Location not found');
//       }

//       const addressDetails = {
//         // zipCode: loc[0].zipcode,
//         // city: loc[0].city,
//         // country: loc[0].countryCode,
//       };

//       return addressDetails;
//     } catch (error) {
//       throw new Error('Error retrieving address details: ' + error.message);
//     }
//   }
// }

import NodeGeocoder from 'node-geocoder';

export default class APIFeatures {
  static async getRestaurantLocation(address) {
    const geocoder = NodeGeocoder({
      provider: 'openstreetmap',
    });

    try {
      const result = await geocoder.geocode(address);

      console.log('result:', result);

      if (result.length === 0) {
        throw new Error('Location not found');
      }

      const addressDetails = {
        zipCode: result[0].zipcode,
        city: result[0].city,
        country: result[0].countryCode,
      };

      return addressDetails;
    } catch (error) {
      throw new Error('Error retrieving address details: ' + error.message);
    }
  }
}
