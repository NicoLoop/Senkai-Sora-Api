/**
 * Rewrites and sanitizes HTML for iframe proxying
 * - Injects <base href="..."> for relative resources (CSS, JS, fonts)
 * - Removes CSP meta tags
 * - Injects frame-busting protection script
 */
function rewritePlayerHtml(rawHtml, targetUrl) {
  if (!rawHtml || typeof rawHtml !== 'string') return rawHtml;

  let origin = '';
  try {
    const parsed = new URL(targetUrl);
    origin = parsed.origin;
  } catch (e) {
    origin = '';
  }

  let html = rawHtml;

  // 1. Remove client-side CSP meta tags
  html = html.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
  html = html.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');

  // 2. Prepare injection script & base tag
  const baseTag = origin ? `<base href="${origin}/" />` : '';
  const frameBusterProtection = `
    <!-- AnimeStreamHindi Frame Protection -->
    ${baseTag}
    <script>
      (function() {
        try {
          // Neutralize window.top frame buster
          Object.defineProperty(window, 'top', {
            get: function() { return window.self; },
            set: function() {}
          });
          Object.defineProperty(window, 'parent', {
            get: function() { return window.self; },
            set: function() {}
          });
        } catch(e) {}
      })();
    </script>
  `;

  // 3. Inject right after <head> or at start
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/(<head[^>]*>)/i, `$1\n${frameBusterProtection}`);
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/(<html[^>]*>)/i, `$1\n<head>${frameBusterProtection}</head>`);
  } else {
    html = `${frameBusterProtection}\n${html}`;
  }

  return html;
}

module.exports = {
  rewritePlayerHtml
};
