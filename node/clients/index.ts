import { IOClients } from '@vtex/api'

import { Search } from './search'
import { Checkout } from './checkout'
import { RRCustomSearch } from './RRCustomSearch'

export class Clients extends IOClients {
  public get search() {
    return this.getOrSet('search', Search)
  }
  public get rrsearch() {
    return this.getOrSet('rrsearch', RRCustomSearch)
  }
  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }
}
