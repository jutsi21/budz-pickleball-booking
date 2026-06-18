import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from '../lib/firebase.js';

const auth = getAuth(app);

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-navy-900 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-navy-800 p-8 rounded-xl border border-white/10 shadow-lg">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src="/images/logo.png"
              alt="Budz Pickleball Logo"
              className="h-20 w-auto object-contain drop-shadow-lg"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 text-center">Admin Login</h2>
          <p className="text-white/40 text-sm text-center mb-6">Sign in to manage bookings</p>
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 outline-none focus:border-gold-500/50 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 outline-none focus:border-gold-500/50 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full py-2.5 bg-gold-500 text-navy-900 font-bold rounded-lg hover:bg-gold-400 transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="bg-navy-800 px-4 py-2 flex justify-between items-center border-b border-white/10">
        <img
          src="/images/logo.png"
          alt="Budz Pickleball"
          className="h-10 w-auto object-contain"
        />
        <button onClick={() => signOut(auth)} className="text-sm text-white/70 hover:text-white transition-colors">Logout</button>
      </div>
      {children}
    </>
  );
}
