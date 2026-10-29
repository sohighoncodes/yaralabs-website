import lightLogo from '../public/brand/logo.svg?raw';
import darkLogo from '../public/brand/logo-dark.svg?raw';

export default function BrandLogo({ dark = false, responsive = true, className = '' }) {
  return <a href="/" aria-label="Yara Labs home" className={`brand-link${responsive ? ' brand-link--responsive' : ''} ${className}`}>
    {/* Inline the supplied SVG so its live wordmark can use the page's loaded fonts. */}
    <span className="brand-lockup" aria-hidden="true" dangerouslySetInnerHTML={{ __html: dark ? darkLogo : lightLogo }} />
    {responsive && <img className="brand-symbol" src={`/brand/logo-symbol${dark ? '-light' : ''}.svg`} width="28" height="28" alt="" aria-hidden="true" />}
  </a>;
}
