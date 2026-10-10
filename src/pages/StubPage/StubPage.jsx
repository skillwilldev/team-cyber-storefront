import { Link } from 'react-router-dom';
import './StubPage.css';

export default function StubPage({ title, text = 'This page is not part of the design yet.' }) {
  return (
    <div className="container stub">
      <h1>{title}</h1>
      <p>{text}</p>
      <Link to="/">Back to catalog</Link>
    </div>
  );
}
