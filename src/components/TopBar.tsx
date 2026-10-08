import { useState } from "react";
import { C } from "../lib/constants";

// ─── BOTTOM NAV (mobile) ──────────────────────────────────────
const NAV_ITEMS = [
  {id:"panel",    emoji:"📊", label:"Painel"},
  {id:"acomp",    emoji:"🎯", label:"Acompanhamento"},
  {id:"usuarios", emoji:"👥", label:"Usuários"},
  {id:"carteira", emoji:"💼", label:"Carteira"},
  {id:"cadastro", emoji:"🏪", label:"Cadastro de unidades"},
  {id:"aniversarios", emoji:"🎂", label:"Aniversariantes"},
  {id:"dashboard",emoji:"🏠", label:"Dashboard"},
  {id:"diario",   emoji:"📓", label:"Diário"},
  {id:"kanban",   emoji:"📋", label:"Kanban"},
  {id:"manutencao",emoji:"🔧",label:"Manutenção"},
  {id:"print3d",  emoji:"🖨️", label:"3D"},
  {id:"campanhas",emoji:"📣", label:"Campanhas"},
  {id:"inauguracao",emoji:"🐣",label:"Inaug."},

  {id:"lojajp",   emoji:"🏪", label:"Loja JP"},
];

// Groups for the nav drawer
const NAV_GROUPS = [
  { label:"Principal",   items:["panel","acomp","dashboard","diario","kanban"] },
  { label:"Gestão",      items:["usuarios","carteira","cadastro","aniversarios"] },
  { label:"Operacional", items:["manutencao","print3d","lojajp"] },
  { label:"Rede",        items:["campanhas","inauguracao"] },
];


// ─── LOGO CLUBKIDS (peça de puzzle oficial) ──────────────────
export function CKLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{flexShrink:0}}>
      <rect x="8" y="22" width="46" height="56" rx="12" stroke="#1a1a1a" strokeWidth="7" fill="none"/>
      <path d="M31 22v-6a6.5 6.5 0 0113 0v6" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <rect x="46" y="38" width="40" height="40" rx="10" fill="#1a1a1a"/>
      <circle cx="58" cy="50" r="5" fill="#f4edd6"/>
      <circle cx="74" cy="50" r="5" fill="#f4edd6"/>
      <circle cx="58" cy="66" r="5" fill="#f4edd6"/>
      <circle cx="74" cy="66" r="5" fill="#f4edd6"/>
    </svg>
  );
}

export function CKWordmark({ size = 15 }) {
  return (
    <span style={{fontSize:size, color:"#1a1a1a", letterSpacing:"-0.3px", fontWeight:400}}>
      club<span style={{fontWeight:800}}>kids</span>
    </span>
  );
}

