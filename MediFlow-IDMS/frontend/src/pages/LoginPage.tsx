import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HeartPulse, ShieldCheck, Activity, Languages, ArrowUpRight, Eye, EyeOff,
  LockKeyhole, UserRound, Sparkles, ChevronLeft, ChevronRight, PlayCircle,
  Stethoscope, Microscope, UsersRound, Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { User } from '../types';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1800&q=85',
    tag: 'COMPASSIONATE CLINICAL CARE',
    title: 'People first. Better care, connected.',
    detail: 'Bring reception, doctors and laboratory teams together around a coordinated patient journey.',
    credit: 'Healthcare professional'
  },
  {
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=85',
    tag: 'MODERN HEALTHCARE ENVIRONMENTS',
    title: 'A clearer view of every patient journey.',
    detail: 'Keep appointments, clinical activity and operational information moving in one secure workspace.',
    credit: 'Clinical environment'
  },
  {
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1800&q=85',
    tag: 'LABORATORY & DIAGNOSTICS',
    title: 'From investigation to informed decisions.',
    detail: 'Connect test requests, cashier payments, laboratory processing and doctor review.',
    credit: 'Medical diagnostics'
  },
  {
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1800&q=85',
    tag: 'A TEAM THAT WORKS AS ONE',
    title: 'Make every handover more seamless.',
    detail: 'Give authorized teams the right workflow and information at the right stage of care.',
    credit: 'Patient care team'
  }
];

