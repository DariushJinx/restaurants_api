import { JwtService } from '@nestjs/jwt';
import { Location } from 'src/restaurants/schemas/restaurant.schema';

const nodeGeoCoder = require('node-geocoder');

export default class APIFeatures {
  static async getRestaurantLocation(address) {
    try {
      const options = {
        provider: 'openstreetmap',
        formatter: null,
      };

      const geoCoder = nodeGeoCoder(options);

      const loc = await geoCoder.geocode(address);

      const location: Location = {
        type: 'Point',
        coordinates: [loc[0].latitude, loc[0].longitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        // state: loc[0].stateCode,
        streetName: loc[0].streetName,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode,
      };

      return location;
    } catch (error) {
      console.log(error.message);
    }
  }

  static async assignJwtToken(
    userId: string,
    jwtService: JwtService,
  ): Promise<string> {
    const payload = { id: userId };

    const token = await jwtService.sign(payload);

    return token;
  }
}
