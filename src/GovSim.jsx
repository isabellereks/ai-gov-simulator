import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ───
const C = {
  bg: "#f5f0e8", card: "#fff", cardAlt: "#faf7f2",
  border: "#ddd6c8", borderLight: "#ebe5d9",
  text: "#1a1510", textMid: "#6b604e", textMute: "#a89e8c",
  rep: "#c1432e", dem: "#2e5e8c", ind: "#6b5b95",
  yea: "#2a6e3f", nay: "#943232",
  yeaMute: "#5a7a5f", nayMute: "#a05050",
  bar: "#2c2418", barTrack: "#3d3428", barTrackAlt: "#4a3f30",
  barMute: "#6b604e", barFill: "#c5bca9", barKnob: "#f5f0e8",
};
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";
const R = { sm: 4, md: 6, lg: 8 }; // border radii
const S = { // shadows
  sm: "0 1px 3px rgba(44,36,24,0.06)",
  md: "0 4px 16px rgba(44,36,24,0.08)",
  lg: "0 8px 32px rgba(44,36,24,0.10)",
};

// ─── DATA ───
const SEN=[{n:"John Thune",s:"SD",p:"R",r:"Majority Leader",i:.72},{n:"John Barrasso",s:"WY",p:"R",r:"Majority Whip",i:.78},{n:"Mitch McConnell",s:"KY",p:"R",r:"Senator",i:.71},{n:"Ted Cruz",s:"TX",p:"R",r:"Senator",i:.88},{n:"Lindsey Graham",s:"SC",p:"R",r:"Senator",i:.68},{n:"Tim Scott",s:"SC",p:"R",r:"Senator",i:.76},{n:"Tom Cotton",s:"AR",p:"R",r:"Senator",i:.85},{n:"Josh Hawley",s:"MO",p:"R",r:"Senator",i:.82},{n:"Rand Paul",s:"KY",p:"R",r:"Senator",i:.8},{n:"Susan Collins",s:"ME",p:"R",r:"Senator",i:.45},{n:"Lisa Murkowski",s:"AK",p:"R",r:"Senator",i:.42},{n:"Chuck Grassley",s:"IA",p:"R",r:"Pres. Pro Tempore",i:.7},{n:"Mike Lee",s:"UT",p:"R",r:"Senator",i:.9},{n:"Rick Scott",s:"FL",p:"R",r:"Senator",i:.83},{n:"Ashley Moody",s:"FL",p:"R",r:"Senator",i:.75},{n:"Jim Justice",s:"WV",p:"R",r:"Senator",i:.7},{n:"Bernie Moreno",s:"OH",p:"R",r:"Senator",i:.77},{n:"Dave McCormick",s:"PA",p:"R",r:"Senator",i:.72},{n:"Jim Banks",s:"IN",p:"R",r:"Senator",i:.84},{n:"John Curtis",s:"UT",p:"R",r:"Senator",i:.65},{n:"Bill Hagerty",s:"TN",p:"R",r:"Senator",i:.81},{n:"Katie Britt",s:"AL",p:"R",r:"Senator",i:.76},{n:"Roger Marshall",s:"KS",p:"R",r:"Senator",i:.79},{n:"Cynthia Lummis",s:"WY",p:"R",r:"Senator",i:.83},{n:"Marsha Blackburn",s:"TN",p:"R",r:"Senator",i:.82},{n:"John Cornyn",s:"TX",p:"R",r:"Senator",i:.73},{n:"Joni Ernst",s:"IA",p:"R",r:"Senator",i:.74},{n:"Chuck Schumer",s:"NY",p:"D",r:"Minority Leader",i:.22},{n:"Dick Durbin",s:"IL",p:"D",r:"Minority Whip",i:.18},{n:"Patty Murray",s:"WA",p:"D",r:"Senator",i:.15},{n:"Bernie Sanders",s:"VT",p:"I",r:"Senator",i:.05},{n:"Elizabeth Warren",s:"MA",p:"D",r:"Senator",i:.08},{n:"Amy Klobuchar",s:"MN",p:"D",r:"Senator",i:.28},{n:"Cory Booker",s:"NJ",p:"D",r:"Senator",i:.15},{n:"Chris Murphy",s:"CT",p:"D",r:"Senator",i:.14},{n:"Jon Ossoff",s:"GA",p:"D",r:"Senator",i:.25},{n:"Mark Kelly",s:"AZ",p:"D",r:"Senator",i:.32},{n:"Raphael Warnock",s:"GA",p:"D",r:"Senator",i:.2},{n:"Alex Padilla",s:"CA",p:"D",r:"Senator",i:.12},{n:"Tammy Duckworth",s:"IL",p:"D",r:"Senator",i:.16},{n:"C. Cortez Masto",s:"NV",p:"D",r:"Senator",i:.27},{n:"Jacky Rosen",s:"NV",p:"D",r:"Senator",i:.3},{n:"Angus King",s:"ME",p:"I",r:"Senator",i:.3},{n:"Kirsten Gillibrand",s:"NY",p:"D",r:"Senator",i:.13},{n:"Jeff Merkley",s:"OR",p:"D",r:"Senator",i:.1},{n:"Ed Markey",s:"MA",p:"D",r:"Senator",i:.09},{n:"Maria Cantwell",s:"WA",p:"D",r:"Senator",i:.19},{n:"Ruben Gallego",s:"AZ",p:"D",r:"Senator",i:.23},{n:"Mazie Hirono",s:"HI",p:"D",r:"Senator",i:.11},{n:"Sheldon Whitehouse",s:"RI",p:"D",r:"Senator",i:.14}].map((x,j)=>({...x,id:`s${j}`,ch:"sen"}));
const HOU=[{n:"Mike Johnson",s:"LA",p:"R",r:"Speaker",i:.85},{n:"Steve Scalise",s:"LA",p:"R",r:"Majority Leader",i:.82},{n:"Tom Emmer",s:"MN",p:"R",r:"Majority Whip",i:.75},{n:"Jim Jordan",s:"OH",p:"R",r:"Judiciary Chair",i:.92},{n:"James Comer",s:"KY",p:"R",r:"Oversight Chair",i:.84},{n:"Byron Donalds",s:"FL",p:"R",r:"Rep.",i:.88},{n:"Lauren Boebert",s:"CO",p:"R",r:"Rep.",i:.93},{n:"Nancy Mace",s:"SC",p:"R",r:"Rep.",i:.65},{n:"Don Bacon",s:"NE",p:"R",r:"Rep.",i:.52},{n:"Brian Fitzpatrick",s:"PA",p:"R",r:"Rep.",i:.45},{n:"Mike Lawler",s:"NY",p:"R",r:"Rep.",i:.48},{n:"Chip Roy",s:"TX",p:"R",r:"Rep.",i:.89},{n:"Dan Crenshaw",s:"TX",p:"R",r:"Rep.",i:.71},{n:"Elise Stefanik",s:"NY",p:"R",r:"Rep.",i:.72},{n:"Randy Fine",s:"FL",p:"R",r:"Rep.",i:.8},{n:"Brandon Gill",s:"TX",p:"R",r:"Rep.",i:.78},{n:"Riley Moore",s:"WV",p:"R",r:"Rep.",i:.77},{n:"Lisa McClain",s:"MI",p:"R",r:"Conf. Chair",i:.8},{n:"Anna Paulina Luna",s:"FL",p:"R",r:"Rep.",i:.86},{n:"Hakeem Jeffries",s:"NY",p:"D",r:"Minority Leader",i:.18},{n:"Katherine Clark",s:"MA",p:"D",r:"Minority Whip",i:.12},{n:"Pete Aguilar",s:"CA",p:"D",r:"Caucus Chair",i:.22},{n:"Alexandria Ocasio-Cortez",s:"NY",p:"D",r:"Rep.",i:.04},{n:"Ilhan Omar",s:"MN",p:"D",r:"Rep.",i:.06},{n:"Rashida Tlaib",s:"MI",p:"D",r:"Rep.",i:.05},{n:"Ro Khanna",s:"CA",p:"D",r:"Rep.",i:.1},{n:"Jamie Raskin",s:"MD",p:"D",r:"Rep.",i:.08},{n:"Jim Clyburn",s:"SC",p:"D",r:"Rep.",i:.2},{n:"Maxine Waters",s:"CA",p:"D",r:"Rep.",i:.07},{n:"Pramila Jayapal",s:"WA",p:"D",r:"Prog. Chair",i:.06},{n:"Jared Golden",s:"ME",p:"D",r:"Rep.",i:.38},{n:"Henry Cuellar",s:"TX",p:"D",r:"Rep.",i:.4},{n:"Greg Stanton",s:"AZ",p:"D",r:"Rep.",i:.28},{n:"James Walkinshaw",s:"VA",p:"D",r:"Rep.",i:.18},{n:"K. McDonald Rivet",s:"MI",p:"D",r:"Rep.",i:.25},{n:"Yassamin Ansari",s:"AZ",p:"D",r:"Rep.",i:.2},{n:"Jerry Nadler",s:"NY",p:"D",r:"Rep.",i:.1},{n:"D. Wasserman Schultz",s:"FL",p:"D",r:"Rep.",i:.19}].map((x,j)=>({...x,id:`h${j}`,ch:"hou"}));
const SCT=[{n:"John Roberts",r:"Chief Justice",ab:"G.W. Bush",i:.58,y:2005},{n:"Clarence Thomas",r:"Assoc. Justice",ab:"G.H.W. Bush",i:.92,y:1991},{n:"Samuel Alito",r:"Assoc. Justice",ab:"G.W. Bush",i:.88,y:2006},{n:"Sonia Sotomayor",r:"Assoc. Justice",ab:"Obama",i:.12,y:2009},{n:"Elena Kagan",r:"Assoc. Justice",ab:"Obama",i:.18,y:2010},{n:"Neil Gorsuch",r:"Assoc. Justice",ab:"Trump",i:.82,y:2017},{n:"Brett Kavanaugh",r:"Assoc. Justice",ab:"Trump",i:.75,y:2018},{n:"Amy Coney Barrett",r:"Assoc. Justice",ab:"Trump",i:.8,y:2020},{n:"Ketanji Brown Jackson",r:"Assoc. Justice",ab:"Biden",i:.15,y:2022}].map((x,j)=>({...x,id:`j${j}`,p:x.i>.5?"R":"D",ch:"sct"}));
const EXC=[{n:"Donald Trump",r:"President",p:"R",i:.82},{n:"J.D. Vance",r:"Vice President",p:"R",i:.8},{n:"Marco Rubio",r:"Sec. of State",p:"R",i:.74},{n:"Pete Hegseth",r:"Sec. of Defense",p:"R",i:.85},{n:"Pam Bondi",r:"Attorney General",p:"R",i:.78},{n:"Scott Bessent",r:"Sec. of Treasury",p:"R",i:.7},{n:"R.F.K. Jr.",r:"Sec. of HHS",p:"R",i:.55},{n:"Linda McMahon",r:"Sec. of Education",p:"R",i:.68},{n:"Russell Vought",r:"OMB Director",p:"R",i:.88},{n:"Tulsi Gabbard",r:"DNI",p:"R",i:.6}].map((x,j)=>({...x,id:`e${j}`,ch:"exc"}));
const POLS=[{name:"Secure Borders Act",center:.78,lean:"right"},{name:"Green New Deal 2.0",center:.12,lean:"left"},{name:"Tax Relief & Jobs Act",center:.8,lean:"right"},{name:"Medicare for All",center:.08,lean:"left"},{name:"Infrastructure & AI Act",center:.48,lean:"center"},{name:"2nd Amendment Expansion",center:.86,lean:"right"},{name:"Student Debt Relief",center:.15,lean:"left"},{name:"Tech Antitrust Reform",center:.38,lean:"center"},{name:"Criminal Justice Reform",center:.33,lean:"center"}];

