import { useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('accessToken', data.accessToken);
      setMessage('Logged in! Access token saved to localStorage.');
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold">Login</h1>
      <div className="mt-4 grid gap-4 max-w-md">
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="rounded bg-gray-800 p-2" />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="rounded bg-gray-800 p-2" />
        <button onClick={handleLogin} className="rounded bg-indigo-500 px-4 py-2">Login</button>
        {message && <p className="text-sm text-gray-300">{message}</p>}
      </div>
    </Layout>
  );
}
