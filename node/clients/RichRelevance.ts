import { IOContext, InstanceOptions } from '@vtex/api'
import { SearchClient } from '../typings/SearchClient'

export default class RichRelevance extends SearchClient {
  public constructor(ctx: IOContext, opts?: InstanceOptions) {
    super(ctx, opts)
  }
}
