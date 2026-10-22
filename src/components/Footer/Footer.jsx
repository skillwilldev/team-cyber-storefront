import { Link } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { FacebookIcon, InstagramIcon, TikTokIcon, TwitterIcon } from '../icons/icons';
import Logo from '../Logo/Logo';
import './Footer.css';

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
  const { t } = useTranslation();

  const SERVICES = [
    t('footer.bonusProgram'),
    t('footer.giftCards'),
    t('footer.creditPayment'),
    t('footer.serviceContracts'),
    t('footer.nonCashAccount'),
    t('footer.payment'),
  ];

  const ASSISTANCE = [
    t('footer.findOrder'),
    t('footer.deliveryTerms'),
    t('footer.exchangeReturn'),
    t('footer.guarantee'),
    t('footer.faq'),
    t('footer.siteTerms'),
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__about">
            <div>
              <Link to="/" className="footer__logo" aria-label={t('header.home')}>
                <Logo />
              </Link>
              <p>{t('footer.description')}</p>
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
          <LinkList title={t('footer.services')} items={SERVICES} />
          <LinkList title={t('footer.assistance')} items={ASSISTANCE} />
        </div>
      </div>
    </footer>
  );
}
