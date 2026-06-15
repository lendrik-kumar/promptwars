import{c as f,r as i,j as a,Z as v,z as x}from"./index-Vtxi3Dx5.js";import{d as N}from"./client-B--iDYZO.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=f("BarChart2",[["line",{x1:"18",x2:"18",y1:"20",y2:"10",key:"1xfpm4"}],["line",{x1:"12",x2:"12",y1:"20",y2:"4",key:"be30l9"}],["line",{x1:"6",x2:"6",y1:"20",y2:"14",key:"1r4le6"}]]),S=["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Puducherry","Chandigarh","Jammu and Kashmir","Ladakh"],g={AC:"❄️","Air Conditioner":"❄️","Water Heater":"🚿",Geyser:"🚿",Refrigerator:"🧊",Lighting:"💡",Fan:"🌀",TV:"📺","Washing Machine":"🫧",Pump:"💧",default:"⚡"};function B(){const[s,r]=i.useState(""),[n,d]=i.useState("Maharashtra"),[p,y]=i.useState("30"),[h,b]=i.useState(""),[o,m]=i.useState(null),[l,u]=i.useState(!1),j=async e=>{e.preventDefault();const t=parseFloat(s);if(!t||t<=0){x.error("Please enter valid units");return}u(!0),m(null);try{const c=await N({units:t,state:n,billingDays:parseInt(p)||30,amount:parseFloat(h)||void 0});m(c)}catch(c){x.error(c instanceof Error?c.message:"Analysis failed")}finally{u(!1)}};return a.jsxs("div",{className:"page",children:[a.jsxs("div",{className:"container",children:[a.jsxs("header",{className:"animate-fade-up",style:{marginBottom:"var(--space-8)"},children:[a.jsx("p",{className:"section-heading",children:"Bill Shock Translator"}),a.jsx("h1",{children:"Electricity Bill Analyser ⚡"}),a.jsx("p",{style:{color:"var(--color-text-muted)",marginTop:"var(--space-3)",maxWidth:"52ch"},children:"Enter your electricity bill details. CarbonIQ breaks down which appliances are driving your footprint and gives you one specific action."})]}),a.jsxs("div",{className:"bill-layout",children:[a.jsxs("section",{className:"card animate-fade-up delay-100","aria-labelledby":"bill-form-heading",children:[a.jsx("h2",{id:"bill-form-heading",style:{fontSize:"1rem",marginBottom:"var(--space-4)"},children:"Bill details"}),a.jsxs("form",{onSubmit:j,noValidate:!0,className:"stack stack-md",children:[a.jsxs("div",{children:[a.jsx("label",{className:"input-label",htmlFor:"units-input",children:"Units consumed (kWh) *"}),a.jsx("input",{id:"units-input",className:"input",type:"number",min:"1",max:"10000",step:"0.1",value:s,onChange:e=>{r(e.target.value)},placeholder:"e.g. 186",required:!0})]}),a.jsxs("div",{children:[a.jsx("label",{className:"input-label",htmlFor:"state-select",children:"State *"}),a.jsx("select",{id:"state-select",className:"input",value:n,onChange:e=>d(e.target.value),style:{cursor:"pointer"},children:S.map(e=>a.jsx("option",{value:e,children:e},e))})]}),a.jsxs("div",{children:[a.jsx("label",{className:"input-label",htmlFor:"days-input",children:"Billing period (days)"}),a.jsx("input",{id:"days-input",className:"input",type:"number",min:"1",max:"90",value:p,onChange:e=>y(e.target.value)})]}),a.jsxs("div",{children:[a.jsx("label",{className:"input-label",htmlFor:"amount-input",children:"Bill amount (₹) — optional"}),a.jsx("input",{id:"amount-input",className:"input",type:"number",min:"0",value:h,onChange:e=>b(e.target.value),placeholder:"e.g. 1,480"})]}),a.jsx("button",{id:"btn-analyze-bill",type:"submit",className:"btn btn--primary",disabled:l||!s,"aria-busy":l,children:l?a.jsxs(a.Fragment,{children:[a.jsx("span",{className:"spinner","aria-hidden":"true"}),"Analysing…"]}):a.jsxs(a.Fragment,{children:[a.jsx(k,{size:16,"aria-hidden":"true"}),"Analyse Bill"]})})]})]}),a.jsxs("div",{children:[!o&&!l&&a.jsxs("div",{className:"result-placeholder",children:[a.jsx(v,{size:48,style:{color:"var(--color-text-faint)",marginBottom:16},"aria-hidden":"true"}),a.jsx("p",{style:{color:"var(--color-text-faint)"},children:"Your breakdown will appear here"})]}),l&&a.jsx("div",{className:"stack stack-md",children:[100,240,160].map((e,t)=>a.jsx("div",{className:"skeleton",style:{height:e,borderRadius:16}},t))}),o&&a.jsx(_,{result:o})]})]})]}),a.jsx("style",{children:`
        .bill-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 768px) { .bill-layout { grid-template-columns: 1fr; } }
        .result-placeholder {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: var(--space-12); border: 1px dashed var(--color-border);
          border-radius: var(--radius-lg); text-align: center; min-height: 300px;
        }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(16, 185, 129, 0.2); border-top-color: var(--color-accent);
          border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px;
        }
        select.input option { background: var(--color-surface); color: var(--color-text); }

        .appliance-bar {
          margin-bottom: var(--space-4);
        }
        .appliance-bar__header {
          display: flex; justify-content: space-between; font-size: 0.875rem;
          margin-bottom: var(--space-1);
        }
        .appliance-bar__name { font-weight: 500; }
        .appliance-bar__pct  { color: var(--color-text-muted); }
        .appliance-bar__track {
          height: 8px; background: var(--color-surface-2);
          border-radius: var(--radius-full); overflow: hidden;
        }
        .appliance-bar__fill {
          height: 100%; border-radius: var(--radius-full);
          background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 6px rgba(34,197,94,0.4);
        }

        .top-action {
          background: var(--color-amber-dim);
          border: 1px solid var(--color-amber);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }
      `})]})}function _({result:s}){return a.jsxs("div",{className:"stack stack-lg animate-fade-up",children:[a.jsxs("div",{className:"card card--accent",children:[a.jsxs("div",{className:"grid-3",style:{gap:"var(--space-5)"},children:[a.jsxs("div",{children:[a.jsx("p",{className:"section-heading",children:"Daily usage"}),a.jsx("div",{className:"stat-value",style:{fontSize:"2rem"},children:s.dailyUnits}),a.jsx("div",{className:"stat-label",children:"kWh/day"})]}),a.jsxs("div",{children:[a.jsx("p",{className:"section-heading",children:"Daily CO₂"}),a.jsx("div",{className:"stat-value",style:{fontSize:"2rem",color:"var(--color-amber)"},children:s.dailyCO2Kg}),a.jsx("div",{className:"stat-label",children:"kg CO₂/day"})]}),a.jsxs("div",{children:[a.jsx("p",{className:"section-heading",children:"Grid factor"}),a.jsx("div",{className:"stat-value",style:{fontSize:"2rem",color:"var(--color-blue)"},children:s.gridFactor}),a.jsxs("div",{className:"stat-label",children:["kg CO₂/kWh — ",s.state]})]})]}),a.jsx("hr",{className:"divider"}),a.jsxs("div",{className:"grid-2",style:{gap:"var(--space-6)"},children:[a.jsxs("div",{style:{fontSize:"0.85rem",color:"var(--color-text-muted)"},children:[a.jsx("strong",{style:{color:"var(--color-text)"},children:"Total this bill:"})," ",s.totalCO2Kg.toFixed(1)," kg CO₂ over ",s.billingDays," days"]}),a.jsxs("div",{style:{fontSize:"0.85rem",color:"var(--color-text-muted)"},children:["Equivalent to not driving ",a.jsxs("strong",{style:{color:"var(--color-text)"},children:[s.equivalents.kmsNotDriven.toLocaleString("en-IN")," km"]})," by car"]})]})]}),a.jsxs("div",{className:"top-action animate-fade-up delay-100",role:"note","aria-label":"Top energy saving action",children:[a.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"var(--space-2)",marginBottom:"var(--space-2)"},children:[a.jsx(v,{size:16,style:{color:"var(--color-amber)"},"aria-hidden":"true"}),a.jsx("strong",{style:{color:"var(--color-amber)",fontSize:"0.85rem"},children:"Top Action"})]}),a.jsx("p",{style:{fontSize:"0.95rem"},children:s.topAction})]}),a.jsxs("div",{className:"card animate-fade-up delay-200",children:[a.jsx("h3",{style:{fontSize:"1rem",marginBottom:"var(--space-5)"},children:"Estimated appliance breakdown"}),s.breakdown.map((r,n)=>{const d=g[r.appliance]??g.default;return a.jsxs("div",{className:"appliance-bar",children:[a.jsxs("div",{className:"appliance-bar__header",children:[a.jsxs("span",{className:"appliance-bar__name",children:[d," ",r.appliance]}),a.jsxs("span",{className:"appliance-bar__pct",children:[r.percentage,"% · ",r.kgCO2.toFixed(1)," kg CO₂"]})]}),a.jsx("div",{className:"appliance-bar__track",role:"progressbar","aria-valuenow":r.percentage,"aria-valuemax":100,"aria-label":`${r.appliance}: ${r.percentage}% of usage`,children:a.jsx("div",{className:"appliance-bar__fill",style:{width:`${r.percentage}%`}})})]},n)}),a.jsx("p",{style:{fontSize:"0.75rem",color:"var(--color-text-faint)",marginTop:"var(--space-3)"},children:"Estimates based on typical Indian household appliance patterns. Actual usage may vary."})]})]})}export{B as default};
