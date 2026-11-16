import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, ArrowRight, ClipboardList, CreditCard, FlaskConical, HeartPulse, ShieldCheck, Stethoscope, Users, Wallet } from 'lucide-react';

const steps = [
  { n:'01', title:'Patient reception', text:'Reception creates a patient profile and opens a visit. The patient is routed directly to the doctor queue.', icon:Users, tone:'mint' },
  { n:'02', title:'Doctor consultation', text:'The doctor records the consultation and requests one or more investigations when clinically required.', icon:Stethoscope, tone:'blue' },
  { n:'03', title:'Consolidated payment', text:'The cashier prepares one invoice for the visit. Laboratory work is released only after full payment.', icon:Wallet, tone:'gold' },
  { n:'04', title:'Laboratory processing', text:'Authorized laboratory staff enter test measurements and results for doctor review.', icon:FlaskConical, tone:'violet' },
  { n:'05', title:'Doctor review & completion', text:'After all results are verified, the doctor reviews findings, enters medical instructions and completes the visit.', icon:ClipboardList, tone:'mint' }
];

export default function DemoPage() {
  return <main className="mf-demo-page">
    <header className="mf-demo-header">
      <Link to="/login" className="mf-demo-logo"><span><HeartPulse /></span><b>MEDIFLOW</b><small>CLINICAL WORKFLOW</small></Link>
      <Link to="/login" className="mf-demo-back"><ArrowLeft size={16}/> Back to staff login</Link>
    </header>
    <section className="mf-demo-hero">
      <div className="mf-demo-hero-copy">
        <span className="mf-demo-kicker"><Activity size={15}/> PUBLIC PRODUCT WALKTHROUGH</span>
        <h1>One connected journey.<br/><em>Better coordinated care.</em></h1>
        <p>Explore how MediFlow coordinates reception, doctor consultation, cashier payments and laboratory investigations in a single clinical workflow.</p>
        <div className="mf-demo-hero-actions"><Link to="/login">Staff sign in <ArrowRight size={16}/></Link><span><ShieldCheck size={15}/> Workflow overview · No patient data shown</span></div>
      </div>
      <div className="mf-demo-hero-image">
        <img src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1300&q=85" alt="Healthcare professionals collaborating in a hospital" />
        <div className="mf-demo-float"><HeartPulse/><span><b>Connected care</b><small>One coordinated workflow</small></span></div>
      </div>
    </section>
    <section className="mf-demo-workflow">
      <div className="mf-demo-section-title"><span>HOW IT WORKS</span><h2>From registration to completed care</h2><p>A simple overview of the workflow configured in this MediFlow build.</p></div>
      <div className="mf-demo-steps">{steps.map((step, index) => {
        const Icon = step.icon;
        return <article className="mf-demo-step" key={step.n}>
          <div className={`mf-demo-step-icon ${step.tone}`}><Icon/></div>
          <div className="mf-demo-step-copy"><small>STEP {step.n}</small><h3>{step.title}</h3><p>{step.text}</p></div>
          {index < steps.length - 1 && <div className="mf-demo-step-arrow"><ArrowRight/></div>}
        </article>;
      })}</div>
    </section>
    <section className="mf-demo-security">
      <div><ShieldCheck/><span><b>Role-based access</b><small>Staff access is restricted according to assigned permissions.</small></span></div>
      <div><CreditCard/><span><b>Payment-gated testing</b><small>Unpaid laboratory orders are not released for testing.</small></span></div>
      <div><Activity/><span><b>Operational visibility</b><small>Managers can review operational workflow and revenue summaries.</small></span></div>
    </section>
    <footer className="mf-demo-footer"><div><HeartPulse/> MEDIFLOW</div><p>Public walkthrough only. This page contains no live patient records and does not provide a sample staff account.</p><Link to="/login">Go to login <ArrowRight size={15}/></Link></footer>
  </main>;
}
