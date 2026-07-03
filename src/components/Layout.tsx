import { NavLink, Outlet } from 'react-router-dom';
import { EthicalBanner } from './EthicalBanner';

interface Props {
  vaultPath: string | null;
}

export function Layout({ vaultPath }: Props) {
  return (
    <div className="app-shell">
      <EthicalBanner />
      <div className="app-main">
        <aside className="app-sidebar">
          <div className="sidebar-brand">
            <small>KM-it-ops</small>
            Graduate&apos;s Guide
          </div>
          {vaultPath ? (
            <>
              <NavLink to="/today" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Today
              </NavLink>
              <NavLink to="/queue" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Queue
              </NavLink>
              <NavLink to="/followups" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Follow-ups
              </NavLink>
              <NavLink to="/evaluate" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Evaluate
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Settings
              </NavLink>
            </>
          ) : (
            <NavLink to="/vault/import" className="nav-link active">
              Import vault
            </NavLink>
          )}
        </aside>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
