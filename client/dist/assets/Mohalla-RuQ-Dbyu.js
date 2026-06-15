import{c as v,r as c,j as e,z as d,L as f,U as b}from"./index-Vtxi3Dx5.js";import{S as j,t as N}from"./index-Cmcm-aSP.js";import{b as k}from"./client-B--iDYZO.js";import{C as w}from"./chevron-right-Ngu7ej5m.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=v("MapPin",[["path",{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",key:"2oe9fu"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=v("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]),z=[{pin:"110001",label:"Delhi — CP"},{pin:"400001",label:"Mumbai — Fort"},{pin:"560001",label:"Bengaluru — MG Rd"},{pin:"600001",label:"Chennai — Parrys"},{pin:"700001",label:"Kolkata — BBD Bagh"},{pin:"500001",label:"Hyderabad — Abids"}];function L(){const[a,o]=c.useState(""),[s,l]=c.useState("8.4"),[i,p]=c.useState(null),[t,m]=c.useState(!1),h=async r=>{const g=(r??a).trim();if(!/^\d{6}$/.test(g)){d.error("Please enter a valid 6-digit pin code");return}m(!0),p(null);try{const n=parseFloat(s)||8.4,y=await k(g,n);p(y),r&&o(r)}catch(n){d.error(n instanceof Error?n.message:"Failed to fetch Mohalla data")}finally{m(!1)}},u=r=>{r.preventDefault(),h()};return e.jsxs("div",{className:"page",children:[e.jsxs("div",{className:"container",children:[e.jsx("header",{className:"animate-fade-up",style:{marginBottom:"var(--space-8)"},children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2)"},children:[e.jsx("h1",{style:{fontSize:"2.5rem",color:"var(--color-primary)",margin:0},children:"Mohalla Mode 🏘️"}),e.jsx("p",{style:{fontSize:"1.125rem",color:"var(--color-text-secondary)",maxWidth:"600px",margin:0},children:"See how your carbon footprint compares to your neighbourhood. Enter any 6-digit Indian pin code."})]})}),e.jsxs("div",{className:"mohalla-layout",children:[e.jsxs("section",{className:"card card--glass animate-fade-up delay-100",style:{borderRadius:"24px",padding:"var(--space-6)"},"aria-labelledby":"mohalla-form-heading",children:[e.jsx("h2",{id:"mohalla-form-heading",style:{fontSize:"1.25rem",color:"var(--color-primary)",marginBottom:"var(--space-4)"},children:"Enter your pin code"}),e.jsxs("form",{onSubmit:u,noValidate:!0,children:[e.jsx("label",{className:"input-label",htmlFor:"pin-input",children:"6-digit pin code"}),e.jsx("input",{id:"pin-input",className:"input",type:"text",inputMode:"numeric",pattern:"\\d{6}",maxLength:6,value:a,onChange:r=>{o(r.target.value.replace(/\D/g,""))},placeholder:"e.g. 110001"}),e.jsx("label",{className:"input-label",htmlFor:"co2-input",style:{marginTop:"var(--space-3)"},children:"Your estimated daily CO₂ (kg)"}),e.jsx("input",{id:"co2-input",className:"input",type:"number",min:"1",max:"50",step:"0.1",value:s,onChange:r=>l(r.target.value)}),e.jsx("button",{id:"btn-lookup-mohalla",type:"submit",className:"btn btn--primary",disabled:t||a.length!==6,style:{marginTop:"var(--space-4)",width:"100%",borderRadius:"16px",padding:"var(--space-4)"},"aria-busy":t,children:t?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner","aria-hidden":"true"}),"Loading…"]}):e.jsxs(e.Fragment,{children:[e.jsx(x,{size:20,"aria-hidden":"true"}),"Look up my Mohalla"]})})]}),e.jsxs("div",{style:{marginTop:"var(--space-5)"},children:[e.jsx("p",{className:"section-heading",children:"Quick picks"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2)",marginTop:"var(--space-2)"},children:z.map(r=>e.jsxs("button",{className:"sample-chip",onClick:()=>h(r.pin),"aria-label":`Look up ${r.label}`,children:[e.jsx(w,{size:12,className:"chip-icon","aria-hidden":"true"}),e.jsxs("span",{className:"chip-text",children:[r.pin," — ",r.label]})]},r.pin))})]})]}),e.jsxs("div",{children:[!i&&!t&&e.jsxs("div",{className:"result-placeholder",children:[e.jsx(x,{size:48,style:{color:"var(--color-text-faint)",marginBottom:16},"aria-hidden":"true"}),e.jsx("p",{style:{color:"var(--color-text-faint)"},children:"Neighbourhood data will appear here"})]}),t&&e.jsx(I,{}),i&&e.jsx(C,{data:i})]})]})]}),e.jsx("style",{children:`
        .mohalla-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 768px) { .mohalla-layout { grid-template-columns: 1fr; } }

        .sample-chip {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer; text-align: left;
          transition: var(--transition-fast); width: 100%;
        }
        .sample-chip:hover { border-color: var(--color-accent); background: var(--color-accent-dim); }
        .chip-icon { color: var(--color-accent); flex-shrink: 0; }
        .chip-text { font-size: 0.82rem; color: var(--color-text-muted); }

        .result-placeholder {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: var(--space-12);
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-lg);
          text-align: center; min-height: 300px;
        }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(16, 185, 129, 0.2); border-top-color: var(--color-accent);
          border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px;
        }
        .percentile-ring {
          width: 120px; height: 120px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column;
          font-family: var(--font-display); font-weight: 800; font-size: 2rem;
          color: var(--color-accent);
          border: 4px solid var(--color-accent);
          box-shadow: var(--shadow-glow);
          animation: countUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .percentile-ring span { font-size: 0.7rem; font-weight: 500; color: var(--color-text-muted); }

        .leaderboard-row {
          display: flex; align-items: center; gap: var(--space-4);
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-border);
        }
        .leaderboard-row:last-child { border-bottom: none; }
        .lb-rank { font-weight: 700; font-family: var(--font-display); font-size: 1.1rem; width: 28px; color: var(--color-text-muted); }
        .lb-name { flex: 1; font-size: 0.9rem; }
        .lb-co2  { font-weight: 600; font-size: 0.9rem; color: var(--color-accent); }
        .lb-swap { font-size: 0.78rem; color: var(--color-text-faint); }
      `})]})}function C({data:a}){const o=async()=>{const s=document.getElementById("mohalla-export-node");if(s)try{const l=await N(s,{cacheBust:!0,backgroundColor:"var(--color-bg)"}),i=document.createElement("a");i.download=`mohalla-rank-${a.pincode}.png`,i.href=l,i.click()}catch(l){d.error("Failed to export image"),console.error("Failed to export image",l)}};return e.jsxs("div",{className:"stack stack-lg animate-fade-up",children:[e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:"-var(--space-4)"},children:e.jsxs("button",{className:"btn btn--outline btn--sm",onClick:o,style:{zIndex:10},children:[e.jsx(j,{size:14})," Share Rank"]})}),e.jsxs("div",{id:"mohalla-export-node",style:{padding:"var(--space-4)",background:"var(--color-bg)",borderRadius:"32px"},className:"stack stack-lg",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"var(--space-2)",paddingLeft:"var(--space-2)",marginTop:"-var(--space-2)"},children:[e.jsx(f,{size:20,style:{color:"var(--color-accent)"}}),e.jsx("span",{style:{fontFamily:"var(--font-display)",fontWeight:800,color:"var(--color-accent)"},children:"CarbonIQ Impact"})]}),e.jsx("div",{className:"card card--glass animate-fade-up delay-200",style:{borderRadius:"24px",padding:"var(--space-6)",background:"linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(16,185,129,0.05) 100%)"},children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"var(--space-4)"},children:[e.jsxs("div",{children:[e.jsxs("p",{className:"section-heading",style:{color:"var(--color-primary)"},children:[a.pincode," · ",a.city]}),e.jsx("h2",{style:{fontSize:"2rem",color:"var(--color-primary)",marginBottom:"var(--space-2)"},children:a.area}),e.jsx("p",{style:{color:"var(--color-text-secondary)",fontSize:"1rem",maxWidth:"40ch",lineHeight:1.5},children:a.message}),e.jsxs("p",{style:{marginTop:"var(--space-3)",fontSize:"0.85rem",color:"var(--color-text-faint)"},children:["Grid: ",a.gridFactor," kg CO₂/kWh · ",a.renewablePct,"% renewable · ",a.state]})]}),e.jsxs("div",{className:"percentile-ring","aria-label":`You are in the top ${100-a.percentile} percent of your area`,children:[a.percentile,e.jsx("span",{children:"percentile"})]})]})}),e.jsxs("div",{className:"grid-2",children:[e.jsxs("div",{className:"card card--glass animate-fade-up delay-300",style:{borderRadius:"24px",padding:"var(--space-6)"},children:[e.jsx("p",{className:"section-heading",style:{color:"var(--color-primary)"},children:"Your daily CO₂"}),e.jsxs("div",{className:"stat-value animate-count-up",style:{fontSize:"2.5rem",color:"var(--color-primary)"},children:[a.userFootprintKg," ",e.jsx("span",{style:{fontSize:"1.25rem",fontWeight:500},children:"kg"})]}),e.jsxs("div",{style:{marginTop:"var(--space-3)"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"0.875rem",marginBottom:4},children:[e.jsx("span",{style:{color:"var(--color-text-secondary)",fontWeight:600},children:"You"}),e.jsxs("span",{style:{color:"var(--color-text-secondary)"},children:["Area avg: ",a.areaAverageKg," kg"]})]}),e.jsx("div",{className:"progress-track",children:e.jsx("div",{className:"progress-fill",style:{width:`${Math.min(100,a.userFootprintKg/a.areaAverageKg*100)}%`},role:"progressbar","aria-valuenow":a.userFootprintKg,"aria-valuemax":a.areaAverageKg,"aria-label":"Your footprint vs area average"})})]})]}),e.jsxs("div",{className:"card card--glass animate-fade-up delay-400",style:{borderRadius:"24px",padding:"var(--space-6)"},children:[e.jsx("p",{className:"section-heading",style:{color:"var(--color-primary)"},children:"Collective impact"}),e.jsx("div",{className:"stat-value animate-count-up delay-100",style:{fontSize:"2.5rem",color:"var(--color-accent)"},children:a.collectiveImpact.ifAllSwapped.toLocaleString("en-IN")}),e.jsxs("div",{style:{fontSize:"0.875rem",color:"var(--color-text-secondary)",marginTop:"var(--space-1)"},children:["kg CO₂ saved this month if all ",a.householdsInArea.toLocaleString("en-IN")," households swap"]})]})]}),e.jsxs("div",{className:"card card--glass animate-fade-up delay-500",style:{borderRadius:"24px",padding:"var(--space-6)"},children:[e.jsxs("h3",{style:{marginBottom:"var(--space-4)",fontSize:"1.25rem",color:"var(--color-primary)",display:"flex",alignItems:"center",gap:"var(--space-2)"},children:[e.jsx(S,{size:20,style:{color:"var(--color-accent)"},"aria-hidden":"true"}),"What your neighbours are doing"]}),a.topSwaps.map((s,l)=>e.jsxs("div",{className:"leaderboard-row animate-slide-in",style:{animationDelay:`${l*.1}s`},children:[e.jsx("div",{className:"lb-rank",children:l+1}),e.jsx("div",{style:{flex:1},children:e.jsx("div",{className:"lb-name",style:{fontWeight:600},children:s})}),e.jsxs("span",{className:"badge badge--green",children:[a.topSwapAdoptionPcts[l],"% adopted"]})]},l))]}),e.jsxs("div",{className:"card card--glass animate-fade-up delay-600",style:{borderRadius:"24px",padding:"var(--space-6)"},children:[e.jsxs("h3",{style:{marginBottom:"var(--space-4)",fontSize:"1.25rem",color:"var(--color-primary)",display:"flex",alignItems:"center",gap:"var(--space-2)"},children:[e.jsx(b,{size:20,style:{color:"var(--color-accent)"},"aria-hidden":"true"}),"Area leaderboard (anonymised)"]}),a.leaderboard.map(s=>e.jsxs("div",{className:"leaderboard-row animate-slide-in",style:{animationDelay:`${s.rank*.08}s`},children:[e.jsx("div",{className:"lb-rank",children:s.rank}),e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{className:"lb-name",style:{fontWeight:600},children:s.label}),e.jsx("div",{className:"lb-swap",children:s.topSwap})]}),e.jsxs("div",{className:"lb-co2",children:[s.dailyCO2Kg," kg/day"]})]},s.rank)),e.jsx("p",{style:{fontSize:"0.75rem",color:"var(--color-text-faint)",marginTop:"var(--space-4)"},children:"All data is aggregated and anonymised. Individual households cannot be identified."})]})]})]})}function I(){return e.jsx("div",{className:"stack stack-lg",children:[200,120,180].map((a,o)=>e.jsx("div",{className:"skeleton",style:{height:a,borderRadius:16}},o))})}export{L as default};
