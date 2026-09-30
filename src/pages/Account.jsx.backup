import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../firebase.js";

export default function Account() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice("");

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      setNotice(error.code || error.message || "Authentication failed.");
    }
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center">Loading...</main>;
  }

  if (user) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] px-5 py-16 text-[#111]">
        <div className="mx-auto max-w-xl border border-black/10 bg-white p-8 md:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">FX Fashion Gallery</p>
          <h1 className="mt-3 text-3xl font-semibold">My Account</h1>
          <p className="mt-5 text-sm text-black/60">{user.email}</p>

          <button
            onClick={() => signOut(auth)}
            className="mt-8 w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
          >
            Logout
          </button>

          <Link
            to="/shop"
            className="mt-3 block border border-black/15 py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-16 text-[#111]">
      <div className="mx-auto max-w-md border border-black/10 bg-white p-8 md:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">FX Fashion Gallery</p>
        <h1 className="mt-3 text-3xl font-semibold">
          {mode === "login" ? "My Account" : "Create Account"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            autoComplete="email"
            required
            className="w-full border border-black/15 px-4 py-4 text-sm outline-none focus:border-black"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            className="mt-3 w-full border border-black/15 px-4 py-4 text-sm outline-none focus:border-black"
          />

          {notice && (
            <p className="mt-4 text-xs text-red-600">{notice}</p>
          )}

          <button
            type="submit"
            className="mt-5 w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
          >
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setNotice("");
          }}
          className="mt-5 w-full text-[10px] font-bold uppercase tracking-[0.15em] text-black/55"
        >
          {mode === "login" ? "Create a new account" : "Already have an account? Login"}
        </button>
      </div>
    </main>
  );
}
