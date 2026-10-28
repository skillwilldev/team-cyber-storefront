import { useState } from 'react';
import { buildImageProps } from '../../lib/image';
import { ImageIcon } from '../icons/icons';
import './ProductImage.css';

/**
 * Shows the product image; if the API has no image (null) or the image fails to load,
 * a neutral placeholder is shown instead. When the API starts returning a working URL,
 * the picture simply appears — nothing to change here.
 *
 * Optional `widths` + `sizes` turn on responsive, resized WebP versions (see lib/image.js):
 *   <ProductImage src={url} widths={[160, 320, 480]} sizes="160px" />
 * If the resized version fails to load, the original URL is tried; only if that fails too, the placeholder appears.
 */
export default function ProductImage({ src, alt = '', className = '', widths, sizes, ...rest }) {
  // remember WHICH url failed and how many times, so a new url (another product / fixed image) is tried again
  // level 0 = resized version, 1 = original url, 2 = placeholder
  const [failure, setFailure] = useState({ src: null, level: 0 });
  const optimized = buildImageProps(src, widths);
  const level = failure.src === src ? failure.level : 0;
  // with a resized version there are two attempts (resized, original); without it only one
  const lastLevel = optimized ? 2 : 1;

  if (!src || level >= lastLevel) {
    // alt="" means the image is decorative → hide the placeholder from screen readers as well
    const a11y = alt === '' ? { 'aria-hidden': true } : { role: 'img', 'aria-label': alt };

    return (
      <span className={`product-image-placeholder ${className}`.trim()} {...a11y}>
        <ImageIcon size={40} />
      </span>
    );
  }

  const useOptimized = optimized && level === 0;

  return (
    <img
      className={className}
      src={useOptimized ? optimized.src : src}
      srcSet={useOptimized ? optimized.srcSet : undefined}
      sizes={useOptimized ? sizes : undefined}
      alt={alt}
      onError={() => setFailure({ src, level: level + 1 })}
      {...rest}
    />
  );
}
