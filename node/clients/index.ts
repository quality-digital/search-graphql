import { IOClients } from '@vtex/api'

import { Checkout } from './checkout'
import RichRelevance from './RichRelevance'
// import { Search } from './search'

export class Clients extends IOClients {
  public get search() {
    return this.getOrSet('search', RichRelevance)
  }
  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }
}
