import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../firebase.js";

export default function Account() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error) {
      const messages = {
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/email-already-in-use": "This email is already registered.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please try again later."
      };
      setNotice(messages[error.code] || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setNotice("Enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice("Password reset email sent. Please check your inbox.");
    } catch (error) {
      setNotice(error.code === "auth/user-not-found" ? "No account found with this email." : "Could not send reset email.");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f4ef]">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">Loading FX</div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-[#f5f4ef] px-5 py-10 text-[#111] md:px-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/fx-logo.png" alt="FX Fashion Gallery" className="h-10 w-auto" />
              <div className="leading-none">
                <div className="text-[16px] font-black tracking-[-0.04em]">FX FASHION</div>
                <div className="mt-1 text-[7px] tracking-[0.42em] text-black/45">GALLERY</div>
              </div>
            </Link>
            <button
              onClick={() => signOut(auth)}
              className="border border-black/15 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] transition hover:bg-black hover:text-white"
            >
              Logout
            </button>
          </div>

          <section className="grid overflow-hidden border border-black/10 bg-white md:grid-cols-[1.2fr_0.8fr]">
            <div className="p-8 md:p-14">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black/40">Your account</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Welcome back.</h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-black/55">{user.email}</p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <Link to="/shop" className="group border border-black/10 p-6 transition hover:bg-black hover:text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Shop collection</span>
                  <ArrowRight className="mt-8 transition-transform group-hover:translate-x-1" size={18} />
                </Link>
                <Link to="/cart" className="group border border-black/10 p-6 transition hover:bg-black hover:text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">View cart</span>
                  <ArrowRight className="mt-8 transition-transform group-hover:translate-x-1" size={18} />
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[#111] p-8 text-white md:p-14">
              <div>
                <ShieldCheck size={24} strokeWidth={1.4} />
                <h2 className="mt-8 text-2xl font-semibold">Your fashion space.</h2>
                <p className="mt-4 text-sm leading-7 text-white/55">Manage your account and continue shopping with FX Fashion Gallery.</p>
              </div>
              <p className="mt-12 text-[9px] uppercase tracking-[0.25em] text-white/35">FX Fashion Gallery</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#111]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#111] lg:block">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90"
            alt="FX Fashion Gallery"
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative flex h-full flex-col justify-between p-12 text-white xl:p-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/fx-logo.png" alt="FX" className="h-11 w-auto brightness-0 invert" />
              <div className="leading-none">
                <div className="text-[18px] font-black tracking-[-0.04em]">FX FASHION</div>
                <div className="mt-1 text-[7px] tracking-[0.45em] text-white/55">GALLERY</div>
              </div>
            </Link>

            <div className="max-w-lg">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">Modern fashion · Timeless style</p>
              <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.05em] xl:text-7xl">
                Dress your<br />next chapter.
              </h1>
              <p className="mt-7 max-w-md text-sm leading-7 text-white/65">
                Discover curated fashion for Men, Women and Kids at FX Fashion Gallery.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.22em] text-white/40">
              <span>Secure account</span>
              <span className="h-px w-8 bg-white/25" />
              <span>FX Fashion Gallery</span>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 md:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <img src="/fx-logo.png" alt="FX Fashion Gallery" className="h-10 w-auto" />
                <div className="leading-none">
                  <div className="text-[16px] font-black tracking-[-0.04em]">FX FASHION</div>
                  <div className="mt-1 text-[7px] tracking-[0.42em] text-black/45">GALLERY</div>
                </div>
              </Link>
            </div>

            <div className="mb-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-black/40">
                {mode === "login" ? "Member access" : "Join FX Fashion Gallery"}
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
                {mode === "login" ? "Welcome back." : "Create your account."}
              </h2>
              <p className="mt-4 text-sm leading-6 text-black/50">
                {mode === "login" ? "Sign in to continue your fashion journey." : "Create an account to make your shopping experience easier."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35" size={17} strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full border border-black/15 bg-white py-4 pl-12 pr-4 text-sm outline-none transition focus:border-black"
                />
              </div>

              <label className="mb-2 mt-5 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35" size={17} strokeWidth={1.5} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  className="w-full border border-black/15 bg-white py-4 pl-12 pr-12 text-sm outline-none transition focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {mode === "login" && (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-[10px] text-black/50">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 accent-black"
                    />
                    Remember me
                  </label>
                  <button type="button" onClick={handleForgotPassword} className="text-[10px] font-bold uppercase tracking-[0.12em] underline underline-offset-4">
                    Forgot password?
                  </button>
                </div>
              )}

              {notice && (
                <div className="mt-5 border border-black/10 bg-black/[0.03] px-4 py-3 text-xs leading-5 text-black/65">
                  {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group mt-6 flex w-full items-center justify-center gap-3 bg-black py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</span>
                {!submitting && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-black/30">or</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setNotice("");
              }}
              className="flex w-full items-center justify-center gap-2 border border-black/15 bg-white py-4 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:border-black"
            >
              <UserRound size={15} strokeWidth={1.5} />
              {mode === "login" ? "Create a new account" : "Already a member? Sign in"}
            </button>

            <p className="mt-8 text-center text-[9px] leading-5 text-black/35">
              By continuing, you agree to shop securely with FX Fashion Gallery.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
