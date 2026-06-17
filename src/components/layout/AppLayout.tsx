import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Ana Sayfa', end: true },
  { to: '/library', label: 'Kütüphane' },
  { to: '/editor', label: 'Editör' },
]

export function AppLayout() {
  return (
    <div className="min-h-screen hp-layout">
      <header className="sticky top-0 z-40 border-b-[3px] border-[#0d0d0d] bg-[#f5f5f0]">
        <div className="flex w-full items-center justify-between px-6 py-3 lg:px-12">
          <NavLink to="/" className="text-sm font-black tracking-tight text-[#0d0d0d]">
            SYNC<span className="text-[#ff4757]">LYRICS</span>
          </NavLink>

          <nav className="flex gap-0">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition',
                    isActive
                      ? 'bg-[#0d0d0d] text-[#00ffc8]'
                      : 'text-[#0d0d0d] hover:bg-[#0d0d0d]/10',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