export function TopBar({ activeTab, setActiveTab, dbStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = NAV_ITEMS.find(n=>n.id===activeTab);

  return (
    <>
      {/* Top bar */}
      <div style={{
        height:54, borderBottom:`1.5px solid ${C.cardBorder}`,
        display:"flex", alignItems:"center", padding:"0 14px",
        position:"sticky", top:0, background:C.card, zIndex:200,
        gap:10,
      }}>
        {/* Hamburger */}
        <button onClick={()=>setMenuOpen(true)} style={{
          background:"none", border:`1px solid ${C.cardBorder}`,
          borderRadius:8, color:C.textPrimary, width:36, height:36,
          cursor:"pointer", fontSize:16, display:"flex",
          alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>☰</button>

        {/* Brand */}
        <CKLogo size={28} />
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", alignItems:"center", gap:7}}>
            <CKWordmark size={15} />
            <span style={{fontSize:9, fontWeight:600, color:"#7a6e5a", background:C.bg, border:`1px solid #d9d0bc`, borderRadius:20, padding:"2px 8px"}}>Flow CRM</span>
            <span style={{
              fontSize:9, fontWeight:600, padding:"2px 8px", borderRadius:20,
              background: dbStatus==="ok"?"#e8f5ee":dbStatus==="offline"?"#fff8e1":C.inset,
              color: dbStatus==="ok"?"#2a7a52":dbStatus==="offline"?"#8a6a00":C.textMuted,
              border:`1px solid ${dbStatus==="ok"?"#b0ddc3":dbStatus==="offline"?"#f0dfa0":C.cardBorder}`,
            }}>
              {dbStatus==="ok"?"☁️ nuvem":dbStatus==="offline"?"⚠️ local":"⏳"}
            </span>
          </div>
          {/* Current section indicator */}
          <div style={{fontSize:10, color:C.textMuted, marginTop:1}}>
            {active?.emoji} {active?.label}
          </div>
        </div>

        {/* Quick nav — most used tabs as icon buttons */}
        <div style={{display:"flex", gap:4, flexShrink:0}}>
          {["panel","acomp","cadastro","dashboard"].map(id=>{
            const n = NAV_ITEMS.find(x=>x.id===id);
            return (
              <button key={id} onClick={()=>setActiveTab(id)} style={{
                width:34, height:34, borderRadius:8,
                border:`1px solid ${activeTab===id ? C.laranja : C.cardBorder}`,
                background: activeTab===id ? "#fff3e6" : "transparent",
                color: activeTab===id ? C.laranja : C.textMuted,
                cursor:"pointer", fontSize:16,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>{n?.emoji}</button>
            );
          })}
        </div>
      </div>

      {/* Drawer overlay */}
      {menuOpen&&(
        <div style={{
          position:"fixed", inset:0, zIndex:500,
          display:"flex",
        }}>
          {/* Backdrop */}
          <div onClick={()=>setMenuOpen(false)} style={{
            position:"absolute", inset:0, background:"#3a302088",
          }}/>

          {/* Drawer */}
          <div style={{
            position:"relative", width:260, background:C.card,
            borderRight:`1px solid ${C.cardBorder}`,
            height:"100vh", overflowY:"auto",
            display:"flex", flexDirection:"column",
          }}>
            {/* Drawer header */}
            <div style={{
              padding:"16px 16px 12px",
              borderBottom:`1px solid ${C.cardBorder}`,
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <CKLogo size={26} />
                <div>
                  <CKWordmark size={14} />
                  <div style={{fontSize:10, color:C.textMuted}}>Flow CRM Franquias CK</div>
                </div>
              </div>
              <button onClick={()=>setMenuOpen(false)} style={{
                background:"none", border:"none", color:C.textMuted,
                fontSize:20, cursor:"pointer", padding:4,
              }}>×</button>
            </div>

            {/* Nav groups */}
            <div style={{flex:1, padding:"8px 0"}}>
              {NAV_GROUPS.map(group=>(
                <div key={group.label} style={{marginBottom:8}}>
                  <div style={{
                    padding:"6px 16px 4px",
                    fontSize:9, fontWeight:700, color:C.textMuted,
                    textTransform:"uppercase", letterSpacing:"0.08em",
                  }}>{group.label}</div>
                  {group.items.map(id=>{
                    const n = NAV_ITEMS.find(x=>x.id===id);
                    const isActive = activeTab===id;
                    return (
                      <button key={id} onClick={()=>{setActiveTab(id);setMenuOpen(false);}} style={{
                        width:"100%", padding:"10px 16px",
                        background: isActive ? `${C.laranja}18` : "transparent",
                        border:"none",
                        borderLeft: isActive ? `3px solid ${C.laranja}` : "3px solid transparent",
                        color: isActive ? C.textPrimary : C.textMuted,
                        fontWeight: isActive ? 700 : 400,
                        fontSize:13, cursor:"pointer",
                        fontFamily:"inherit", textAlign:"left",
                        display:"flex", alignItems:"center", gap:10,
                      }}>
                        <span style={{fontSize:18}}>{n?.emoji}</span>
                        <span>{n?.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Drawer footer */}
            <div style={{
              padding:"12px 16px",
              borderTop:`1px solid ${C.cardBorder}`,
              fontSize:10, color:C.textMuted,
            }}>
              👤 Ivanise Leite · Supervisora Nacional
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  MÓDULOS DE GESTÃO: Usuários · Carteira · Cadastro Unidades
// ═══════════════════════════════════════════════════════════

// Status de gestação/segmentação da unidade
