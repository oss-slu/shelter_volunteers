import {faHome} from '@fortawesome/free-solid-svg-icons';
function DashboardSelection({ user, dashboards, onSelectDashboard }){
  return(
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f8ff 0%, #ffffff 50%, #faf0ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '48rem', width: '100%' }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
        }}>
          <img
            src={user.picture}
            alt={user.name}
            style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                border: '2px solid #e5e7eb'
            }}
          />
          <div style={{ textAlign: 'left' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0'
            }}>
              Welcome, {user.name}!
            </h2>
            <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0'
            }}>
              {user.email}
            </p>
          </div>
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          Choose Your <span style={{ color: '#2563eb' }}>Dashboard</span>
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#6b7280',
          marginBottom: '3rem',
          lineHeight: '1.6'
        }}>
          {dashboards.length === 1 
          ? "You have access to one dashboard. Click below to continue."
          : `You have access to ${dashboards.length} dashboards. Select one to get started.`
          }
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: dashboards.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '48rem',
          margin: '0 auto'
        }}>
          {dashboards.map((dashboard) => {
          const Icon = faHome;
          return (<button
            key={`${dashboard.type}-${dashboard.id}`}
            onClick={() => onSelectDashboard(dashboard)}
            style={{
                padding: '2rem',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(0)'
            }}
            onMouseOver={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
            }}
            onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
            }}
            onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            <Icon 
              size={48} 
              style={{ 
                color: '#2563eb', 
                marginBottom: '1rem',
                display: 'block',
                margin: '0 auto 1rem'
              }} 
            />
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              {dashboard.name}
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              lineHeight: '1.5',
              margin: '0'
            }}>
              {dashboard.type === 'volunteer' && 'Access your volunteer activities and find new opportunities'}
              {dashboard.type === 'shelter' && 'Manage animals, volunteers, and shelter operations'}
              {dashboard.type === 'admin' && 'System administration and user management'}
            </p>
          </button>
          );

        })}
        </div>  
        {dashboards.length > 1 && (
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginTop: '2rem'
          }}>
            You can switch between dashboards anytime using the dropdown menu
          </p>
        )}
      </div>
    </div>
  );
}
export default DashboardSelection;