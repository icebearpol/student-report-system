import { mockUsers } from '@campus/mock-data';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser { id: string; name: string; email: string; role: 'student'|'admin'; token: string; }
const LS_USERS='campus_users'; const LS_TOKEN='campus_token'; const LS_USER='campus_user';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || '';

let memoryUsers: typeof mockUsers | null = null;

async function getStoredUsers(): Promise<typeof mockUsers> {
  try {
    const raw = await AsyncStorage.getItem(LS_USERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...mockUsers];
}
async function saveStoredUsers(users: typeof mockUsers){ try{ await AsyncStorage.setItem(LS_USERS, JSON.stringify(users)); }catch{} }

export async function getCurrentUser(): Promise<AuthUser|null>{
  try{ const raw=await AsyncStorage.getItem(LS_USER); return raw? JSON.parse(raw):null;}catch{return null}
}
export async function getToken(): Promise<string|null>{ try{return await AsyncStorage.getItem(LS_TOKEN);}catch{return null} }
export async function logout(){ try{ await AsyncStorage.multiRemove([LS_TOKEN, LS_USER]); }catch{} }

async function tryRealLogin(email:string,password:string):Promise<AuthUser|null>{
  if(!API_BASE) return null;
  try{ const r=await fetch(`${API_BASE}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}); if(!r.ok) return null; const d=await r.json(); return d.user??d; }catch{return null}
}
export async function login(email:string,password:string):Promise<AuthUser>{
  const real=await tryRealLogin(email,password);
  if(real){ await AsyncStorage.setItem(LS_TOKEN, real.token); await AsyncStorage.setItem(LS_USER, JSON.stringify(real)); return real; }
  const users=await getStoredUsers();
  const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
  if(!u) throw new Error('No account found for this email');
  const token=`mock-${u.id}-${Date.now()}`;
  const auth:AuthUser={id:u.id,name:u.name,email:u.email,role:u.role as any,token};
  await AsyncStorage.setItem(LS_TOKEN, token); await AsyncStorage.setItem(LS_USER, JSON.stringify(auth));
  return auth;
}
async function tryRealSignup(name:string,email:string,password:string):Promise<AuthUser|null>{
  if(!API_BASE) return null;
  try{ const r=await fetch(`${API_BASE}/auth/signup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})}); if(!r.ok) return null; const d=await r.json(); return d.user??d; }catch{return null}
}
export async function signup(name:string,email:string,password:string):Promise<AuthUser>{
  const real=await tryRealSignup(name,email,password);
  if(real){ await AsyncStorage.setItem(LS_TOKEN, real.token); await AsyncStorage.setItem(LS_USER, JSON.stringify(real)); return real; }
  const users=await getStoredUsers();
  if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())) throw new Error('Email already registered');
  const nu={id:`user-${Date.now()}`,name,email,role:'student' as const, studentId:`STU-${Date.now()}`, createdAt:new Date().toISOString()};
  users.push(nu as any); await saveStoredUsers(users);
  const token=`mock-${nu.id}-${Date.now()}`; const auth:AuthUser={id:nu.id,name:nu.name,email:nu.email,role:'student',token};
  await AsyncStorage.setItem(LS_TOKEN, token); await AsyncStorage.setItem(LS_USER, JSON.stringify(auth)); return auth;
}
export async function upvoteReport(reportId:string){
  if(API_BASE){ try{ const t=await getToken(); await fetch(`${API_BASE}/reports/${reportId}/upvote`,{method:'POST',headers:{Authorization:`Bearer ${t}`}}); return;}catch{} }
  try{ const k=`campus_upvotes_${reportId}`; const v=Number((await AsyncStorage.getItem(k))||'0')+1; await AsyncStorage.setItem(k,String(v)); }catch{}
}
