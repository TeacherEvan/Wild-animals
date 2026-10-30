/**
 * Global error logging.
 *
 * Kept in a self-hosted file rather than an inline <script> because the page
 * ships `script-src 'self'`; inline scripts are blocked by CSP and fail silently.
 * Logging must never interfere with gameplay.
 */

window.addEventListener('error', (event) => {
  console.error('[GlobalError]', event.message, 'at', `${event.filename}:${event.lineno}`);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UnhandledRejection]', event.reason);
});
