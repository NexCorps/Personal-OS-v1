
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
  chat: [],
  settings: { aiEndpoint: '', aiToken: '' }
};
let state = loadState();

const modules = [
 ['today','Today'],['dashboard','Progress'],['master','Master Map'],['music','Music'],['sales','Sales'],
 ['acting','Acting'],['trading','Trading'],['fitness','Fitness'],['pharmacy','Pharmacy / Study'],
 ['business','Money / Business'],['miami','Miami'],['tetr','Tetr'],['content','Content'],
 ['ideas','Idea Parking'],['change','System Change'],['ai','AI Coach'],['settings','Settings']
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
function loadState(){
  try {
    const raw = localStorage.getItem(APP_KEY);
    return raw ? Object.assign(clone(defaultState), JSON.parse(raw)) : clone(defaultState);
  } catch(e) { return clone(defaultState); }
}
function saveState(){
  try { localStorage.setItem(APP_KEY, JSON.stringify(state)); } catch(e) {}
}
function esc(s=''){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
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
  ['12:30–12:40','Trading — 10 min paper practice'],
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
 return `<div class="grid7030">
  ${card('Today — '+fmt(d),rows(scheduleFor(d)))}
  <div class="stack">
   ${card('Fixed outputs',`<div class="metric"><span>Song</span><b>${esc(songFor(d))}</b></div>
   <div class="metric"><span>Gym</span><b>${esc(fitnessNames[day])}</b></div>
   <div class="metric"><span>Sales skill</span><b>${esc(salesNames[day])}</b></div>
   <div class="metric"><span>GCU</span><b>Next unfinished lesson</b></div>
   <div class="metric"><span>Trading</span><b>One paper decision</b></div>`)}
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
 ${card('ACTIVE',list(['Acting script / care plans / research closeout','Wipes + paid work + foreign-currency remote job','Sales practice + negotiation + GCU','Music repertoire','Fitness','Spanish','Paper trading','Content documenting real work']))}
 ${card('WAITING',list(['Pharmacy POS','Supplement brand','Large B2B expansion','Bahamas distribution/logistics','Real-estate acquisition program','Creator consulting product','New applications / capital-heavy ventures']))}
 ${card('Anti-pivot rules',list(['30-day hold for new ideas','Replacement, never addition','Finish before improve','Evidence before expansion','A question triggers the smallest useful patch, not a whole-life redesign']))}
 ${card('Decision filter',list(['Does it help the current stage?','Does it create money, skill, proof, network or a necessary credential?','What active block does it replace?','Is it real or merely exciting?','What evidence can I obtain first?','Can I defer it without losing it?']))}
 </div>`;
}

function musicHTML(d){
 const process=['0–5 LISTEN — full reference; instrument untouched; hear mood, tempo, dynamics and sections.','5–10 STRUCTURE — write intro, verse/A, chorus/B, bridge, outro.','10–18 KEY — find tonal home, confirm and write it.','18–28 CHORDS — map harmony section by section; no decoration.','28–33 NUMBERS — convert harmony to Roman numerals.','33–38 ARRANGEMENT — simple intro; sparse first section; slightly fuller refrain; bridge texture change; clean outro.','LEFT HAND — root → root+5th → octave/light shell when stable.','RIGHT HAND — use the inversion requiring the smallest movement from the previous chord.','38–48 SECTIONS — intro ×3, main ×3, refrain ×3, bridge ×3.','48–58 FULL RUN — start to finish; do not stop for mistakes.','58–63 FIX ONE THING — biggest breakdown only.','63–65 RECALL — key, structure, number progression, correction.'];
 return `<div class="grid7030">
  <div class="stack">
   ${card("Today's fixed assignment",`<h1>${esc(songFor(d))}</h1><p class="muted">Craft toward high-end restaurants, hotel lounges, diplomats, expats, tourists, business dinners and private/corporate events.</p>`)}
   ${card('65-minute process',checks('music-'+dateKey(),process))}
  </div>
  <div class="stack">
   ${card('Professional sound',list(['Familiar + elegant + warm + controlled','Conversation-friendly volume','Clean intros and endings','Few flashy fills during dinner/business settings','Smooth genre transitions']))}
   ${card('Weekly rule',list(['Monday–Friday → one fixed new song','Saturday → refinement','Sunday → uninterrupted restaurant-style set','Do not choose based on mood']))}
   ${card('Performance targets',list(['Sep 30 → 8–12 reasonably clean songs','Oct 21 → 15–20 reliable','Nov 30 → 25–35 reliable; 45–60 minute set','Dec 20 → Christmas set + 60–90 minute simulation','Dec 31 → Elegant set + Modern set + Caribbean/Seasonal/Requests set']))}
  </div>
 </div>`;
}

function salesHTML(){ return `<div class="grid2">
 ${card('Real sales loop',checks('sales-loop',['Target prepared','Enter','Reach decision maker','Ask current process','Listen','Identify need','Present only relevant value','Handle objection','Ask for sale/trial/meeting/follow-up','Record result']))}
 ${card('Weekly training',list(['Monday → cold approach','Tuesday → discovery','Wednesday → price objection','Thursday → negotiation','Friday → closing','Saturday → full scenario','Sunday → weakest skill']))}
 ${card('Objection flow',list(['ACKNOWLEDGE','CLARIFY','IDENTIFY the real problem','RESPOND only to that problem','CHECK whether concern is answered','RE-CLOSE']))}
 ${card('Business sourcing',list(['Sunday: prepare next week rather than searching each morning','One geographic cluster per day','Up to 10 prepared targets/day','Record name, category, opening time, phone and target role','Route nearby businesses together','Stay in productive clusters instead of crossing Georgetown merely to finish a list']))}
 </div>`;
}

function actingHTML(){ return `<div class="grid2">
 ${card('Current rule','<p class="muted">The current script remains the active acting task until submitted. No new acting curriculum before finishing the present script.</p>')}
 ${card('Script process',checks('acting',['Read once without acting','Who am I?','Where am I?','Who am I speaking to?','What happened immediately before?','What do I want?','Break into beats when topic/tactic/energy changes','Give each beat one action verb','Run aloud while pursuing the objective','Record full take','Watch once','Fix biggest 1–2 issues','Record again','Submit']))}
 ${card('Recording default',list(['Camera at eye level','Clean background','Good light','Reader slightly beside camera if needed','Complete takes; do not restart every small mistake']))}
 ${card('After current backlog',list(['Saturday 60–90 minute acting block','Keep acting alive without stealing a daily block','Real auditions/deadlines can temporarily create a deadline block']))}
 </div>`;
}

function tradingHTML(){ return `<div class="grid2">
 ${card('Current role','<p class="muted">Trading is a skill project. It is not the main money engine at Stage 1.</p>')}
 ${card('Daily 10 minutes',checks('trading-'+dateKey(),['Open one chart','Identify trend/direction','Mark entry','Mark invalidation/stop','Mark target','Take/review one paper decision','Journal reason','Close platform']))}
 ${card('Live-money gate',list(['Stable earned income','Miami obligations covered','30 documented paper trades','Written maximum-risk rule','Order types understood','No borrowed money']))}
 ${card('Saturday review',list(['Count trades','Did I follow my rule?','Did I move the stop?','Did I enter without a reason?','What one pattern am I testing?','Only one simple strategy active at a time']))}
 </div>`;
}

function fitnessHTML(d){
 const plans={
 0:['Walk / mobility','No hard lifting'],
 1:['Press variation — 3×6–10','Incline press — 3×8–12','Fly variation — 2–3×10–15'],
 2:['Pulldown / pull-up — 3×6–12','Row — 3×8–12','Second row / pullover — 2–3×10–15'],
 3:['Squat / leg press — 3×6–10','Romanian deadlift / hinge — 3×8–12','Leg curl — 2–3×10–15','Calves — 2–3×10–15'],
 4:['Overhead press — 3×6–10','Lateral raise — 3×10–15','Rear-delt movement — 3×10–15'],
 5:['Biceps curl — 3×8–12','Second curl — 3×10–15','Triceps pressdown — 3×8–12','Overhead triceps — 3×10–15'],
 6:['Optional weak point OR light full body','30–45 min maximum']
 };
 return `<div class="grid2">
 ${card('Today — '+fitnessNames[dow(d)],checks('fitness-'+dateKey(),plans[dow(d)]))}
 ${card('Set rule',list(['Pick a challenging weight','Controlled reps','Stop with about 1–3 clean reps left','Rest 60–120 seconds','Record load + reps','When every set reaches the top of the range cleanly → increase slightly']))}
 ${card('Bulking basics',list(['Eat consistently','Protein every day','Protein shake is convenience, not all nutrition','Weigh once weekly under similar conditions','If body weight is not increasing over several weeks, increase food intake']))}
 ${card('Time rule','<p class="muted">Target around 45 minutes. Challenging sets + progression + recovery matter more than chasing a magical total number of reps.</p>')}
 </div>`;
}

function pharmacyHTML(){ return `<div class="grid2">
 ${card('When clocked in',list(['Do pharmacy work','Do not mentally run five other businesses during the shift','Observe useful patterns without storing patient-identifying information']))}
 ${card('Observe',list(['Common questions','Medication misunderstandings','Supplement questions','What sells / does not sell','Stock problems','Supplier issues','Workflow problems','POS problems','Repeated customer needs']))}
 ${card('Academic closeout',checks('study',['Care plans','Research analysis/final section','Remaining university tasks']))}
 ${card('Research-analysis skeleton',list(['What was measured?','What result appeared?','What does it mean?','How does it compare with literature?','What could explain it?','What limitation affects interpretation?','What is the implication?']))}
 </div>`;
}

function businessHTML(){ return `<div class="grid2">
 ${card('Current money engines',list(['Pharmacy income/work','Existing wipes','Foreign-currency remote sales work','Later: paid piano gigs']))}
 ${card('Remote-job block',checks('job-'+dateKey(),['Open tracker','Submit 1–2 strong applications','Send 2 direct messages/follow-ups','Check replies','Prepare next interview action','Stop; do not scroll endlessly']))}
 ${card('Target roles',list(['SDR','BDR','Outbound sales','Telesales','Appointment setting','Lead generation','Insurance sales where legally/contractually available']))}
 ${card('Replacement rule',list(['Paid remote hours become protected','Reduce/pause weekday wipes route if overlapping','Do not stack a full remote shift + full wipes route + pharmacy + every other ambition','Preserve music, basic fitness, core learning and sleep']))}
 </div>`;
}

function miamiHTML(){ return `<div class="grid2">
 ${card('Window',list(['Travel target: October 22–29, 2026','10X Business Summit: October 23–25','Real Estate Summit: October 26–27','Purpose: learn + network + create opportunities + follow up']))}
 ${card('Deadlines',checks('miami',['Flight target booking — Sep 10','Accommodation target — Sep 12','GCU target completion — Oct 15','Final travel readiness — Oct 21','Follow up meaningful contacts within 48h of return']))}
 ${card('Trip sheet',list(['Flight','Accommodation','Ground transport','Food','Emergency reserve','Event expenses','Money saved','Remaining amount']))}
 ${card('Savings rule','<p class="muted">Daily target = remaining trip need ÷ days remaining until October 21. When income arrives: essentials → planned Miami transfer → record new balance.</p>')}
 </div>`;
}

function tetrHTML(){ return `<div class="grid2">
 ${card('Role','<p class="muted">Tetr is a possible Stage-2 replacement path, not another Stage-1 daily project. January 2027 is the cleaner target unless actual acceptance/funding facts change the logic.</p>')}
 ${card('GO gate',checks('tetr',['Written acceptance','Exact cohort/start date','Exact scholarship/aid award','Exact amount still payable','Payment deadlines','Visa/travel feasibility','Clear internship deferral/resumption pathway','Realistic funding method','No fatal collision with essential obligations','One-sentence reason Tetr is worth replacing internship now']))}
 ${card('GO','<p class="muted">If the full gate supports it, Tetr replaces the internship/work structure. It does not stack on top.</p>')}
 ${card('NO-GO','<p class="muted">Continue internship/professional/business path and preserve Tetr for later rather than destroying either option prematurely.</p>')}
 </div>`;
}

function contentHTML(){ return `<div class="grid2">
 ${card('Purpose','<p class="muted">Document the actual beginning. Content is not a separate full-time job.</p>')}
 ${card('Frequency',list(['Tuesday → one short','Saturday → one short','Same core video → Reels + TikTok + YouTube Shorts']))}
 ${card('Use only real work',list(['Sales lesson','Human-behavior observation','Pharmacy/health/fitness lesson','Music progress','Business-building lesson']))}
 ${card('20-minute creation',checks('content-'+dateKey(),['Write: “Today I learned ___.”','Write 3 bullets','Record 30–90 seconds','Trim dead beginning/end','Add simple title/caption','Post to all three platforms','Stop']))}
 </div>`;
}

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
 ${card('Change history',`<div class="stack">${state.patches.length?state.patches.slice().reverse().map((x,i)=>`<div class="patch"><b>${esc(x.module)} — ${esc(x.date)}</b><p>Trigger: ${esc(x.trigger)}<br>Patch: ${esc(x.fix)}<br>Dependencies: ${esc(x.deps||'None stated')}<br>Preserved: all non-dependent modules.</p></div>`).join(''):'<p class="muted">No structural patches logged.</p>'}</div>`)}
 </div>`;
}

function currentContext(){
 const d=parseDate(state.selectedDate), st=stageFor(d);
 const done=Object.entries(state.checks).filter(([k,v])=>v&&k.startsWith('daily-'+dateKey()+'-')).length;
 return {
   operating_date: state.selectedDate,
   stage: st[0],
   stage_purpose: st[1],
   today_song: songFor(d),
   gym: fitnessNames[dow(d)],
   sales_skill: salesNames[dow(d)],
   daily_completion: `${done}/7`,
   current_module: state.currentModule,
   current_module_note: state.notes[state.currentModule]||'',
   metrics: state.metrics,
   recent_patches: state.patches.slice(-5),
   parked_ideas: state.ideas.slice(-10)
 };
}

function aiHTML(){
 const ep=state.settings.aiEndpoint;
 const token=state.settings.aiToken||'';
 const aiReady=Boolean(ep&&token);
 return `<div class="grid7030">
   ${card('AI Coach',`<div class="${ep?'good':'notice'}">${aiReady?'AI endpoint and private app token configured. Messages can include your live operating-state context.':'AI is not connected yet. The app remains fully usable offline. Connect the secure backend URL and private app token in Settings.'}</div>
   <div id="chatBox" class="chatbox" style="margin-top:12px">${state.chat.length?state.chat.map(m=>`<div class="chatmsg ${m.role==='user'?'user':'ai'}"><div class="who">${m.role==='user'?'You':'AI Coach'}</div><div>${esc(m.text)}</div></div>`).join(''):'<p class="muted">Ask about the active module, a problem you encountered, or a system change. Your current date, module and productivity state can be sent with the message.</p>'}</div>
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
 document.getElementById('stageName').textContent=st[0];
 document.getElementById('stagePurpose').textContent=st[1];
 document.getElementById('nav').innerHTML=modules.map(([id,name])=>`<button data-module="${id}" class="${state.currentModule===id?'active':''}">${esc(name)}</button>`).join('');
 const map={
  today:()=>todayHTML(d), dashboard:dashboardHTML, master:masterHTML, music:()=>musicHTML(d), sales:salesHTML,
  acting:actingHTML, trading:tradingHTML, fitness:()=>fitnessHTML(d), pharmacy:pharmacyHTML, business:businessHTML,
  miami:miamiHTML, tetr:tetrHTML, content:contentHTML, ideas:ideasHTML, change:changeHTML, ai:aiHTML, settings:settingsHTML
 };
 document.getElementById('content').innerHTML=map[state.currentModule]();
 document.getElementById('moduleNote').value=state.notes[state.currentModule]||'';
 wire();
}

function wire(){
 document.querySelectorAll('#nav [data-module]').forEach(b=>b.addEventListener('click',()=>{
   state.notes[state.currentModule]=document.getElementById('moduleNote').value;
   state.currentModule=b.dataset.module; saveState(); render();
 }));
 document.querySelectorAll('[data-check]').forEach(c=>c.addEventListener('change',()=>{state.checks[c.dataset.check]=c.checked;saveState();}));
 const mf=document.getElementById('metricForm');
 if(mf) mf.addEventListener('submit',e=>{e.preventDefault();state.metrics.totalSales=+document.getElementById('mSales').value||0;state.metrics.revenue=+document.getElementById('mRevenue').value||0;state.metrics.applications=+document.getElementById('mApps').value||0;state.metrics.songsReady=+document.getElementById('mSongs').value||0;saveState();render();});
 const f=document.getElementById('ideaForm');
 if(f) f.addEventListener('submit',e=>{e.preventDefault();state.ideas.push({name:document.getElementById('ideaName').value.trim(),why:document.getElementById('ideaWhy').value.trim(),replace:document.getElementById('ideaReplace').value.trim(),proof:document.getElementById('ideaProof').value.trim(),date:state.selectedDate});saveState();render();});
 const cf=document.getElementById('changeForm');
 if(cf) cf.addEventListener('submit',e=>{e.preventDefault();state.patches.push({trigger:document.getElementById('changeTrigger').value.trim(),module:document.getElementById('changeModule').value,fix:document.getElementById('changeFix').value.trim(),deps:document.getElementById('changeDeps').value.trim(),date:state.selectedDate});saveState();render();});
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
 const chatform=document.getElementById('chatForm');
 if(chatform) chatform.addEventListener('submit',async e=>{
   e.preventDefault();
   const input=document.getElementById('chatInput'), text=input.value.trim(), endpoint=state.settings.aiEndpoint, token=state.settings.aiToken||'';
   if(!text||!endpoint||!token)return;
   state.chat.push({role:'user',text});saveState();render();
   state.chat.push({role:'assistant',text:'Thinking…'});saveState();render();
   try{
     const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-App-Token':token},body:JSON.stringify({message:text,context:currentContext(),history:state.chat.slice(-12,-1)})});
     if(!res.ok) throw new Error('Server returned '+res.status);
     const data=await res.json();
     state.chat[state.chat.length-1]={role:'assistant',text:data.reply||'No reply returned.'};
   }catch(err){
     state.chat[state.chat.length-1]={role:'assistant',text:'AI connection failed: '+err.message};
   }
   saveState();render();
 });
}

document.getElementById('date').addEventListener('change',e=>{state.selectedDate=e.target.value;saveState();render();});
document.getElementById('moduleNote').addEventListener('input',e=>{state.notes[state.currentModule]=e.target.value;saveState();});

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
