import './QueryError.css';

export default function QueryError({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="query-error" role="alert">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
