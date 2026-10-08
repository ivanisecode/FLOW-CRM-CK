import { useState, useMemo } from "react";
import { C, TODAY } from "../lib/constants";
import { GROUP_CFG } from "../lib/helpers";

const ANIV_FRANQUEADOS = [{"unidade": "RIO VERDE - GO", "franqueado": "Amanda Danieli Rocha de Souza", "dia": "30/01"}, {"unidade": "BARRA DA TIJUCA - RJ", "franqueado": "Marcos Henrique Freire de Brito Fernandes", "dia": "23/01"}, {"unidade": "CAMPINA GRANDE - PB", "franqueado": "Felipe Augusto Barbosa Tavares", "dia": "15/01"}, {"unidade": "RIO BRANCO - AC", "franqueado": "Eloisa Secoti Leal", "dia": "07/01"}, {"unidade": "SANTO ANDRÉ E CAETANO - SP", "franqueado": "Alexandre Augusto Rodrigues de Souza", "dia": "11/01"}, {"unidade": "TERESINA - PI", "franqueado": "Karina Borges de Sousa", "dia": "21/02"}, {"unidade": "ILHA DO GOVERNADOR - RJ", "franqueado": "Yasmin Tinoco", "dia": "11/02"}, {"unidade": "BLUMENAU - SC", "franqueado": "Ivete Ventura Camargo", "dia": "09/02"}, {"unidade": "FORTALEZA MEIRELES - CE", "franqueado": "Alexandre Rios", "dia": "10/02"}, {"unidade": "FOZ DO IGUAÇU - PR", "franqueado": "Simone Hanzen Tomazzoni", "dia": "16/02"}, {"unidade": "IPATINGA - MG", "franqueado": "Arthur Gonçalves Assini", "dia": "02/02"}, {"unidade": "SÃO JOSÉ DOS CAMPOS - SP", "franqueado": "Laura Araruna Clementino de Souza", "dia": "08/02"}, {"unidade": "PORTO VELHO - RO", "franqueado": "Margarida Freires Santana", "dia": "18/03"}, {"unidade": "BELÉM UMARIZAL - PA", "franqueado": "Pablo Cardias Soares", "dia": "06/03"}, {"unidade": "DOURADOS - MS", "franqueado": "Carolina Cardoso", "dia": "28/03"}, {"unidade": "DIVINOPOLIS - MG", "franqueado": "Izabel Ormianini Monteiro", "dia": "29/03"}, {"unidade": "NITEROI - RJ", "franqueado": "Marcus José Gonçalves Teixeira", "dia": "19/03"}, {"unidade": "CHAPECÓ - SC", "franqueado": "Lyvia Fernanda Benedet Zimmermann", "dia": "25/04"}, {"unidade": "FORTALEZA MEIRELES - CE", "franqueado": "Roberta Feitosa", "dia": "29/04"}, {"unidade": "ARARAQUARA - SP", "franqueado": "Ana Paula Forte Costa", "dia": "20/04"}, {"unidade": "CUIABÁ - MT", "franqueado": "Camila Souza De Angeli", "dia": "05/04"}, {"unidade": "SÃO JOSÉ DOS PINHAIS - PR", "franqueado": "Giovanna Carla Erkmann", "dia": "02/04"}, {"unidade": "VILA ANDRADE E CENTRO - SP", "franqueado": "Renata Melo", "dia": "13/04"}, {"unidade": "ITAITUBA - PA", "franqueado": "Lucia Evelyn Nunes Charife", "dia": "11/05"}, {"unidade": "JUIZ DE FORA - MG", "franqueado": "Ruth Rocha Lopes Teixeira", "dia": "21/05"}, {"unidade": "CASCAVEL - PR", "franqueado": "Daniele Karina Ferrari de Oliveira", "dia": "05/05"}, {"unidade": "CAMPINA GRANDE - PB", "franqueado": "Gitana Carla Soares de Assis Tavares", "dia": "19/05"}, {"unidade": "SANTA RITA E BAYEUX - PB", "franqueado": "José de Carvalho Júnior", "dia": "25/05"}, {"unidade": "JUAZEIRO DO NORTE - CE", "franqueado": "Mario Renan de Oliveira Romão", "dia": "28/05"}, {"unidade": "PATOS - PB", "franqueado": "Tacianne de Oliveira Fernandes", "dia": "29/05"}, {"unidade": "GUARABIRA - PB", "franqueado": "Yarianne Melo de Sousa Gama Cabral Araujo", "dia": "21/05"}, {"unidade": "JACAREPAGUA - RJ", "franqueado": "Rodrigo Cézar Marques", "dia": "24/05"}, {"unidade": "JOINVILLE - SC", "franqueado": "Renan Regueira Heidemann", "dia": "13/05"}, {"unidade": "LONDRINA - PR", "franqueado": "Alysson Delalibera", "dia": "30/05"}, {"unidade": "ITAITUBA - PA", "franqueado": "Lucia Evelyn Nunes Charife", "dia": "11/06"}, {"unidade": "JUAZEIRO DO NORTE - CE", "franqueado": "Anne Rocha", "dia": "02/06"}, {"unidade": "BOA VISTA - RR", "franqueado": "Kassia Regina de Sousa Silva", "dia": "06/06"}, {"unidade": "GOIÂNIA - GO", "franqueado": "Lorenzo Di Raimo Fernandes", "dia": "13/06"}, {"unidade": "VITORIA DA CONQUISTA - BA", "franqueado": "Jacqueline Brito de paula", "dia": "15/06"}, {"unidade": "CURITIBA BATEL - PR", "franqueado": "Dayane Batista", "dia": "27/06"}, {"unidade": "DIVINOPOLIS - MG", "franqueado": "Marcelo Antônio Mageste Vieira", "dia": "16/06"}, {"unidade": "NITEROI - RJ", "franqueado": "Thamiris Azeredo Viana", "dia": "04/06"}, {"unidade": "PALHOÇA SÃO JOSÉ - SC", "franqueado": "Ana Claudia Barros", "dia": "24/06"}, {"unidade": "BOA VISTA - RR", "franqueado": "Weverton Augusto Campos ferreira", "dia": "23/07"}, {"unidade": "JUAZEIRO DO NORTE - CE", "franqueado": "Jamille Ferreira Leandro", "dia": "17/07"}, {"unidade": "DIVINOPOLIS - MG", "franqueado": "Marcelo Monteiro Ignacio de Paula", "dia": "18/07"}, {"unidade": "EUSÉBIO E AQUIRAZ - CE", "franqueado": "Fabricia Reges", "dia": "17/07"}, {"unidade": "JOINVILLE - SC", "franqueado": "Camila Orsi Heidemann", "dia": "07/07"}, {"unidade": "PALMAS - TO", "franqueado": "Cibelle Gomes Quintas Toledo", "dia": "17/07"}, {"unidade": "SALVADOR PITUBA - BA", "franqueado": "Camylla Vilas Boas", "dia": "24/07"}, {"unidade": "SANTO ANDRÉ E CAETANO - SP", "franqueado": "Tamires Zanellato Brito", "dia": "03/07"}, {"unidade": "CHAPECÓ - SC", "franqueado": "Denilson Amaral Zimmermann", "dia": "06/08"}, {"unidade": "ARACAJU JARDINS - SE", "franqueado": "Marta Lima campos bezerra", "dia": "30/08"}, {"unidade": "PATOS - PB", "franqueado": "Jonas Fernandes da Silva", "dia": "23/08"}, {"unidade": "SÃO LUIS - MA", "franqueado": "Ricardo Marques Carvalho", "dia": "06/08"}, {"unidade": "SOUSA - PB", "franqueado": "Victor Gadelha", "dia": "01/08"}, {"unidade": "CAMPO GRANDE - MS", "franqueado": "Daniel Leme Di Raimo", "dia": "06/09"}, {"unidade": "BARUERI - SP", "franqueado": "Maraiza Silva Gomes kuwana", "dia": "19/09"}, {"unidade": "MACAPÁ - AP", "franqueado": "Mirelli Perazoli", "dia": "10/09"}, {"unidade": "MARILIA - SP", "franqueado": "Camila Nogueira de Lima Hila", "dia": "11/09"}, {"unidade": "SOUSA - PB", "franqueado": "Bruna Sybelle", "dia": "10/09"}, {"unidade": "VOLTA REDONDA - RJ", "franqueado": "Taís Moreira", "dia": "18/09"}, {"unidade": "JACAREPAGUA - RJ", "franqueado": "Tuany Sales Machado", "dia": "06/09"}, {"unidade": "CASCAVEL - PR", "franqueado": "Daniele karina ferrari de oliveira", "dia": "17/10"}, {"unidade": "BARRA DA TIJUCA - RJ", "franqueado": "Marcis Freire de Brito Fernandes", "dia": "30/10"}, {"unidade": "BARUERI - SP", "franqueado": "Alexandre kuwana da silva", "dia": "12/10"}, {"unidade": "GARANHUNS - PE", "franqueado": "Patricia Raquel Dias Arruda", "dia": "16/10"}, {"unidade": "GOIÂNIA - GO", "franqueado": "Marília Theodoro de Carvalho Di Raimo", "dia": "28/10"}, {"unidade": "TERESINA - PI", "franqueado": "Henrique Buarque Gurgel", "dia": "04/10"}, {"unidade": "NATAL - RN", "franqueado": "Auderi de Lima Filho", "dia": "07/10"}, {"unidade": "RECIFE IMBIRIBEIRA - PE", "franqueado": "Micheli Ferreira dos Santos", "dia": "23/10"}, {"unidade": "CHAPECÓ - SC", "franqueado": "Milla Fontes Dalha Valhe", "dia": "29/11"}, {"unidade": "PORTO VELHO - RO", "franqueado": "Tamires Cunha vitória dos Santos", "dia": "18/11"}, {"unidade": "CAMPO GRANDE - MS", "franqueado": "Sílvia Letícia Raupp da Costa Di Raimo", "dia": "14/11"}, {"unidade": "CURITIBA AHU - PR", "franqueado": "Bruno Brandini", "dia": "29/11"}, {"unidade": "MACAPÁ - AP", "franqueado": "Ivan Perazoli", "dia": "09/11"}, {"unidade": "RIBEIRÃO PRETO - SP", "franqueado": "Juliana Mazucato Veraguas", "dia": "28/11"}, {"unidade": "LONDRINA - PR", "franqueado": "Aline Munhoz Santana Delalibera", "dia": "28/11"}, {"unidade": "BELÉM UMARIZAL - PA", "franqueado": "Camila Cardoso Silva Soares", "dia": "07/12"}, {"unidade": "CUIABÁ - MT", "franqueado": "Rodrigo Castro", "dia": "08/12"}, {"unidade": "SÃO JOSÉ DOS PINHAIS - PR", "franqueado": "Marcos Milani Rua", "dia": "12/12"}, {"unidade": "SÃO LUIS - MA", "franqueado": "Flavia Araujo Figueiredo", "dia": "06/12"}, {"unidade": "LAURO DE FREITAS - BA", "franqueado": "Georgea de Jesus Aragão de Oliveira", "dia": "20/12"}, {"unidade": "GUARABIRA - PB", "franqueado": "Bellyzia Gama da Silva Gomes", "dia": "28/12"}, {"unidade": "SALVADOR PITUBA - BA", "franqueado": "Danilo Almeida", "dia": "21/12"}, {"unidade": "PIRACICABA - SP", "franqueado": "Danilo Chiodi", "dia": "08/03"}];

