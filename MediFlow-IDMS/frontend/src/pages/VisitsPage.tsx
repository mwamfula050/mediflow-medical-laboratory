import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, ClipboardList, Stethoscope } from 'lucide-react';
import { api } from '../api';
import { PageTitle, DataTable } from '../components/shared';
import type { User, Patient } from '../types';

function Visits({user}:{user:User}) {
 const [rows,setRows]=useState<any[]>([]); const [patients,setPatients]=useState<Patient[]>([]);
 const [pid,setPid]=useState(''); const [message,setMessage]=useState('');
 const load=()=>api.get('/visits').then(r=>setRows(r.data)).catch(()=>setMessage('Unable to load visits. Check your connection and permissions.'));
 useEffect(()=>{load();api.get('/patients').then(r=>setPatients(r.data)).catch(()=>{});},[]);
 async function createVisit(){if(!pid)return;setMessage('');try{await api.post('/visits',{patientId:Number(pid)});setPid('');setMessage('Visit created and sent directly to the doctor queue.');load();}catch(e:any){setMessage(e?.response?.data?.message||'Unable to create visit. Check your permissions.');}}
 const canCreate=['ADMIN','MANAGER','RECEPTIONIST'].includes(user.role);
 return <div className="content">
  <PageTitle eyebrow="CARE COORDINATION" title="Patient visits" desc="Reception creates an encounter and the system routes it directly to the doctor without a nursing-account handover." action={<button className="secondary" onClick={load}><RefreshCw size={15}/> Refresh queue</button>}/>
  {canCreate&&<section className="panel"><div className="panel-head"><div><h3>Send patient to doctor</h3><p className="helper">Each visit is a separate clinical encounter linked to the patient's permanent record.</p></div><Stethoscope/></div><div className="inline-form"><select value={pid} onChange={e=>setPid(e.target.value)}><option value="">Select patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.patientNumber} — {p.fullName}</option>)}</select><button className="primary" onClick={createVisit} disabled={!pid}><Plus size={16}/> Create visit & send to doctor</button></div></section>}
  {message&&<p className="success-text">{message}</p>}
  <section className="panel table-panel"><div className="panel-head"><div><h3>Patient visit worklist</h3><p className="helper">Track the patient journey across clinical, laboratory and billing teams.</p></div><ClipboardList/></div>
   <DataTable headers={['Visit ID','Patient ID','Patient','Status','Department','Priority','Registered']} rows={rows.map(v=>[v.id,v.patient?.patientNumber,v.patient?.fullName,v.status,v.department||'DOCTOR',v.priority||'NORMAL',v.registeredAt?new Date(v.registeredAt).toLocaleString():'—'])}/>
  </section>
 </div>;
}
export default Visits;
