import { SearchClient } from '../typings/SearchClient'
import { InstanceOptions, IOContext } from '@vtex/api'

/** Search API
 * Docs: https://documenter.getpostman.com/view/845/catalogsystem-102/Hs44
 */
export class Search extends SearchClient {
  constructor(ctx: IOContext, opts?: InstanceOptions) {
    super('vtex.catalog-api-proxy@0.x', ctx, opts)
  }
}
