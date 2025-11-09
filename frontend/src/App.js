// frontend/src/App.js
import React, { useEffect, useState } from 'react';
const API = process.env.REACT_APP_API_URL || '';

function App() {
  const [items, setItems] = useState({});
  const [balance, setBalance] = useState('0');

  useEffect(()=> {
    fetch(API + '/api/items').then(r=>r.json()).then(setItems);
    fetch(API + '/api/wallet').then(r=>r.json()).then(d=> setBalance(d.balance || '0'));
  }, []);

  const login = async () => {
    await fetch(API + '/api/login');
    const d = await (await fetch(API + '/api/wallet')).json();
    setBalance(d.balance || '0');
    alert('Logged in as player');
  }

  const setBal = async () => {
    const b = prompt('New balance (e.g. 10000):', '10000');
    if(!b) return;
    await fetch(API + '/api/wallet', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({balance: b})});
    const d = await (await fetch(API + '/api/wallet')).json();
    setBalance(d.balance || '0');
  }

  const buy = async (id) => {
    const r = await fetch(API + '/api/buy', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({item: id})});
    const j = await r.json();
    if(j.flag) {
      alert('FLAG: ' + j.flag);
    } else {
      alert(JSON.stringify(j));
    }
  }

  return (
    <div style={{maxWidth:800, margin:'40px auto', fontFamily:'Arial'}}>
      <h1>Mini Shop</h1>
      <p>Balance: <b>{balance}</b></p>
      <button onClick={login}>Login as player</button>
      <button onClick={setBal} style={{marginLeft:10}}>Wallet (Top-up)</button>
      <hr />
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
        { Object.keys(items).map(k => {
            const it = items[k];
            return (
              <div key={k} style={{padding:12, border:'1px solid #ddd', borderRadius:6}}>
                <h3>{it.name}</h3>
                <p>{it.price} SAR</p>
                <button onClick={()=> buy(k)}>Buy</button>
              </div>
            )
        })}
      </div>
    </div>
  );
}

export default App;
