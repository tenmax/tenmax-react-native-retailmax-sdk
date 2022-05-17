import axios from 'axios';
import { API_DOMAIN } from '../../constants';
import '../../enums';

export default class EcdmpApi {
  static async postEvents(events: Array<any>): Promise<number> {
    const data = {
      events: events,
    };
    if (__DEV__) {
      console.log(`postEvents: ${JSON.stringify(data)}`);
    }
    const result = await axios.post(`${API_DOMAIN}/bulk/t`, data);
    return result.status;
  }
}
