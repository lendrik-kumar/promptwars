import{r as l,j as e,Z as m,L as g,z as h}from"./index-Vtxi3Dx5.js";import{p as x}from"./client-B--iDYZO.js";import{C as v}from"./chevron-right-Ngu7ej5m.js";import{A as b}from"./arrow-right-CqADAAkb.js";const u=["HDFC Bank: UPI txn of Rs.340 to SWIGGY on 12-06. Avl Bal Rs.12,450","Dear SBI Customer, Rs.220.00 debited from A/c XX1234 to VPA ola@okaxis on 12-06-26","ICICI Bank: Rs 156.50 debited for UPI txn at ZOMATO. Ref 2406123456","Rs.2,800 paid to INDIANOIL on 13-06. UPI Ref: 240613789012","HDFC Bank: UPI txn of Rs.1,240 to BIGBASKET on 11-06. Avl Bal Rs.8,200"],f={food_delivery:"Food Delivery",transport_cab:"Cab / Ride",transport_train:"Train / Rail",transport_flight:"Flight",grocery:"Grocery",fuel:"Fuel",utility:"Utility",shopping:"Shopping",entertainment:"Entertainment",health:"Health",default:"General Spend"},y={food_delivery:"badge--amber",transport_cab:"badge--amber",fuel:"badge--red",transport_flight:"badge--red",grocery:"badge--green",utility:"badge--blue",default:"badge--muted"};function C(){const[a,o]=l.useState(""),[n,r]=l.useState(null),[i,c]=l.useState(!1),d=s=>{o(s),r(null)},p=async s=>{if(s.preventDefault(),!!a.trim()){c(!0),r(null);try{const t=await x(a.trim());r(t)}catch(t){h.error(t instanceof Error?t.message:"Failed to parse SMS")}finally{c(!1)}}};return e.jsxs("div",{className:"page",children:[e.jsxs("div",{className:"container",children:[e.jsx("header",{className:"animate-fade-up",style:{marginBottom:"var(--space-8)"},children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2)"},children:[e.jsx("h1",{style:{fontSize:"2.5rem",color:"var(--color-primary)",margin:0},children:"SMS Carbon Scorer"}),e.jsx("p",{style:{fontSize:"1.125rem",color:"var(--color-text-secondary)",maxWidth:"600px",margin:0},children:"Paste any Indian bank or UPI SMS. CarbonIQ identifies the merchant, estimates the carbon footprint, and suggests a swap — in under 2 seconds."})]})}),e.jsxs("div",{className:"sms-layout",children:[e.jsxs("section",{className:"card card--glass animate-fade-up delay-100",style:{borderRadius:"24px",padding:"var(--space-6)"},"aria-labelledby":"sms-input-heading",children:[e.jsx("h2",{id:"sms-input-heading",style:{fontSize:"1.25rem",color:"var(--color-primary)",marginBottom:"var(--space-4)"},children:"Paste your SMS"}),e.jsxs("form",{onSubmit:p,noValidate:!0,children:[e.jsx("label",{className:"input-label",htmlFor:"sms-input",children:"SMS message"}),e.jsx("textarea",{id:"sms-input",className:"input",value:a,onChange:s=>{o(s.target.value),r(null)},placeholder:"HDFC Bank: UPI txn of Rs.340 to SWIGGY...",rows:4,maxLength:500,"aria-describedby":"sms-char-count"}),e.jsxs("div",{id:"sms-char-count",style:{fontSize:"0.75rem",color:"var(--color-text-faint)",textAlign:"right",marginTop:4},children:[a.length,"/500"]}),e.jsx("button",{id:"btn-parse-sms",type:"submit",className:"btn btn--primary",disabled:i||!a.trim(),style:{marginTop:"var(--space-4)",width:"100%",borderRadius:"16px",padding:"var(--space-4)"},"aria-busy":i,children:i?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner","aria-hidden":"true"}),"Calculating…"]}):e.jsxs(e.Fragment,{children:[e.jsx(m,{size:20,"aria-hidden":"true"}),"Calculate Carbon Score"]})})]}),e.jsxs("div",{style:{marginTop:"var(--space-5)"},children:[e.jsx("p",{className:"section-heading",style:{marginBottom:"var(--space-3)"},children:"Try a sample"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2)"},children:u.map((s,t)=>e.jsxs("button",{id:`sample-sms-${t}`,className:"sample-chip",onClick:()=>d(s),"aria-label":`Use sample SMS ${t+1}`,children:[e.jsx(v,{size:12,className:"chip-icon","aria-hidden":"true"}),e.jsx("span",{className:"chip-text",children:s})]},t))})]})]}),e.jsxs("div",{children:[!n&&!i&&e.jsxs("div",{className:"result-placeholder",children:[e.jsx(g,{size:48,style:{color:"var(--color-text-faint)",marginBottom:16},"aria-hidden":"true"}),e.jsx("p",{style:{color:"var(--color-text-faint)"},children:"Your carbon analysis will appear here"})]}),i&&e.jsxs("div",{className:"result-placeholder","aria-busy":"true",children:[e.jsx("div",{className:"skeleton",style:{width:80,height:80,borderRadius:"50%",marginBottom:16}}),e.jsx("div",{className:"skeleton",style:{width:200,height:20,borderRadius:6}})]}),n&&e.jsx(j,{result:n})]})]})]}),e.jsx("style",{children:`
        .sms-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 768px) { .sms-layout { grid-template-columns: 1fr; } }

        .sample-chip {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          text-align: left;
          transition: var(--transition-fast);
          width: 100%;
        }
        .sample-chip:hover {
          border-color: var(--color-accent);
          background: var(--color-accent-dim);
        }
        .chip-icon { color: var(--color-accent); flex-shrink: 0; margin-top: 2px; }
        .chip-text { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; }

        .result-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-12);
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-lg);
          text-align: center;
          min-height: 300px;
        }

        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(16, 185, 129, 0.2);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Result card */
        .result-card {
          animation: fadeUp 0.4s ease both;
        }
        .result-score {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--color-amber);
          line-height: 1;
          margin-bottom: 4px;
        }
        .result-score-label { color: var(--color-text-muted); font-size: 0.9rem; }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 0.9rem;
        }
        .breakdown-row:last-child { border-bottom: none; }
        .breakdown-key { color: var(--color-text-muted); }
        .breakdown-val { font-weight: 600; }

        .swap-suggestion {
          background: var(--color-accent-dim);
          border: 1px solid var(--color-border-hover);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-top: var(--space-4);
        }
        .swap-suggestion p { color: var(--color-text); font-size: 0.95rem; }
        .swap-savings {
          display: flex;
          gap: var(--space-4);
          margin-top: var(--space-3);
        }
        .swap-saving { font-size: 0.85rem; }
        .swap-saving strong { color: var(--color-accent); }
      `})]})}function j({result:a}){const o=y[a.category]??"badge--muted",n=Object.entries(a.breakdown).filter(([,r])=>typeof r=="number"&&r>0);return e.jsx("article",{className:"result-card stack stack-lg","aria-label":"SMS carbon analysis result",children:e.jsxs("div",{className:"card card--glass",style:{borderRadius:"24px",padding:"var(--space-6)",background:"linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(16,185,129,0.05) 100%)"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"var(--space-4)"},children:[e.jsxs("div",{children:[e.jsx("p",{style:{fontSize:"0.8rem",color:"var(--color-text-muted)",marginBottom:4},children:"Merchant"}),e.jsx("p",{style:{fontWeight:600,fontSize:"1.05rem"},children:a.merchant})]}),e.jsx("span",{className:`badge ${o}`,children:f[a.category]??a.category})]}),e.jsxs("div",{style:{display:"flex",gap:"var(--space-6)",marginBottom:"var(--space-4)",alignItems:"flex-end"},children:[e.jsxs("div",{children:[e.jsx("div",{className:"result-score","aria-label":`${a.carbonScore} kilograms CO2`,children:a.carbonScore}),e.jsx("div",{className:"result-score-label",children:"kg CO₂ this transaction"})]}),e.jsxs("div",{style:{paddingBottom:4},children:[e.jsxs("div",{style:{fontSize:"1.4rem",fontWeight:700},children:["₹",a.amount.toLocaleString("en-IN")]}),e.jsx("div",{style:{fontSize:"0.8rem",color:"var(--color-text-muted)"},children:"amount"})]})]}),n.length>0&&e.jsxs("div",{children:[e.jsx("p",{className:"section-heading",style:{marginBottom:"var(--space-2)"},children:"Breakdown"}),n.map(([r,i])=>e.jsxs("div",{className:"breakdown-row",children:[e.jsx("span",{className:"breakdown-key",children:r.replace(/([A-Z])/g," $1").trim()}),e.jsxs("span",{className:"breakdown-val",children:[Number(i).toFixed(3)," kg CO₂"]})]},r))]}),e.jsxs("div",{className:"swap-suggestion","aria-label":"Recommended swap",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"var(--space-2)",marginBottom:"var(--space-2)"},children:[e.jsx(b,{size:16,style:{color:"var(--color-accent)"},"aria-hidden":"true"}),e.jsx("strong",{style:{fontSize:"0.85rem",color:"var(--color-accent)"},children:"One Swap"})]}),e.jsx("p",{children:a.swap.description}),e.jsxs("div",{className:"swap-savings",children:[a.swap.moneySaved>0&&e.jsxs("div",{className:"swap-saving",children:["Save ",e.jsxs("strong",{children:["₹",a.swap.moneySaved]})," ",a.swap.unit]}),a.swap.carbonSaved>0&&e.jsxs("div",{className:"swap-saving",children:["Avoid ",e.jsxs("strong",{children:[a.swap.carbonSaved," kg CO₂"]})," ",a.swap.unit]})]})]}),e.jsxs("p",{style:{fontSize:"0.75rem",color:"var(--color-text-faint)",marginTop:"var(--space-3)"},children:["Parsed by: ",a.parsedBy," · Confidence: ",Math.round((a.confidence??0)*100),"%"]})]})})}export{C as default};
