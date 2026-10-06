import { useState } from 'react';
import { ImageIcon } from '../icons/icons';
import './ProductImage.css';

/**
 * Shows the product image; if the API has no image (null) or the image fails to load,
 * a neutral placeholder is shown instead. When the API starts returning a working URL,
 * the picture simply appears — nothing to change here.
 */
export default function ProductImage({ src, alt = '', className = '', ...rest }) {
  // remember WHICH url failed, so a new url (another product / fixed image) is tried again
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    // alt="" means the image is decorative → hide the placeholder from screen readers as well
    const a11y = alt === '' ? { 'aria-hidden': true } : { role: 'img', 'aria-label': alt };

    return (
      <span className={`product-image-placeholder ${className}`.trim()} {...a11y}>
        <ImageIcon size={40} />
      </span>
    );
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailedSrc(src)} {...rest} />;
}
