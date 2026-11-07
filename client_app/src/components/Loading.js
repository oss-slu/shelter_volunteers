function Loading(){
  return (
    <div style={{
        minHeight: '100vh',
        background: 'var(--main-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '24rem' }}>
        <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid var(--brand)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
        }} />
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--text-strong)',
          marginBottom: '0.5rem'}}>
          Loading ...
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Please wait while we fetch your data. This may take a moment.
        </p>
        <style>{`
            @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
            }
        `}</style>
      </div>
    </div>
  );
}

export default Loading;