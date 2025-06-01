import { useState } from 'react';

export const Header = ({ user, dashboards, currentDashboard, onSelectDashboard, onToggleSidebar, onLogout }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '0',
      zIndex: 30
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          <Menu size={20} />
        </button>
        
        <DashboardSelector
          dashboards={dashboards}
          currentDashboard={currentDashboard}
          onSelectDashboard={onSelectDashboard}
        />
      </div>
      
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: '#374151',
            borderRadius: '0.5rem'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <img
            src={user.picture}
            alt={user.name}
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              border: '1px solid #e5e7eb'
            }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{user.name}</span>
        </button>
        
        {userMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            marginTop: '0.25rem',
            minWidth: '12rem'
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #f3f4f6',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {user.email}
            </div>
            <button
              onClick={() => {
                setUserMenuOpen(false);
                onLogout();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                color: '#374151',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};