function vt(m,pol){return(1-Math.abs(m.i-pol.center)+(Math.random()-.5)*.35)>.5}
function sim(ms,pol){const r=ms.map(m=>({...m,v:vt(m,pol)}));const y=r.filter(x=>x.v).length;return{r,y,n:r.length-y,ok:y>r.length/2}}

const VIEWS_MOB={idle:{x:0,y:0,w:1280,h:700},hou:{x:60,y:420,w:460,h:260},sen:{x:60,y:0,w:460,h:240},exc:{x:540,y:170,w:320,h:260},sct:{x:830,y:170,w:440,h:260},done:{x:0,y:0,w:1280,h:700}};
const VIEWS_DT={idle:{x:0,y:-20,w:1380,h:800},hou:{x:30,y:400,w:540,h:300},sen:{x:30,y:-20,w:540,h:280},exc:{x:480,y:120,w:440,h:340},sct:{x:830,y:150,w:440,h:260},done:{x:0,y:-20,w:1380,h:800}};
function lerp(a,b,t){return a+(b-a)*t}

// ─── TIMELINE BUILDER ───
function buildTimeline(policy){
  const ev=[];let t=0;const shuf=a=>[...a].sort(()=>Math.random()-.5);
  // House
  const hr=sim(HOU,policy);ev.push({t,type:"stage",val:"hou"},{t,type:"counter",y:0,n:0});t+=600;
  const hs=shuf(hr.r);let hy=0,hn=0;
  hs.forEach((m,i)=>{if(m.v)hy++;else hn++;ev.push({t:t+i*30,type:"vote",id:m.id,v:m.v},{t:t+i*30,type:"counter",y:hy,n:hn})});
  t+=hs.length*30+400;ev.push({t,type:"houseResult",...hr});
  if(!hr.ok){t+=300;ev.push({t,type:"stage",val:"done"},{t,type:"outcome",s:"Defeated",w:"House"});return{events:ev,duration:t+2000}}
  t+=600;ev.push({t,type:"pause",next:"Senate Vote"});t+=100;
  // Senate
  const sr=sim(SEN,policy);ev.push({t,type:"stage",val:"sen"},{t,type:"counter",y:0,n:0});t+=600;
  const ss=shuf(sr.r);let sy=0,sn=0;
  ss.forEach((m,i)=>{if(m.v)sy++;else sn++;ev.push({t:t+i*25,type:"vote",id:m.id,v:m.v},{t:t+i*25,type:"counter",y:sy,n:sn})});
  t+=ss.length*25+400;ev.push({t,type:"senateResult",...sr});
  if(!sr.ok){t+=300;ev.push({t,type:"stage",val:"done"},{t,type:"outcome",s:"Defeated",w:"Senate"});return{events:ev,duration:t+2000}}
  t+=600;ev.push({t,type:"pause",next:"Presidential Action"});t+=100;
  // President
  ev.push({t,type:"stage",val:"exc"},{t,type:"counter",y:0,n:0});t+=1500;
  const signed=Math.abs(EXC[0].i-policy.center)<.35||Math.random()>.65;
  ev.push({t,type:"vote",id:EXC[0].id,v:signed},{t,type:"presResult",signed});
  if(!signed){t+=1200;ev.push({t,type:"stage",val:"done"},{t,type:"outcome",s:"Vetoed"});return{events:ev,duration:t+2000}}
  t+=800;ev.push({t,type:"pause",next:"Supreme Court"});t+=100;
  // SCOTUS
  ev.push({t,type:"stage",val:"sct"},{t,type:"counter",y:0,n:0});
  const extreme=Math.abs(policy.center-.5)>.25;const challenged=extreme&&Math.random()<.55;
  if(!challenged){t+=1200;ev.push({t,type:"scotusResult",ch:false});t+=500;ev.push({t,type:"stage",val:"done"},{t,type:"outcome",s:"Enacted"});return{events:ev,duration:t+2000}}
  t+=800;const cr=sim(SCT,policy);const cs=shuf(cr.r);let cy2=0,cn2=0;
  cs.forEach((m,i)=>{if(m.v)cy2++;else cn2++;ev.push({t:t+i*300,type:"vote",id:m.id,v:m.v},{t:t+i*300,type:"counter",y:cy2,n:cn2})});
  t+=cs.length*300+500;const upheld=cr.y>=5;
  ev.push({t,type:"scotusResult",ch:true,upheld,y:cr.y,n:cr.n});t+=1000;
  ev.push({t,type:"stage",val:"done"},{t,type:"outcome",s:upheld?"Enacted":"Unconstitutional"});
  return{events:ev,duration:t+2000};
}

