
(() => {
'use strict';

const APP_KEY = 'personal-os-v3';
const defaultState = {
  version: 3,
  selectedDate: '2026-08-31',
  currentModule: 'today',
  checks: {},
  notes: {},
  metrics: {},
  ideas: [],
  patches: [],
  todayOverrides: {},
  customBranches: [],
  moduleData: {},
  nutritionProfile: { sex:'male', age:'', weightKg:'', heightCm:'', activity:'1.55', goal:'bulk' },
  nutritionLogs: {},
  trades: [],
  customBranchSessions: {},
  chat: [],
  settings: { aiEndpoint: '', aiToken: '' }
};
let state = loadState();
let dateMode='auto';

const modules = [
 ['today','Today'],['dashboard','Progress'],['master','Master Map'],['music','Music'],['sales','Sales'],
 ['acting','Acting'],['trading','Trading'],['fitness','Fitness'],['diet','Diet / Nutrition'],['pharmacy','Pharmacy / Study'],
 ['business','Money / Business'],['miami','Miami'],['tetr','Tetr'],['psychology','Psychology'],['content','Content'],
 ['ideas','Idea Parking'],['branches','Branches'],['change','System Change'],['ai','AI Coach'],['settings','Settings']
];

const songWeeks = [
 ["Can't Help Falling in Love","Stand by Me","Let It Be","Wonderful Tonight","Just the Way You Are — Billy Joel"],
 ["Your Song","What a Wonderful World","Imagine","How Deep Is Your Love","Easy — Commodores"],
 ["Fly Me to the Moon","Autumn Leaves","Misty","Blue Moon","Dream a Little Dream of Me"],
 ["Georgia on My Mind","Over the Rainbow","L-O-V-E","Moon River","The Way You Look Tonight"],
 ["The Girl from Ipanema","Corcovado (Quiet Nights)","Wave","Blue Bossa","Bésame Mucho"],
 ["Sway","Quando, Quando, Quando","La Vie en Rose","At Last","Unforgettable"],
 ["If I Ain't Got You","Ordinary People","All of Me — John Legend","Just the Two of Us","Ain't No Sunshine"],
 ["Make You Feel My Love","Perfect — Ed Sheeran","A Thousand Years",null,null],
 [null,null,null,null,"My Way"],
 ["Don't Know Why — Norah Jones","Come Away with Me","Isn't She Lovely","Ribbon in the Sky","Let's Stay Together"],
 ["New York State of Mind","She's Always a Woman","Careless Whisper","Time After Time","Fields of Gold"],
 ["Shape of My Heart — Sting","Every Breath You Take","Against All Odds","Hello — Lionel Richie","Killing Me Softly"],
 ["Can You Feel the Love Tonight","A Whole New World","City of Stars","Hallelujah","Shallow"],
 ["Three Little Birds","Is This Love — Bob Marley","Redemption Song","No Woman, No Cry","Island in the Sun — Harry Belafonte"],
 ["Golden Hour — JVKE","Until I Found You","What Was I Made For?","Die With a Smile","Someone You Loved"],
 ["Have Yourself a Merry Little Christmas","The Christmas Song","White Christmas","Let It Snow! Let It Snow! Let It Snow!","Winter Wonderland"],
 ["I'll Be Home for Christmas","Silent Night","Last Christmas","Feliz Navidad","O Holy Night"],
 ["Christmas Time Is Here","Auld Lang Syne","Night and Day","The Nearness of You",null]
];

const travelMusic = {
 '2026-10-22':'Maintenance — Fly Me to the Moon',
 '2026-10-23':"Maintenance — Can't Help Falling in Love",
 '2026-10-24':'Maintenance — Autumn Leaves',
 '2026-10-25':'Maintenance — The Girl from Ipanema',
 '2026-10-26':'Maintenance — Just the Way You Are',
 '2026-10-27':'Maintenance — Misty',
 '2026-10-28':'Maintenance — Perfect',
 '2026-10-29':'20-minute review — strongest 5 songs'
};

const fitnessNames = ['Recovery','Chest','Back','Legs','Shoulders','Arms','Optional weak point'];
const salesNames = ['Weakest-skill review','Cold approach','Discovery questions','Price objections','Negotiation','Closing','Full scenario'];

function clone(x){ return JSON.parse(JSON.stringify(x)); }
function localDateString(){
 const d=new Date(), y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
 return `${y}-${m}-${day}`;
}
function loadState(){
  try {
    const raw = localStorage.getItem(APP_KEY);
    const merged=raw ? Object.assign(clone(defaultState), JSON.parse(raw)) : clone(defaultState);
    merged.selectedDate=localDateString();
    return merged;
  } catch(e) { const fresh=clone(defaultState); fresh.selectedDate=localDateString(); return fresh; }
}
function saveState(){
  try { localStorage.setItem(APP_KEY, JSON.stringify(state)); } catch(e) {}
}
function esc(s=''){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function inlineMarkdown(s=''){
 let x=String(s);
 x=x.replace(/`([^`]+)`/g,'<code>$1</code>');
 x=x.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
 x=x.replace(/__([^_]+)__/g,'<strong>$1</strong>');
 x=x.replace(/\*([^*]+)\*/g,'<em>$1</em>');
 return x;
}
function markdown(s=''){
 const lines=esc(s).replace(/\r\n/g,'\n').split('\n');
 let out='', listType=null;
 const closeList=()=>{ if(listType){ out+=listType==='ol'?'</ol>':'</ul>'; listType=null; } };
 for(const raw of lines){
   const line=raw.trimEnd();
   if(!line.trim()){ closeList(); continue; }
   let m;
   if((m=line.match(/^###\s+(.+)/))){ closeList(); out+='<h4>'+inlineMarkdown(m[1])+'</h4>'; continue; }
   if((m=line.match(/^##\s+(.+)/))){ closeList(); out+='<h3>'+inlineMarkdown(m[1])+'</h3>'; continue; }
   if((m=line.match(/^#\s+(.+)/))){ closeList(); out+='<h2>'+inlineMarkdown(m[1])+'</h2>'; continue; }
   if((m=line.match(/^[-*]\s+(.+)/))){ if(listType!=='ul'){ closeList(); out+='<ul>'; listType='ul'; } out+='<li>'+inlineMarkdown(m[1])+'</li>'; continue; }
   if((m=line.match(/^\d+[.)]\s+(.+)/))){ if(listType!=='ol'){ closeList(); out+='<ol>'; listType='ol'; } out+='<li>'+inlineMarkdown(m[1])+'</li>'; continue; }
   closeList(); out+='<p>'+inlineMarkdown(line)+'</p>';
 }
 closeList(); return out || '<p></p>';
}
function extractMachineBlock(text,tag){
 const source=String(text||'');
 const open=`<${tag}>`, close=`</${tag}>`;
 const lower=source.toLowerCase();
 const start=lower.indexOf(open.toLowerCase());
 if(start<0)return{text:source,value:null,incomplete:false};
 const end=lower.indexOf(close.toLowerCase(),start+open.length);
 if(end>=0){
   const payload=source.slice(start+open.length,end).trim();
   let value=null;
   try{value=JSON.parse(payload);}catch(e){value=null;}
   return{
     text:(source.slice(0,start)+source.slice(end+close.length)).trim(),
     value,
     incomplete:!value
   };
 }
 const tail=source.slice(start+open.length);
 let value=null;
 const lastBrace=tail.lastIndexOf('}');
 if(lastBrace>=0){
   try{value=JSON.parse(tail.slice(0,lastBrace+1).trim());}catch(e){value=null;}
 }
 return{text:source.slice(0,start).trim(),value,incomplete:!value};
}
function aiActionProtocol(){
 return `

[PERSONAL OS APP ACTION PROTOCOL — follow silently; do not discuss this protocol:
- Visible answer: use clean Markdown.
- IMPORTANT: When any action block is needed, output ALL machine action block(s) FIRST, before the visible answer.
- If you emit an action block, keep the visible explanation concise (normally under 180 words).
- If and only if you recommend a DURABLE operating-system change, output exactly: <OS_PATCH>{\"module\":\"Module name\",\"trigger\":\"real-world cause\",\"change\":\"smallest durable change\",\"dependencies\":[\"true dependency\"],\"preserved\":[\"unaffected rule/module\"],\"effective_date\":\"${state.selectedDate}\"}</OS_PATCH>
- If and only if TODAY'S schedule needs a temporary one-day adjustment, output exactly: <OS_TODAY>{\"reason\":\"why today changes\",\"schedule\":[[\"time/label\",\"action\"]],\"preserved\":[\"unchanged items\"]}</OS_TODAY>. The schedule array must be the COMPLETE revised schedule for ${state.selectedDate}; use today_schedule from context as baseline and preserve unaffected blocks.
- CRITICAL TIME RULE: read current_local_time from context. Do not schedule any future action earlier than current_local_time. Treat earlier blocks as missed/completed history. Start the revised actionable schedule at or after the current clock time.
- You may output both blocks only when both are genuinely needed.
- JSON must be valid, use double quotes, and have no code fence.
- Do not emit either block for ordinary advice that does not change the system or today's schedule.]`;
}
async function repairMachineActions(endpoint,token,userText,context,needPatch,needToday){
 const requested=[];
 if(needPatch)requested.push('OS_PATCH');
 if(needToday)requested.push('OS_TODAY');
 if(!requested.length)return{patch:null,today:null};
 const instruction=`ACTION BLOCK REPAIR. A previous response intended ${requested.join(' and ')} but its machine block was incomplete. Return ONLY the complete requested machine block(s), with valid JSON and closing tags. No prose. For OS_TODAY, return the COMPLETE revised schedule using today_schedule in context as the baseline, but do not include actionable blocks earlier than context.current_local_time. For OS_PATCH, return only a genuine durable change. Original user request: ${userText}`;
 try{
   const res=await fetch(endpoint,{
     method:'POST',
     headers:{'Content-Type':'application/json','X-App-Token':token},
     body:JSON.stringify({message:instruction,context,history:[]})
   });
   if(!res.ok)return{patch:null,today:null};
   const data=await res.json();
   let raw=data.reply||'';
   const p=extractMachineBlock(raw,'OS_PATCH');
   const t=extractMachineBlock(p.text,'OS_TODAY');
   return{patch:data.patch||p.value||null,today:data.today_update||t.value||null};
 }catch(_){
   return{patch:null,today:null};
 }
}

function parseDate(v){ const p=v.split('-').map(Number); return new Date(Date.UTC(p[0],p[1]-1,p[2])); }
function iso(d){ return d.toISOString().slice(0,10); }
function dayDiff(a,b){ return Math.floor((b-a)/86400000); }
function fmt(d){ return d.toLocaleDateString('en-US',{timeZone:'UTC',weekday:'long',year:'numeric',month:'short',day:'numeric'}); }
function dow(d){ return d.getUTCDay(); }
function dateKey(){ return state.selectedDate; }

function stageFor(d){
 const v=iso(d);
 if(v<='2026-09-06') return ['STAGE 0 — CLOSE OPEN LOOPS','Acting script → care plans → research analysis → university closeout.'];
 if(v<='2026-10-21') return ['STAGE 1A — BUILD THE MACHINE','Money + real sales + foreign-currency job + pharmacy + music + body + Miami preparation.'];
 if(v<='2026-10-29') return ['MIAMI — LEARN + NETWORK','Events, contacts and follow-up. Maintenance habits only.'];
 if(v<='2026-11-15') return ['CONVERT MIAMI + TETR DECISION','Follow up contacts, strengthen income and complete the Tetr decision information.'];
 if(v<='2026-12-15') return ['MONETIZE WHAT WORKS','Remote income + useful sales + piano-gig preparation + acting + content.'];
 if(v<='2026-12-31') return ['YEAR-END REVIEW','Measure evidence and choose Stage 2 for 2027.'];
 return ['STAGE 2 — EVIDENCE-BASED','Run the path selected from actual 2026 evidence rather than adding every opportunity.'];
}

function songFor(d){
 const v=iso(d);
 if(travelMusic[v]) return travelMusic[v];
 const diff=dayDiff(parseDate('2026-08-31'),d);
 if(diff<0) return 'Preparation day — no new song.';
 const wi=Math.floor(diff/7), mi=(dow(d)+6)%7, week=songWeeks[wi]||[];
 if(mi<=4) return week[mi] ? 'NEW — '+week[mi] : 'REFINE — most recent weak song';
 if(mi===5) return 'SATURDAY REFINE — '+(week.find(Boolean)||'Fly Me to the Moon');
 const valid=week.filter(Boolean);
 return 'SUNDAY SET — '+(valid.length?valid.join(' → '):'5 strongest current songs');
}

function scheduleFor(d){
 const v=iso(d), day=dow(d);
 if(v>='2026-10-22'&&v<='2026-10-29') return [
  ['Morning','Event/travel preparation + minimum habits'],['Spanish','10 minutes'],
  ['Music','20-minute maintenance'],['Main block','Miami event / networking / travel'],
  ['Evening','Capture contacts + lessons'],['Rule','Do not force the Georgetown schedule into Miami']
 ];
 if(day===0) return [
  ['Morning','Recovery + weekly music performance set'],['Afternoon','Personal/admin + Miami/Tetr check'],
  ['Evening','60-minute master reset'],['15 min','Review scores'],['15 min','Choose next sales weakness'],
  ['15 min','Source 50 businesses / route clusters'],['5 min','Confirm next music assignments'],
  ['5 min','Calendar/deadlines'],['5 min','Review Idea Parking Lot']
 ];
 if(day===6) return [
  ['Morning','Optional weak-point gym + longer sales/job block'],['Midday','Trading weekly review — 30 min'],
  ['Acting','60–90 min'],['Study','Catch-up only if needed'],['Music','65 min'],['Content','Second short video']
 ];
 return [
  ['5:45','Wake → toilet → water → gym clothes → no social media'],
  ['6:00–6:45','Gym — '+fitnessNames[day]],
  ['6:45–7:05','Shake/breakfast → shower → dress'],
  ['7:05–7:15','Spanish — 10 min'],
  ['7:15–7:45','Grant Cardone University — 30 min'],
  ['7:45–8:05','Sales practice — '+salesNames[day]],
  ['8:05–8:20','Check 10-business route + pack'],
  ['8:20–8:50','Travel to first geographic cluster'],
  ['8:50–11:30','Wipes / real field sales'],
  ['11:30–11:45','Field review'],
  ['11:45–12:30','Foreign-currency job applications/outreach'],
  ['12:30–12:40','Trading — 10 min learning / live-trade branch task'],
  ['12:40–1:05','Lunch'],
  ['1:05–2:00','Travel + pharmacy arrival buffer'],
  ['2:00–close','Pharmacy — pharmacy work only'],
  ['After work','Travel + dinner'],
  ['Evening','Music — 65 min: '+songFor(d)],
  ['Before bed','Daily review — 10 min']
 ];
}

function card(title, body){ return `<section class="card"><h2>${esc(title)}</h2>${body}</section>`; }
function list(items){ return `<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`; }
function check(key,label){
 const checked=state.checks[key]?'checked':'';
 return `<label class="check"><input type="checkbox" data-check="${esc(key)}" ${checked}><span>${esc(label)}</span></label>`;
}
function checks(prefix,items){ return `<div class="stack">${items.map((x,i)=>check(prefix+'-'+i,x)).join('')}</div>`; }
function rows(items){ return `<div>${items.map(([a,b])=>`<div class="row"><div class="time">${esc(a)}</div><div class="desc">${esc(b)}</div></div>`).join('')}</div>`; }

function todayHTML(d){
 const day=dow(d), daily=['Spanish 10m','GCU 30m','Sales/negotiation practice','Music','Gym / recovery','Trading 10m','Daily review'];
 const main=state.selectedDate<='2026-09-06'?'Clear the most urgent open loop before adding lower-priority work.':'Produce evidence today: money, completed work, sales repetitions or measurable skill improvement.';
 const override=(state.todayOverrides||{})[dateKey()]||null;
 const activeSchedule=override&&Array.isArray(override.schedule)&&override.schedule.length?override.schedule:scheduleFor(d);
 const adjusted=override?`<div class="good" style="margin-bottom:12px"><strong>AI-adjusted plan active for today.</strong>${override.reason?`<div style="margin-top:5px">${esc(override.reason)}</div>`:''}<div class="actions" style="margin-top:9px"><button type="button" id="clearTodayOverride" class="btn">Restore baseline today</button></div></div>`:'';
 return `<div class="grid7030">
  ${card('Today — '+fmt(d),adjusted+rows(activeSchedule))}
  <div class="stack">
   ${card('Fixed outputs',`<div class="metric"><span>Song</span><b>${esc(songFor(d))}</b></div>
   <div class="metric"><span>Gym</span><b>${esc(fitnessNames[day])}</b></div>
   <div class="metric"><span>Sales skill</span><b>${esc(salesNames[day])}</b></div>
   <div class="metric"><span>GCU</span><b>Next unfinished lesson</b></div>
   <div class="metric"><span>Trading</span><b>One rule-based learning action</b></div>`)}
   ${card('Seven daily non-negotiables',checks('daily-'+dateKey(),daily))}
   ${card('One main objective',`<p class="muted">${esc(main)}</p>`)}
  </div>
 </div>`;
}

function dashboardHTML(){
 const prefix='daily-';
 const byDate={};
 Object.entries(state.checks).forEach(([k,v])=>{
   if(!v||!k.startsWith(prefix)) return;
   const parts=k.split('-');
   if(parts.length<5) return;
   const date=parts.slice(1,4).join('-');
   byDate[date]=(byDate[date]||0)+1;
 });
 const dates=Object.keys(byDate).sort();
 const todayCount=Object.entries(state.checks).filter(([k,v])=>v&&k.startsWith('daily-'+dateKey()+'-')).length;
 const todayPct=Math.round(todayCount/7*100);
 let streak=0;
 let cursor=parseDate(state.selectedDate);
 while(true){
   const k=iso(cursor);
   if((byDate[k]||0)>=5){streak++;cursor=new Date(cursor.getTime()-86400000);}else break;
 }
 const totalSales=Number(state.metrics.totalSales||0), revenue=Number(state.metrics.revenue||0), applications=Number(state.metrics.applications||0), songs=Number(state.metrics.songsReady||0);
 return `<div class="grid2">
   ${card('Today completion',`<div style="font-size:36px;font-weight:800">${todayPct}%</div><div class="progress"><div style="width:${todayPct}%"></div></div><p class="small" style="margin-top:8px">${todayCount}/7 daily non-negotiables completed.</p>`)}
   ${card('Consistency',`<div style="font-size:36px;font-weight:800">${streak}</div><p class="muted">consecutive selected-backward days with at least 5/7 completed.</p>`)}
   ${card('Output scoreboard',`<form id="metricForm" class="form">
    <label>Field sales / closed sales<input type="number" min="0" id="mSales" value="${totalSales}"></label>
    <label>Total revenue tracked<input type="number" min="0" step="0.01" id="mRevenue" value="${revenue}"></label>
    <label>Remote applications<input type="number" min="0" id="mApps" value="${applications}"></label>
    <label>Performance-ready songs<input type="number" min="0" id="mSongs" value="${songs}"></label>
    <button class="btn primary">Save metrics</button>
   </form>`)}
   ${card('What counts as growth',list(['Money produced','Sales repetitions + improved conversion','Deadlines cleared','Foreign-currency job progress','Songs retained and performance-ready','Training progression','Documented learning','A later-stage decision supported by evidence']))}
 </div>`;
}

function masterHTML(){ return `<div class="grid2">
 ${card('The tree',list(['VISION → connect countries, industries, people and capital','YOU → CONNECT → UNDERSTAND → BUILD','STAGE 1 → Money → Sales → Pharmacy/Health → Music → Body → Proof','STAGE 2 → Tetr OR internship/business path, selected by evidence','STAGE 3 → one scalable business','STAGE 4 → connect countries','STAGE 5 → connect industries, assets and institutions']))}
 ${card('Four pillars',list(['Sales → approach, ask, listen, value, negotiate, close','Psychology → observe, question, understand motives/resistance, adapt','Pharmacy / Health / Fitness → health, drugs, patient care, physiology, supplements and healthcare business','Music → piano, guitar, listening, rhythm, timing, improvisation and performance']))}
 ${card('ACTIVE',list(['Acting script / care plans / research closeout','Wipes + paid work + foreign-currency remote job','Sales practice + negotiation + GCU','Music repertoire','Fitness','Spanish','Trading learning + risk-controlled live execution','Content documenting real work']))}
 ${card('WAITING',list(['Pharmacy POS','Supplement brand','Large B2B expansion','Bahamas distribution/logistics','Real-estate acquisition program','Creator consulting product','New applications / capital-heavy ventures']))}
 ${card('Anti-pivot rules',list(['30-day hold for new ideas','Replacement, never addition','Finish before improve','Evidence before expansion','A question triggers the smallest useful patch, not a whole-life redesign']))}
 ${card('Decision filter',list(['Does it help the current stage?','Does it create money, skill, proof, network or a necessary credential?','What active block does it replace?','Is it real or merely exciting?','What evidence can I obtain first?','Can I defer it without losing it?']))}
 </div>`;
}


function moduleDay(module){
 if(!state.moduleData)state.moduleData={};
 if(!state.moduleData[module])state.moduleData[module]={};
 if(!state.moduleData[module][dateKey()])state.moduleData[module][dateKey()]={};
 return state.moduleData[module][dateKey()];
}
function nutritionDay(){
 if(!state.nutritionLogs)state.nutritionLogs={};
 if(!state.nutritionLogs[dateKey()])state.nutritionLogs[dateKey()]=[];
 return state.nutritionLogs[dateKey()];
}
function sel(module,field,label,options,value,rerender=true){
 const opts=options.map(o=>Array.isArray(o)?o:[o,o]);
 return `<label>${esc(label)}<select data-mod="${esc(module)}" data-field="${esc(field)}" ${rerender?'data-rerender="1"':''}>${opts.map(([v,n])=>`<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`;
}
function txt(module,field,label,value='',placeholder=''){return `<label>${esc(label)}<input data-mod="${esc(module)}" data-field="${esc(field)}" value="${esc(value||'')}" placeholder="${esc(placeholder)}"></label>`;}
function num(module,field,label,value='',placeholder='',step='1'){return `<label>${esc(label)}<input type="number" step="${esc(step)}" data-mod="${esc(module)}" data-field="${esc(field)}" value="${esc(value??'')}" placeholder="${esc(placeholder)}"></label>`;}
function area(module,field,label,value='',placeholder='',rows=3){return `<label>${esc(label)}<textarea rows="${rows}" data-mod="${esc(module)}" data-field="${esc(field)}" placeholder="${esc(placeholder)}">${esc(value||'')}</textarea></label>`;}
function dynamicTasks(module,title,tasks){return card(title,`<div class="stack">${tasks.map((t,i)=>check(`${module}-${dateKey()}-task-${i}`,t)).join('')}</div>`);}
function sessionSummary(items){return `<div class="branch-overview">${items.map(([a,b])=>`<div class="metricTile"><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join('')}</div>`;}
function safeNum(v){const n=Number(v);return Number.isFinite(n)?n:0;}
function minutesBetween(a,b){if(!a||!b)return 0;const x=new Date(a),y=new Date(b);return Math.max(0,Math.round((y-x)/60000));}
function optionForm(title,body){return card(title,`<div class="form">${body}</div>`);}

const fitnessPlans={
 gym:{
  Chest:[['Flat dumbbell/barbell press','mid-chest'],['Incline press','upper chest'],['Cable or pec-deck fly','chest adduction/stretch']],
  Back:[['Lat pulldown or pull-up','vertical pull / lats'],['Seated/cable row','mid-back'],['Straight-arm pulldown or supported row','lat isolation / control']],
  Legs:[['Squat or leg press','quads/glutes'],['Romanian deadlift','hamstrings/glutes'],['Leg curl or split squat','hamstrings / unilateral control']],
  Shoulders:[['Overhead press','front/overall delts'],['Lateral raise','side delts'],['Reverse fly / rear-delt machine','rear delts']],
  Arms:[['Incline or standing curl','biceps lengthened position'],['Hammer curl','brachialis/forearm'],['Pressdown or overhead triceps extension','triceps']],
  'Full Body':[['Leg press or squat','lower body'],['Press','push'],['Row or pulldown','pull']],
  Recovery:[['Easy treadmill/bike','circulation'],['Mobility sequence','range of motion'],['Light core','control']]
 },
 home:{
  Chest:[['Standard push-up','mid-chest'],['Feet-elevated push-up','upper chest'],['Wide or slow-tempo push-up','chest stretch/control']],
  Back:[['Table/inverted row if safe','mid-back'],['Backpack bent-over row','lats/mid-back'],['Prone Y-T-W raises','upper back/rear shoulder']],
  Legs:[['Bodyweight squat','quads/glutes'],['Bulgarian split squat','single-leg strength'],['Single-leg Romanian deadlift','hamstrings/glutes']],
  Shoulders:[['Pike push-up','pressing strength'],['Backpack lateral raise','side delts'],['Prone rear-delt raise','rear delts']],
  Arms:[['Backpack curl','biceps'],['Hammer curl with bottles/backpack','brachialis'],['Diamond push-up / chair extension if safe','triceps']],
  'Full Body':[['Squat','lower body'],['Push-up','push'],['Backpack row','pull']],
  Recovery:[['Walk','circulation'],['Mobility sequence','range of motion'],['Light core','control']]
 }
};
function fitnessHTML(d){
 const x=moduleDay('fitness');
 const env=x.environment||'gym', group=x.group||fitnessNames[dow(d)]||'Chest', repTarget=safeNum(x.repTarget)||40, cap=safeNum(x.timeCap)||45;
 const plan=(fitnessPlans[env]&&fitnessPlans[env][group])||fitnessPlans[env].Chest;
 const completed=plan.map((_,i)=>safeNum(x['reps'+i]));
 const pct=Math.min(100,Math.round(completed.reduce((a,b)=>a+b,0)/(repTarget*plan.length)*100));
 const duration=x.durationMin||minutesBetween(x.startedAt,x.finishedAt)||0;
 return `<div class="stack stack-lg">
  ${card('Fitness — choose today’s conditions first',`<p class="muted">Choose where you are training and the muscle group. The app then gives only the exercises that fit that choice. The target is total clean repetitions, split into as many mini-sets as needed.</p>${sessionSummary([['Environment',env==='gym'?'Gym':'Home / calisthenics'],['Muscle',group],['Rep target',repTarget+' each'],['Completion',pct+'%']])}`)}
  <div class="grid7030">
   ${optionForm('1) Select today’s workout',`${sel('fitness','environment','Where are you training?',[['gym','Gym'],['home','Home / calisthenics']],env)}${sel('fitness','group','Muscle group',['Chest','Back','Legs','Shoulders','Arms','Full Body','Recovery'],group)}${sel('fitness','repTarget','Total reps per exercise',[['30','30 reps'],['40','40 reps'],['50','50 reps']],String(repTarget))}${sel('fitness','timeCap','Time cap',[['30','30 minutes'],['45','45 minutes'],['60','60 minutes']],String(cap),false)}<div class="actions"><button type="button" class="btn primary" id="fitnessStart">Start workout</button><button type="button" class="btn" id="fitnessFinish">Finish + record time</button></div>${x.startedAt?`<div class="small">Started: ${esc(new Date(x.startedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}))}${x.finishedAt?` · Finished: ${esc(new Date(x.finishedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}))}`:''}</div>`:''}`)}
   ${card('2) Today’s three exercises',`<div class="stack">${plan.map((e,i)=>`<div class="check"><div style="flex:1"><b>${i+1}. ${esc(e[0])}</b><div class="small">Targets ${esc(e[1])}. Complete <strong>${repTarget} total clean reps</strong>. Break the total into mini-sets; stop a mini-set when form starts to break.</div><div class="grid2" style="margin-top:10px">${num('fitness','reps'+i,'Reps completed',x['reps'+i]||'',String(repTarget))}${txt('fitness','load'+i,env==='gym'?'Load used':'Resistance / variation',x['load'+i]||'',env==='gym'?'Example: 20 kg':'Example: backpack / feet elevated')}</div></div></div>`).join('')}</div><div class="notice" style="margin-top:12px">Quantity is the target, but clean tension still matters: use a resistance/variation that makes the later reps challenging without losing form.</div>`)}
  </div>
  ${card('3) Session metric',`${sessionSummary([['Time cap',cap+' min'],['Recorded time',duration?duration+' min':'Not finished'],['Total reps',completed.reduce((a,b)=>a+b,0)+' / '+(repTarget*plan.length)],['Discipline',duration?(duration<=cap?'Inside time cap':'Over time cap'):'Pending']])}<div class="progress" style="margin-top:12px"><div style="width:${pct}%"></div></div>`)}
 </div>`;
}

function nutritionTargets(){
 const p=state.nutritionProfile||{}; const w=safeNum(p.weightKg), h=safeNum(p.heightCm), age=safeNum(p.age), sex=p.sex||'male', act=safeNum(p.activity)||1.55;
 if(!w||!h||!age)return null;
 const bmr=10*w+6.25*h-5*age+(sex==='female'?-161:5); const maintenance=Math.round(bmr*act); const goal=p.goal||'bulk';
 const calories=goal==='bulk'?maintenance+300:goal==='cut'?maintenance-400:maintenance; const protein=Math.round(w*(goal==='cut'?2.0:1.8));
 return {bmr:Math.round(bmr),maintenance,calories,protein,goal};
}
function dietHTML(){
 const p=state.nutritionProfile||{}; const meals=nutritionDay(), t=nutritionTargets();
 const cals=Math.round(meals.reduce((a,m)=>a+safeNum(m.calories),0)); const protein=Math.round(meals.reduce((a,m)=>a+safeNum(m.protein),0));
 const calPct=t?Math.min(100,Math.round(cals/t.calories*100)):0, proPct=t?Math.min(100,Math.round(protein/t.protein*100)):0;
 return `<div class="stack stack-lg">
  ${card('Diet / Nutrition — goal-driven daily tracker',`<p class="muted">Set your body data and goal once. Then log what you actually eat. Meal calories/protein can be entered manually or estimated with AI from your description.</p>${t?sessionSummary([['Goal',t.goal],['Calories',cals+' / '+t.calories],['Protein',protein+'g / '+t.protein+'g'],['Meals logged',String(meals.length)] ]):'<div class="notice">Complete the profile below to calculate an estimated daily target.</div>'}`)}
  <div class="grid7030">
   ${optionForm('1) Body + goal',`<label>Sex used for calorie equation<select id="nutSex"><option value="male" ${p.sex==='male'?'selected':''}>Male</option><option value="female" ${p.sex==='female'?'selected':''}>Female</option></select></label><label>Age<input id="nutAge" type="number" value="${esc(p.age||'')}"></label><label>Weight (kg)<input id="nutWeight" type="number" step="0.1" value="${esc(p.weightKg||'')}"></label><label>Height (cm)<input id="nutHeight" type="number" step="0.1" value="${esc(p.heightCm||'')}"></label><label>Activity<select id="nutActivity"><option value="1.2" ${String(p.activity)==='1.2'?'selected':''}>Low</option><option value="1.375" ${String(p.activity)==='1.375'?'selected':''}>Light</option><option value="1.55" ${String(p.activity||'1.55')==='1.55'?'selected':''}>Moderate</option><option value="1.725" ${String(p.activity)==='1.725'?'selected':''}>High</option></select></label><label>Goal<select id="nutGoal"><option value="bulk" ${p.goal==='bulk'?'selected':''}>Calorie surplus / bulk</option><option value="maintain" ${p.goal==='maintain'?'selected':''}>Maintain</option><option value="cut" ${p.goal==='cut'?'selected':''}>Calorie deficit / cut</option></select></label><button type="button" id="saveNutritionProfile" class="btn primary">Save + calculate target</button>${t?`<div class="small">Estimated maintenance: ${t.maintenance} kcal/day. Current target: ${t.calories} kcal and ${t.protein} g protein/day.</div>`:''}`)}
   ${optionForm('2) Log a meal',`<label>Meal<select id="mealType"><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option><option>Shake</option></select></label><label>What did you eat?<textarea id="mealDescription" rows="3" placeholder="Example: 3 eggs, 2 slices toast, peanut butter and a glass of milk"></textarea></label><div class="grid2"><label>Calories<input id="mealCalories" type="number"></label><label>Protein (g)<input id="mealProtein" type="number" step="0.1"></label></div><div class="actions"><button type="button" id="estimateMeal" class="btn">Estimate with AI</button><button type="button" id="addMeal" class="btn primary">Add meal</button></div><div id="mealEstimateStatus" class="small">AI estimates are approximations; portions and preparation change the result.</div>`)}
  </div>
  ${card('3) Today’s intake',`${meals.length?`<div class="branch-list">${meals.map((m,i)=>`<div class="branchItem"><div class="branchItemTop"><div><b>${esc(m.type)}</b><div class="small">${esc(m.description)}</div></div><button type="button" class="btn danger" data-delete-meal="${i}">Remove</button></div><div class="metric"><span>Calories</span><b>${Math.round(safeNum(m.calories))}</b></div><div class="metric"><span>Protein</span><b>${Math.round(safeNum(m.protein))} g</b></div></div>`).join('')}</div>`:'<p class="muted">No meals logged yet.</p>'}${t?`<div style="margin-top:16px"><div class="small">Calories</div><div class="progress"><div style="width:${calPct}%"></div></div><div class="small" style="margin-top:10px">Protein</div><div class="progress"><div style="width:${proPct}%"></div></div><div class="grid2" style="margin-top:12px"><div class="good">Remaining calories: <strong>${t.calories-cals}</strong></div><div class="good">Remaining protein: <strong>${Math.max(0,t.protein-protein)} g</strong></div></div></div>`:''}`)}
 </div>`;
}

const tradeStageTasks={
 'Account setup':['Open the broker’s official application page/app.','Create an Individual account.','Select Cash account while learning; do not enable margin just to speed up trading.','Complete identity/tax/financial questions truthfully.','Submit verification documents requested by the broker.','Do not send money until the account is approved and the broker shows official funding instructions.'],
 'Funding':['Sign in to the approved broker account.','Open Deposit / Transfer & Pay.','Create the broker’s deposit notification first.','Copy the exact bank instructions for the currency you are sending.','Send only money you can afford to expose to market loss.','Wait until the broker shows the cash as available before any trade.'],
 'Learn order types':['Open the official broker education resource before the trading ticket.','Learn the difference between Market and Limit orders.','Open a real order ticket without submitting it.','Identify symbol, side, quantity/dollar amount, order type, limit price and estimated cost.','Close the ticket and explain in your notes what each field controls.'],
 'First live trade':['Open the official order-types lesson first.','Open your broker app and your Trading notes.','Choose a stock/ETF from your own watchlist; the app does not select an investment for you.','Write why you are considering the trade.','Write entry, invalidation, target and maximum acceptable dollar loss.','Use a small cash/fractional position if the broker supports it.','Review the order ticket line by line before Submit.','After fill, record the trade immediately.'],
 'Live trade review':['Open the trade confirmation/history.','Record entry, exit, amount used and fees.','Calculate profit/loss.','Answer: did I follow the plan written before entry?','Write one behavior to repeat and one behavior to change.']
};
function tradingHTML(){
 const x=moduleDay('trading'); const platform=x.platform||'IBKR GlobalTrader', stage=x.stage||'Account setup'; const tasks=tradeStageTasks[stage]||tradeStageTasks['Account setup'];
 const links=platform==='TradingView + broker'?[['TradingView Help','https://www.tradingview.com/support/'],['IBKR Campus','https://www.interactivebrokers.com/campus/']]:[['IBKR Campus','https://www.interactivebrokers.com/campus/'],['Interactive Brokers','https://www.interactivebrokers.com/']];
 const records=(state.trades||[]).filter(r=>r.date===dateKey()); const net=records.reduce((a,r)=>a+safeNum(r.pnl),0);
 return `<div class="stack stack-lg">
  ${card('Trading — choose hub and learning stage',`<p class="muted">This branch uses real-money learning only when you deliberately select a live-trade stage. It does not pick securities for you. The goal is to learn the platform, define risk before entry and record the actual result.</p>${sessionSummary([['Platform',platform],['Stage',stage],['Trades logged',String(records.length)],['Today P/L',net.toFixed(2)]])}`)}
  <div class="grid7030">
   ${optionForm('1) Select platform + stage',`${sel('trading','platform','Trading hub',[['IBKR GlobalTrader','IBKR GlobalTrader'],['IBKR Client Portal','IBKR Client Portal'],['TradingView + broker','TradingView + broker'],['Other','Other']],platform)}${platform==='Other'?txt('trading','otherPlatform','Platform name',x.otherPlatform||''):''}${sel('trading','stage','What are you doing today?',Object.keys(tradeStageTasks),stage)}<div class="actions">${links.map(([n,u])=>`<a class="btn" target="_blank" rel="noopener" href="${u}">Open ${esc(n)}</a>`).join('')}</div>`)}
   ${dynamicTasks('trading','2) Exact next steps',tasks)}
  </div>
  ${optionForm('3) Record a completed live trade',`<div class="grid2">${txt('trading','ticker','Ticker / instrument',x.ticker||'','Example: AAPL')}${num('trading','startBalance','Account balance before trade',x.startBalance||'','','0.01')}${num('trading','amountUsed','Cash amount used',x.amountUsed||'','','0.01')}${num('trading','entryPrice','Entry price',x.entryPrice||'','','0.0001')}${num('trading','exitPrice','Exit price',x.exitPrice||'','','0.0001')}${num('trading','fees','Fees',x.fees||'0','','0.01')}</div>${area('trading','tradeReason','Reason written before entry',x.tradeReason||'','One sentence: why did I take this trade?',2)}<button type="button" class="btn primary" id="addTradeRecord">Save trade result</button><div class="small">P/L is calculated from the cash amount used and the entry/exit price. This is recordkeeping, not a recommendation to buy or sell any specific security.</div>`)}
  ${card('4) Today’s trade record',records.length?`<div class="branch-list">${records.map(r=>`<div class="branchItem"><b>${esc(r.ticker)}</b><div class="metric"><span>Amount used</span><b>${r.amountUsed.toFixed(2)}</b></div><div class="metric"><span>Entry → Exit</span><b>${r.entryPrice} → ${r.exitPrice}</b></div><div class="metric"><span>P/L</span><b>${r.pnl.toFixed(2)}</b></div><div class="small">${esc(r.reason||'')}</div></div>`).join('')}</div>`:'<p class="muted">No live trade logged for this date.</p>')}
 </div>`;
}

const pharmacyFlows={
 'Study':['Write the exact topic.','Open one primary source: lecture material, guideline, textbook chapter or trusted clinical reference.','Write 3 questions you must be able to answer by the end.','Study the first section.','Close the source and recall the answer from memory.','Check the source and correct gaps.','Finish with a 5-line summary.'],
 'Assignment':['Open the assignment instructions/rubric first.','Write the exact deliverable and deadline.','Break the deliverable into sections.','Choose the one section that must be completed today.','Gather only the sources needed for that section.','Draft it.','Check it against the rubric before stopping.'],
 'Research':['Identify the current research phase: data, analysis, discussion, references or final editing.','Open the research file and the source data/material.','Define one measurable output for today.','Complete that output before opening a new research issue.','Record what changed and what is still unresolved.'],
 'Work shift':['Confirm shift time and assigned role.','Do pharmacy work while clocked in.','Record repeated operational questions/problems without patient-identifying details.','Note one product/stock/workflow observation.','At shift end, write one operational lesson.'],
 'Attachment / Rotation':['Write the ward/site/rotation and today’s learning objective.','Review the patient/problem list without storing identifiable information in this app.','For each medication question: class → indication → dose → monitoring → key interaction/precaution.','Ask/verify unresolved clinical questions with the supervising team/reference.','Write the main learning point after the attachment.'],
 'Clinical case':['Write the problem list.','List current medicines and doses.','Match each medicine to an indication.','Check renal/hepatic dosing considerations where relevant.','Check important interactions/monitoring.','Identify the pharmacist intervention or counseling point.','Summarize in a concise care-plan format.'],
 'Exam prep':['Choose one exam topic.','Do 10–20 minutes of active recall before rereading.','Answer practice questions.','Mark every wrong/uncertain answer.','Review only those gaps.','Repeat the missed questions once.'],
 'Patient counseling':['Choose the medicine/condition.','Write the indication in plain language.','Write exactly how to use it.','Write key side effects and what requires urgent help.','Write interactions/precautions relevant to the patient.','Practice a 60–90 second counseling explanation aloud.']
};
function pharmacyHTML(){
 const x=moduleDay('pharmacy'); const mode=x.mode||'Study'; const tasks=pharmacyFlows[mode]||pharmacyFlows.Study;
 return `<div class="stack stack-lg">
  ${card('Pharmacy — select what kind of pharmacy work you are doing',`<p class="muted">Different pharmacy activities need different regimens. Select the actual context first; the checklist changes to fit it.</p>${sessionSummary([['Activity',mode],['Focus',x.focus||'Not entered'],['Time block',(x.duration||60)+' min'],['Completed',x.completed||'Not recorded']])}`)}
  <div class="grid7030">${optionForm('1) Define today’s pharmacy context',`${sel('pharmacy','mode','Activity',Object.keys(pharmacyFlows),mode)}${txt('pharmacy','focus','Topic / patient problem / assignment / project',x.focus||'','Be specific')}${sel('pharmacy','duration','Time available',[['30','30 min'],['60','60 min'],['90','90 min'],['120','120 min']],String(x.duration||60),false)}${txt('pharmacy','deadline','Deadline / shift time — if relevant',x.deadline||'')}`)}${dynamicTasks('pharmacy','2) Today’s regimen',tasks)}</div>
  ${optionForm('3) Record output',`${area('pharmacy','output','What did you actually complete?',x.output||'','Write the concrete output, not just “studied”.',3)}${sel('pharmacy','completed','Completion',['Not recorded','25%','50%','75%','100%'],x.completed||'Not recorded',false)}${sel('pharmacy','confidence','How well can you explain/apply it?',[['1','1 — weak'],['2','2'],['3','3 — usable'],['4','4'],['5','5 — strong']],String(x.confidence||3),false)}`)}
 </div>`;
}

const salesIndustries=['Pharmacy / Healthcare','Gym / Fitness','Hotels / Hospitality','Restaurants / Food service','Offices / Corporate','Retail','Schools / Education','Construction / Trades','Other'];
const salesModes=['Prospecting','Cold approach','Discovery','Follow-up','Negotiation','Closing'];
function salesTasks(mode,count){
 const base={
  'Prospecting':['Choose the industry and area.','Open the Maps search below.','Save the required number of real business names before approaching anyone.','For each target, record business name + decision-maker role + contact/visit option.'],
  'Cold approach':['Prepare one opening sentence.','Approach/call the first target.','Ask permission for 20–30 seconds.','State the reason for the approach.','Ask one current-process question.','Record the result immediately.'],
  'Discovery':['Ask how they currently handle the problem.','Ask what they dislike/cost/lose with the current method.','Ask who decides and what would make a change worthwhile.','Do not pitch until a need is clear.'],
  'Follow-up':['Open the previous conversation note.','State the reason for following up.','Reference the agreed next step.','Ask for the next concrete action/date.','Record outcome and next follow-up.'],
  'Negotiation':['State the value and current offer clearly.','Ask what specifically prevents agreement.','Classify the obstacle: price, timing, authority, risk or value.','Respond only to that obstacle.','Trade concessions; do not give them away without receiving something.','Ask for agreement again.'],
  'Closing':['Summarize the agreed need.','State the exact offer.','Ask directly for purchase/trial/meeting/commitment.','Stay quiet long enough for an answer.','If no: identify the final obstacle.','Record close or next step.']
 };
 return [...(base[mode]||base.Prospecting),`Complete the planned target of ${count} business interactions/targets or record why the session stopped.`];
}
function salesHTML(){
 const x=moduleDay('sales'); const industry=x.industry||salesIndustries[0], mode=x.mode||'Prospecting', count=safeNum(x.targetCount)||10, areaName=x.area||''; const tasks=salesTasks(mode,count);
 const query=encodeURIComponent(`${industry.replace(' / ',' ')} ${areaName}`.trim()); const mapUrl=`https://www.google.com/maps/search/?api=1&query=${query}`;
 const approaches=safeNum(x.approaches), dm=safeNum(x.dm), offers=safeNum(x.offers), closes=safeNum(x.closes), revenue=safeNum(x.revenue); const conversion=approaches?Math.round(closes/approaches*100):0;
 return `<div class="stack stack-lg">
  ${card('Sales — select market, objective and offer',`<p class="muted">The branch first narrows the real-world situation. Then it gives the exact sales sequence and lets you record what happened.</p>${sessionSummary([['Industry',industry],['Objective',mode],['Close rate',conversion+'%'],['Revenue',String(revenue)]])}`)}
  <div class="grid7030">${optionForm('1) Define the sales session',`${sel('sales','industry','Industry',salesIndustries,industry)}${industry==='Other'?txt('sales','otherIndustry','Industry name',x.otherIndustry||''):''}${sel('sales','mode','Sales objective',salesModes,mode)}${txt('sales','offer','What are you selling?',x.offer||'','Example: wipes / service / software')}${txt('sales','area','Target area / neighborhood',areaName,'Example: Georgetown')}${num('sales','targetCount','Number of targets',count,'10')}<div class="actions"><a class="btn primary" target="_blank" rel="noopener" href="${mapUrl}">Find actual businesses on Maps</a><button type="button" class="btn" id="salesAIStrategy">Build pitch with AI</button></div><div id="salesAIStatus" class="small">Maps finds real businesses. AI can tailor an opening, discovery questions and objection strategy from your selections.</div>`)}${dynamicTasks('sales','2) Exact session sequence',tasks)}</div>
  ${x.aiStrategy?card('AI sales strategy',markdown(x.aiStrategy)):''}
  ${optionForm('3) Record outcomes',`<div class="grid2">${num('sales','approaches','Approaches / calls',x.approaches||'0')}${num('sales','dm','Decision-maker conversations',x.dm||'0')}${num('sales','qualified','Qualified needs',x.qualified||'0')}${num('sales','offers','Offers made',x.offers||'0')}${num('sales','closes','Closes',x.closes||'0')}${num('sales','revenue','Revenue',x.revenue||'0','','0.01')}</div>${area('sales','objections','Main objections heard',x.objections||'','Price, timing, authority, risk, value...',2)}<div class="good">Close rate from recorded approaches: <strong>${conversion}%</strong></div>`)}
 </div>`;
}

const musicSkills={
 'Basic chords':['Map the chord progression cleanly.','Play each chord in root position once.','Then move to the closest inversion to reduce hand movement.'],
 '7th chords':['Identify which major/minor triads can be upgraded naturally to 7th chords.','Learn the 7th-chord shapes in the song key.','Replace only 2–4 suitable chords first.','Play the full section and keep only changes that preserve the song.'],
 '9th chords':['Start from stable 7th chords.','Add the 9th only to selected dominant/major/minor chords that suit the style.','Voice the chord so the melody remains clear.','Use no more than a few 9ths in the first full run.'],
 'Inversions':['Write the chord sequence.','For each next chord, choose the inversion requiring the smallest hand movement.','Practice only the chord transitions for 5 minutes.','Then play the section without looking down constantly.'],
 'Arpeggios':['Choose one chord pattern.','Practice the pattern slowly on each song chord.','Keep timing even with a metronome.','Apply it to one verse/section before the whole song.'],
 'Bassline':['Write chord roots first.','Choose root notes on strong beats.','Add fifths, approach notes or walking movement only where they connect cleanly.','Keep the bass simpler when the right hand/melody becomes busy.'],
 'Melody harmonization':['Identify the melody note on the strong beat.','Choose a chord tone or nearby harmony note under/around it.','Harmonize only one phrase first.','Compare it with the plain melody and keep the clearer version.'],
 'Improvisation':['Identify the song key and safe chord tones.','Limit the first improvisation to one small rhythmic idea.','Use chord tones on strong beats.','Leave space instead of filling every gap.','Record one short improvised section.'],
 'Rhythm / groove':['Clap/tap the groove before playing.','Choose one accompaniment pattern.','Practice it on one chord until steady.','Apply it to the progression without changing pattern mid-section.'],
 'Intro / outro':['Create a 2–4 bar intro using the final/first progression.','Make the ending deliberate: held final chord, turnaround or short tag.','Practice intro and ending three times each before the full run.']
};
function musicHTML(d){
 const x=moduleDay('music'); const instrument=x.instrument||'Piano', assignment=x.assignment||'Fixed song', skill=x.skill||'Inversions', time=safeNum(x.time)||65; const song=assignment==='Custom song'?(x.customSong||'Enter song below'):assignment==='Technique only'?'Technique session':songFor(d); const skillTasks=musicSkills[skill]||musicSkills.Inversions;
 const instrumentTasks=instrument==='Piano'?['Left hand: establish root/bass role before adding movement.','Right hand: keep melody/chord voicing clear and use economical movement.']:['Choose chord shapes/voicings that keep transitions clean.','Decide whether bass notes, fingerstyle pattern or strumming carries the arrangement.'];
 const tasks=[`0–5 min — listen to/reference ${song}.`,`5–10 min — write the structure and key.`,`10–20 min — stabilize the basic harmony before the new skill.`,...skillTasks,...instrumentTasks,`Final ${Math.max(10,time-35)} min — play full sections, then one uninterrupted run.`,`Record one measurable result: BPM, full runs, mistakes or confidence.`];
 return `<div class="stack stack-lg">
  ${card('Music — select instrument + growth skill',`<p class="muted">The fixed song remains the assignment when selected, but each session now forces one technical/creative skill into the song so the repertoire and musicianship grow together.</p>${sessionSummary([['Instrument',instrument],['Assignment',song],['Skill',skill],['Time',time+' min']])}`)}
  <div class="grid7030">${optionForm('1) Select today’s music task',`${sel('music','instrument','Instrument',['Piano','Guitar'],instrument)}${sel('music','assignment','Assignment',['Fixed song','Custom song','Technique only'],assignment)}${assignment==='Custom song'?txt('music','customSong','Song',x.customSong||''):''}${sel('music','skill','Skill to add',Object.keys(musicSkills),skill)}${sel('music','time','Practice time',[['30','30 min'],['45','45 min'],['65','65 min'],['90','90 min']],String(time),false)}`)}${dynamicTasks('music','2) Exact practice sequence',tasks)}</div>
  ${optionForm('3) Record performance',`<div class="grid2">${num('music','bpm','Stable BPM reached',x.bpm||'')}${num('music','fullRuns','Full runs completed',x.fullRuns||'0')}${num('music','mistakes','Major breakdowns in last run',x.mistakes||'0')}${sel('music','confidence','Confidence',[['1','1 — not ready'],['2','2'],['3','3 — usable'],['4','4'],['5','5 — performance-ready']],String(x.confidence||3),false)}</div>${area('music','lesson','What changed in the arrangement today?',x.lesson||'','Example: used 7ths in chorus; bassline still unstable',2)}`)}
 </div>`;
}

const actingFlows={
 'Script analysis':['Read once without acting.','Identify who you are, where you are, relationship and what just happened.','Write the character’s objective.','Break the scene into beats when tactic/topic changes.','Give each beat one playable action verb.'],
 'Memorization':['Read one short section aloud.','Cover the text and recall it.','Check errors.','Repeat until accurate.','Add the next section.','Run the joined sections while moving/listening rather than reciting mechanically.'],
 'Character work':['Write what the character wants.','Write what they fear/avoid.','Choose physical/voice behavior only if supported by the text.','Play the same beat with two different tactics.','Keep the version that feels more truthful/clear.'],
 'Self-tape':['Set camera at eye level.','Check light, sound and framing.','Place reader just off lens if needed.','Record one complete take without stopping.','Watch once.','Choose only 1–2 corrections.','Record take two.'],
 'Audition submission':['Read submission instructions first.','Confirm deadline, slate/file naming and framing requirements.','Prepare the requested material only.','Record/choose final take.','Export correct format.','Submit and record confirmation.']
};
function actingHTML(){const x=moduleDay('acting'),mode=x.mode||'Script analysis';return `<div class="stack stack-lg">${card('Acting — select today’s acting mode',sessionSummary([['Mode',mode],['Material',x.material||'Current script'],['Time',(x.time||60)+' min'],['Takes',String(x.takes||0)]]))}<div class="grid7030">${optionForm('1) Define session',`${sel('acting','mode','Activity',Object.keys(actingFlows),mode)}${txt('acting','material','Script / scene / audition',x.material||'')}${sel('acting','time','Time available',[['30','30 min'],['60','60 min'],['90','90 min']],String(x.time||60),false)}`)}${dynamicTasks('acting','2) Exact acting sequence',actingFlows[mode])}</div>${optionForm('3) Record result',`${num('acting','takes','Full takes completed',x.takes||'0')}${num('acting','memorized','Lines/material memorized (%)',x.memorized||'0')}${area('acting','correction','Biggest correction for next session',x.correction||'','One or two things only',2)}`)}</div>`;}

const businessFlows={
 'Remote job':['Open your job tracker.','Choose one target role.','Find 1–2 roles that actually match the target.','Tailor CV/profile only where the role requires it.','Submit.','Send 2 direct follow-ups/outreach messages.','Record application and next follow-up date.'],
 'Existing product sales':['Define the product/offer and today’s target customer.','Prepare price and minimum outcome.','Choose target list.','Run sales session.','Record conversations, objections, closes and revenue.'],
 'Offer validation':['Write the problem the offer solves.','Identify 5 people/businesses who actually have the problem.','Ask about current process and pain before pitching.','Record exact words and willingness to pay/try.','Change the offer only from repeated evidence.'],
 'Budget / cash flow':['Record current cash available.','Record money due in.','Record mandatory expenses.','Allocate money to the nearest required goal.','Record remaining discretionary cash.'],
 'Business idea test':['State the idea in one sentence.','State the paying customer.','State the painful problem.','Find one real-world evidence source/customer conversation.','Define the smallest paid/usable test.','Do not build the full business before the test.']
};
function businessHTML(){const x=moduleDay('business'),mode=x.mode||'Remote job';return `<div class="stack stack-lg">${card('Money / Business — choose the money activity',sessionSummary([['Mode',mode],['Focus',x.focus||'Not entered'],['Time',(x.time||45)+' min'],['Output',x.output||'Not recorded']]))}<div class="grid7030">${optionForm('1) Define today’s money block',`${sel('business','mode','Activity',Object.keys(businessFlows),mode)}${txt('business','focus','Exact role / offer / business / budget focus',x.focus||'')}${sel('business','time','Time available',[['30','30 min'],['45','45 min'],['60','60 min'],['90','90 min']],String(x.time||45),false)}`)}${dynamicTasks('business','2) Exact sequence',businessFlows[mode])}</div>${optionForm('3) Record output',`${area('business','output','What did this block produce?',x.output||'','Applications, revenue, customer evidence, budget decision...',3)}`)}</div>`;}

const miamiFlows={
 'Flight':['Open the selected airline/search source.','Confirm travel dates and passenger name exactly as passport.','Compare total round-trip price including baggage.','Record candidate flight.','Book only after dates and payment are confirmed.','Save confirmation/reference.'],
 'Accommodation':['Define event area and maximum budget.','Search lodging for exact dates.','Compare total price, taxes, cancellation and transport distance.','Shortlist 3.','Book the best confirmed option.','Save address and confirmation.'],
 'Budget':['List flight, accommodation, ground transport, food, event costs and emergency reserve.','Enter amount already paid.','Enter money currently saved.','Calculate remaining amount.','Set next transfer/savings target.'],
 'Event preparation':['Open event schedule.','Choose sessions/objectives.','Write 3 questions you want answered.','Prepare concise introduction.','Prepare note/contact capture method.'],
 'Networking':['Define the type of person you want to meet.','Prepare a 15-second introduction.','Ask what they are building/working on.','Find a real reason to follow up.','Record name, context and next step immediately.'],
 'Travel documents':['Check passport validity.','Check visa/entry document status.','Save event tickets/confirmations.','Save flight/accommodation confirmations.','Create offline/backup copies.']
};
function miamiHTML(){const x=moduleDay('miami'),mode=x.mode||'Budget';return `<div class="stack stack-lg">${card('Miami — select the travel problem you are solving today',sessionSummary([['Mode',mode],['Deadline',x.deadline||'Not entered'],['Cost / amount',x.amount||'Not entered'],['Result',x.result||'Pending']]))}<div class="grid7030">${optionForm('1) Select travel task',`${sel('miami','mode','Task',Object.keys(miamiFlows),mode)}${txt('miami','deadline','Deadline / date',x.deadline||'')}${txt('miami','amount','Budget / amount relevant to this task',x.amount||'')}`)}${dynamicTasks('miami','2) Exact sequence',miamiFlows[mode])}</div>${optionForm('3) Record result',`${area('miami','result','What is now confirmed/completed?',x.result||'','Booking, amount saved, contact list, document status...',3)}`)}</div>`;}

const tetrFlows={
 'Application':['Open the application portal.','Identify the next incomplete section.','Collect only the document/information required for that section.','Complete it.','Save/submit and record confirmation.'],
 'Acceptance / offer':['Open the official offer/acceptance document.','Record cohort/start date.','Record conditions of acceptance.','Record acceptance/payment deadlines.','List every unresolved question before making a tradeoff decision.'],
 'Funding':['Record total program cost.','Record scholarship/aid confirmed in writing.','Calculate amount still payable.','Record payment deadlines.','List realistic funding sources and amounts.','Do not count uncertain money as funded.'],
 'Visa / travel':['Identify destination and required travel/visa process.','List documents required.','Record application timeline and cost.','Identify the earliest action that can be completed now.'],
 'Internship tradeoff':['Write what internship/license gives you.','Write what Tetr gives you.','Record whether internship can be deferred/resumed.','Record confirmed Tetr cost/funding.','Record network/experience benefit supported by actual program facts.','Do not sacrifice either path while key facts remain unknown.'],
 'Decision gate':['Check written acceptance.','Check start date.','Check exact cost/funding.','Check visa/travel feasibility.','Check internship fallback.','Write GO or NO-GO only from verified evidence.']
};
function tetrHTML(){const x=moduleDay('tetr'),mode=x.mode||'Decision gate';return `<div class="stack stack-lg">${card('Tetr — choose the current decision/work stage',sessionSummary([['Stage',mode],['Unknown',x.unknown||'None entered'],['Deadline',x.deadline||'Not entered'],['Status',x.status||'Open']]))}<div class="grid7030">${optionForm('1) Select stage',`${sel('tetr','mode','Stage',Object.keys(tetrFlows),mode)}${txt('tetr','unknown','Main unresolved question',x.unknown||'')}${txt('tetr','deadline','Relevant deadline',x.deadline||'')}`)}${dynamicTasks('tetr','2) Exact sequence',tetrFlows[mode])}</div>${optionForm('3) Record evidence',`${area('tetr','evidence','What did you verify today?',x.evidence||'','Use facts from official communication/documents.',3)}${sel('tetr','status','Current status',['Open','Waiting on response','Ready for decision','Completed'],x.status||'Open',false)}`)}</div>`;}

const psychologyFlows={
 'Observation':['Choose one real interaction/situation.','Write only observable behavior first — what was said/done.','Separate your interpretation from the observation.','List 2–3 possible motives/explanations.','Identify what evidence would distinguish them.','Write one lesson for future interaction.'],
 'Human behavior study':['Choose one concept: motivation, bias, persuasion, emotion, group behavior, negotiation or decision-making.','Read/watch one credible source.','Write the concept in plain language.','Write one example from real life.','Write one way the concept could be misapplied.','Apply it to one current situation.'],
 'Conversation review':['Write what you wanted from the conversation.','Write what the other person appeared to want.','Identify the moment their response changed.','Identify what you said/did immediately before the change.','Write one alternative response to test next time.'],
 'Problem solving':['Define the problem without solution language.','List constraints that are actually real.','List assumptions that may be false.','Generate 3 different approaches.','Choose the smallest test.','Record result and update belief.'],
 'Decision analysis':['Write the decision.','List options.','List upside, downside and reversibility of each.','Identify what fact would most change the decision.','Get that fact before overthinking lower-value details.']
};
function psychologyHTML(){const x=moduleDay('psychology'),mode=x.mode||'Observation';return `<div class="stack stack-lg">${card('Psychology / Understanding People',sessionSummary([['Mode',mode],['Situation',x.situation||'Not entered'],['Lesson',x.lesson||'Pending'],['Applied?',x.applied||'No']]))}<div class="grid7030">${optionForm('1) Choose the thinking task',`${sel('psychology','mode','Mode',Object.keys(psychologyFlows),mode)}${area('psychology','situation','Situation / concept / problem',x.situation||'','What exactly are you analyzing?',3)}`)}${dynamicTasks('psychology','2) Analysis sequence',psychologyFlows[mode])}</div>${optionForm('3) Record lesson',`${area('psychology','lesson','What did you learn?',x.lesson||'','One clear behavior/decision insight.',3)}${sel('psychology','applied','Did you apply/test it?',['No','Partly','Yes'],x.applied||'No',false)}`)}</div>`;}

const contentFlows={
 'Sales lesson':['Choose one real sales interaction.','State what happened.','State the behavior/objection you noticed.','State what you learned.','Turn it into one useful takeaway.'],
 'Human behavior':['Choose one observed behavior.','Describe it without identifying private individuals.','Explain 2 possible reasons.','State the lesson for communication/decision-making.'],
 'Music progress':['Choose today’s song/skill.','Show or explain the before/after.','State one technical lesson.','Record a short demonstration if useful.'],
 'Pharmacy / health':['Choose one educational topic.','Verify the factual point.','Explain it simply.','Do not include identifiable patient details.','Add a clear educational-not-personal-advice frame where relevant.'],
 'Business building':['Choose one real action: outreach, customer lesson, product test or operational problem.','State the action.','State result.','State what changes next.']
};
function contentHTML(){const x=moduleDay('content'),source=x.source||'Sales lesson';return `<div class="stack stack-lg">${card('Content — select what real work you are documenting',sessionSummary([['Source',source],['Format',x.format||'Short video'],['Platform',x.platform||'Instagram / TikTok / Shorts'],['Published',x.published||'No']]))}<div class="grid7030">${optionForm('1) Select content source',`${sel('content','source','Source',Object.keys(contentFlows),source)}${sel('content','format','Format',['Short video','Carousel / post','Written note'],x.format||'Short video')}${sel('content','platform','Platform',['Instagram / TikTok / Shorts','Instagram','TikTok','YouTube Shorts','LinkedIn'],x.platform||'Instagram / TikTok / Shorts')}${txt('content','topic','Specific topic',x.topic||'')}`)}${dynamicTasks('content','2) Build the content',contentFlows[source].concat(['Write a one-sentence hook.','Record/write within a 20-minute cap.','Publish or save as draft with a clear reason.']))}</div>${optionForm('3) Record result',`${sel('content','published','Published?',['No','Drafted','Yes'],x.published||'No',false)}${num('content','views','Views / reach if available',x.views||'0')}${area('content','response','Useful response / lesson',x.response||'','What signal did the content produce?',2)}`)}</div>`;}

function ideasHTML(){
 return `<div class="grid7030">
 ${card('Add an idea',`<form id="ideaForm" class="form">
  <label>Idea<input id="ideaName" type="text" required></label>
  <label>Why it looks attractive<textarea id="ideaWhy" rows="2"></textarea></label>
  <label>What ACTIVE project would it replace?<input id="ideaReplace" type="text"></label>
  <label>What proof would justify activation?<input id="ideaProof" type="text"></label>
  <button class="btn primary">Park idea</button>
 </form>`)}
 ${card('Parking lot',`<p class="small">Writing it down is not permission to act.</p><div class="stack">${state.ideas.length?state.ideas.map((x,i)=>`<div class="idea"><b>${i+1}. ${esc(x.name)}</b><p>Why: ${esc(x.why||'—')}<br>Replaces: ${esc(x.replace||'Nothing identified — do not activate')}<br>Proof gate: ${esc(x.proof||'Not defined')}</p></div>`).join(''):'<p class="muted">No parked ideas yet.</p>'}</div>`)}
 </div>`;
}

function changeHTML(){
 return `<div class="grid7030">
 ${card('Log the smallest patch',`<form id="changeForm" class="form">
  <label>What happened?<textarea id="changeTrigger" required rows="2"></textarea></label>
  <label>Owning module<select id="changeModule">${modules.filter(x=>!['change','settings','dashboard'].includes(x[0])).map(x=>`<option>${esc(x[1])}</option>`).join('')}</select></label>
  <label>Smallest proposed change<textarea id="changeFix" required rows="2"></textarea></label>
  <label>Dependencies actually affected<input id="changeDeps" type="text" placeholder="Example: weekday wipes block, travel time"></label>
  <button class="btn primary">Log patch</button>
 </form>`)}
 ${card('Change history',`<div class="stack">${state.patches.length?state.patches.slice().reverse().map((x,i)=>`<div class="patch"><b>${esc(x.module)} — ${esc(x.date)}</b>${x.source==='AI'?'<div class="badge" style="margin-top:6px">AI-approved patch</div>':''}<p>Trigger: ${esc(x.trigger)}<br>Patch: ${esc(x.fix)}<br>Dependencies: ${esc(x.deps||'None stated')}<br>Preserved: ${esc(Array.isArray(x.preserved)&&x.preserved.length?x.preserved.join(', '):'all non-dependent modules')}</p></div>`).join(''):'<p class="muted">No structural patches logged.</p>'}</div>`)}
 </div>`;
}


function linesFromText(v=''){ return String(v||'').split(/\n+/).map(x=>x.trim()).filter(Boolean); }
function branchById(id){ return (state.customBranches||[]).find(b=>String(b.id)===String(id)); }
function branchNavItems(){
 return (state.customBranches||[]).filter(b=>b.status!=='archived').map(b=>['branch:'+b.id,b.name]);
}

function branchSession(id){
 if(!state.customBranchSessions)state.customBranchSessions={};
 if(!state.customBranchSessions[id])state.customBranchSessions[id]={};
 if(!state.customBranchSessions[id][dateKey()])state.customBranchSessions[id][dateKey()]={answers:{},tasks:[],metrics:{}};
 return state.customBranchSessions[id][dateKey()];
}
function defaultBranchQuestions(){return [
 {id:'sessionType',label:'What kind of session is this?',type:'select',options:['Learn','Practice','Execute','Review']},
 {id:'time',label:'Time available',type:'select',options:['15 min','30 min','45 min','60 min','90 min']},
 {id:'focus',label:'Exact focus for today',type:'text',options:[]}
];}
function branchesHTML(){
 const branches=state.customBranches||[], draft=state.customBranchDraft||null;
 return `<div class="stack stack-lg">
  ${card('Dynamic branch builder',`<p class="muted">New branches are not forced into one universal template. Define the branch, then let AI design the specific choices that make sense for that branch. Each day you select those choices and the branch creates a daily regimen.</p>${sessionSummary([['Branches',String(branches.length)],['Active',String(branches.filter(b=>b.status==='active').length)],['Design rule','Branch-specific choices → today’s tasks'],['AI',(state.settings.aiEndpoint&&state.settings.aiToken)?'Connected':'Optional']])}`)}
  <div class="grid7030">
   ${optionForm('1) Define the branch',`<label>Branch name<input id="branchName" placeholder="Example: Real Estate Learning"></label><label>Parent module / pillar<input id="branchParent" placeholder="Example: Business"></label><label>Purpose<textarea id="branchPurpose" rows="3" placeholder="What should this branch help you accomplish?"></textarea></label><label>Status<select id="branchStatus"><option value="active">Active</option><option value="waiting">Waiting</option></select></label><div class="actions"><button type="button" class="btn" id="branchDesignAI">Design branch choices with AI</button><button type="button" class="btn primary" id="createDynamicBranch">Create branch</button></div><div id="branchDesignStatus" class="small">AI design is optional. If you create without it, the branch starts with Learn / Practice / Execute / Review choices.</div>`)}
   ${card('2) Draft branch choices',draft?`<div class="stack">${(draft.questions||[]).map((q,i)=>`<div class="branchItem"><b>${i+1}. ${esc(q.label)}</b><div class="small">${esc(q.type||'select')}${q.options&&q.options.length?' · '+esc(q.options.join(' / ')):''}</div></div>`).join('')}${draft.metrics&&draft.metrics.length?`<div class="formSection"><div class="formSectionTitle">Metrics designed for this branch</div>${draft.metrics.map(m=>`<div class="small">• ${esc(m.label||m)}</div>`).join('')}</div>`:''}</div>`:'<p class="muted">No AI-designed branch draft yet.</p>')}
  </div>
  ${card('Current custom branches',branches.length?`<div class="branch-list">${branches.map(b=>`<div class="branchItem"><div class="branchItemTop"><div><b>${esc(b.name)}</b><div class="small">${esc(b.parent)} · ${esc(b.purpose)}</div></div><div class="badge ${b.status==='waiting'?'badge-waiting':'badge-active'}">${esc(b.status)}</div></div><div class="small" style="margin-top:8px">${(b.questions||[]).length} daily choices · ${(b.metrics||[]).length} metrics</div><div class="actions" style="margin-top:10px"><button class="btn" data-open-branch="${b.id}">Open</button><button class="btn danger" data-delete-branch="${b.id}">Delete</button></div></div>`).join('')}</div>`:'<p class="muted">No custom branches yet.</p>')}
 </div>`;
}
function customQuestionHTML(b,q,sess){
 const v=(sess.answers||{})[q.id]||'';
 if(q.type==='number')return `<label>${esc(q.label)}<input type="number" data-custom-answer="${esc(q.id)}" value="${esc(v)}"></label>`;
 if(q.type==='text')return `<label>${esc(q.label)}<input data-custom-answer="${esc(q.id)}" value="${esc(v)}"></label>`;
 const opts=(q.options&&q.options.length?q.options:['Yes','No']);
 return `<label>${esc(q.label)}<select data-custom-answer="${esc(q.id)}">${opts.map(o=>`<option ${String(o)===String(v)?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
}
function customBranchHTML(id){
 const b=branchById(id); if(!b)return card('Branch not found','<p class="muted">This branch no longer exists.</p>');
 if(!b.questions||!b.questions.length)b.questions=defaultBranchQuestions(); const sess=branchSession(id);
 return `<div class="stack stack-lg">
  ${card(b.name,`<div class="branchHero"><div><div class="badge">${esc(b.parent)}</div><p class="muted" style="margin-top:10px">${esc(b.purpose)}</p></div><div class="branchHeroStats"><div class="metric"><span>Status</span><b>${esc(b.status)}</b></div><div class="metric"><span>Date</span><b>${esc(dateKey())}</b></div><div class="metric"><span>Tasks</span><b>${String((sess.tasks||[]).length)}</b></div></div></div><div class="actions" style="margin-top:12px"><button type="button" class="btn" data-jump-module="branches">Back to Branches</button></div>`)}
  <div class="grid7030">
   ${optionForm('1) Select today’s circumstances',(b.questions||[]).map(q=>customQuestionHTML(b,q,sess)).join('')+`<button type="button" class="btn primary" id="customBranchGenerateDay" data-branch-id="${esc(id)}">Generate today’s regimen with AI</button><div id="customBranchStatus" class="small">Your selections are saved for this date.</div>`)}
   ${card('2) Today’s regimen',sess.tasks&&sess.tasks.length?`<div class="stack">${sess.tasks.map((t,i)=>check(`custom-${id}-${dateKey()}-${i}`,t)).join('')}</div>${sess.completion?`<div class="good" style="margin-top:12px">Completion: ${esc(sess.completion)}</div>`:''}`:'<p class="muted">Choose today’s circumstances, then generate the regimen.</p>')}
  </div>
  ${card('3) Record branch metrics',(b.metrics&&b.metrics.length)?`<div class="grid2">${b.metrics.map((m,i)=>{const label=m.label||String(m);const type=m.type||'number';const val=(sess.metrics||{})[m.id||('m'+i)]||'';return `<label>${esc(label)}<input ${type==='number'?'type="number"':''} data-custom-metric="${esc(m.id||('m'+i))}" value="${esc(val)}"></label>`;}).join('')}</div>`:'<p class="muted">No special metrics were designed for this branch yet.</p>')}
 </div>`;
}

function currentLocalTimeContext(){
 const now=new Date();
 return {
   local_iso: now.toLocaleString('sv-SE').replace(' ','T'),
   local_time: now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
   local_date: now.toLocaleDateString('en-CA'),
   timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'local'
 };
}

function currentContext(){
 const d=parseDate(state.selectedDate), st=stageFor(d);
 const nowCtx=currentLocalTimeContext();
 const done=Object.entries(state.checks).filter(([k,v])=>v&&k.startsWith('daily-'+dateKey()+'-')).length;
 return {
   operating_date: state.selectedDate,
   current_local_time: nowCtx.local_time,
   current_local_date: nowCtx.local_date,
   current_local_iso: nowCtx.local_iso,
   timezone: nowCtx.timezone,
   scheduling_rule: 'For a today-only adjustment, never schedule any new block earlier than current_local_time. Past blocks are missed/completed history, not future tasks.',
   stage: st[0],
   stage_purpose: st[1],
   today_song: songFor(d),
   gym: fitnessNames[dow(d)],
   sales_skill: salesNames[dow(d)],
   daily_completion: `${done}/7`,
   today_schedule: scheduleFor(d),
   today_override: (state.todayOverrides||{})[state.selectedDate]||null,
   current_module: state.currentModule,
   current_module_note: state.notes[state.currentModule]||'',
   metrics: state.metrics,
   approved_patches: state.patches.slice(-20),
   custom_branches: (state.customBranches||[]).map(b=>({id:b.id,name:b.name,parent:b.parent,status:b.status,purpose:b.purpose,questions:b.questions||[],metrics:b.metrics||[]})),
   current_custom_branch: state.currentModule.startsWith('branch:') ? branchById(state.currentModule.split(':')[1]) : null,
   branch_execution_rule: 'Each branch must start from branch-specific choices/circumstances, then generate exact daily tasks and measurable outputs. Avoid generic universal templates.',
   current_module_day_data: (state.moduleData&&state.moduleData[state.currentModule]&&state.moduleData[state.currentModule][state.selectedDate])||null,
   parked_ideas: state.ideas.slice(-10)
 };
}
function proposalActions(m,i){
 let out='';
 if(m.patch){
   if(m.patchApplied) out+='<div class="good proposal-status">Patch approved and added to System Change.</div>';
   else out+=`<div class="proposal"><div class="kicker">Proposed system patch</div><div class="proposal-title">${esc(m.patch.module||'System')}</div><div class="small">${esc(m.patch.change||'')}</div><button type="button" class="btn primary" data-approve-patch="${i}">Approve Patch</button></div>`;
 }
 if(m.todayUpdate){
   if(m.todayApplied) out+='<div class="good proposal-status">Today\'s adjusted plan is active.</div>';
   else out+=`<div class="proposal"><div class="kicker">Today-only adjustment</div><div class="proposal-title">${esc(m.todayUpdate.reason||'Revised plan for today')}</div><div class="small">This changes today only. The master system stays unchanged.</div><button type="button" class="btn primary" data-apply-today="${i}">Apply to Today</button></div>`;
 }
 return out;
}

function aiHTML(){
 const ep=state.settings.aiEndpoint;
 const token=state.settings.aiToken||'';
 const aiReady=Boolean(ep&&token);
 return `<div class="grid7030">
   ${card('AI Coach',`<div class="${ep?'good':'notice'}">${aiReady?'AI endpoint and private app token configured. Messages can include your live operating-state context.':'AI is not connected yet. The app remains fully usable offline. Connect the secure backend URL and private app token in Settings.'}</div>
   <div id="chatBox" class="chatbox" style="margin-top:12px">${state.chat.length?state.chat.map((m,i)=>`<div class="chatmsg ${m.role==='user'?'user':'ai'}"><div class="who">${m.role==='user'?'You':'AI Coach'}</div><div class="${m.role==='assistant'?'md':''}">${m.role==='assistant'?markdown(m.text):esc(m.text).replace(/\n/g,'<br>')}</div>${m.role==='assistant'?proposalActions(m,i):''}</div>`).join(''):'<p class="muted">Ask about the active module, a problem you encountered, or a system change. Your current date, module and productivity state can be sent with the message.</p>'}</div>
   <form id="chatForm" class="form" style="margin-top:12px">
     <label>Message<textarea id="chatInput" rows="3" required placeholder="Example: I missed the morning sales block because traffic took 55 minutes. Patch the day without redesigning everything."></textarea></label>
     <div class="actions"><button class="btn primary" ${aiReady?'':'disabled'}>${aiReady?'Send with current context':'Connect AI in Settings'}</button><button type="button" id="clearChat" class="btn">Clear chat history</button></div>
   </form>`)}
   ${card('What the AI receives',`<pre style="white-space:pre-wrap;font-size:12px;color:var(--muted);margin:0">${esc(JSON.stringify(currentContext(),null,2))}</pre>`)}
 </div>`;
}

function settingsHTML(){
 return `<div class="grid2">
 ${card('AI connection',`<form id="settingsForm" class="form">
  <label>Secure AI backend URL<input id="aiEndpoint" type="url" value="${esc(state.settings.aiEndpoint||'')}" placeholder="https://your-project.vercel.app/api/chat"></label>
  <label>Private app token<input id="aiToken" type="password" value="${esc(state.settings.aiToken||'')}" placeholder="Paste the private token you create in Vercel"></label>
  <button class="btn primary">Save settings</button>
 </form>
 <div class="notice" style="margin-top:12px">Do not put an OpenAI API key into this app. The downloadable project includes an optional backend that keeps the key server-side.</div>`)}
 ${card('Backup / restore',`<p class="muted">Export your local state regularly. The backup contains checklists, notes, ideas, patches, chat history and productivity metrics.</p>
 <div class="actions"><button id="exportBtn" class="btn primary">Export backup</button><label class="btn" style="display:inline-flex;align-items:center">Import backup<input id="importFile" type="file" accept="application/json" style="display:none"></label><button id="resetBtn" class="btn danger">Reset local data</button></div>`)}
 ${card('Install model',list(['Standalone HTML → easiest test, but iPhone file opening is browser/Files behavior rather than a true installed app','PWA → host this folder on HTTPS, open in Safari, then Add to Home Screen','Native iPhone .ipa → requires Apple signing/build tools; this project is the functional prototype a native wrapper can later use']))}
 ${card('System principle','<p class="muted">The app is modular. A change should patch the owning module and true dependencies only. The master map is preserved unless the actual long-term direction changes.</p>')}
 </div>`;
}

function render(){
 const d=parseDate(state.selectedDate), st=stageFor(d);
 document.getElementById('date').value=state.selectedDate;
 const sync=document.getElementById('dateSyncStatus'); if(sync)sync.textContent=dateMode==='auto'?'Synced to phone date':'Browsing another date';
 document.getElementById('stageName').textContent=st[0];
 document.getElementById('stagePurpose').textContent=st[1];
 const navModules=[...modules,...branchNavItems()];
 document.getElementById('nav').innerHTML=navModules.map(([id,name])=>`<button data-module="${id}" class="${state.currentModule===id?'active':''}">${esc(name)}</button>`).join('');
 const currentModuleName=(navModules.find(([id])=>id===state.currentModule)||[])[1]||'Custom branch';
 const doneToday=Object.entries(state.checks).filter(([k,v])=>v&&k.startsWith('daily-'+dateKey()+'-')).length;
 document.getElementById('content').dataset.currentModule=currentModuleName;
 const map={
  today:()=>todayHTML(d), dashboard:dashboardHTML, master:masterHTML, music:()=>musicHTML(d), sales:salesHTML,
  acting:actingHTML, trading:tradingHTML, fitness:()=>fitnessHTML(d), diet:dietHTML, pharmacy:pharmacyHTML, business:businessHTML,
  miami:miamiHTML, tetr:tetrHTML, psychology:psychologyHTML, content:contentHTML, ideas:ideasHTML, branches:branchesHTML, change:changeHTML, ai:aiHTML, settings:settingsHTML
 };
 if(state.currentModule.startsWith('branch:')){
   document.getElementById('content').innerHTML=customBranchHTML(state.currentModule.split(':')[1]);
 }else{
   document.getElementById('content').innerHTML=map[state.currentModule]();
 }
 const hud=`<div class="moduleHud"><div class="moduleHudPill"><span>Current module</span><b>${esc(currentModuleName)}</b></div><div class="moduleHudPill"><span>Date</span><b>${esc(state.selectedDate)}</b></div><div class="moduleHudPill"><span>Daily completion</span><b>${doneToday}/7</b></div></div>`;
 document.getElementById('content').innerHTML=hud+document.getElementById('content').innerHTML;
 document.getElementById('moduleNote').value=state.notes[state.currentModule]||'';
 wire();
}

function wire(){
 document.querySelectorAll('#nav [data-module]').forEach(b=>b.addEventListener('click',()=>{
   state.notes[state.currentModule]=document.getElementById('moduleNote').value;
   state.currentModule=b.dataset.module; saveState(); render();
 }));
 document.querySelectorAll('[data-jump-module]').forEach(b=>b.addEventListener('click',()=>{state.currentModule=b.dataset.jumpModule;saveState();render();}));
 document.querySelectorAll('[data-check]').forEach(c=>c.addEventListener('change',()=>{state.checks[c.dataset.check]=c.checked;saveState();}));
 const mf=document.getElementById('metricForm');
 if(mf) mf.addEventListener('submit',e=>{e.preventDefault();state.metrics.totalSales=+document.getElementById('mSales').value||0;state.metrics.revenue=+document.getElementById('mRevenue').value||0;state.metrics.applications=+document.getElementById('mApps').value||0;state.metrics.songsReady=+document.getElementById('mSongs').value||0;saveState();render();});
 const f=document.getElementById('ideaForm');
 if(f) f.addEventListener('submit',e=>{e.preventDefault();state.ideas.push({name:document.getElementById('ideaName').value.trim(),why:document.getElementById('ideaWhy').value.trim(),replace:document.getElementById('ideaReplace').value.trim(),proof:document.getElementById('ideaProof').value.trim(),date:state.selectedDate});saveState();render();});
 const cf=document.getElementById('changeForm');
 if(cf) cf.addEventListener('submit',e=>{e.preventDefault();state.patches.push({trigger:document.getElementById('changeTrigger').value.trim(),module:document.getElementById('changeModule').value,fix:document.getElementById('changeFix').value.trim(),deps:document.getElementById('changeDeps').value.trim(),date:state.selectedDate});saveState();render();});

 // Save branch-specific selections/inputs.
 document.querySelectorAll('[data-mod][data-field]').forEach(el=>el.addEventListener('change',()=>{
   const m=moduleDay(el.dataset.mod); m[el.dataset.field]=el.value; saveState(); if(el.dataset.rerender==='1')render();
 }));

 // Fitness session timing.
 const fs=document.getElementById('fitnessStart'); if(fs)fs.addEventListener('click',()=>{const x=moduleDay('fitness');x.startedAt=new Date().toISOString();x.finishedAt=null;x.durationMin=null;saveState();render();});
 const ff=document.getElementById('fitnessFinish'); if(ff)ff.addEventListener('click',()=>{const x=moduleDay('fitness');if(!x.startedAt)x.startedAt=new Date().toISOString();x.finishedAt=new Date().toISOString();x.durationMin=minutesBetween(x.startedAt,x.finishedAt);saveState();render();});

 // Nutrition profile + meal logging.
 const snp=document.getElementById('saveNutritionProfile'); if(snp)snp.addEventListener('click',()=>{
   state.nutritionProfile={sex:document.getElementById('nutSex').value,age:document.getElementById('nutAge').value,weightKg:document.getElementById('nutWeight').value,heightCm:document.getElementById('nutHeight').value,activity:document.getElementById('nutActivity').value,goal:document.getElementById('nutGoal').value};saveState();render();
 });
 const estimateMeal=document.getElementById('estimateMeal'); if(estimateMeal)estimateMeal.addEventListener('click',async()=>{
   const status=document.getElementById('mealEstimateStatus'),desc=document.getElementById('mealDescription').value.trim(); if(!desc){status.textContent='Describe the meal first.';return;}
   if(!state.settings.aiEndpoint||!state.settings.aiToken){status.textContent='AI is not connected. Enter calories/protein manually.';return;}
   estimateMeal.disabled=true;status.textContent='Estimating meal…';
   try{const prompt=`Estimate calories and protein for this meal from the description. Return ONLY <OS_MEAL>{"calories":number,"protein":number,"note":"short uncertainty note"}</OS_MEAL>. Meal: ${desc}. Use reasonable serving estimates when missing and clearly reflect uncertainty in note.`;const res=await fetch(state.settings.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json','X-App-Token':state.settings.aiToken},body:JSON.stringify({message:prompt,context:{date:dateKey()},history:[]})});if(!res.ok)throw new Error('Server returned '+res.status);const data=await res.json();const v=extractMachineBlock(data.reply||'','OS_MEAL').value;if(!v)throw new Error('No complete estimate returned');document.getElementById('mealCalories').value=Math.round(safeNum(v.calories));document.getElementById('mealProtein').value=Math.round(safeNum(v.protein));status.textContent=v.note||'Estimate filled. Review portions before adding.';}catch(e){status.textContent='Could not estimate: '+e.message;}finally{estimateMeal.disabled=false;}
 });
 const addMeal=document.getElementById('addMeal'); if(addMeal)addMeal.addEventListener('click',()=>{const desc=document.getElementById('mealDescription').value.trim(),cal=safeNum(document.getElementById('mealCalories').value),pro=safeNum(document.getElementById('mealProtein').value);if(!desc||(!cal&&!pro))return;nutritionDay().push({type:document.getElementById('mealType').value,description:desc,calories:cal,protein:pro,addedAt:new Date().toISOString()});saveState();render();});
 document.querySelectorAll('[data-delete-meal]').forEach(b=>b.addEventListener('click',()=>{nutritionDay().splice(Number(b.dataset.deleteMeal),1);saveState();render();}));

 // Trading journal.
 const atr=document.getElementById('addTradeRecord'); if(atr)atr.addEventListener('click',()=>{const x=moduleDay('trading');const amount=safeNum(x.amountUsed),entry=safeNum(x.entryPrice),exit=safeNum(x.exitPrice),fees=safeNum(x.fees);if(!x.ticker||!amount||!entry||!exit)return;const pnl=amount*(exit/entry-1)-fees;if(!state.trades)state.trades=[];state.trades.push({date:dateKey(),ticker:x.ticker,startBalance:safeNum(x.startBalance),amountUsed:amount,entryPrice:entry,exitPrice:exit,fees,pnl,reason:x.tradeReason||'',createdAt:new Date().toISOString()});saveState();render();});

 // Sales AI strategy from selected industry/offer/objective. Real-business discovery uses Maps link in the UI.
 const sai=document.getElementById('salesAIStrategy'); if(sai)sai.addEventListener('click',async()=>{const x=moduleDay('sales'),status=document.getElementById('salesAIStatus');if(!state.settings.aiEndpoint||!state.settings.aiToken){status.textContent='Connect AI in Settings first.';return;}sai.disabled=true;status.textContent='Building strategy…';try{const prompt=`Build a concise field-sales strategy. Industry: ${x.industry||''}. Objective: ${x.mode||''}. Offer: ${x.offer||''}. Area: ${x.area||''}. Give: 1 opening line, 3 discovery questions, likely objection categories, and the exact close/next-step question. Use simple language. Do not invent named businesses.`;const res=await fetch(state.settings.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json','X-App-Token':state.settings.aiToken},body:JSON.stringify({message:prompt,context:currentContext(),history:[]})});if(!res.ok)throw new Error('Server returned '+res.status);const data=await res.json();x.aiStrategy=data.reply||'';saveState();render();}catch(e){status.textContent='Could not build strategy: '+e.message;}finally{sai.disabled=false;}});

 // Dynamic custom branch design.
 const bdesign=document.getElementById('branchDesignAI'); if(bdesign)bdesign.addEventListener('click',async()=>{const status=document.getElementById('branchDesignStatus'),name=document.getElementById('branchName').value.trim(),parent=document.getElementById('branchParent').value.trim(),purpose=document.getElementById('branchPurpose').value.trim();if(!name||!parent||!purpose){status.textContent='Enter branch name, parent and purpose first.';return;}if(!state.settings.aiEndpoint||!state.settings.aiToken){status.textContent='Connect AI first, or create the branch with the default choices.';return;}bdesign.disabled=true;status.textContent='Designing branch-specific choices…';try{const prompt=`Design the interaction flow for a Personal OS branch. Return ONLY <OS_BRANCH_DESIGN>{"questions":[{"id":"short_id","label":"question","type":"select|text|number","options":["option"]}],"metrics":[{"id":"short_id","label":"metric","type":"number|text"}]}</OS_BRANCH_DESIGN>. Branch: ${name}. Parent: ${parent}. Purpose: ${purpose}. Create 2-5 branch-specific questions the user should select/answer BEFORE a daily regimen is generated. Do not use a generic universal blueprint. Questions must reflect the actual circumstances that change the task in this branch.`;const res=await fetch(state.settings.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json','X-App-Token':state.settings.aiToken},body:JSON.stringify({message:prompt,context:currentContext(),history:[]})});if(!res.ok)throw new Error('Server returned '+res.status);const data=await res.json();const v=extractMachineBlock(data.reply||'','OS_BRANCH_DESIGN').value;if(!v)throw new Error('No complete design returned');state.customBranchDraft=v;saveState();render();}catch(e){status.textContent='Could not design branch: '+e.message;}finally{bdesign.disabled=false;}});
 const createBranch=document.getElementById('createDynamicBranch'); if(createBranch)createBranch.addEventListener('click',()=>{const name=document.getElementById('branchName').value.trim(),parent=document.getElementById('branchParent').value.trim(),purpose=document.getElementById('branchPurpose').value.trim();if(!name||!parent||!purpose)return;const draft=state.customBranchDraft||{};const b={id:Date.now().toString(36),name,parent,purpose,status:document.getElementById('branchStatus').value,questions:(draft.questions&&draft.questions.length)?draft.questions:defaultBranchQuestions(),metrics:draft.metrics||[],createdAt:new Date().toISOString()};state.customBranches.push(b);state.customBranchDraft=null;state.currentModule='branch:'+b.id;saveState();render();});
 document.querySelectorAll('[data-open-branch]').forEach(btn=>btn.addEventListener('click',()=>{state.currentModule='branch:'+btn.dataset.openBranch;saveState();render();}));
 document.querySelectorAll('[data-delete-branch]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.deleteBranch;if(confirm('Delete this custom branch?')){state.customBranches=(state.customBranches||[]).filter(b=>String(b.id)!==String(id));if(state.currentModule==='branch:'+id)state.currentModule='branches';saveState();render();}}));
 document.querySelectorAll('[data-custom-answer]').forEach(el=>el.addEventListener('change',()=>{const id=state.currentModule.startsWith('branch:')?state.currentModule.split(':')[1]:null;if(!id)return;const sess=branchSession(id);sess.answers[el.dataset.customAnswer]=el.value;saveState();}));
 document.querySelectorAll('[data-custom-metric]').forEach(el=>el.addEventListener('change',()=>{const id=state.currentModule.startsWith('branch:')?state.currentModule.split(':')[1]:null;if(!id)return;const sess=branchSession(id);sess.metrics[el.dataset.customMetric]=el.value;saveState();}));
 const cbd=document.getElementById('customBranchGenerateDay'); if(cbd)cbd.addEventListener('click',async()=>{const id=cbd.dataset.branchId,b=branchById(id),sess=branchSession(id),status=document.getElementById('customBranchStatus');if(!b)return;document.querySelectorAll('[data-custom-answer]').forEach(el=>{sess.answers[el.dataset.customAnswer]=el.value;});saveState();if(!state.settings.aiEndpoint||!state.settings.aiToken){status.textContent='Connect AI in Settings to generate a branch-specific daily regimen.';return;}cbd.disabled=true;status.textContent='Generating today’s regimen…';try{const prompt=`Create today’s exact regimen for this Personal OS branch. Return ONLY <OS_BRANCH_DAY>{"tasks":["small concrete action"],"completion":"clear completion test"}</OS_BRANCH_DAY>. Branch: ${b.name}. Purpose: ${b.purpose}. Today selections: ${JSON.stringify(sess.answers||{})}. Give the smallest executable steps in order. Make tasks specific to the selected circumstances; do not output a generic universal framework.`;const res=await fetch(state.settings.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json','X-App-Token':state.settings.aiToken},body:JSON.stringify({message:prompt,context:currentContext(),history:[]})});if(!res.ok)throw new Error('Server returned '+res.status);const data=await res.json();const v=extractMachineBlock(data.reply||'','OS_BRANCH_DAY').value;if(!v||!Array.isArray(v.tasks))throw new Error('No complete daily regimen returned');sess.tasks=v.tasks;sess.completion=v.completion||'';saveState();render();}catch(e){status.textContent='Could not generate regimen: '+e.message;}finally{cbd.disabled=false;}});

 const sf=document.getElementById('settingsForm');
 if(sf) sf.addEventListener('submit',e=>{e.preventDefault();state.settings.aiEndpoint=document.getElementById('aiEndpoint').value.trim();state.settings.aiToken=document.getElementById('aiToken').value.trim();saveState();render();});
 const exp=document.getElementById('exportBtn');
 if(exp) exp.addEventListener('click',()=>{
   const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
   const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='personal-os-backup-'+state.selectedDate+'.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 });
 const imp=document.getElementById('importFile');
 if(imp) imp.addEventListener('change',async()=>{const file=imp.files&&imp.files[0];if(!file)return;try{const data=JSON.parse(await file.text());state=Object.assign(clone(defaultState),data);saveState();render();}catch(e){alert('That backup file could not be read.');}});
 const reset=document.getElementById('resetBtn');
 if(reset) reset.addEventListener('click',()=>{if(confirm('Reset all locally stored app data?')){state=clone(defaultState);saveState();render();}});
 const clear=document.getElementById('clearChat');
 if(clear) clear.addEventListener('click',()=>{state.chat=[];saveState();render();});
 document.querySelectorAll('[data-approve-patch]').forEach(btn=>btn.addEventListener('click',()=>{
   const i=Number(btn.dataset.approvePatch), m=state.chat[i], p=m&&m.patch;
   if(!p)return;
   state.patches.push({trigger:p.trigger||'AI-recommended system change',module:p.module||'System',fix:p.change||'',deps:Array.isArray(p.dependencies)?p.dependencies.join(', '):(p.dependencies||''),preserved:Array.isArray(p.preserved)?p.preserved:[],date:p.effective_date||state.selectedDate,source:'AI'});
   m.patchApplied=true; saveState(); render();
 }));
 document.querySelectorAll('[data-apply-today]').forEach(btn=>btn.addEventListener('click',()=>{
   const i=Number(btn.dataset.applyToday), m=state.chat[i], u=m&&m.todayUpdate;
   if(!u||!Array.isArray(u.schedule)||!u.schedule.length)return;
   if(!state.todayOverrides)state.todayOverrides={};
   state.todayOverrides[state.selectedDate]={reason:u.reason||'AI-adjusted plan',schedule:u.schedule,preserved:Array.isArray(u.preserved)?u.preserved:[],appliedAt:new Date().toISOString(),source:'AI'};
   m.todayApplied=true; saveState(); render();
 }));
 const clearToday=document.getElementById('clearTodayOverride');
 if(clearToday) clearToday.addEventListener('click',()=>{if(state.todayOverrides)delete state.todayOverrides[state.selectedDate];saveState();render();});
 const chatform=document.getElementById('chatForm');
 if(chatform) chatform.addEventListener('submit',async e=>{
   e.preventDefault();
   const input=document.getElementById('chatInput'), text=input.value.trim(), endpoint=state.settings.aiEndpoint, token=state.settings.aiToken||'';
   if(!text||!endpoint||!token)return;
   state.chat.push({role:'user',text});saveState();render();
   state.chat.push({role:'assistant',text:'Thinking…'});saveState();render();
   try{
     const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-App-Token':token},body:JSON.stringify({message:text+aiActionProtocol(),context:currentContext(),history:state.chat.slice(-12,-1)})});
     if(!res.ok) throw new Error('Server returned '+res.status);
     const data=await res.json();
     let cleanReply=data.reply||'No reply returned.';
     const patchBlock=extractMachineBlock(cleanReply,'OS_PATCH'); cleanReply=patchBlock.text;
     const todayBlock=extractMachineBlock(cleanReply,'OS_TODAY'); cleanReply=todayBlock.text;
     let patchValue=data.patch||patchBlock.value||null;
     let todayValue=data.today_update||todayBlock.value||null;

     if((patchBlock.incomplete&&!patchValue)||(todayBlock.incomplete&&!todayValue)){
       const repaired=await repairMachineActions(
         endpoint,
         token,
         text,
         currentContext(),
         patchBlock.incomplete&&!patchValue,
         todayBlock.incomplete&&!todayValue
       );
       patchValue=patchValue||repaired.patch;
       todayValue=todayValue||repaired.today;
     }

     state.chat[state.chat.length-1]={
       role:'assistant',
       text:cleanReply,
       patch:patchValue,
       todayUpdate:todayValue,
       patchApplied:false,
       todayApplied:false
     };
   }catch(err){
     state.chat[state.chat.length-1]={role:'assistant',text:'AI connection failed: '+err.message};
   }
   saveState();render();
 });
}

function shiftDateString(v,days){const [y,m,d]=v.split('-').map(Number);const x=new Date(y,m-1,d);x.setDate(x.getDate()+days);const yy=x.getFullYear(),mm=String(x.getMonth()+1).padStart(2,'0'),dd=String(x.getDate()).padStart(2,'0');return `${yy}-${mm}-${dd}`;}
document.getElementById('date').addEventListener('change',e=>{dateMode='browse';state.selectedDate=e.target.value;saveState();render();});
document.getElementById('prevDate').addEventListener('click',()=>{dateMode='browse';state.selectedDate=shiftDateString(state.selectedDate,-1);saveState();render();});
document.getElementById('nextDate').addEventListener('click',()=>{dateMode='browse';state.selectedDate=shiftDateString(state.selectedDate,1);saveState();render();});
document.getElementById('todayDate').addEventListener('click',()=>{dateMode='auto';state.selectedDate=localDateString();saveState();render();});
document.getElementById('moduleNote').addEventListener('input',e=>{state.notes[state.currentModule]=e.target.value;saveState();});
setInterval(()=>{if(dateMode==='auto'){const now=localDateString();if(now!==state.selectedDate){state.selectedDate=now;saveState();render();}}},60000);

let timerBase=600,timerRemain=600,timerHandle=null;
const td=document.getElementById('timerDisplay');
function timerDraw(){const m=Math.floor(timerRemain/60),s=timerRemain%60;td.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
document.querySelectorAll('[data-min]').forEach(b=>b.addEventListener('click',()=>{if(timerHandle){clearInterval(timerHandle);timerHandle=null;}timerBase=timerRemain=Math.max(60,(+b.dataset.min||10)*60);timerDraw();}));
document.getElementById('timerStart').addEventListener('click',()=>{if(timerHandle){clearInterval(timerHandle);timerHandle=null;return;}if(timerRemain<=0)timerRemain=timerBase;timerHandle=setInterval(()=>{timerRemain--;timerDraw();if(timerRemain<=0){clearInterval(timerHandle);timerHandle=null;}},1000);});
document.getElementById('timerReset').addEventListener('click',()=>{if(timerHandle){clearInterval(timerHandle);timerHandle=null;}timerRemain=timerBase;timerDraw();});

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
 navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
timerDraw();
render();
})();
