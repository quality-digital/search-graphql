import {
  AppClient,
  InstanceOptions,
  IOContext,
  RequestConfig,
  SegmentData,
} from '@vtex/api'
import { stringify } from 'qs'

import { searchEncodeURI } from '../resolvers/search/utils'

interface AutocompleteArgs {
  maxRows: number | string
  searchTerm: string
}

enum SimulationBehavior {
  SKIP = 'skip',
  DEFAULT = 'default'
}


const inflightKey = ({ baseURL, url, params, headers }: RequestConfig) => {
  return (
    baseURL! +
    url! +
    stringify(params, { arrayFormat: 'repeat', addQueryPrefix: true }) +
    `&segmentToken=${headers['x-vtex-segment']}`
  )
}

/** Search API
 * Docs: https://documenter.getpostman.com/view/845/catalogsystem-102/Hs44
 */
export class RRCustomSearch extends AppClient {
  private searchEncodeURI: (x: string) => string

  public constructor(ctx: IOContext, opts?: InstanceOptions) {
    super('acupula.rich-relevance@0.x', ctx, opts)

    this.searchEncodeURI = searchEncodeURI(ctx.account)
  }

  /* Page home load Products */
  public products = (args: SearchArgs) => {
    return this.get<SearchProduct[]>(this.productSearchUrl(args), {
      metric: 'search-products',
    })
  }

  /* Auto complete search */
  public autocomplete = ({ maxRows, searchTerm }: AutocompleteArgs) =>
    this.get<{ itemsReturned: SearchAutocompleteUnit[] }>(
      `/buscaautocomplete?maxRows=${maxRows}&productNameContains=${this.searchEncodeURI(
        encodeURIComponent(searchTerm)
      )}`,
      { metric: 'search-autocomplete' }
    )

  private get = <T = any>(url: string, config: RequestConfig = {}) => {
    const segmentData: SegmentData | undefined = (this
      .context! as CustomIOContext).segment
    const { channel: salesChannel = '' } = segmentData || {}

    config.params = {
      ...config.params,
      ...(!!salesChannel && { sc: salesChannel }),
    }
    config.inflightKey = inflightKey

    return this.http.get<T>(`/proxy/catalog${url}`, config)
  }

  private productSearchUrl = ({
    query = '',
    category = '',
    specificationFilters,
    priceRange = '',
    collection = '',
    salesChannel = '',
    orderBy = '',
    from = 0,
    to = 9,
    map = '',
    hideUnavailableItems = false,
    simulationBehavior = SimulationBehavior.DEFAULT,
  }: SearchArgs) => {
    const sanitizedQuery = this.searchEncodeURI(
      encodeURIComponent(
        decodeURIComponent(query || '').trim()
      )
    )
    if (hideUnavailableItems) {
      const segmentData = (this.context as CustomIOContext).segment
      salesChannel = (segmentData && segmentData.channel.toString()) || ''
    }
    let url = `/pub/products/search/${sanitizedQuery}?`
    if (category && !query) {
      url += `&fq=C:/${category}/`
    }
    if (specificationFilters && specificationFilters.length > 0) {
      url += specificationFilters.map(filter => `&fq=${filter}`)
    }
    if (priceRange) {
      url += `&fq=P:[${priceRange}]`
    }
    if (collection) {
      url += `&fq=productClusterIds:${collection}`
    }
    if (salesChannel) {
      url += `&fq=isAvailablePerSalesChannel_${salesChannel}:1`
    }
    if (orderBy) {
      url += `&O=${orderBy}`
    }
    if (map) {
      url += `&map=${map}`
    }
    if (from != null && from > -1) {
      url += `&_from=${from}`
    }
    if (to != null && to > -1) {
      url += `&_to=${to}`
    }
    if (simulationBehavior === SimulationBehavior.SKIP) {
      url += `&simulation=false`
    }
    return url
  }
}
