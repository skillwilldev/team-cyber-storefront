import { ChevronIcon } from '../icons/icons';
import './Pagination.css';

function getPages(page, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, '…', total];
  if (page >= total - 2) return [1, '…', total - 2, total - 1, total];

  return [1, '…', page - 1, page, page + 1, '…', total];
}

export default function Pagination({ page, total, onChange }) {
  if (total <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__arrow"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronIcon direction="left" size={20} />
      </button>

      {getPages(page, total).map((item, i) =>
        item === '…' ? (
          <span key={`dots-${i}`} className="pagination__dots" aria-hidden="true">
            ....
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className="pagination__btn"
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="pagination__arrow"
        aria-label="Next page"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
      >
        <ChevronIcon direction="right" size={20} />
      </button>
    </nav>
  );
}
