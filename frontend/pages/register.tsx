import { useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName })
      });
      setMessage('Registration complete. Please login.');
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold">Register</h1>
      <div className="mt-4 grid gap-4 max-w-md">
        <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Display name" className="rounded bg-gray-800 p-2" />
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="rounded bg-gray-800 p-2" />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="rounded bg-gray-800 p-2" />
        <button onClick={handleRegister} className="rounded bg-indigo-500 px-4 py-2">Register</button>
        {message && <p className="text-sm text-gray-300">{message}</p>}
      </div>
    </Layout>
  );
}
