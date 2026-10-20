# SearchFilter: Technical Noise Reduction & Primary-Source Architecture Plan

## Executive Summary

When researching complex technical concepts (such as Linux Kernel virtualization, `/dev/kvm`, hypervisor mechanics, or binary translation), traditional web search frontends exhibit compounding failure modes:
1. **The SEO Echo-Chamber**: The same superficial definitions (*"the guest is aware that it is a guest"*) are copied verbatim across dozens of Medium posts, dev blogs, and aggregated wikis without explaining *how* it actually works in silicon or code.
2. **"All Sizzle, No Steak"**: Articles that claim deep architectural coverage but stack buzzwords without mechanical explanations, leaving the reader with unresting questions and cognitive fatigue.
3. **Unstated Prerequisites & Broken Media**: Traversing multi-part series only to find broken dark-mode diagrams (transparent black-on-black PNGs) or unannounced mathematical/assembly prerequisites after investing 45 minutes.
4. **Aggregators Over Primary Sources**: Secondary and tertiary regurgitators outrank original foundational papers (USENIX, ACM, IEEE preprints, OSDI, Linux Kernel source & documentation, LWN.net).
5. **Paywalls & Closed Gates**: Trapping users in commercial paywalls (Medium member-only, Substack paywalls) or academic paywalls ($35 IEEE/ACM fees) when free open-access author preprints exist.
6. **Redundant Cognitive Overhead**: Resurfacing introductory material that the user has already absorbed or rejected.

---

## Architectural Pillars & Core Requirements

```mermaid
flowchart TD
    Query[User Query & Filters] --> Router[Query Router & Engine Orchestrator]
    Router --> Primary[Primary / Authoritative Sources\n(arXiv, USENIX, docs.kernel.org, LWN, Open-Access)]
    Router --> General[General Aggregated Engines\n(Brave, SearXNG, DuckDuckGo)]
    
    Primary --> Collector[Raw Candidates Collector]
    General --> Collector
    
    Collector --> PaywallFilter[1. Paywall & Access Gatekeeper]
    PaywallFilter --> OpenAccessResolver[Open Preprint / PDF Alternative Resolver]
    
    OpenAccessResolver --> ContentScreener[2. Pre-Flight Screener & Density Analyzer]
    ContentScreener --> EchoChamberDetector[3. Echo-Chamber / Cliché De-duplicator]
    EchoChamberDetector --> KnowledgeFilter[4. Incremental Knowledge & Preference Layer]
    
    KnowledgeFilter --> FinalResults[Ranked & Annotated Results UI]
```

---

## Detailed Milestone Roadmap

### Milestone 1: Paywall Shield & Open-Access Alternative Resolver
Eliminate wasted clicks on paywalled content and automatically route to open preprints.

* **Domain & URL Paywall Registry**:
  - Classify domains with paywall heuristics:
    - *Commercial Paywalls*: Medium (`*/@*`, `medium.com`), Substack paid tiers, Bloomberg, Business Insider, etc.
    - *Academic Paywalls*: IEEE Xplore, ACM Digital Library, SpringerLink, Elsevier/ScienceDirect.
* **Open-Access Resolution (`findOpenAccessAlternative`)**:
  - For academic papers discovered behind paywalls, run background cross-resolution for author-hosted open PDFs:
    - Queries targeted at `arxiv.org`, `usenix.org`, or university CS repositories (`site:edu filetype:pdf [paper title]`).
    - Expose a 1-click **"Open Preprint / PDF"** badge directly on the result card.
* **Frontend Filtering**:
  - Add a **"No Paywalls"** quick toggle pill to the filter bar (`All`, `Free Only`, `Primary Only`).

---

### Milestone 2: Primary Source & Deep Systems Provider Integration
Prioritize authoritative, primary technical documentation and research papers over commercial aggregators.

* **Authoritative Source Profiles**:
  - **Linux Systems / Kernel**: `docs.kernel.org`, `kernel.org`, `lwn.net`, `man7.org`, `bootlin.com/doc`, LKML archives.
  - **Computer Science Systems Papers**: USENIX (ATC, OSDI, FAST), arXiv (cs.OS, cs.AR, cs.SE), ACM OpenTOC, Bell Labs Technical Journal, author preprints.
  - **Hardware Architecture**: Intel Software Developer Manuals (SDM), AMD APM, ARM Architecture Reference Manuals.
