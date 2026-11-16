import React, { useEffect, useState } from 'react';
import {
  Activity, Users, ClipboardList, FlaskConical, Wallet, LogOut, Languages,
  Plus, Search, ShieldCheck, Stethoscope, ArrowUpRight, Download, Menu,
  HeartPulse, UserCog, TestTube2, FileText, CheckCircle2, Clock3, Package,
  LockKeyhole, RefreshCw, FileSpreadsheet, FileDown, Eye, EyeOff, Heart,
  Thermometer, Weight, Ruler, Droplets, Wind, Gauge, CalendarDays, UserRound,
  ChevronRight, Sparkles, ShieldCheck as ShieldIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, downloadCsv } from '../api';
import { PageTitle, Stat, DataTable } from '../components/shared';
import type { User, Patient } from '../types';

function Laboratory({user}:{user:User}){
 const [rows,setRows]=useState<any[]>([]);const [entry,setEntry]=useState<any>(null);const [result,R]=useState('');const [measurement,MV]=useState('');const [unit,U]=useState('');const [interpretation,I]=useState('');const [specimen,S]=useState('');const [msg,M]=useState('');
 const load=()=>api.get('/lab/orders').then(r=>setRows(r.data)).catch(()=>{});useEffect(()=>{load();const timer=window.setInterval(load,15000);return ()=>window.clearInterval(timer)},[]);
 async function submit(e:React.FormEvent){e.preventDefault();try{await api.patch(`/lab/orders/${entry.id}/result`,{result,measurement,unit,interpretation,specimenCode:specimen});M('Result submitted for verification.');setEntry(null);R('');MV('');U('');I('');S('');load()}catch{M('Unable to submit result. Check permissions and order status.')}}
 async function verify(id:number){try{await api.post(`/lab/orders/${id}/verify`);M('Laboratory result verified and returned to doctor.');load()}catch{M('Verification failed. Only authorized manager or admin can verify results.')}}
 const canEnter=['ADMIN','LAB_TECHNICIAN'].includes(user.role),canVerify=['ADMIN','DOCTOR'].includes(user.role);
 return <div className="content"><PageTitle eyebrow="DIAGNOSTIC SERVICES" title="Laboratory worklist" desc="Receive doctor's test requests, enter results and route verified results back to the requesting doctor." action={<button className="secondary" onClick={load}><RefreshCw size={15}/> Refresh</button>}/><section className="panel"><div className="panel-head"><div><h3>Incoming test requests</h3><p>Only fully paid tests can be processed. Payment status is synchronized with cashier.</p></div><FlaskConical/></div><DataTable headers={['Order','Patient','Test','Payment','Lab status','Measurement','Result','Action']} rows={rows.map(x=>[x.id,x.visit?.patient?.fullName,x.testName,<span className={`status-pill ${x.paymentStatus==='PAID'?'paid':'unpaid'}`}>{x.paymentStatus||'UNPAID'}</span>,x.status,x.measurement?`${x.measurement} ${x.unit||''}`:'—',x.result||'Not entered',<div className="action-group">{canEnter&&x.paymentStatus==='PAID'&&x.status!=='VERIFIED'&&<button className="small-action" onClick={()=>{setEntry(x);R(x.result||'');MV(x.measurement||'');U(x.unit||'');I(x.interpretation||'');S(x.specimenCode||'')}}>Enter result</button>}{canEnter&&x.paymentStatus!=='PAID'&&<span className="muted-note">Awaiting cashier</span>}{canVerify&&x.status==='PENDING_VERIFICATION'&&<button className="small-action positive" onClick={()=>verify(x.id)}>Verify</button>}</div>])}/></section>{entry&&<form className="panel form-grid" onSubmit={submit}><h3 className="span-all">Enter result – {entry.testName} / {entry.visit?.patient?.fullName}</h3><label>Specimen code<input value={specimen} onChange={e=>S(e.target.value)}/></label><label>Measured value / result *<input required value={measurement} onChange={e=>MV(e.target.value)} placeholder="e.g. 13.2"/></label><label>Unit<input value={unit} onChange={e=>U(e.target.value)} placeholder="e.g. g/dL, mmol/L, cells/µL"/></label><label className="span-all">Result / qualitative finding<textarea required value={result} onChange={e=>R(e.target.value)} placeholder="Enter test findings, observations or a qualitative result"/></label><label className="span-all">Interpretation / notes<textarea value={interpretation} onChange={e=>I(e.target.value)}/></label><div className="span-all"><button className="primary">Submit result for verification</button> <button type="button" className="secondary" onClick={()=>setEntry(null)}>Cancel</button></div></form>}{msg&&<p className="success-text">{msg}</p>}</div>
}
export default Laboratory;
