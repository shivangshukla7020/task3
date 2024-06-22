import { ServerRespond } from './DataStreamer';

export interface Row { //As now we have new schema we need to implement similar structure here as same kind of structure must be returned by generateRow function
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
  // stock: string,
  // top_ask_price: number,
  // timestamp: Date,
}


export class DataManipulator { // Here we made the changes with required logic for calculation of ration, 10% annual upper and lower bound, alert and returned it as ROW structure
  static generateRow(serverResponds: ServerRespond[]): Row {
    const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2;
    const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2;
    const ratio = priceABC/priceDEF;
    const upperBound = 1 + 0.10;
    const lowerBound = 1 - 0.10;
    return{
      price_abc:priceABC,
      price_def:priceDEF,
      ratio,
      timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ?serverResponds[0].timestamp : serverResponds[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio>upperBound || ratio < lowerBound) ? ratio: undefined,
    };
   
  }
}