// ─── ANIVERSARIANTES ─────────────────────────────────────────
const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function mesFromISO(iso){ if(!iso) return null; const p=iso.split("-"); return p.length>=2?parseInt(p[1],10):null; }
function mesFromDDMM(dm){ if(!dm) return null; const p=dm.split("/"); return p.length>=2?parseInt(p[1],10):null; }
function diaFromDDMM(dm){ if(!dm) return null; return parseInt(dm.split("/")[0],10); }
function diaFromISO(iso){ if(!iso) return null; const p=iso.split("-"); return p.length>=3?parseInt(p[2],10):null; }

export function AniversariantesView({ units }) {
  const mesAtual = TODAY.getMonth()+1;
  const [mes, setMes] = useState(mesAtual);
  const [aba, setAba] = useState("unidades"); // unidades | franqueados

  // Aniversários de INAUGURAÇÃO das unidades
  const inaugs = useMemo(()=>units
    .filter(u=>!u.cadastroOnly || u.dataInauguracao || u.inaug)
    .map(u=>{
      const iso = u.dataInauguracao || u.inaug;
      return { nome:u.name, iso, mes:mesFromISO(iso), dia:diaFromISO(iso),
        anos: iso?Math.max(0, 2026 - parseInt(iso.split("-")[0],10)):null,
        franqueado:u.franchiseeName||u.responsavelOp||"", group:u.group, responsible:u.responsible };
    })
    .filter(x=>x.mes===mes)
    .sort((a,b)=>(a.dia||0)-(b.dia||0))
  ,[units,mes]);

  // Aniversários de NASCIMENTO dos franqueados
  const pessoas = useMemo(()=>ANIV_FRANQUEADOS
    .filter(p=>mesFromDDMM(p.dia)===mes)
    .map(p=>({...p, diaN:diaFromDDMM(p.dia)}))
    .sort((a,b)=>a.diaN-b.diaN)
  ,[mes]);

  const lista = aba==="unidades"?inaugs:pessoas;

  return (
    <div style={{padding:"14px",maxWidth:880,margin:"0 auto"}}>
      <div style={{fontSize:15,fontWeight:800,color:C.textPrimary,marginBottom:4}}>🎂 Aniversariantes</div>
      <div style={{fontSize:11,color:C.textMuted,marginBottom:14}}>Aniversários de inauguração das unidades e de nascimento dos franqueados.</div>

      {/* Filtro de mês */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
        {MESES_PT.map((m,i)=>{
          const n=i+1; const sel=mes===n; const isAtual=n===mesAtual;
          return (
            <button key={m} onClick={()=>setMes(n)} style={{
              fontSize:10,fontWeight:sel?800:600,padding:"5px 11px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",position:"relative",
              background: sel?C.laranja:isAtual?"#fff3e6":C.card,
              color: sel?"#fff":isAtual?C.laranja:C.textMuted,
              border:`1px solid ${sel?C.laranja:isAtual?C.laranja:C.cardBorder}`,
            }}>{m.slice(0,3)}{isAtual&&!sel?" ●":""}</button>
          );
        })}
      </div>

      {/* Abas */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["unidades","🏪 Inauguração da unidade",inaugs.length],["franqueados","🎉 Nascimento do franqueado",pessoas.length]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setAba(k)} style={{
            fontSize:11,fontWeight:700,padding:"7px 14px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
            background:aba===k?C.card:"transparent",color:aba===k?C.textPrimary:C.textMuted,
            border:`1px solid ${aba===k?C.cardBorder:"transparent"}`,
          }}>{l} <span style={{opacity:0.6}}>({c})</span></button>
        ))}
      </div>

      {mes===mesAtual&&(
        <div style={{background:"#fff3e6",border:`1px solid ${C.laranja}`,borderRadius:10,padding:"9px 13px",marginBottom:12,fontSize:12,color:"#c46c0a",fontWeight:700}}>
          🎈 Mês corrente — {lista.length} aniversariante{lista.length!==1?"s":""} em {MESES_PT[mes-1]}
        </div>
      )}

      {/* Lista */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {lista.length===0&&<div style={{textAlign:"center",padding:"30px",color:C.textMuted,fontSize:12,background:C.card,borderRadius:12,border:`1px dashed ${C.cardBorder}`}}>Nenhum aniversariante em {MESES_PT[mes-1]}.</div>}

        {aba==="unidades"&&inaugs.map((u,i)=>{
          const gc=GROUP_CFG[u.group];
          const isCurrent = mes===mesAtual;
          return (
            <div key={i} style={{background:isCurrent?"#fffaf2":C.card,border:`1px solid ${isCurrent?C.laranja+"77":C.cardBorder}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div style={{width:42,height:42,borderRadius:10,background:gc?.bg||C.inset,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:14,fontWeight:800,color:gc?.color||C.textPrimary,lineHeight:1}}>{u.dia||"?"}</span>
                <span style={{fontSize:7,color:C.textMuted,textTransform:"uppercase"}}>{MESES_PT[mes-1].slice(0,3)}</span>
              </div>
              <div style={{flex:1,minWidth:140}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{u.nome} {isCurrent&&<span style={{fontSize:11}}>🎂</span>}</div>
                <div style={{fontSize:10,color:C.textMuted}}>{u.franqueado||"—"} {u.responsible&&<>· carteira {u.responsible}</>}</div>
              </div>
              {u.anos!=null&&<div style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:C.inset,color:C.textPrimary}}>{u.anos} {u.anos===1?"ano":"anos"}</div>}
            </div>
          );
        })}

        {aba==="franqueados"&&pessoas.map((p,i)=>{
          const isCurrent = mes===mesAtual;
          return (
            <div key={i} style={{background:isCurrent?"#fffaf2":C.card,border:`1px solid ${isCurrent?C.laranja+"77":C.cardBorder}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:10,background:"#fbeaf0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:14,fontWeight:800,color:"#c25a82",lineHeight:1}}>{p.diaN}</span>
                <span style={{fontSize:7,color:C.textMuted,textTransform:"uppercase"}}>{MESES_PT[mes-1].slice(0,3)}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{p.franqueado} {isCurrent&&<span style={{fontSize:11}}>🎉</span>}</div>
                <div style={{fontSize:10,color:C.textMuted}}>{p.unidade}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
