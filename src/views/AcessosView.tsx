import { useEffect, useState } from 'react';
import { sb } from '../lib/supabase';

const box = {background:'#fff',border:'1px solid #ddd',padding:20,borderRadius:12,margin:'16px auto',maxWidth:850};
const button = {padding:'10px 16px',borderRadius:8,border:'1px solid #ccc',cursor:'pointer',margin:4};

export function SolicitarAcesso({email,onSair}:{email:string,onSair:()=>void}) {
 const [nome,setNome]=useState(''),[unidade,setUnidade]=useState(''),[motivo,setMotivo]=useState('');
 const [aviso,setAviso]=useState(''),[erro,setErro]=useState(''),[busy,setBusy]=useState(false);
 async function enviar(e:React.FormEvent){
  e.preventDefault();setBusy(true);setErro('');
  try {
   const r=await sb.rpc('solicitar_acesso',{p_nome:nome,p_unidade:unidade,p_motivo:motivo});
   if(r.status!=='pendente'){setAviso('Seu pedido já foi avaliado. Saia e entre novamente para atualizar seu acesso.');return;}
   // O pedido já está salvo. Uma falha de e-mail nunca concede acesso.
   const key='pedido-notificado:'+r.id;
   if(!localStorage.getItem(key)){
    const resp=await fetch('/__forms.html',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({'form-name':'solicitacao-acesso','bot-field':'',nome,email:r.email,unidade,pedido:r.id,crm:'https://musical-lokum-f21932.netlify.app/',motivo,subject:'Clubkids: pedido de acesso para avaliação'}).toString()});
    if(!resp.ok)throw new Error('Pedido salvo no CRM. O aviso por e-mail falhou; tente novamente.');
    localStorage.setItem(key,'1');
   }
   setAviso('Pedido registrado para avaliação da Ivanise. Seu acesso permanece bloqueado até a aprovação.');
  }catch(e){setErro((e as Error).message);}finally{setBusy(false);}
 }
 return <main style={{fontFamily:'Segoe UI,sans-serif',padding:20,background:'#f4edd6',minHeight:'100vh'}}><form onSubmit={enviar} style={box}>
 <h1>Acesso sujeito à aprovação</h1><p>{email}</p><p>Somente a Ivanise pode liberar novos contatos. O pedido será comunicado a supervisao@franquiasclubkids.com.br.</p>
 <label>Seu nome<input required maxLength={120} value={nome} onChange={e=>setNome(e.target.value)} style={{display:'block',padding:10,margin:8}}/></label>
 <label>Unidade ou área<input maxLength={160} value={unidade} onChange={e=>setUnidade(e.target.value)} style={{display:'block',padding:10,margin:8}}/></label>
 <label>Motivo do acesso<textarea required maxLength={1000} value={motivo} onChange={e=>setMotivo(e.target.value)} style={{display:'block',padding:10,margin:8,width:'90%'}}/></label>
 {erro&&<p role="alert">{erro}</p>}{aviso&&<p role="status">{aviso}</p>}
 <button style={button} disabled={busy||!!aviso}>{busy?'Enviando…':'Solicitar aprovação'}</button><button style={button} type="button" onClick={onSair}>Sair</button>
 </form></main>;
}

export function UnidadeHome({unidades,onSair}:{unidades:any[],onSair:()=>void}){
 return <main style={{fontFamily:'Segoe UI,sans-serif',background:'#f4edd6',minHeight:'100vh',padding:20}}><section style={box}>
 <img src="/brand/logo-black.png" alt="Clubkids" style={{width:200}}/><h1>Área da unidade</h1><p>Você tem acesso apenas às unidades vinculadas ao seu e-mail.</p>
 {unidades.map(u=><article key={u.id}><h2>{u.nome}</h2>{u.plano?<a href={u.plano}>Abrir plano, tarefas e materiais</a>:<p>O plano desta unidade ainda será disponibilizado pela gestão.</p>}</article>)}
 <button style={button} onClick={onSair}>Sair</button></section></main>;
}

export function AcessosView({units}:{units:any[]}){
 const [pedidos,setPedidos]=useState<any[]>([]),[erro,setErro]=useState(''),[busy,setBusy]=useState('');
 const [perfis,setPerfis]=useState<Record<string,string>>({}),[destinos,setDestinos]=useState<Record<string,string>>({});
 const load=()=>sb.get('solicitacoes_acesso','?select=*&order=created_at.desc').then(setPedidos).catch(e=>setErro(e.message));
 useEffect(()=>{load();},[]);
 async function decidir(id:string,aprovar:boolean){setBusy(id);setErro('');try{await sb.rpc('decidir_acesso',{p_id:id,p_aprovar:aprovar,p_perfil:perfis[id]||'franqueada',p_unit_id:destinos[id]?Number(destinos[id]):null});await load();}catch(e){setErro((e as Error).message);}finally{setBusy('');}}
 return <section style={box}><h1>Autorizações de acesso</h1><p>Somente Ivanise Leite pode aprovar ou negar. A aprovação de uma franqueada libera apenas a unidade selecionada.</p>
 <button style={button} onClick={load}>Atualizar pedidos</button>{erro&&<p role="alert">{erro}</p>}
 {!pedidos.length&&<p>Nenhum pedido de acesso.</p>}
 {pedidos.map(p=><article key={p.id} style={{borderTop:'1px solid #ddd',padding:'16px 0'}}><h2>{p.nome}</h2><p>{p.email} · {p.unidade}</p><p>{p.motivo}</p><p>Status: {p.status}</p>
 {p.status==='pendente'&&<><label>Perfil <select aria-label={'Perfil de '+p.nome} value={perfis[p.id]||'franqueada'} onChange={e=>setPerfis({...perfis,[p.id]:e.target.value})}><option value="franqueada">Franqueada · somente sua unidade</option><option value="analista">Analista · equipe de gestão</option></select></label>
 {(perfis[p.id]||'franqueada')==='franqueada'&&<label> Unidade <select aria-label={'Unidade de '+p.nome} value={destinos[p.id]||''} onChange={e=>setDestinos({...destinos,[p.id]:e.target.value})}><option value="">Selecione</option>{units.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label>}
 <div><button style={button} disabled={busy===p.id||((perfis[p.id]||'franqueada')==='franqueada'&&!destinos[p.id])} onClick={()=>decidir(p.id,true)}>Aprovar acesso</button><button style={button} disabled={busy===p.id} onClick={()=>decidir(p.id,false)}>Negar</button></div></>}
 </article>)}</section>;
}
