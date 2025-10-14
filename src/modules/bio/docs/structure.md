# Bio module structure

This document explains the internal structure of the bio module and how to extend it with new submodules.

## Directory layout

```
src/modules/bio/
  ParentLayout.vue             # Root layout for the bio section
  docs/
    intro.md                   # High-level domain goals
    structure.md               # This file
  js/                          # Module-scoped JS utilities
    bio-constants.js
    bio-helpers.js
    endpoints.js               # Local API endpoints (single source for @bio)
    menu-config.json
    routes.js                  # Route definitions (component paths point to submodules)
  shared/                      # Reusable pieces across submodules only
    components/
      BootstrapTable.vue
      CustomDropdown.vue
      CustomPaginator.vue
      ModalCenter.vue
      NavigationButtons.vue
    utils/
      table-helpers.js
  submodules/
    geobotany/                 # Example submodule (current implementation)
      views/
        SiteListView.vue
        SitesMap.vue
        SiteConsolidatedAnalysis.vue
        SiteView.vue
        SiteInfo.vue
        SiteSpecies.vue
        SiteAnalytics.vue
      store/
        consolidatedAnalysisStore.js (re-exports from legacy location for now)
```

Key rules:
- shared/ holds only truly reusable UI/utilities within @bio. Do not place domain logic here.
- Each submodule keeps its own views/components/store. Charts and modals can stay inside submodule or shared if reused.
- API calls in @bio must import from `@/modules/bio/js/endpoints`.

## Working with routes
- `js/routes.js` contains route records for bio. Component paths should point to submodule views, e.g. `@/modules/bio/submodules/geobotany/views/SiteListView.vue`.
- Keep route names/paths stable to avoid breaking menu and cross-links.

## Adding a new submodule
1. Create `src/modules/bio/submodules/<name>/` with:
   - `views/` for page-level components
   - `store/` for Pinia stores (if needed)
   - optional `components/`, `components/modals/`, `components/charts/`
2. Wire routes in `src/modules/bio/js/routes.js` to new submodule views.
3. Use `@/modules/bio/js/endpoints` for all API calls.
4. If something is reused by multiple submodules, move it to `shared/` and update imports.

## Endpoints policy
- Single source of truth for API paths is `@/modules/bio/js/endpoints`.
- Do not import global `@/js/api/endpoints` inside @bio.

## Notes for future evolution
- Legacy files under `src/modules/bio/js/*` are kept flat to minimize churn. When more submodules appear, consider moving submodule-specific logic under its folder.
- When refactoring stores to TypeScript later, keep store API stable (names, actions) and adjust imports in views.