// ─── RESPONSIVE HOOK ───
function useWindowSize(){
  const[size,setSize]=useState(null);
  useEffect(()=>{
    function update(){setSize({w:window.innerWidth,h:window.innerHeight})}
    update();window.addEventListener("resize",update);
    return()=>window.removeEventListener("resize",update);
  },[]);
  return size||{w:1280,h:800};
}
function useMounted(){const[m,setM]=useState(false);useEffect(()=>setM(true),[]);return m;}

// ─── COMPONENT ───
export default function GovSim(){
  const mounted=useMounted();
  const win=useWindowSize();
  const mob=mounted&&win.w<768;
  const sm=mounted&&win.w<480;
  const[timeline,setTimeline]=useState(null);
  const[playhead,setPlayhead]=useState(0);
  const[playing,setPlaying]=useState(false);
  const[speed,setSpeed]=useState(1);
  const[pol,setPol]=useState(null);
  const[hov,setHov]=useState(null);
  const[mp,setMp]=useState({x:0,y:0});
  const[vb,setVb]=useState(VIEWS_DT.idle);
  const tgt=useRef(VIEWS_DT.idle);const cur=useRef(VIEWS_DT.idle);const lastT=useRef(null);

  // Derive state from playhead
  const snap=useMemo(()=>{
    if(!timeline)return{stage:"idle",rv:{},cy:0,cn:0,hR:null,sR:null,pR:null,cR:null,out:null,paused:null};
    const st={stage:"idle",rv:{},cy:0,cn:0,hR:null,sR:null,pR:null,cR:null,out:null,paused:null};
    for(const e of timeline.events){
      if(e.t>playhead)break;
      if(e.type==="stage")st.stage=e.val;if(e.type==="vote")st.rv[e.id]=e.v;
      if(e.type==="counter"){st.cy=e.y;st.cn=e.n}
      if(e.type==="houseResult")st.hR=e;if(e.type==="senateResult")st.sR=e;
      if(e.type==="presResult")st.pR=e;if(e.type==="scotusResult")st.cR=e;
      if(e.type==="outcome")st.out=e;if(e.type==="pause")st.paused=e;
    }
    if(st.paused){const pt=st.paused.t;const nx=timeline.events.filter(e=>e.t>pt&&e.type!=="pause");if(nx.length>0&&playhead>nx[0].t)st.paused=null}
    return st;
  },[timeline,playhead]);

  // Animation loop
  useEffect(()=>{
    let raf;const anim=(now)=>{
      if(lastT.current===null)lastT.current=now;const dt=now-lastT.current;lastT.current=now;
      const t=tgt.current,c=cur.current;
      cur.current={x:lerp(c.x,t.x,.07),y:lerp(c.y,t.y,.07),w:lerp(c.w,t.w,.07),h:lerp(c.h,t.h,.07)};
      setVb(cur.current);
      if(playing&&timeline){
        setPlayhead(prev=>{const n=prev+dt*speed;if(n>=timeline.duration){setPlaying(false);return timeline.duration}
          for(const e of timeline.events){if(e.type==="pause"&&prev<e.t&&n>=e.t){setPlaying(false);return e.t}}return n});
      }
      raf=requestAnimationFrame(anim);
    };raf=requestAnimationFrame(anim);return()=>cancelAnimationFrame(raf);
  },[playing,timeline,speed]);

  const VIEWS=mob?VIEWS_MOB:VIEWS_DT;
  useEffect(()=>{tgt.current=VIEWS[snap.stage]||VIEWS.idle},[snap.stage,mob]);

  // Positions
  const positions=useMemo(()=>{
    const p={};
    // Senate — left column, top
    [...SEN].sort((a,b)=>a.i-b.i).forEach((s,idx)=>{const a=Math.PI*.06+(idx/(SEN.length-1))*Math.PI*.88;const row=Math.floor(idx/18);p[s.id]={x:Math.cos(a)*(130+row*26)+300,y:Math.sin(a)*(130+row*26)+40}});
    // House — left column, bottom (well spaced from senate)
    [...HOU].sort((a,b)=>a.i-b.i).forEach((h,idx)=>{const a=Math.PI*.04+(idx/(HOU.length-1))*Math.PI*.92;const row=Math.floor(idx/14);p[h.id]={x:Math.cos(a)*(95+row*24)+300,y:Math.sin(a)*(95+row*24)+520}});
    // Executive — middle column, vertically centered
    const cx=700,cy=310;p[EXC[0].id]={x:cx,y:cy};p[EXC[1].id]={x:cx,y:cy-65};
    EXC.slice(2).forEach((e,idx)=>{const a=(idx/(EXC.length-2))*Math.PI*2-Math.PI/2;const r=85+(idx%2)*30;p[e.id]={x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r}});
    // SCOTUS — right column, vertically centered
    const bx=1050,by=310;p[SCT[0].id]={x:bx,y:by-70};
    [3,4,8,7,6,5,2,1].forEach((ji,idx)=>{p[SCT[ji].id]={x:bx-140+idx*40,y:by}});
    return p;
  },[]);

  // Sections for scrub bar
  const sections=useMemo(()=>{
    if(!timeline)return[];const so=[];
    for(const e of timeline.events){if(e.type==="stage"&&e.val!=="done"){if(!so.length||so[so.length-1].val!==e.val)so.push({val:e.val,start:e.t})}if(e.type==="stage"&&e.val==="done"&&so.length)so[so.length-1].end=e.t}
    so.forEach((s,i)=>{if(!s.end)s.end=i<so.length-1?so[i+1].start:timeline.duration});
    const lb={hou:"House",sen:"Senate",exc:"President",sct:"Court"};
    return so.map(s=>({label:lb[s.val]||"",start:s.start/timeline.duration,end:s.end/timeline.duration,mid:((s.start+s.end)/2)/timeline.duration}));
  },[timeline]);

  const go=useCallback(policy=>{setPol(policy);setTimeline(buildTimeline(policy));setPlayhead(0);setPlaying(true)},[]);
  const reset=()=>{setTimeline(null);setPol(null);setPlayhead(0);setPlaying(false)};
  const replay=()=>{setPlayhead(0);setPlaying(true);cur.current=VIEWS.idle};

  const partyColor=p=>p==="R"?C.rep:p==="D"?C.dem:C.ind;
  const nc=m=>{const v=snap.rv[m.id];if(v===true)return C.yea;if(v===false)return C.nay;return partyColor(m.p)};
  const nr=m=>{if(m.r==="President")return 14;if(m.r==="Chief Justice")return 10;if(m.r?.includes("Leader")||m.r?.includes("Speaker"))return 9;if(m.r?.includes("Whip")||m.r?.includes("Chair")||m.r==="Vice President")return 7;if(m.ch==="sct")return 9;if(m.ch==="exc")return 6;return 5.5};

  const all=[...SEN,...HOU,...EXC,...SCT];
  const vbStr=`${vb.x} ${vb.y} ${vb.w} ${vb.h}`;
  const pct=timeline?Math.min(1,playhead/timeline.duration):0;
  const isActive=snap.stage!=="idle"&&snap.stage!=="done";
  const stageTitle={hou:"House Vote",sen:"Senate Vote",exc:"Presidential Action",sct:"Supreme Court Review"};

  // ─── Shared overlay card style ───
  const cardStyle={background:C.card,border:`1px solid ${C.border}`,borderRadius:R.lg,boxShadow:S.md};

  return(
    <div onMouseMove={e=>setMp({x:e.clientX,y:e.clientY})} onClick={e=>{if(mob&&hov&&!e.target.closest("g"))setHov(null)}} style={{width:"100%",height:"100dvh",overflow:"hidden",position:"relative",background:C.bg,fontFamily:SERIF,color:C.text,touchAction:"manipulation"}}>
      <style>{`@keyframes shimmer{0%,100%{background-position:200% 0}50%{background-position:-200% 0}}`}</style>
      {/* Texture */}
      <div style={{position:"absolute",inset:0,opacity:.02,pointerEvents:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,backgroundSize:"256px"}}/>

      {/* SVG */}
      <svg viewBox={vbStr} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid meet">
        <text x="300" y="16" textAnchor="middle" style={{fontSize:14,fill:C.textMid,letterSpacing:4,fontFamily:SANS,fontWeight:700}}>UNITED STATES SENATE</text>
        <text x="300" y="470" textAnchor="middle" style={{fontSize:14,fill:C.textMid,letterSpacing:4,fontFamily:SANS,fontWeight:700}}>HOUSE OF REPRESENTATIVES</text>
        <text x="700" y="170" textAnchor="middle" style={{fontSize:14,fill:C.textMid,letterSpacing:4,fontFamily:SANS,fontWeight:700}}>EXECUTIVE</text>
        <text x="1050" y="200" textAnchor="middle" style={{fontSize:14,fill:C.textMid,letterSpacing:4,fontFamily:SANS,fontWeight:700}}>SUPREME COURT</text>

        {all.map(m=>{const p=positions[m.id];if(!p)return null;const r=nr(m),c=nc(m),isH=hov?.id===m.id,revealed=snap.rv[m.id]!==undefined,scale=revealed?1.3:1;
          return(<g key={m.id} style={{cursor:"pointer"}}>
            {isH&&<circle cx={p.x} cy={p.y} r={r*3} fill={c} opacity={.12}/>}
            {mob&&<circle cx={p.x} cy={p.y} r={Math.max(r*1.8,10)} fill="transparent" onPointerDown={e=>{e.stopPropagation();setMp({x:e.clientX,y:e.clientY});setHov(hov?.id===m.id?null:m)}}/>}
            <circle cx={p.x} cy={p.y} r={r*scale} fill={c} opacity={isH?1:.85} stroke={isH?C.text:"none"} strokeWidth={1} style={{transition:"fill 0.2s"}}
              onMouseEnter={()=>{if(!mob)setHov(m)}} onMouseLeave={()=>{if(!mob)setHov(null)}}/>
          </g>)})}

        {/* Labels */}
        {SCT.map(j=>{const p=positions[j.id];return p&&<text key={j.id+"l"} x={p.x} y={p.y+nr(j)+16} textAnchor="middle" style={{fontSize:8,fill:C.textMid,fontFamily:SANS,fontWeight:600,pointerEvents:"none"}}>{j.r==="Chief Justice"?"CJ Roberts":j.n.split(" ").pop()}</text>})}
        {EXC.slice(0,2).map(m=>{const p=positions[m.id];return p&&<text key={m.id+"l"} x={p.x} y={p.y+nr(m)+14} textAnchor="middle" style={{fontSize:10,fill:C.text,fontFamily:SANS,fontWeight:700,pointerEvents:"none"}}>{m.n.split(" ").pop()}</text>})}
      </svg>

      {/* ─── Top bar ─── */}
      <div style={{position:"absolute",top:0,left:0,right:0,padding:mob?"10px 14px":"16px 28px",display:"flex",flexDirection:mob?"column":"row",justifyContent:"space-between",alignItems:mob?"flex-start":"center",gap:mob?6:0,background:`linear-gradient(180deg, ${C.bg} 60%, ${C.bg}00)`,zIndex:10,pointerEvents:"none"}}>
        <div>
          <div style={{fontSize:mob?8:11,letterSpacing:mob?1:3,textTransform:"uppercase",color:C.textMute,fontFamily:SANS,fontWeight:500}}>PolicySim: U.S. Federal Policy Simulator</div>
          {pol&&<div style={{marginTop:2,display:"flex",alignItems:"baseline",gap:mob?6:10,flexWrap:"wrap"}}>
            <span style={{fontSize:mob?10:12,fontFamily:SANS,fontWeight:600,letterSpacing:mob?1:2,textTransform:"uppercase",color:C.textMute,background:`linear-gradient(90deg,${C.textMute},${C.text},${C.textMute})`,backgroundSize:"200% 100%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 2.5s ease-in-out infinite"}}>Now voting on:</span>
            <span style={{fontSize:mob?16:22,fontWeight:400,color:C.text}}>{pol.name}</span>
          </div>}
        </div>
        {pol&&<div style={{display:"flex",gap:mob?6:10}}>
          {["hou","sen","exc","sct"].map((s,i)=>{const labels=mob?["H","S","P","C"]:["House","Senate","President","Court"];const done=["hou","sen","exc","sct"].indexOf(snap.stage)>i||snap.stage==="done";const act=snap.stage===s;
            return(<div key={s} style={{display:"flex",alignItems:"center",gap:mob?3:5}}>
              <div style={{width:mob?6:8,height:mob?6:8,borderRadius:"50%",background:act?C.rep:done?C.yea:C.border,boxShadow:act?`0 0 8px ${C.rep}66`:"none"}}/>
              <span style={{fontSize:mob?10:13,fontFamily:SANS,color:act?C.text:done?C.yeaMute:C.textMute,fontWeight:act?700:400}}>{labels[i]}</span>
              {i<3&&<span style={{color:C.border,fontSize:mob?9:11}}>→</span>}
            </div>)})}
        </div>}
      </div>

      {/* ─── Watermark (removed) ─── */}

      {/* ─── Continue prompt ─── */}
      {snap.paused&&!playing&&<div style={{position:"absolute",bottom:mob?64:68,left:"50%",transform:"translateX(-50%)",textAlign:"center",zIndex:20,...cardStyle,padding:mob?"12px 18px":"16px 32px",maxWidth:mob?"90vw":"none"}}>
        <div style={{fontSize:mob?11:13,color:C.textMute,fontFamily:SANS,fontWeight:500,marginBottom:mob?6:10}}>
          {snap.hR&&!snap.sR?`House ${snap.hR.ok?"passed":"failed"} ${snap.hR.y}–${snap.hR.n}`:snap.sR&&!snap.pR?`Senate ${snap.sR.ok?"passed":"failed"} ${snap.sR.y}–${snap.sR.n}`:snap.pR?`President ${snap.pR.signed?"signed":"vetoed"}`:""}
        </div>
        <div onClick={()=>{setPlaying(true);setPlayhead(p=>p+150)}} style={{display:"inline-flex",alignItems:"center",gap:6,padding:mob?"8px 18px":"10px 28px",borderRadius:R.md,background:C.bar,color:C.bg,cursor:"pointer",fontSize:mob?12:14,fontFamily:SANS,fontWeight:600,pointerEvents:"auto"}}>
          Continue to {snap.paused.next}<span style={{fontSize:mob?13:16}}>→</span>
        </div>
      </div>}

      {/* ─── Live counter ─── */}
      {isActive&&!snap.out&&!(snap.paused&&!playing)&&(snap.stage==="hou"||snap.stage==="sen"||snap.stage==="sct")&&(snap.cy>0||snap.cn>0)&&
        <div style={{position:"absolute",bottom:mob?64:68,left:"50%",transform:"translateX(-50%)",display:"flex",gap:mob?20:36,alignItems:"baseline",zIndex:10,...cardStyle,padding:mob?"10px 24px":"14px 40px"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:mob?32:48,fontWeight:300,color:C.yea,lineHeight:1,fontFamily:SANS}}>{snap.cy}</div><div style={{fontSize:mob?10:12,color:C.yeaMute,fontFamily:SANS,fontWeight:600,letterSpacing:2,marginTop:2}}>YEA</div></div>
          <div style={{width:1,height:mob?32:48,background:C.border}}/>
          <div style={{textAlign:"center"}}><div style={{fontSize:mob?32:48,fontWeight:300,color:C.nay,lineHeight:1,fontFamily:SANS}}>{snap.cn}</div><div style={{fontSize:mob?10:12,color:C.nayMute,fontFamily:SANS,fontWeight:600,letterSpacing:2,marginTop:2}}>NAY</div></div>
        </div>}

      {/* ─── Presidential decision ─── */}
      {snap.pR&&snap.stage==="exc"&&!snap.out&&!(snap.paused&&!playing)&&
        <div style={{position:"absolute",bottom:mob?64:68,left:"50%",transform:"translateX(-50%)",textAlign:"center",zIndex:10,maxWidth:mob?"90vw":"none"}}>
          <div style={{background:C.card,borderRadius:R.lg,padding:mob?"14px 28px":"18px 44px",boxShadow:S.lg,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:mob?10:11,fontFamily:SANS,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.textMute,marginBottom:4}}>Presidential Action</div>
            <div style={{fontSize:mob?20:28,fontWeight:600,fontFamily:SANS,color:snap.pR.signed?C.yea:C.nay}}>{snap.pR.signed?"Signed Into Law":"Vetoed"}</div>
          </div>
        </div>}

      {/* ─── Outcome ─── */}
      {snap.out&&(()=>{
        const won=snap.out.s==="Enacted";
        const label={Enacted:"Law Enacted",Defeated:`Defeated in the ${snap.out.w}`,Vetoed:"Presidential Veto",Unconstitutional:"Ruled Unconstitutional"}[snap.out.s];
        const accent=won?C.yea:C.nay;
        return <div style={{position:"absolute",bottom:mob?64:68,left:"50%",transform:"translateX(-50%)",textAlign:"center",zIndex:20,maxWidth:mob?"90vw":"none"}}>
          <div style={{background:C.card,borderRadius:R.lg,padding:mob?"16px 28px":"22px 52px",boxShadow:S.lg,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:mob?10:11,fontFamily:SANS,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.textMute,marginBottom:6}}>Final Result</div>
            <div style={{fontSize:mob?22:34,fontWeight:600,fontFamily:SANS,color:accent,lineHeight:1.1}}>{label}</div>
          </div>
        </div>;
      })()}

      {/* ─── Hero / idle ─── */}
      {!timeline&&<div style={{position:"absolute",inset:0,zIndex:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,padding:mob?"20px 16px":"0",overflow:"auto"}}>
        <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          {[{x:"8%",y:"18%",s:80,c:C.rep,o:.06},{x:"85%",y:"22%",s:60,c:C.dem,o:.06},{x:"15%",y:"75%",s:50,c:C.dem,o:.05},{x:"78%",y:"70%",s:70,c:C.rep,o:.05},{x:"50%",y:"12%",s:40,c:C.textMute,o:.04},{x:"92%",y:"50%",s:45,c:C.rep,o:.04},{x:"5%",y:"48%",s:55,c:C.dem,o:.04}].map((d,i)=>
            <div key={i} style={{position:"absolute",left:d.x,top:d.y,width:mob?d.s*.6:d.s,height:mob?d.s*.6:d.s,borderRadius:"50%",background:d.c,opacity:d.o,transform:"translate(-50%,-50%)"}}/>)}
        </div>
        <div style={{textAlign:"center",marginBottom:mob?20:36,position:"relative"}}>
          <div style={{fontSize:mob?10:12,letterSpacing:mob?3:6,textTransform:"uppercase",color:C.textMute,fontFamily:SANS,fontWeight:600,marginBottom:mob?6:10}}>U.S. Federal Government</div>
          <h1 style={{fontSize:sm?32:mob?40:56,fontWeight:300,color:C.text,lineHeight:1,margin:0,letterSpacing:-1.5}}>Policy Simulator</h1>
          <div style={{fontSize:mob?12:14,color:C.textMute,marginTop:mob?8:12,fontFamily:SANS,fontWeight:400,letterSpacing:1}}>Senate · House · Executive · Supreme Court</div>
        </div>
        <div style={{position:"relative",width:mob?"100%":360,maxWidth:360}}>
          <div style={{background:C.card,borderRadius:R.lg,overflow:"hidden",boxShadow:`${S.sm}, ${S.lg}`,border:`1px solid ${C.border}`}}>
            <div style={{padding:mob?"10px 16px":"12px 20px",borderBottom:`1px solid ${C.borderLight}`}}>
              <span style={{fontSize:mob?10:11,color:C.textMute,fontFamily:SANS,fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>Select a bill</span>
            </div>
            {POLS.map((p,idx)=><div key={idx} onClick={()=>go(p)} style={{padding:mob?"10px 16px":"11px 20px",cursor:"pointer",borderBottom:idx<POLS.length-1?`1px solid ${C.borderLight}`:"none",display:"flex",alignItems:"center",gap:mob?8:11,transition:"background 0.1s"}}
              onMouseEnter={e=>{if(!mob)e.currentTarget.style.background=C.cardAlt}} onMouseLeave={e=>{if(!mob)e.currentTarget.style.background="transparent"}}>
              <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:p.lean==="right"?C.rep:p.lean==="left"?C.dem:C.textMute}}/>
              <span style={{fontSize:mob?14:15,fontWeight:500,color:C.text}}>{p.name}</span>
            </div>)}
          </div>
        </div>
      </div>}

      {/* ─── Tooltip ─── */}
      {hov&&<div style={mob?{position:"fixed",left:Math.min(Math.max(mp.x,80),win.w-80),top:mp.y-90,transform:"translateX(-50%)",background:C.card,border:`1px solid ${C.border}`,borderRadius:R.md,padding:"6px 12px",zIndex:1000,pointerEvents:"none",boxShadow:S.md,maxWidth:"80vw"}:{position:"fixed",left:mp.x+16,top:mp.y-12,background:C.card,border:`1px solid ${C.border}`,borderRadius:R.md,padding:"8px 14px",zIndex:1000,pointerEvents:"none",boxShadow:S.md}}>
        <div style={{fontSize:mob?13:15,fontWeight:600,color:C.text}}>{hov.n}</div>
        <div style={{fontSize:mob?10:11,color:C.textMute,marginTop:1}}>{hov.r}{hov.s?`, ${hov.s}`:""}</div>
        <div style={{display:"flex",gap:6,marginTop:4}}>
          <span style={{fontSize:10,padding:"1px 6px",borderRadius:R.sm,background:partyColor(hov.p)+"18",color:partyColor(hov.p),fontFamily:SANS,fontWeight:600}}>{hov.p==="R"?"Republican":hov.p==="D"?"Democrat":"Independent"}</span>
        </div>
        {snap.rv[hov.id]!==undefined&&<div style={{marginTop:4,fontSize:12,fontWeight:700,color:snap.rv[hov.id]?C.yea:C.nay,fontFamily:SANS}}>{snap.rv[hov.id]?"Yea":"Nay"}</div>}
        {hov.ab&&<div style={{fontSize:10,color:C.textMute,marginTop:2,fontFamily:SANS}}>Appointed by {hov.ab}, {hov.y}</div>}
      </div>}

      {/* ─── Video bar ─── */}
      {timeline&&<div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:30,background:C.bar,paddingBottom:mob?"env(safe-area-inset-bottom, 8px)":"0"}}>
        <div style={{padding:mob?"8px 12px":"8px 20px",display:"flex",alignItems:"center",gap:mob?10:14,height:mob?40:48}}>
          {/* Play */}
          <div onClick={()=>{if(playhead>=(timeline?.duration||0))replay();else setPlaying(!playing)}} style={{width:32,height:32,borderRadius:"50%",background:C.barKnob,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
            {playing?<svg width="12" height="12" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" fill={C.bar}/><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill={C.bar}/></svg>
            :<svg width="12" height="12" viewBox="0 0 14 14"><path d="M4 1.5l7.5 5.5L4 12.5z" fill={C.bar}/></svg>}
          </div>
          {/* Track */}
          <div style={{flex:1,position:"relative",height:30,cursor:"pointer"}} onClick={e=>{const rect=e.currentTarget.getBoundingClientRect();const cx=e.clientX||0;setPlayhead(Math.max(0,Math.min(1,(cx-rect.left)/rect.width))*timeline.duration);cur.current=VIEWS.idle}}
            onTouchStart={e=>{const rect=e.currentTarget.getBoundingClientRect();const cx=e.touches[0].clientX;setPlayhead(Math.max(0,Math.min(1,(cx-rect.left)/rect.width))*timeline.duration);cur.current=VIEWS.idle}}>
            {sections.map((s,idx)=><div key={idx} style={{position:"absolute",left:`${s.start*100}%`,width:`${(s.end-s.start)*100}%`,top:0,height:30}}>
              <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",fontSize:mob?8:9,color:C.barMute,fontFamily:SANS,fontWeight:600,whiteSpace:"nowrap",letterSpacing:mob?0:1}}>{mob?s.label.charAt(0):s.label}</div>
              <div style={{position:"absolute",top:14,left:0,right:0,height:4,borderRadius:2,background:idx%2===0?C.barTrack:C.barTrackAlt}}/>
              {idx>0&&<div style={{position:"absolute",top:12,left:0,width:1,height:8,background:C.barMute}}/>}
            </div>)}
            <div style={{position:"absolute",top:14,left:0,right:0,height:4,background:"#352e22",borderRadius:2,zIndex:-1}}/>
            <div style={{position:"absolute",top:14,left:0,height:4,borderRadius:2,width:`${pct*100}%`,background:C.barFill,zIndex:1}}/>
            <div style={{position:"absolute",top:10,left:`${pct*100}%`,transform:"translateX(-50%)",width:12,height:12,borderRadius:"50%",background:C.barKnob,boxShadow:"0 1px 4px rgba(0,0,0,.3)",zIndex:2}}/>
          </div>
          {/* Speed + New */}
          <div style={{display:"flex",alignItems:"center",gap:mob?6:8,flexShrink:0}}>
            {!sm&&<div style={{display:"flex",gap:2}}>
              {[.5,1,2].map(s=><div key={s} onClick={()=>setSpeed(s)} style={{padding:"2px 6px",borderRadius:R.sm,cursor:"pointer",background:speed===s?C.barKnob:"transparent",color:speed===s?C.bar:C.barMute,fontSize:11,fontFamily:SANS,fontWeight:600}}>{s}x</div>)}
            </div>}
            <div onClick={reset} style={{padding:"4px 12px",borderRadius:R.sm,cursor:"pointer",border:`1px solid ${C.barMute}`,color:C.barFill,fontSize:10,fontFamily:SANS,fontWeight:600}}>New</div>
          </div>
        </div>
      </div>}
    </div>
  );
}
