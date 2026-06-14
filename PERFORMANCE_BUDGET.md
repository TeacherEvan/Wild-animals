# Performance Budget

## Budget Targets

| Metric | Budget | Current Status |
|--------|--------|----------------|
| Total JS (gzipped) | < 50 KB | ~15 KB (game-core.js gzipped) |
| Total CSS (gzipped) | < 20 KB | ~12 KB (styles.css gzipped) |
| HTML (gzipped) | < 5 KB | ~2 KB |
| LCP (Largest Contentful Paint) | ≤ 2.5s | TBD |
| INP (Interaction to Next Paint) | ≤ 200ms | TBD |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | TBD |
| Total Page Weight | < 500 KB | ~300 KB (with audio) |
| Time to Interactive | < 3.5s (4G) | TBD |

## Optimization Strategies

### JavaScript
- [x] Extracted inline JS to separate ES module (game-core.js)
- [x] Minimal global namespace pollution
- [x] Efficient DOM caching
- [x] requestAnimationFrame for score updates
- [x] Debounce/throttle utilities
- [ ] Code splitting for interactive features (lazy-load)
- [ ] Minify for production
- [ ] Tree-shaking unused code

### CSS
- [x] Custom properties for consistency
- [x] GPU acceleration hints (will-change, transform: translateZ(0))
- [x] Reduced motion support
- [x] Efficient animations (transform/opacity only)
- [ ] Minify for production
- [ ] Remove unused CSS
- [ ] Critical CSS inlining

### Images/Audio
- [ ] Convert audio to WebP/OPUS where possible
- [ ] Use audio sprites for UI sounds
- [ ] Lazy-load non-critical audio
- [ ] Preload only critical sounds

### Loading Strategy
- [x] Preload critical scripts
- [x] Defer non-critical scripts
- [ ] Add resource hints (dns-prefetch, preconnect)
- [ ] Service worker for offline support

## Monitoring

Run Lighthouse CI in GitHub Actions:
```yaml
# Add to .github/workflows/ci.yml
- name: Run Lighthouse CI
  run: npx lhci autorun
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

Budgets enforced via lighthouserc.js:
```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8080'],
      numberOfRuns: 3,
      settings: {
        budget: {
          resourceSizes: [
            { resourceType: 'total', budget: 500 },
            { resourceType: 'script', budget: 100 },
            { resourceType: 'css', budget: 50 },
            { resourceType: 'image', budget: 200 },
            { resourceType: 'font', budget: 50 },
          ],
          resourceCounts: [
            { resourceType: 'third-party', budget: 10 },
          ],
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

## Current File Sizes (Uncompressed)

| File | Size | Gzipped (est.) |
|------|------|----------------|
| game-core.js | 53 KB | ~15 KB |
| styles.css | 47 KB | ~12 KB |
| interactive-features.js | 31 KB | ~9 KB |
| real-animal-sounds.js | 9 KB | ~3 KB |
| animal-sounds.js | 1 KB | < 1 KB |
| index.html | 7 KB | ~2 KB |
| **Total** | **148 KB** | **~43 KB** |

Audio files (not counted in initial load):
- 80+ audio files ranging from 1KB to 65MB
- Most are WAV files - consider converting to MP3/OGG for web delivery

## Recommendations

1. **Enable compression** (Gzip/Brotli) on server - reduces JS/CSS by ~70%
2. **Minify assets** for production - reduces by ~20-30%
3. **Convert WAV to MP3/OGG** - reduces audio by ~80-90%
4. **Add Service Worker** - enables offline and faster repeat visits
5. **Lazy-load interactive-features.js** - only load when habitat/sounds modes selected
6. **Add performance monitoring** - web-vitals library in production