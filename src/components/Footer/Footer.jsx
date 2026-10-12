import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, TikTokIcon, TwitterIcon } from '../icons/icons';
import Logo from '../Logo/Logo';
import './Footer.css';

const SERVICES = [
  'Bonus program',
  'Gift cards',
  'Credit and payment',
  'Service contracts',
  'Non-cash account',
  'Payment',
];

const ASSISTANCE = [
  'Find an order',
  'Terms of delivery',
  'Exchange and return of goods',
  'Guarantee',
  'Frequently asked questions',
  'Terms of use of the site',
];

const SOCIALS = [
  { label: 'Twitter', Icon: TwitterIcon },
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'TikTok', Icon: TikTokIcon },
  { label: 'Instagram', Icon: InstagramIcon },
];

function LinkList({ title, items }) {
  return (
    <div className="footer__col">
      <h3 className="footer__title">{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <a href="#">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__about">
            <div>
              <Link to="/" className="footer__logo" aria-label="Cyber — home">
                <Logo />
              </Link>
              <p>We are a residential interior design firm located in Portland. Our boutique-studio offers more than</p>
            </div>
            <ul className="footer__socials">
              {SOCIALS.map(({ label, Icon }) => (
                <li key={label}>
                  <a href="#" aria-label={label}>
                    <Icon size={24} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <LinkList title="Services" items={SERVICES} />
          <LinkList title="Assistance to the buyer" items={ASSISTANCE} />
        </div>
      </div>
    </footer>
  );
}
