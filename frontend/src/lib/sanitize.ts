import DOMPurify from 'dompurify';

/**
 * Sanitize and clean HTML content from WooCommerce descriptions
 * Removes malicious scripts while preserving formatting
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                   'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style', 'data-*'],
    KEEP_CONTENT: true,
  });
}

/**
 * Strip all HTML tags for plain text display
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}
