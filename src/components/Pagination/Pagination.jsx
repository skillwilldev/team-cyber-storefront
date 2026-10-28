import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronIcon } from '../icons/icons';
import './Pagination.css';

function getPages(page, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, '…', total];
  if (page >= total - 2) return [1, '…', total - 2, total - 1, total];

  return [1, '…', page - 1, page, page + 1, '…', total];
}

/**
 * Page numbers are real links (<a href="/?page=2">), so search engines can follow them to every page of the catalog.
 * `hrefFor(page)` returns the target of a page (a router "to" value); a normal click is handled by React Router
 * without a reload, Ctrl/Cmd-click opens the page in a new tab.
 * Without `hrefFor` the old behaviour is kept: buttons that call `onChange(page)`.
 */
export default function Pagination({ page, total, onChange, hrefFor }) {
  const { t } = useTranslation();

  if (total <= 1) return null;

  const arrow = (target, direction, label, disabled) => {
    const icon = <ChevronIcon direction={direction} size={20} />;
    if (disabled) {
      return (
        <span className="pagination__arrow pagination__arrow--disabled" aria-hidden="true">
          {icon}
        </span>
      );
    }
    if (hrefFor) {
      return (
        <Link
          to={hrefFor(target)}
          className="pagination__arrow"
          aria-label={label}
          rel={direction === 'left' ? 'prev' : 'next'}
        >
          {icon}
        </Link>
      );
    }

    return (
      <button type="button" className="pagination__arrow" aria-label={label} onClick={() => onChange(target)}>
        {icon}
      </button>
    );
  };

  return (
    <nav className="pagination" aria-label={t('a11y.pagination')}>
      {arrow(page - 1, 'left', t('a11y.previousPage'), page === 1)}

      {getPages(page, total).map((item, i) => {
        if (item === '…') {
          return (
            <span key={`dots-${i}`} className="pagination__dots" aria-hidden="true">
              ....
            </span>
          );
        }
        const common = {
          className: 'pagination__btn',
          'aria-current': item === page ? 'page' : undefined,
          'aria-label': t('a11y.page', { n: item }),
        };

        return hrefFor ? (
          <Link key={item} to={hrefFor(item)} {...common}>
            {item}
          </Link>
        ) : (
          <button key={item} type="button" onClick={() => onChange(item)} {...common}>
            {item}
          </button>
        );
      })}

      {arrow(page + 1, 'right', t('a11y.nextPage'), page === total)}
    </nav>
  );
}
