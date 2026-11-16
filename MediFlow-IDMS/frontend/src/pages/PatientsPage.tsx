import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Download, CalendarDays, UserRound, FileDown, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, downloadCsv } from '../api';
import { PageTitle, DataTable } from '../components/shared';
import type { User, Patient } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Patients({user}:{user:User}){
 const {t}=useTranslation();
 const [rows,setRows]=useState<Patient[]>([]);
 const [q,setQ]=useState('');
 const [form,setForm]=useState(false);
 const [name,N]=useState('');const [phone,P]=useState('');const [age,A]=useState('');
 const [sex,S]=useState('');const [address,AD]=useState('');const [error,E]=useState('');const [saving,SV]=useState(false);
 const today=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
 const load=()=>api.get('/patients',{params:{q}}).then(r=>setRows(r.data)).catch(()=>{});
 useEffect(()=>{load()},[q]);
 const canRegister=['ADMIN','MANAGER','RECEPTIONIST','RECORDS_OFFICER'].includes(user.role);
 const stats=useMemo(()=>({total:rows.length,today:rows.filter(p=>p.createdAt&&new Date(p.createdAt).toDateString()===new Date().toDateString()).length}),[rows]);
 async function save(e:React.FormEvent){
  e.preventDefault();E('');SV(true);
  try{await api.post('/patients',{fullName:name.trim(),phone,age:Number(age),sex,address});N('');P('');A('');S('');AD('');setForm(false);await load()}
  catch(err:any){E(err?.response?.data?.message||'Unable to save patient. Check the required fields and your permissions.')}
  finally{SV(false)}
 }
 function exportPdf(){
  const doc=new jsPDF();doc.setFillColor(9,105,94);doc.rect(0,0,210,34,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(20);doc.text('MEDIFLOW',14,15);doc.setFontSize(9);doc.text('PATIENT REGISTER',14,23);
  doc.setTextColor(35,70,65);doc.setFontSize(9);doc.text(`Generated: ${new Date().toLocaleString()}`,14,43);
  autoTable(doc,{startY:50,head:[['Patient ID','Patient name','Age','Sex','Phone','Registration date']],body:rows.map(p=>[p.patientNumber,p.fullName,p.age??'—',p.sex??'—',p.phone??'—',p.createdAt?new Date(p.createdAt).toLocaleDateString():'—']),styles:{fontSize:8,cellPadding:3},headStyles:{fillColor:[13,137,119]},alternateRowStyles:{fillColor:[239,248,245]}});
  const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(110,130,125);doc.text(`CONFIDENTIAL • MEDICAL RECORDS  |  Page ${i} of ${pages}`,14,289)}
  doc.save('MediFlow-Patient-Register.pdf');
 }
 return <div className="content patient-page">
  <PageTitle eyebrow="PATIENT RECORDS" title={t('patients')} desc="Register patients and automatically open their first visit in the doctor queue." action={<div className="record-actions"><button className="secondary" onClick={exportPdf}><FileDown size={16}/> PDF Register</button>{canRegister&&<button className="primary" onClick={()=>setForm(!form)}><Plus size={17}/> Register patient</button>}</div>}/>
  <div className="stat-grid compact-stats">
   <div className="stat-card"><div className="stat-icon cyan"><UserRound/></div><span>Patients in this list</span><strong>{stats.total}</strong><small>Matching patient records</small></div>
   <div className="stat-card"><div className="stat-icon green"><CalendarDays/></div><span>Registered today</span><strong>{stats.today}</strong><small>{today}</small></div>
  </div>
  {form&&<form className="panel form-grid patient-registration" onSubmit={save}>
   <div className="span-all registration-heading"><div><span className="eyebrow">NEW PATIENT</span><h3>Patient registration</h3><p>Registration date is recorded automatically by MEDIFLOW.</p></div><span className="registration-date"><CalendarDays size={16}/> {today}</span></div>
   <label>Full name *<input required maxLength={160} value={name} onChange={e=>N(e.target.value)} placeholder="Enter patient's full name"/></label>
   <label>Age (years) *<input required type="number" min="0" max="130" step="1" value={age} onChange={e=>A(e.target.value)} placeholder="e.g. 24"/></label>
   <label>Phone number<input type="tel" value={phone} onChange={e=>P(e.target.value)} placeholder="e.g. 07XXXXXXXX"/></label>
   <label>Sex *<select required value={sex} onChange={e=>S(e.target.value)}><option value="">Select sex</option><option>Female</option><option>Male</option><option>Other</option></select></label>
   <label className="span-all">Address<input value={address} onChange={e=>AD(e.target.value)} placeholder="Street, ward, district"/></label>
   {error&&<p className="error span-all">{error}</p>}
   <div className="span-all registration-actions"><button className="primary" disabled={saving}>{saving?'Registering…':'Register patient & send to doctor'}</button><button type="button" className="secondary" onClick={()=>setForm(false)}>Cancel</button></div>
  </form>}
  <section className="panel table-panel"><div className="table-toolbar"><div className="searchbox"><Search/><input placeholder={t('search')} value={q} onChange={e=>setQ(e.target.value)}/></div><div className="record-actions"><button className="secondary" onClick={()=>downloadCsv('mediflow-patients.csv',rows as any)}><Download size={16}/> CSV</button><button className="secondary" onClick={load}><Sparkles size={15}/> Refresh</button></div></div>
   <DataTable headers={['Patient ID','Patient name','Age','Sex','Phone','Registration date']} rows={rows.map(p=>[p.patientNumber,p.fullName,p.age!=null?`${p.age} years`:'—',p.sex,p.phone,p.createdAt?new Date(p.createdAt).toLocaleDateString():'—'])}/>
  </section>
 </div>
}
export default Patients;
