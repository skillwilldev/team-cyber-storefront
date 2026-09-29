import { StarIcon } from '../icons/icons';
import './Stars.css';

export default function Stars({ value, size = 20 }) {
  const filled = Math.round(value);

  return (
    <span className="stars" role="img" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} size={size} filled={i < filled} className={i < filled ? undefined : 'stars__empty'} />
      ))}
    </span>
  );
}