export default function LoginPage({ onLogin }: { onLogin: (u: User) => void }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState(() => localStorage.getItem('mediflow-remembered-user') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(!!localStorage.getItem('mediflow-remembered-user'));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide(current => (current + 1) % slides.length), 6200);
    return () => window.clearInterval(timer);
  }, []);

  function moveSlide(direction: number) {
    setActiveSlide(current => (current + direction + slides.length) % slides.length);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { username: username.trim(), password });
      const data = response.data;
      if (!data || !data.token || typeof data.token !== 'string') {
        throw new Error('Backend did not return a valid authentication token.');
      }
      sessionStorage.setItem('mediflow-token', data.token);
      if (!sessionStorage.getItem('mediflow-token')) throw new Error('Unable to save authentication token.');
      if (remember) localStorage.setItem('mediflow-remembered-user', username.trim());
      else localStorage.removeItem('mediflow-remembered-user');
      const user: User = { username: data.username, fullName: data.fullName, role: data.role };
      sessionStorage.setItem('mediflow-user', JSON.stringify(user));
      onLogin(user);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) setError('Incorrect username or password, or your account is disabled.');
      else if (status === 403) setError('Your account is not permitted to sign in. Contact the administrator.');
      else if (e?.message?.includes('token')) setError(e.message);
      else if (e?.response) setError(`Login failed. Server returned status ${status || 'unknown'}.`);
      else setError('Unable to connect to MEDIFLOW. Check that the backend and database are running.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page mf-login">
      <section className="login-art mf-login-visual">
        <div className="mf-slides" aria-hidden="true">
          {slides.map((slide, index) => (
            <div key={slide.image} className={`mf-slide ${index === activeSlide ? 'is-active' : ''}`}
              style={{ backgroundImage: `url("${slide.image}")` }} />
          ))}
        </div>
        <div className="mf-visual-overlay" />
        <div className="brand large mf-login-brand">
          <div className="brand-mark"><HeartPulse /></div>
          <div><b>MEDIFLOW</b><small>INTEGRATED MEDICAL MANAGEMENT</small></div>
        </div>
        <div className="health-orbit orbit-a" /><div className="health-orbit orbit-b" />
        <div className="mf-visual-content" key={activeSlide}>
          <span className="eyebrow"><Sparkles size={14} /> {slides[activeSlide].tag}</span>
          <h1>{slides[activeSlide].title}</h1>
          <p>{slides[activeSlide].detail}</p>
          <div className="mf-visual-features">
            <span><UsersRound /> Patient-centred</span>
            <span><Stethoscope /> Connected clinical teams</span>
            <span><Microscope /> Integrated diagnostics</span>
          </div>
          <div className="mf-slide-footer">
            <div className="mf-slide-dots" aria-label="Choose featured image">
              {slides.map((slide, index) => <button key={slide.image} aria-label={`Show slide ${index + 1}`}
                className={index === activeSlide ? 'active' : ''} onClick={() => setActiveSlide(index)} />)}
            </div>
            <div className="mf-slide-arrows">
              <button onClick={() => moveSlide(-1)} aria-label="Previous image"><ChevronLeft /></button>
              <button onClick={() => moveSlide(1)} aria-label="Next image"><ChevronRight /></button>
            </div>
          </div>
        </div>
        <div className="mf-image-caption"><Building2 size={13} /> {slides[activeSlide].credit} · Illustrative stock photography</div>
        <div className="heartbeat-panel"><HeartPulse size={27} /><small>CONNECTED CARE WORKFLOW</small></div>
        <div className="art-footer">MEDIFLOW HEALTH SYSTEMS <span>•</span> BUILT FOR BETTER CARE</div>
      </section>

      <section className="login-panel mf-login-panel">
        <div className="mf-language-note"><Languages size={16} /> ENGLISH · KISWAHILI · العربية</div>
        <form onSubmit={submit}>
          <div className="mobile-brand"><HeartPulse /> MEDIFLOW</div>
          <span className="eyebrow">SECURE STAFF PORTAL</span>
          <h2>{t('signIn')}</h2>
          <p>Sign in with the account assigned by your system administrator.</p>
          <label htmlFor="username">Username</label>
          <div className="input-with-icon"><UserRound size={17} />
            <input id="username" value={username} onChange={e => setUsername(e.target.value)}
              autoComplete="username" required placeholder="Enter your username" />
          </div>
          <label htmlFor="password">Password</label>
          <div className="input-with-icon password-input"><LockKeyhole size={17} />
            <input id="password" type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="current-password"
              required placeholder="Enter your password" />
            <button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
          </div>
          <label className="remember-row"><input type="checkbox" checked={remember}
            onChange={e => setRemember(e.target.checked)} /> Remember username on this device</label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="primary full login-submit" disabled={busy}>
            {busy ? <><span className="spinner" /> Signing in securely…</> : <>Sign in to MEDIFLOW <ArrowUpRight size={18} /></>}
          </button>
          <div className="mf-demo-link">
            <span>Want to understand the system first?</span>
            <Link to="/demo">Explore the public workflow demo <ArrowUpRight size={15} /></Link>
          </div>
          <small className="login-foot"><ShieldCheck size={14} /> Access is monitored and restricted by your assigned role.</small>
        </form>
        <div className="mf-login-video">
          <div className="mf-video-thumb">
            <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80" alt="Medical team in a clinical setting" />
            <button type="button" onClick={() => setVideoOpen(true)} aria-label="Open medical introduction video"><PlayCircle /></button>
          </div>
          <div><b>Patient-centred care</b><span>Watch a short healthcare empathy film</span></div>
        </div>
      </section>
      {videoOpen && <div className="mf-video-modal" role="dialog" aria-modal="true" aria-label="Medical introduction video" onClick={() => setVideoOpen(false)}>
        <div className="mf-video-dialog" onClick={e => e.stopPropagation()}>
          <button className="mf-video-close" onClick={() => setVideoOpen(false)} aria-label="Close video">×</button>
          <div className="mf-video-frame">
            <iframe src="https://www.youtube-nocookie.com/embed/cDDWvj_q-o8?autoplay=1&rel=0"
              title="Empathy and patient care video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
          </div>
          <p>Healthcare video hosted by an external provider. Availability and playback depend on YouTube.</p>
        </div>
      </div>}
    </main>
  );
}
