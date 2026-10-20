import { URL } from 'url';

/**
 * Authoritative Primary Source Profiles as defined in Milestone 2
 * Focuses on systems engineering, Linux kernel internals, OS research papers,
 * hardware architecture manuals, and foundational standards.
 */
const PRIMARY_PROFILES = [
  {
    id: 'linux_kernel',
    category: 'Linux Kernel',
    exactDomains: new Set([
      'docs.kernel.org',
      'kernel.org',
      'git.kernel.org',
      'lore.kernel.org',
      'lwn.net',
      'man7.org',
      'bootlin.com',
      'elixir.bootlin.com',
      'kernelnewbies.org'
    ]),
    domainSuffixes: ['kernel.org', 'bootlin.com', 'lwn.net', 'man7.org']
  },
  {
    id: 'systems_research',
    category: 'Systems Research',
    exactDomains: new Set([
      'usenix.org',
      'arxiv.org',
      'dl.acm.org',
      'sigops.org',
      'openreview.net',
      'semanticscholar.org',
      'bell-labs.com',
      'iacr.org'
    ]),
    domainSuffixes: ['usenix.org', 'arxiv.org', 'openreview.net', 'sigops.org', 'bell-labs.com']
  },
  {
    id: 'hardware_specs',
    category: 'Hardware Spec',
    exactDomains: new Set([
      'intel.com',
      'developer.intel.com',
      'amd.com',
      'arm.com',
      'developer.arm.com',
      'riscv.org'
    ]),
    domainSuffixes: ['intel.com', 'amd.com', 'arm.com', 'riscv.org']
  },
  {
    id: 'standards_docs',
    category: 'Standards & RFCs',
    exactDomains: new Set([
      'ietf.org',
      'rfc-editor.org',
      'w3.org',
      'iso.org',
      'open-std.org',
      'khronos.org',
      'ecma-international.org'
    ]),
    domainSuffixes: ['ietf.org', 'rfc-editor.org', 'w3.org', 'open-std.org', 'khronos.org']
  }
];

// Academic domain patterns (.edu, .ac.uk, .edu.au, .ethz.ch, etc.)
const ACADEMIC_TLD_REGEX = /\.(edu|ac\.uk|edu\.[a-z]{2}|ethz\.ch|epfl\.ch)$/i;

export const primarySourcesService = {
  /**
   * Classify whether a URL or domain belongs to an authoritative primary source.
   * @param {string} rawUrl
   * @param {string} [fallbackDomain]
   * @returns {{ isPrimary: boolean, category: string|null, domain: string } | null}
   */
  classify(rawUrl, fallbackDomain = '') {
    if (!rawUrl && !fallbackDomain) return null;

    let hostname = (fallbackDomain || '').toLowerCase().replace(/^www\./, '');
    let pathname = '';

    if (rawUrl) {
      try {
        const parsed = new URL(rawUrl);
        hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
        pathname = parsed.pathname.toLowerCase();
      } catch {
        // Fallback to domain string
      }
    }

    if (!hostname) return null;

    // 1. Check categorized primary profiles
    for (const profile of PRIMARY_PROFILES) {
      if (profile.exactDomains.has(hostname)) {
        return { isPrimary: true, category: profile.category, domain: hostname };
      }
      for (const suffix of profile.domainSuffixes) {
        if (hostname === suffix || hostname.endsWith(`.${suffix}`)) {
          return { isPrimary: true, category: profile.category, domain: hostname };
        }
      }
    }

    // 2. Check general academic institutions (.edu, .ac.uk, etc.)
    if (ACADEMIC_TLD_REGEX.test(hostname)) {
      return { isPrimary: true, category: 'Academic Research', domain: hostname };
    }

    // 3. Check author preprints or direct USENIX / arXiv PDF links
    if (pathname.endsWith('.pdf') && (hostname.includes('arxiv') || hostname.includes('usenix') || hostname.includes('kernel'))) {
      return { isPrimary: true, category: 'Primary PDF', domain: hostname };
    }

    return null;
  },

  /**
   * Annotate a search result with primary source metadata
   */
  annotateResult(result) {
    if (!result) return result;
    const classification = this.classify(result.url, result.domain);
    if (classification) {
      return {
        ...result,
        isPrimarySource: true,
        primaryCategory: classification.category
      };
    }
    return {
      ...result,
      isPrimarySource: false
    };
  },

  /**
   * Annotate an array of search results
   */
  annotateResults(results = []) {
    return results.map(r => this.annotateResult(r));
  },

  /**
   * Get list of top primary source domains to target in specialized search queries
   */
  getTargetDomains() {
    return [
      'docs.kernel.org',
      'kernel.org',
      'lwn.net',
      'man7.org',
      'usenix.org',
      'arxiv.org',
      'dl.acm.org',
      'bootlin.com',
      'lore.kernel.org',
      'ietf.org',
      'intel.com',
      'amd.com',
      'arm.com'
    ];
  }
};
