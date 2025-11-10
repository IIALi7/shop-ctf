// frontend/src/App.js
import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || '';

function App() {
  const [items, setItems] = useState({});
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const it = await fetch(API + '/api/items', { credentials: 'include' }).then(r => r.json());
        setItems(it);
        const w = await fetch(API + '/api/wallet', { credentials: 'include' }).then(r => r.json());
        setBalance(w.balance || '0');
      } catch (e) {
        console.error(e);
        alert('API not reachable. Check REACT_APP_API_URL and backend.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async () => {
    await fetch(API + '/api/login', { credentials: 'include' });
    const w = await fetch(API + '/api/wallet', { credentials: 'include' }).then(r => r.json());
    setBalance(w.balance || '0');
    alert('Logged in as player');
  };

  const topup = async () => {
    const b = prompt('New balance (e.g. 10000):', '10000');
    if (!b) return;
    await fetch(API + '/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ balance: b })
    });
    const w = await fetch(API + '/api/wallet', { credentials: 'include' }).then(r => r.json());
    setBalance(w.balance || '0');
  };

  const buy = async (id) => {
    const r = await fetch(API + '/api/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ item: id })
    });
    const j = await r.json();
    if (j.flag) {
      alert('FLAG: ' + j.flag);
    } else {
      alert(j.msg || JSON.stringify(j));
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Inter, Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Mini Shop</h1>
        <div>
          <button onClick={login} style={{ padding: '8px 14px', marginRight: 8, borderRadius: 6, border: '1px solid #ddd' }}>
            Login as player
          </button>
          <button onClick={topup} style={{ padding: '8px 14px', borderRadius: 6, background: '#4f46e5', color: '#fff', border: 'none' }}>
            Wallet (Top-up)
          </button>
        </div>
      </header>

      <p style={{ marginTop: 0, color: '#334155' }}>
        Balance: <b>{balance}</b> SAR
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {Object.entries(items).map(([id, it]) => (
          <div key={id} style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff' }}>
            <h3 style={{ marginTop: 0 }}>{it.name}</h3>
            <p style={{ color: '#475569', margin: '8px 0' }}>{it.price} SAR</p>
            <button
              onClick={() => buy(id)}
              style={{ padding: '8px 14px', borderRadius: 6, background: '#0ea5e9', color: '#fff', border: 'none' }}
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: 24, color: '#64748b', fontSize: 12 }}>
        API: <code>{API || '(same origin)'}</code>
      </footer>
    </div>
  );
}

export default App;
