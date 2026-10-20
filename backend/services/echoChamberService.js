/**
 * Echo-Chamber & "All Sizzle" Semantic De-duplication Service (Milestone 3)
 * Detects shallow copy-paste boilerplate, calculates Information Depth Scores
 * (concrete mechanisms vs buzzwords), and collapses redundant 101 overviews into semantic clusters.
 */

// 1. Concrete systems mechanisms, kernel structures, registers, syscalls, and low-level tokens
const MECHANISM_PATTERNS = [
  // Registers & CPU architecture flags
  /\b(VMXON|VMXOFF|VMLAUNCH|VMRESUME|VMWRITE|VMREAD|VMCALL|VMPTRLD|VMPTRST)\b/i,
  /\b(CR0|CR2|CR3|CR4|CR8|EFER|MSR|RFLAGS|EFLAGS|RIP|EIP|RSP|ESP|RBP|EBP)\b/i,
  /\b(VT-x|AMD-V|SVM|EPT|NPT|IOMMU|APIC|LAPIC|IOAPIC|TLB|SMM|TSS|GDT|IDT|LDT)\b/i,
  // Kernel internals & hypervisor interfaces
  /\b(\/dev\/kvm|kvm_run|kvm_vcpu|kvm_vm|vmcs|vmcb|vm_exit|vm_entry|hypercall)\b/i,
  /\b(ioctl|sys_enter|sys_exit|mmap|mprotect|brk|epoll|kthread|task_struct|mm_struct)\b/i,
  /\b(page table|page fault|PTE|PMD|PUD|PGD|hugepages|THP|KPTI|ASLR)\b/i,
  /\b(spinlock|rwlock|mutex|rcu|atomic_t|memory barrier|smp_mb)\b/i,
  /\b(ebpf|bpf_prog|kprobe|uprobe|tracepoint|ftrace|perf_event)\b/i,
  /\b(sk_buff|net_device|qdisc|cgroup|namespaces|seccomp)\b/i,
  // Hex addresses & assembly / code tokens
  /\b0x[0-9a-fA-F]{2,16}\b/,
  /\b(sys_[a-z0-9_]+|[a-z0-9_]+_init|[a-z0-9_]+_exit)\b/,
  /\b(#include\s*<[a-z0-9_\/.]+>|struct\s+[a-z0-9_]+|\btypedef\b)\b/i,
  /->[a-z0-9_]+/
];

// 2. Empty cliché buzzwords and regurgitated fluff
const CLICHE_BUZZWORDS = [
  /\b(game changer|revolutionize|revolutionizing|revolutionary)\b/i,
  /\b(in today's fast[- ]paced world|in this digital age)\b/i,
  /\b(demystified|demystifying|simply put|in layman's terms)\b/i,
  /\b(without breaking a sweat|a complete breeze|walk in the park)\b/i,
  /\b(magic behind|secret sauce|unlocked the secret)\b/i,
  /\b(the guest is aware that it is a guest)\b/i,
  /\b(hardware enforces boundaries in silicon)\b/i,
  /\b(unlock the power of|unleash the power)\b/i,
  /\b(ultimate guide|everything you need to know in \d+ minutes)\b/i,
  /\b(without further ado|let's dive right in|let's jump right in)\b/i,
  /\b(virtualization is simply the process of)\b/i,
  /\b(in this article we will (explore|see|discuss|learn))\b/i
];

// Common stopwords to exclude during similarity shingles
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
  'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor',
  'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'guide', 'tutorial', 'introduction',
  'overview', 'basics', 'beginners', 'simple', 'understanding', 'explained'
]);

export const echoChamberService = {
  /**
   * Calculate Information Depth Score and detect cliché carbon-copies
   * @param {Object} result { title, snippet, url }
   * @returns {{ depthScore: number, depthLevel: 'deep'|'balanced'|'shallow', isEchoChamber: boolean, mechanismMatches: number, buzzwordMatches: number }}
   */
  analyze(result) {
    if (!result) return { depthScore: 0, depthLevel: 'balanced', isEchoChamber: false, mechanismMatches: 0, buzzwordMatches: 0 };

    const text = `${result.title || ''} ${result.snippet || ''}`;
    let mechanismMatches = 0;
    let buzzwordMatches = 0;

    for (const pattern of MECHANISM_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        mechanismMatches += match.length;
      }
    }

    for (const pattern of CLICHE_BUZZWORDS) {
      const match = text.match(pattern);
      if (match) {
        buzzwordMatches += match.length;
      }
    }

    // Depth Score: rewards concrete mechanisms (+4 pts each), penalizes empty fluff (-5 pts each)
    let depthScore = (mechanismMatches * 4) - (buzzwordMatches * 5);

    // Primary sources and academic papers naturally exhibit structural depth
    if (result.isPrimarySource) {
      depthScore += 4;
    }

    let depthLevel = 'balanced';
    if (mechanismMatches >= 2 || depthScore >= 6) {
      depthLevel = 'deep';
    } else if (buzzwordMatches >= 2 && mechanismMatches === 0) {
      depthLevel = 'shallow';
    }

    // Flag as echo chamber if text has multiple cliché patterns and zero technical mechanisms
    const isEchoChamber = buzzwordMatches >= 2 && mechanismMatches === 0;

    return {
      depthScore,
      depthLevel,
      isEchoChamber,
      mechanismMatches,
      buzzwordMatches
    };
  },

  /**
   * Tokenize text into normalized content tokens for semantic overlap comparison
   */
  tokenize(text) {
    if (!text) return new Set();
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 2 && !STOPWORDS.has(token))
    );
  },

  /**
   * Compute Jaccard similarity between two token sets
   */
  similarity(setA, setB) {
    if (!setA.size || !setB.size) return 0;
    let intersection = 0;
    for (const item of setA) {
      if (setB.has(item)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  },

  /**
   * Cluster redundant search results.
   * If multiple results share high semantic overlap or are duplicate 101 overviews,
   * collapses them under the highest-scoring result as `collapsedVariants`.
   * @param {Array} rankedResults
   * @returns {Array} Results with redundant variants grouped
   */
  clusterResults(rankedResults = []) {
    if (!rankedResults || rankedResults.length <= 1) return rankedResults;

    const tokenized = rankedResults.map(r => ({
      result: r,
      tokens: this.tokenize(`${r.title} ${r.snippet}`)
    }));

    const clustered = [];
    const absorbedUrls = new Set();

    for (let i = 0; i < tokenized.length; i++) {
      const current = tokenized[i];
      if (absorbedUrls.has(current.result.url)) continue;

      const collapsedVariants = [];

      // Check remaining candidates for semantic overlap
      for (let j = i + 1; j < tokenized.length; j++) {
        const candidate = tokenized[j];
        if (absorbedUrls.has(candidate.result.url)) continue;

        // Skip clustering primary sources together (e.g. separate kernel docs or research papers should remain independent)
        if (current.result.isPrimarySource && candidate.result.isPrimarySource) continue;

        const sim = this.similarity(current.tokens, candidate.tokens);

        // Clustered if:
        // 1. High Jaccard text overlap (>= 0.65)
        // 2. Both are shallow/introductory overviews covering the identical core topic (>= 0.50)
        const bothIntroductory = (current.result.depthLevel === 'shallow' || current.result.depthLevel === 'balanced') &&
                                 (candidate.result.depthLevel === 'shallow' || candidate.result.depthLevel === 'balanced');
        
        if (sim >= 0.65 || (bothIntroductory && sim >= 0.50)) {
          collapsedVariants.push({
            title: candidate.result.title,
            url: candidate.result.url,
            domain: candidate.result.domain,
            snippet: candidate.result.snippet,
            depthLevel: candidate.result.depthLevel,
            finalScore: candidate.result.finalScore
          });
          absorbedUrls.add(candidate.result.url);
        }
      }

      clustered.push({
        ...current.result,
        collapsedVariants: collapsedVariants.length > 0 ? collapsedVariants : null
      });
    }

    return clustered;
  }
};
