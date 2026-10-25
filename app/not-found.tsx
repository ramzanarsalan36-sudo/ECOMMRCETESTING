import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#2B1B17' }}>404 - Page Not Found</h2>
      <p style={{ color: '#6A5F56', marginTop: '10px' }}>The page you are looking for does not exist.</p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          background: '#8C4320',
          color: '#ffffff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 700
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
