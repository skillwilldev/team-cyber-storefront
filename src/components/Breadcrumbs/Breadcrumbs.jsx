import { Link } from 'react-router-dom';
import { ChevronIcon } from '../icons/icons';
import './Breadcrumbs.css';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs only-desktop" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label}>
              {item.to && !last ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              )}
              {!last && <ChevronIcon direction="right" size={16} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
