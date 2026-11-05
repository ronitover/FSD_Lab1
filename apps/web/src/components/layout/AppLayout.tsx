import * as m from 'motion/react-m';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { HOME_BY_ROLE, useAuth } from '../../auth/context.ts';
import { ROLE_LABELS } from '../../lib/labels.ts';
import { pillSpring } from '../motion/variants.ts';
import { buttonClasses } from '../ui/styles.ts';
import { useToast } from '../ui/toast-context.ts';
import { Logo } from './Logo.tsx';
import { NAV_BY_ROLE } from './nav.ts';
import { ThemeToggle } from './ThemeToggle.tsx';

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'text-cream' : 'text-forest/75 hover:bg-forest/5 hover:text-forest'
  }`;

/** A nav link whose dark highlight slides over from the previous page's link. */
function NavItem({
  to,
  label,
  pill,
  onClick,
}: {
  to: string;
  label: string;
  /** Links sharing a pill id share one sliding highlight. */
  pill: string;
  onClick?: () => void;
}) {
  return (
    <NavLink to={to} end className={navLinkClasses} onClick={onClick}>
      {({ isActive }) => (
        <>
          {isActive && (
            <m.span
              layoutId={pill}
              className="absolute inset-0 rounded-full bg-forest"
              transition={pillSpring}
            />
          )}
          <span className="relative">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function AppLayout() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const me = auth.status === 'signed-in' ? auth.me : null;
  const navItems = me ? NAV_BY_ROLE[me.role] : [];

  async function signOut() {
    setMenuOpen(false);
    await auth.signOut();
    toast.show('You have signed out.', 'info');
    void navigate('/');
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-forest px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-forest/10 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <Logo to={me ? HOME_BY_ROLE[me.role] : '/'} />

          {me && (
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <NavItem key={item.to} to={item.to} label={item.label} pill="nav-pill" />
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {me ? (
              <>
                <Link
                  to="/account"
                  className="hidden rounded-xl px-2 py-1 text-right hover:bg-forest/5 md:block"
                  aria-label={`Your profile (${me.displayName})`}
                >
                  <p className="text-sm font-semibold text-forest">{me.displayName}</p>
                  <p className="text-xs text-forest/55">{ROLE_LABELS[me.role]} · Profile</p>
                </Link>
                <div className="hidden md:block">
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className={buttonClasses('secondary', 'sm')}
                  >
                    Sign out
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  className="flex size-10 items-center justify-center rounded-full border border-forest/15 text-forest md:hidden"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    {menuOpen ? (
                      <path d="M6 6l12 12M18 6 6 18" />
                    ) : (
                      <path d="M4 7h16M4 12h16M4 17h16" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              auth.status === 'signed-out' && (
                <>
                  <Link to="/signin" className={buttonClasses('ghost', 'md')}>
                    Sign in
                  </Link>
                  <div className="hidden sm:block">
                    <Link to="/signup" className={buttonClasses('primary', 'md')}>
                      Get started
                    </Link>
                  </div>
                </>
              )
            )}
          </div>
        </div>

        {me && menuOpen && (
          <m.nav
            id="mobile-menu"
            aria-label="Main"
            className="overflow-hidden border-t border-forest/10 px-4 py-3 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <p className="px-4 pb-2 text-sm text-forest/60">
              Signed in as <strong className="text-forest">{me.displayName}</strong> (
              {ROLE_LABELS[me.role]})
            </p>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  pill="nav-pill-mobile"
                  onClick={() => setMenuOpen(false)}
                />
              ))}
              <NavItem
                to="/account"
                label="Profile"
                pill="nav-pill-mobile"
                onClick={() => setMenuOpen(false)}
              />
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-full px-4 py-2 text-left text-sm font-semibold text-forest/75 hover:bg-forest/5"
              >
                Sign out
              </button>
            </div>
          </m.nav>
        )}
      </header>

      <main id="main" className="flex-1">
        {/* Each screen fades and rises in. Keyed by path, so changing filters doesn't replay it. */}
        <m.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </m.div>
      </main>

      <footer className="border-t border-forest/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-forest/55 sm:px-6 lg:px-10">
          <p>RePlate · Good food deserves another plate.</p>
          <p>Map data © OpenStreetMap contributors</p>
        </div>
      </footer>
    </div>
  );
}
