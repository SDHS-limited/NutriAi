import { Outlet, NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', icon: HomeIcon, label: '홈' },
  { to: '/meal', icon: ForkIcon, label: '식단' },
  { to: '/analysis', icon: ChartIcon, label: '분석' },
  { to: '/chat', icon: ChatIcon, label: 'AI 상담' },
  { to: '/profile', icon: UserIcon, label: '프로필' },
];

export default function Layout() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* 바텀 탭 바 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-purple-100 px-2 py-2 z-50">
        <div className="flex justify-around items-center">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} filled={isActive} />
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

// 아이콘 컴포넌트
function HomeIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      <path d="M3 12L12 3l9 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ForkIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M18 8h1a4 4 0 010 8h-1" strokeLinecap="round" />
      <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6" y1="1" x2="6" y2="4" strokeLinecap="round" />
      <line x1="10" y1="1" x2="10" y2="4" strokeLinecap="round" />
      <line x1="14" y1="1" x2="14" y2="4" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
      <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
