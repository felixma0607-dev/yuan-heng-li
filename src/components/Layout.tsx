import { NavLink, Outlet } from 'react-router-dom'
import { DISCLAIMER } from '../lib/copy.ts'

const LINKS = [
  { to: '/almanac', label: '通勝' },
  { to: '/meihua', label: '梅花' },
  { to: '/coins', label: '金錢' },
  { to: '/hexagrams', label: '卦辭' },
]

export function Layout() {
  return (
    <div className="shell">
      <header className="top">
        <div className="brand-block">
          <NavLink to="/" className="brand" end>
            元亨利
          </NavLink>
          <p className="tagline">免費易數小工具</p>
        </div>
        <nav aria-label="工具">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-foot">{DISCLAIMER}</footer>
    </div>
  )
}
