# SearchFilter — Agent Guidelines & Context Routing

## Fast Context Navigation with `PROJECT_MAP.md`
To conserve tokens and reduce latency, this project maintains an active [PROJECT_MAP.md](file:///home/username_anna/Desktop/SearchFilter/PROJECT_MAP.md):

1. **Read Before Searching**:
   - For any user request, consult [PROJECT_MAP.md](file:///home/username_anna/Desktop/SearchFilter/PROJECT_MAP.md) first to pinpoint the exact target files, components, or backend services needed.
   - Avoid exploratory `list_dir` or broad repository-wide `grep_search` calls unless a target cannot be found in the map.

2. **Maintenance Duty**:
   - Whenever you create, delete, or rename files, routes, or services, or significantly alter data flow contracts, update [PROJECT_MAP.md](file:///home/username_anna/Desktop/SearchFilter/PROJECT_MAP.md) before concluding your turn.

3. **Turn Efficiency Reporting**:
   - Conclude each response with a brief 1-line token estimate breakdown for the turn (e.g., `⚡ Turn Tokens: ~450 (Context: ~300, Output: ~150)`).
