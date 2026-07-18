export class SearchProvider {
  /**
   * Search for a query and return a structured list of results.
   * @param {string} query
   * @returns {Promise<Array<{title: string, url: string, snippet: string, domain: string}>>}
   */
  async search(query) {
    throw new Error('search() must be implemented by subclass');
  }
}
