# Changelog

All notable changes to this project will be documented in this file.


## [0.2.1](https://github.com/radumardale/claude-lens/compare/v0.2.0...v0.2.1) (2026-01-30)

### Features

* add GitHub Pages landing page ([3d5c7b4](https://github.com/radumardale/claude-lens/commit/3d5c7b45765e0e157ac581bc0b6136c37c09b805))
* add GitHub social preview image ([62ac60a](https://github.com/radumardale/claude-lens/commit/62ac60a338d80b1ac9c0d3a14d8d945aa4afa329))
* **cli:** make TUI the default mode ([0888835](https://github.com/radumardale/claude-lens/commit/088883534fcead91d3b66526f192c133d37e3468))
* configure custom domain claudelens.dev ([985bb1d](https://github.com/radumardale/claude-lens/commit/985bb1df18508db7a250b5a603404465d6d9cd4b))
* enhance social preview with custom circuit lens icon ([399285e](https://github.com/radumardale/claude-lens/commit/399285e35996a2bf555299d77473219b6df5b283))
* **tui:** add contextual empty state messages ([44212b4](https://github.com/radumardale/claude-lens/commit/44212b4ecd1f5a6b4117312b4905bd6c9a1b9912))
* **tui:** add delete feature with trash/recycling bin ([a628bdb](https://github.com/radumardale/claude-lens/commit/a628bdb49dbe1094d72e54667973030fdfdc5c34))
* **tui:** improve toggle UX with checkboxes and dynamic help ([c60fed5](https://github.com/radumardale/claude-lens/commit/c60fed54245f16919769d664eb7882ecae6db54e))
* **tui:** preserve list selection on back navigation ([2e84111](https://github.com/radumardale/claude-lens/commit/2e8411105e1a19e22b9d5519cf3d3fbdd5a00905))
* **tui:** preserve ProjectDashboardView list selection on back ([2971d2d](https://github.com/radumardale/claude-lens/commit/2971d2d84158220cb630c43b759b0d5c2e3b21b5))
* **tui:** replace dashboard header with minimal style + breadcrumb ([dbf22ef](https://github.com/radumardale/claude-lens/commit/dbf22ef3e7518fad0146199c3e2ec1778ed88164))
* **tui:** show app name consistently across all views ([1f1d7ee](https://github.com/radumardale/claude-lens/commit/1f1d7eeeb0e94e503ea0437db76b26e9a8c8234c))

### Bug Fixes

* **tui:** add left/right arrow navigation to Settings and Disabled Items ([b812203](https://github.com/radumardale/claude-lens/commit/b812203871d077dfdf09fc38b74157c916d0c1fa))
* **tui:** hide toggle help when sidebar is focused ([a7f9241](https://github.com/radumardale/claude-lens/commit/a7f92415623a7629b76d54b98d42f5c0ff0a315d))
* **tui:** improve MCP list UX with clearer columns and navigation ([8d5f40e](https://github.com/radumardale/claude-lens/commit/8d5f40e9be197f2b8c0f408acb3a98394ae5a662))
* **tui:** make breadcrumb last segment styling more explicit ([f299295](https://github.com/radumardale/claude-lens/commit/f2992950695274dab28695e17b50780e9ac85b4c))
* **tui:** persist focus area when returning from detail view ([be4633a](https://github.com/radumardale/claude-lens/commit/be4633aed77c3f89d1102f9b332f2de55f36afd6))
* **tui:** preserve list selection when changing categories via sidebar ([4500d3b](https://github.com/radumardale/claude-lens/commit/4500d3bcd18b9a257965886a0895902ee8703d4a))
* **tui:** remove top padding for consistent header position ([dac06e6](https://github.com/radumardale/claude-lens/commit/dac06e6383adec6e16056f821951460299a4d540))
* update Buy Me a Coffee link ([b641f39](https://github.com/radumardale/claude-lens/commit/b641f391caf84a9fbbeb4ecddc53232f85663ac0))

### Refactoring

* extract string utilities from table formatter ([9b0dd3b](https://github.com/radumardale/claude-lens/commit/9b0dd3b67255291ea736cb7f6954a910b6de6e13))
* extract version to shared utility for dynamic display ([c81adfa](https://github.com/radumardale/claude-lens/commit/c81adfa42dfcb87111bba2bb0915605952d11c3a))
* **tui:** simplify delete - disabled items are the trash ([ce84536](https://github.com/radumardale/claude-lens/commit/ce845368082b42e1a97aa26b60f240748f628a7a))

### Documentation

* add Buy Me a Coffee link to author section ([0d85291](https://github.com/radumardale/claude-lens/commit/0d85291f745f4f96b5fa26f6f69c2b345e607bbe))
* add community files for public release ([d86fd47](https://github.com/radumardale/claude-lens/commit/d86fd47c4d6ebbe797ba86af578d4d578f917df6))
* add test coverage plan for prioritized testing ([1596eb1](https://github.com/radumardale/claude-lens/commit/1596eb178262e74e0297f3d5ba6ab97791a33463))
* move plugin navigation enhancement to GitHub issue [#1](https://github.com/radumardale/claude-lens/issues/1) ([46e5519](https://github.com/radumardale/claude-lens/commit/46e55199d9f486a91572b31c52f14abda6378892))
* move plugin skill toggle proposal to GitHub issue [#2](https://github.com/radumardale/claude-lens/issues/2) ([1526666](https://github.com/radumardale/claude-lens/commit/152666600f3ae6529f496c3af0cfa1382def7a04))
* remove completed implementation plan ([c536d2a](https://github.com/radumardale/claude-lens/commit/c536d2af73055fee4c0741e58830d6f84f86d126))
* update CLAUDE.md dev examples ([d33ef7c](https://github.com/radumardale/claude-lens/commit/d33ef7c3035618cca58a30621e423d2c83b5aec0))
* update demo recording ([7485f63](https://github.com/radumardale/claude-lens/commit/7485f632ff6a8949078ccc45c6ce62576b0d9616))
* update demo recording files ([6b48f18](https://github.com/radumardale/claude-lens/commit/6b48f186d9402e6708499de520646b5069a69b0d))
* update README for TUI-first default ([3bacbe5](https://github.com/radumardale/claude-lens/commit/3bacbe51dd6d5eaf2238055c7c29bbcd9080d917))
* update README for v0.2.0 - npx usage and delete feature ([693ba0a](https://github.com/radumardale/claude-lens/commit/693ba0aea927f3301efe93f58095c3df13ad6b48))
* update UI-NAVIGATION.md with all views and shortcuts ([f1a637a](https://github.com/radumardale/claude-lens/commit/f1a637a1bdeedf999f63070cd37e5a6950341856))
* use absolute URL for demo gif (fixes npm display) ([5a2ffdb](https://github.com/radumardale/claude-lens/commit/5a2ffdb9e1eadca0b2fa546ebcdc7a4d69955c0f))

# Changelog

All notable changes to this project will be documented in this file.
