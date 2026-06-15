import{c as h,r as n,j as e,z as u}from"./index-Vtxi3Dx5.js";import{c as N}from"./client-B--iDYZO.js";import{A as S}from"./arrow-right-CqADAAkb.js";import{C as R}from"./circle-check-big-CZEZvgcI.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=h("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=h("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=h("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]),j={low:{color:"#4ade80",bg:"rgba(34,197,94,0.15)",icon:e.jsx(R,{size:14}),label:"Low impact"},moderate:{color:"#fbbf24",bg:"rgba(245,158,11,0.15)",icon:e.jsx(b,{size:14}),label:"Moderate"},high:{color:"#f87171",bg:"rgba(239,68,68,0.15)",icon:e.jsx(b,{size:14}),label:"High impact"},unknown:{color:"#9ca3af",bg:"rgba(75,85,99,0.2)",icon:null,label:"Unknown"}};function P(){const[a,t]=n.useState(null),[i,o]=n.useState(null),[p,c]=n.useState(null),[l,v]=n.useState(!1),[d,m]=n.useState(!1),x=n.useRef(null),f=r=>{t(r),c(null);const s=URL.createObjectURL(r);o(s)},w=r=>{r.preventDefault(),m(!1);const s=r.dataTransfer.files[0];s&&s.type.startsWith("image/")?f(s):u.error("Please drop an image file (JPEG, PNG, or WebP)")},k=r=>{var y;const s=(y=r.target.files)==null?void 0:y[0];s&&f(s)},z=async()=>{if(a){v(!0),c(null);try{const r=await N(a);c(r)}catch(r){u.error(r instanceof Error?r.message:"Failed to analyze receipt")}finally{v(!1)}}};return e.jsxs("div",{className:"page",children:[e.jsxs("div",{className:"container",children:[e.jsx("header",{className:"animate-fade-up",style:{marginBottom:"var(--space-8)"},children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2)"},children:[e.jsx("h1",{style:{fontSize:"2.5rem",color:"var(--color-primary)",margin:0},children:"Receipt Scanner 🧾"}),e.jsx("p",{style:{fontSize:"1.125rem",color:"var(--color-text-secondary)",maxWidth:"600px",margin:0},children:"Upload a grocery or restaurant receipt. CarbonIQ scores each line item using Indian supply chain data and flags high-impact choices."})]})}),e.jsxs("div",{className:"receipt-layout",children:[e.jsxs("section",{className:"card card--glass stack stack-md animate-fade-up delay-100",style:{borderRadius:"24px",padding:"var(--space-6)"},"aria-labelledby":"upload-heading",children:[e.jsx("h2",{id:"upload-heading",style:{fontSize:"1.25rem",color:"var(--color-primary)"},children:"Upload your receipt"}),e.jsx("div",{className:`drop-zone${d?" drop-zone--active":""}`,onDragOver:r=>{r.preventDefault(),m(!0)},onDragLeave:()=>m(!1),onDrop:w,onClick:()=>{var r;return(r=x.current)==null?void 0:r.click()},role:"button",tabIndex:0,"aria-label":"Drop receipt image here or click to browse",onKeyDown:r=>{var s;return r.key==="Enter"&&((s=x.current)==null?void 0:s.click())},children:i?e.jsx("img",{src:i,alt:"Receipt preview",className:"preview-img"}):e.jsxs(e.Fragment,{children:[e.jsx(I,{size:32,className:`upload-icon${d?" upload-icon--active":""}`,"aria-hidden":"true"}),e.jsxs("p",{style:{color:d?"var(--color-accent)":"var(--color-text-muted)",fontSize:"0.9rem",textAlign:"center",transition:"var(--transition-fast)"},children:[d?"Drop it like it's hot!":"Drop receipt image here",e.jsx("br",{}),e.jsx("span",{style:{color:"var(--color-text-faint)",fontSize:"0.8rem"},children:"JPEG, PNG, WebP — max 10 MB"})]})]})}),e.jsx("input",{ref:x,id:"receipt-file-input",type:"file",accept:"image/jpeg,image/png,image/webp",onChange:k,style:{display:"none"},"aria-label":"Select receipt image"}),a&&e.jsxs("p",{style:{fontSize:"0.8rem",color:"var(--color-text-muted)"},children:[e.jsx(g,{size:12,style:{verticalAlign:"middle",marginRight:4},"aria-hidden":"true"}),a.name," · ",(a.size/1024).toFixed(0)," KB"]}),e.jsx("button",{id:"btn-analyze-receipt",className:"btn btn--primary",onClick:z,disabled:!a||l,style:{width:"100%",borderRadius:"16px",padding:"var(--space-4)"},"aria-busy":l,children:l?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner","aria-hidden":"true"}),"Analysing receipt…"]}):e.jsxs(e.Fragment,{children:[e.jsx(g,{size:20,"aria-hidden":"true"}),"Analyse Receipt"]})}),i&&!l&&e.jsx("button",{className:"btn btn--ghost btn--sm",onClick:()=>{t(null),o(null),c(null)},children:"Clear"})]}),e.jsxs("div",{children:[!p&&!l&&e.jsxs("div",{className:"result-placeholder",children:[e.jsx(g,{size:48,style:{color:"var(--color-text-faint)",marginBottom:16},"aria-hidden":"true"}),e.jsx("p",{style:{color:"var(--color-text-faint)"},children:"Line-item carbon scores will appear here"})]}),l&&e.jsx(D,{}),p&&e.jsx(A,{result:p})]})]})]}),e.jsx("style",{children:`
        .receipt-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 768px) { .receipt-layout { grid-template-columns: 1fr; } }

        .drop-zone {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: var(--space-3);
          padding: var(--space-8);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: var(--transition-fast);
          min-height: 180px;
          background: var(--color-surface-2);
        }
        .drop-zone:hover, .drop-zone--active {
          border-color: var(--color-accent);
          background: var(--color-accent-dim);
          transform: scale(1.02);
        }
        .upload-icon { color: var(--color-text-faint); transition: var(--transition-fast); }
        .upload-icon--active { color: var(--color-accent); transform: translateY(-4px) scale(1.1); }
        .preview-img { max-height: 240px; max-width: 100%; border-radius: var(--radius-md); object-fit: contain; }

        .result-placeholder {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: var(--space-12);
          border: 1px dashed var(--color-border); border-radius: var(--radius-lg);
          text-align: center; min-height: 300px;
        }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(16, 185, 129, 0.2); border-top-color: var(--color-accent);
          border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px;
        }

        .item-row {
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-border);
          animation: slideIn 0.3s ease both;
        }
        .item-row:last-of-type { border-bottom: none; }
        .item-flag-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .item-name { flex: 1; font-size: 0.9rem; }
        .item-price { font-size: 0.8rem; color: var(--color-text-faint); }
        .item-co2   { font-weight: 600; font-size: 0.9rem; }
        .item-note  { font-size: 0.75rem; color: var(--color-text-faint); margin-top: 2px; }

        .swap-box {
          background: var(--color-accent-dim);
          border: 1px solid var(--color-border-hover);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-top: var(--space-4);
        }
      `})]})}function A({result:a}){const t=[...a.items].sort((i,o)=>o.carbonKg-i.carbonKg);return e.jsxs("div",{className:"stack stack-lg animate-fade-up",children:[e.jsx("div",{className:"card card--glass animate-fade-up delay-200",style:{borderRadius:"24px",padding:"var(--space-6)",background:"linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(16,185,129,0.05) 100%)"},children:e.jsxs("div",{className:"row-between",style:{flexWrap:"wrap",gap:"var(--space-4)"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"section-heading",style:{color:"var(--color-primary)"},children:a.storeName}),e.jsxs("div",{className:"stat-value",style:{fontSize:"2.5rem",color:"var(--color-primary)"},children:[a.totalCarbon.toFixed(2)," ",e.jsx("span",{style:{fontSize:"1.25rem",fontWeight:500},children:"kg CO₂"})]}),e.jsx("p",{className:"stat-label",children:"total for this receipt"})]}),e.jsxs("div",{style:{background:"rgba(255,255,255,0.6)",padding:"var(--space-4)",borderRadius:"20px",border:"1px solid rgba(255,255,255,0.8)"},children:[e.jsx("p",{style:{fontSize:"0.875rem",color:"var(--color-text-secondary)",marginBottom:"var(--space-1)"},children:"Highest impact"}),e.jsxs("p",{style:{fontWeight:700,color:"var(--color-red)",fontSize:"1.125rem"},children:["⚠️ ",a.highestImpactItem]})]})]})}),e.jsxs("div",{className:"card card--glass animate-fade-up delay-300",style:{borderRadius:"24px",padding:"var(--space-6)"},children:[e.jsx("h3",{style:{fontSize:"1.25rem",color:"var(--color-primary)",marginBottom:"var(--space-4)"},children:"Item-level carbon scores"}),e.jsx("div",{role:"list","aria-label":"Receipt items with carbon scores",children:t.map((i,o)=>e.jsx(C,{item:i,index:o},o))}),a.swap&&e.jsxs("div",{className:"swap-box","aria-label":"Recommended swap",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"var(--space-2)",marginBottom:"var(--space-2)"},children:[e.jsx(S,{size:16,style:{color:"var(--color-accent)"},"aria-hidden":"true"}),e.jsx("strong",{style:{fontSize:"0.85rem",color:"var(--color-accent)"},children:"One Swap"})]}),e.jsxs("p",{style:{fontSize:"0.95rem"},children:["Swap ",e.jsx("strong",{children:a.swap.fromItem})," → ",e.jsx("strong",{style:{color:"var(--color-accent-light)"},children:a.swap.toItem})]}),e.jsxs("div",{style:{display:"flex",gap:"var(--space-6)",marginTop:"var(--space-3)",flexWrap:"wrap"},children:[a.swap.moneySavedINR>0&&e.jsxs("div",{style:{fontSize:"0.85rem"},children:["Save ",e.jsxs("strong",{style:{color:"var(--color-accent)"},children:["₹",a.swap.moneySavedINR]}),"/week"]}),a.swap.carbonSavedKg>0&&e.jsxs("div",{style:{fontSize:"0.85rem"},children:["Avoid ",e.jsxs("strong",{style:{color:"var(--color-accent)"},children:[a.swap.carbonSavedKg," kg CO₂"]}),"/week"]})]})]})]})]})}function C({item:a,index:t}){const i=j[a.flag]??j.unknown;return e.jsxs("div",{className:"item-row",role:"listitem",style:{animationDelay:`${t*.05}s`},children:[e.jsx("div",{className:"item-flag-dot",style:{background:i.color,boxShadow:`0 0 6px ${i.color}`},"aria-hidden":"true"}),e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{className:"item-name",children:a.name}),a.note&&e.jsx("div",{className:"item-note",children:a.note})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsxs("div",{className:"item-co2",style:{color:i.color},children:[a.carbonKg.toFixed(3)," kg"]}),a.priceINR>0&&e.jsxs("div",{className:"item-price",children:["₹",a.priceINR]})]}),e.jsx("span",{className:"badge",style:{background:i.bg,color:i.color,fontSize:"0.7rem"},children:i.label})]})}function D(){return e.jsxs("div",{className:"stack stack-md",children:[e.jsx("div",{className:"skeleton",style:{height:120,borderRadius:16}}),e.jsx("div",{className:"card",children:Array.from({length:5},(a,t)=>e.jsxs("div",{style:{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid var(--color-border)"},children:[e.jsx("div",{className:"skeleton",style:{width:10,height:10,borderRadius:"50%",flexShrink:0,marginTop:4}}),e.jsx("div",{className:"skeleton",style:{flex:1,height:16,borderRadius:4}}),e.jsx("div",{className:"skeleton",style:{width:60,height:16,borderRadius:4}})]},t))})]})}export{P as default};