* **Dedicated "Primary Sources" Mode / Filter**:
  - Add an engine toggle or query routing rule in `searchProviderFactory.js` that appends domain filters or directly queries primary APIs (e.g. arXiv API, USENIX index, SearXNG specialized research engines).
  - Add visual **"Primary Source"** indicator badges to cards meeting the domain or preprint criteria.

---

### Milestone 3: Echo-Chamber & "All Sizzle" Semantic De-duplication
Detect shallow, repetitive copy-paste explanations and surface novel, mechanically sound articles.

* **Cliché & Carbon-Copy Detection**:
  - Identify regurgitated boilerplate phrases (e.g., *"The guest is aware that it is a guest"*, *"hardware enforces boundaries in silicon"* without elaboration).
  - Extract and compare snippet/key-concept overlap against previously visited/rated documents.
* **Code & Mechanism Density Scoring**:
  - Calculate an *Information Depth Score*:
    - Ratio of concrete mechanisms (code snippets, kernel data structures, syscalls, CPU flags, assembly instructions, registers like `VMXON`, `CR0`, `CR4`) versus generic buzzwords.
    - Demote articles with high buzzword density but zero architectural mechanics.
* **Clustering & Novelty Boosting**:
  - Group search results into semantic clusters. If 15 articles cover the identical 101 summary of KVM history, collapse them into 1 representative card with an expandable drawer: *"14 similar introductory summaries collapsed"*.

---

### Milestone 4: Pre-Flight Content & Readability Screener
Prevent the "invested 40 minutes on an unreadable series" trap before opening external tabs.

* **Media & Dark-Mode Contrast Validator**:
  - Check for common readability failures (e.g. transparent PNG diagrams with pure black line art that break in dark mode).
* **Prerequisite & Scope Auditor**:
  - Extract prerequisite signals from articles (e.g., *"Prerequisites: x86 real mode, VT-x paging, C assembly"*).
  - Detect multi-part series and display a structured table of contents / series status (e.g., *"Part 2 of 5 — requires reading Part 1 on MMU emulation"*).
* **"TLC / Pre-Flight" Card Badges**:
  - Badges on result cards: `[Code-Dense]`, `[Math-Heavy]`, `[Dark-Mode Friendly]`, `[5-Part Series]`.

---

### Milestone 5: Incremental Knowledge Frontier (Absorbed Concepts)
Evolve the search space as the user's understanding grows.

* **Good / Bad Rating Feedback Integration**:
  - Feed the existing `ratings.json` database into the ranking engine (`preferenceEngine.js`).
  - If a user marks an article as **Good** because it explained paravirtualization hypercalls clearly, extract the key concepts and suppress 101 definitions of those concepts in future queries.
  - If a user marks an article as **Bad** (marked as superficial/rehash), reduce the rank of similar aggregators and repetitive domains.
* **Frontier Query Augmentation**:
  - Provide auto-suggested "Next Frontier" refinement prompts (e.g., *"Filter out introductory overviews; focus on guest-to-host VM-exit handling"*).

---

## Proposed Implementation Phasing

| Phase | Milestone | Scope & Components | Complexity |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Paywall Shield & Academic Resolver** | Domain filter registry, `openAccessService.js`, frontend paywall toggle pill. | Low–Medium |
| **Phase 2** | **Primary Source Engine / Routing** | `primarySourcesProvider.js`, kernel/academic query expansion, badge overlays. | Medium |
| **Phase 3** | **Pre-Flight Screener & Series Detector** | Multi-part series detector, code-density analyzer, image contrast sanity check. | Medium |
| **Phase 4** | **Echo-Chamber De-duplication** | Cliché phrase detector, snippet clustering, semantic compression of rehashes. | Medium–High |
| **Phase 5** | **Knowledge Frontier Tuning** | Dynamic ranking based on `ratings.json` concept saturation. | High |
