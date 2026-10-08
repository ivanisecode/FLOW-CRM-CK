import { C } from "./constants";

export const labelSt = {fontSize:10,color:C.textMuted,display:"block",marginBottom:4,
  textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600};

export const inputSt = {width:"100%",padding:"8px 12px",background:C.inset,
  border:`1px solid ${C.cardBorder}`,borderRadius:8,color:C.textPrimary,
  fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};

export const btnSt = (bg,color="#fff") => ({
  padding:"8px 16px",borderRadius:8,background:bg,border:"none",
  color,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",
});
