
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
  profile: { country:'', region:'', city:'', address:'', currency:'', transportMode:'', travelRadiusKm:'', coordinates:null },
  chat: [],
  settings: { aiEndpoint: '', aiToken: '' }
};
let state = loadState();

const modules = [
 ['today','Today'],['dashboard','Progress'],['master','Master Map'],['music','Music'],['sales','Sales'],
 ['acting','Acting'],['trading','Trading'],['fitness','Fitness'],['pharmacy','Pharmacy / Study'],
 ['business','Money / Business'],['miami','Miami'],['tetr','Tetr'],['content','Content'],
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


const executionBlueprints = {
 music:{parent:'Music',purpose:'Build a professional live-performance skill and repertoire that can earn income in high-end hospitality and private settings.',output:'Performance-ready songs and a reliable live set.',hub:['Instrument: 88-key digital piano when available; guitar for interim structure practice','Reference audio: Spotify / YouTube / purchased recording','Metronome or timer','Personal OS Music branch for notes and completion tracking'],access:['Practice location with instrument, headphones/speaker and minimal interruption','Performance opportunities are location-dependent: target hotels, restaurants, lounges, private events and corporate venues within the selected travel radius'],setup:['Choose the fixed song assigned by the OS','Open one reference recording','Set instrument and seat/stand','Set 65-minute timer','Write key and song sections before decorative playing'],actions:['Listen without playing','Map structure','Find key','Map chords','Convert to numbers','Choose simplest arrangement','Practice sections','Full uninterrupted run','Fix one breakdown','Record recall notes'],markers:['Can I identify the key?','Can I name every section?','Can I play the chord movement without stopping?','Are intro and ending clean?','Can I maintain conversation-friendly volume?'],rules:['If harmony is unstable → simplify before adding fills','If a mistake occurs during full run → continue to the end','If one song is not retained → do not add complexity to it'],limits:['Do not choose songs by mood during fixed-repertoire phase','Do not spend the whole session improvising','Do not chase complexity before clean time, harmony and endings'],metrics:['Songs learned','Songs retained after 7 days','Full-run completion without stopping','Minutes of uninterrupted performance','Number of songs performance-ready'],done:'The fixed practice block is completed and the song has one recorded improvement or identified correction.',review:'Weekly set review; monthly repertoire count.',next:'Open the Music module and complete the current song process from the first unfinished step.'},
 sales:{parent:'Sales',purpose:'Build repeatable ability to approach, diagnose need, communicate value, handle resistance and close.',output:'Real sales repetitions, conversion improvement and revenue.',hub:['Google Maps / business directories for target sourcing','Phone and messaging apps','Personal OS Sales tracker / notes','Product or offer sheet used in the real conversation'],access:['Work one geographic cluster at a time based on profile city and travel radius','Prioritize locations that can be reached within the available travel window'],setup:['Choose one sales skill for the day','Prepare target list before leaving','Write opening line','Write 3 discovery questions','Know price/offer and minimum acceptable outcome','Pack samples/materials if physical selling'],actions:['Enter or call','Reach decision maker','Open conversation','Ask current process','Listen','Identify problem','Present only relevant value','Handle objection','Ask for sale/trial/meeting','Record result immediately'],markers:['Decision maker reached?','Need identified?','Objection type?','Offer presented?','Close attempted?','Outcome and next follow-up date?'],rules:['If no need is identified → keep asking before pitching','If objection is vague → clarify before responding','If the decision maker is unavailable → secure a return time/contact','Every qualified conversation ends with a clear ask'],limits:['No wandering without a prepared cluster','No endless explaining after the buyer understands','No changing price impulsively without a rule'],metrics:['Approaches','Decision-maker conversations','Qualified needs','Offers made','Closes','Conversion rate','Revenue','Follow-ups completed'],done:'The planned number of real approaches or the defined revenue/output target is completed and every result is recorded.',review:'Daily field review; weekly conversion review.',next:'Open the Sales module, identify today’s skill, then prepare the first target before leaving.'},
 acting:{parent:'Acting',purpose:'Build acting skill through real script work, recorded practice and performance opportunities.',output:'Submitted scripts/auditions, recorded scenes and measurable performance improvement.',hub:['Current script document/PDF','iPhone camera or voice recorder','Timer','Personal OS Acting notes','Training/audition source when available'],access:['Training and audition opportunities depend on country/city; use profile location to filter reachable options','Keep remote/self-tape opportunities separate from in-person travel requirements'],setup:['Open the current script','Read once without acting','Identify character, place, relationship, prior event and objective','Mark beats and changes','Set camera/recording position'],actions:['Read for meaning','Define objective','Choose playable actions','Rehearse one beat at a time','Record full take','Watch once without stopping','Write one correction','Record second take'],markers:['Objective clear?','Words memorized enough to listen?','Voice audible?','Eye-line consistent?','Actions change when the other person changes?','One specific improvement between takes?'],rules:['If meaning is unclear → return to text before performance choices','If performance feels forced → simplify action and listen','Finish the current script before starting a new curriculum'],limits:['No endless retakes without one defined correction','No adding new acting projects before the active submission is handled'],metrics:['Scripts completed','Self-tapes recorded','Submissions sent','Callbacks/auditions','Specific corrections resolved'],done:'One complete work block produces a finished take, script analysis section, or submission-ready improvement.',review:'After each recording/submission; weekly acting progress review.',next:'Open the current script and complete the first unfinished analysis or recording step.'},
 trading:{parent:'Trading',purpose:'Learn market execution with real money while controlling risk and documenting every decision.',output:'Rule-based live trades with measured process compliance and P/L.',hub:['Broker: Interactive Brokers (IBKR)','Phone app: IBKR GlobalTrader','Account type: Individual → Cash account','Trading journal in Personal OS'],access:['Broker/account availability must match profile country and legal eligibility','Funding method depends on the bank/currency available to the user; use broker-generated instructions only'],setup:['Create/verify account','Fund from an account in your own name','Confirm cash available','Choose one instrument','Complete pre-trade checklist','Define entry, invalidation, target and maximum loss'],actions:['Open GlobalTrader','Open journal','Select one watchlist instrument','Check price/news/context','Write thesis','Define risk','Enter only if rules pass','Record fill','Manage according to written plan','Journal result'],markers:['Market context','Catalyst/news','Direction','Entry level','Invalidation','Liquidity/spread','Maximum dollar risk','Reward relative to risk','Behavior compliance'],rules:['Cash account only during early learning','No trade if a required field is blank','No adding to losing position without a prewritten rule','No revenge trading'],limits:['No margin','No options during initial live-learning phase','No shorting','No money needed for essentials or near-term obligations'],metrics:['Process compliance %','Rule compliance %','Actual vs planned loss','Net P/L','Impulsive trades','Correct no-trade decisions'],done:'A live trade or valid no-trade decision is fully documented with the checklist and journal complete.',review:'After every trade; deeper review every 10 trades.',next:'Open Trading, complete the account/setup gate if unfinished; otherwise complete one pre-trade checklist.'},
 fitness:{parent:'Fitness',purpose:'Build muscle, strength and discipline with short repeatable sessions.',output:'Progressive training performance and gradual bodyweight/muscle gain.',hub:['Gym available within profile travel radius','Workout log in Personal OS','Timer','Bodyweight scale if available','Food/protein tracking method'],access:['Choose the gym/location that can actually be reached inside the scheduled block','Travel time is part of the workout block and should be reflected in Today adjustments'],setup:['Check today’s muscle group','Pack clothes/water','Arrive with a 45-minute cap','Choose starting weights from last session or a conservative first-session load','Start timer'],actions:['Warm up target joints/movement','Complete listed compound movement','Complete listed secondary movement','Complete listed accessory movement','Record load and reps','Leave when the planned work is done'],markers:['Load used','Reps completed','Reps left in reserve','Technique quality','Session duration','Weekly bodyweight trend'],rules:['If all sets reach top of rep range cleanly → increase load slightly next time','If technique breaks → reduce load','If recovery is poor → reduce volume rather than adding random exercises'],limits:['No 2–3 hour gym sessions','No changing the workout because another exercise looks interesting','No relying on supplements instead of food/recovery'],metrics:['Loads/reps','Session completion','Bodyweight weekly trend','Workout consistency','Protein/food consistency'],done:'The planned exercises are completed within the time cap and load/reps are recorded.',review:'Weekly training review; monthly bodyweight/strength trend.',next:'Open Fitness, identify today’s muscle group, then complete the first listed exercise.'},
 pharmacy:{parent:'Pharmacy / Study',purpose:'Convert pharmacy education and work exposure into usable clinical knowledge, professional output and healthcare-business insight.',output:'Completed academic obligations, stronger patient-care reasoning and documented workflow/business observations.',hub:['Personal OS Pharmacy module','Course/rotation files and notes','Current clinical guidelines/reference sources when needed','Calculator / drug-information resources','Workplace systems while on shift'],access:['Professional scope and licensing depend on country; separate what can be done as a graduate/intern from what requires pharmacist registration','Patient-identifying information must not be stored in the personal OS'],setup:['Define the exact assignment/patient/topic','Gather the required source documents','Write the clinical question','Identify deadline/output format','Open the relevant guideline/reference'],actions:['Identify problem','Collect relevant facts','Assess medication/clinical issue','Compare to guideline/standard','Calculate dose/labs when required','Write recommendation/care plan','Check interactions/monitoring','Finalize output'],markers:['Indication','Dose','Route','Frequency','Duration','Renal/hepatic factors','Interactions','Contraindications','Monitoring','Guideline position','Patient counseling'],rules:['Use current authoritative references for changing clinical guidance','Separate observed facts from assumptions','Do not store patient identifiers'],limits:['Do not substitute AI alone for clinical verification','Do not exceed legal scope of practice'],metrics:['Assignments completed','Topics reviewed','Guideline-supported decisions','Observed workflow problems logged','Deadlines met'],done:'The defined pharmacy/study output is completed, checked against the required source, and saved/submitted.',review:'At end of study block/shift; weekly academic closeout.',next:'Open Pharmacy / Study and complete the highest-priority unfinished academic or clinical output.'},
 business:{parent:'Money / Business',purpose:'Create income and build businesses through specific offers, customers, operations and measurable cash flow.',output:'Revenue, validated offers, paid work and reusable business assets.',hub:['Personal OS Money / Business tracker','Bank/payment account','Lead/customer tracker','Offer/pricing document','Email/phone/LinkedIn or relevant sales channel'],access:['Target customers and payment methods must be compatible with profile country and target market','Foreign-currency work should specify employer/client country, payment method and legal/contract constraints'],setup:['Choose one active money engine','Define today’s measurable output','Open lead/application list','Prepare offer/CV/message','Confirm payment/price terms'],actions:['Source lead/opportunity','Qualify','Contact','Follow up','Close/apply','Deliver required work','Invoice/collect where relevant','Record result'],markers:['Qualified opportunity?','Decision maker?','Value/problem fit?','Payment amount/currency?','Next action/date?','Actual cash received?'],rules:['New business replaces an active block; it does not stack indefinitely','Evidence before expansion','Paid work hours become protected'],limits:['No capital-heavy expansion before validation','No endless research instead of contacting the market'],metrics:['Applications','Qualified leads','Calls/messages','Meetings','Closes','Revenue','Foreign-currency income','Cash collected'],done:'Today’s defined money-output block is complete and every opportunity has a next action.',review:'Daily money check; weekly pipeline/revenue review.',next:'Open Money / Business and execute the next revenue-producing action, not another planning task.'},
 miami:{parent:'Travel / Miami',purpose:'Execute the planned South Florida trip with controlled cost, reliable logistics and deliberate networking.',output:'Booked travel, funded budget, completed events and followed-up contacts.',hub:['Airline booking site/app','Accommodation booking source','Calendar','Maps/navigation','Personal OS Miami budget and deadlines','Passport/travel documents'],access:['Departure airport, visa/entry rules, routes and transport depend on profile location and passport/citizenship','Only use confirmed booking details as final'],setup:['Confirm travel dates','Book flight','Book accommodation','Set ground transport plan','Set daily budget','Prepare event schedule','Prepare contact/follow-up system'],actions:['Check next deadline','Complete one booking/payment/preparation item','Update amount paid and amount remaining','Record confirmations','During trip: attend, capture contact and next step','Follow up after event'],markers:['Flight booked?','Accommodation booked?','Transport resolved?','Funds available?','Emergency reserve?','Event dates/times?','Contacts with follow-up?'],rules:['Trip costs are recorded when paid','Do not treat ticket purchase as the whole trip budget','Meaningful contacts receive a next step'],limits:['Do not use emergency reserve for optional spending','Do not book conflicting travel/event times'],metrics:['Amount saved','Amount remaining','Bookings completed','Contacts made','Follow-ups sent','Opportunities created'],done:'The next dated travel requirement is completed and the budget/confirmation record is updated.',review:'Weekly until travel; daily during trip; 48-hour follow-up after return.',next:'Open Miami and complete the nearest uncompleted deadline.'},
 tetr:{parent:'Tetr / Education',purpose:'Evaluate and, if justified, execute the Tetr opportunity without destroying the professional fallback path.',output:'Evidence-based GO/NO-GO decision and completed application/funding/transition steps.',hub:['Tetr application portal','Email','Offer/acceptance documents','Scholarship/funding documents','Passport/visa files','Personal OS Tetr decision gate'],access:['Cohort, visa, funding and travel feasibility depend on applicant profile, citizenship/location and current program terms','Verify current dates and costs before acting'],setup:['Collect application status','Confirm cohort/start date','Confirm full cost','Confirm scholarship/aid','Confirm deadlines','Confirm visa/travel path','Confirm internship deferral/resumption path'],actions:['Open latest official communication','Update one unknown fact','Record evidence','Run GO gate','Complete the next required application/funding/document step','Do not make irreversible sacrifice before gate passes'],markers:['Written acceptance','Start date','Aid amount','Amount still payable','Payment deadline','Visa feasibility','Travel feasibility','Internship fallback'],rules:['Tetr replaces—not stacks on top of—the conflicting full-time path','No final sacrifice based only on excitement','Current official documents override assumptions'],limits:['Do not resign/forfeit professional pathway before key acceptance/funding facts are verified'],metrics:['Unknowns resolved','Documents completed','Funding secured','Deadlines met','GO-gate items passed'],done:'The next unresolved gate item is converted into verified evidence or a completed required action.',review:'Whenever new official information arrives; formal monthly gate review.',next:'Open Tetr and resolve the highest-impact unknown in the GO gate.'},
 content:{parent:'Content',purpose:'Document real progress and turn lived work into public proof without creating a separate full-time project.',output:'Consistent short-form posts tied to actual work and identity.',hub:['iPhone Camera','Photos','Instagram','TikTok','YouTube Shorts','Personal OS Content notes'],access:['Platform availability/account status depends on user location/account; publishing workflow should use the platforms actually available'],setup:['Choose one real lesson from today','Write one sentence hook','Write three supporting bullets','Choose simple recording location/light','Set 20-minute cap'],actions:['Record 30–90 seconds','Trim dead beginning/end','Add simple title/caption','Post same core idea to selected platforms','Record link/result','Stop'],markers:['Is it based on real work?','One clear idea?','Understandable without extra context?','Posted within time cap?','Any useful response/signal?'],rules:['Document; do not invent a separate content life','One core video can be reused across platforms','Clarity beats editing complexity'],limits:['No hours of editing for a short','No posting private patient/client information'],metrics:['Posts published','Views','Saves/shares','Useful replies','Inbound opportunities','Consistency'],done:'One real-work insight is recorded, posted to the selected channels and logged.',review:'Twice weekly posting review; monthly content/opportunity review.',next:'Open Content and turn today’s strongest real lesson into one short.'}
};

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
 ${card('Trading branch — exact starting platform',`
   <div class="metric"><span>Broker</span><b>Interactive Brokers (IBKR)</b></div>
   <div class="metric"><span>Phone app</span><b>IBKR GlobalTrader</b></div>
   <div class="metric"><span>Account type</span><b>Individual → Cash account</b></div>
   <div class="metric"><span>First products</span><b>Stocks / ETFs only</b></div>
   <div class="metric"><span>Leverage</span><b>None during training</b></div>
   <p class="small" style="margin-top:10px">Use real money only after the account is approved and funded. Cash account means you must have the cash for the trade; no borrowed margin and no short stock.</p>`)}
 ${card('Account opening — do this in order',checks('trading-setup',[
   'Download/open IBKR GlobalTrader or open Interactive Brokers account application.',
   'Choose Individual account.',
   'Choose Cash account — not Margin.',
   'Enter legal name, residential address, date/country of birth.',
   'Enter tax residency and tax identification number.',
   'Enter employer information, income/assets, investment objectives and truthful trading experience.',
   'Prepare proof of identity: valid passport, national ID, or driver’s licence.',
   'Prepare separate proof of residential address: acceptable recent document showing your name/address.',
   'Submit application and complete any identity verification requests.',
   'After approval, sign in to Client Portal.',
   'Create a deposit notification before sending money.',
   'Choose the funding method available to you; for bank wire, copy the exact currency-specific instructions IBKR gives you.',
   'Send funds from an account in your own name; record bank/intermediary fees.',
   'Wait until cash is shown as available for trading before placing a live order.'
 ]))}
 ${card('Before each live trade — no skipping',checks('trading-pre-'+dateKey(),[
   'Open GlobalTrader.',
   'Open Trading Branch notes/journal.',
   'Choose ONE instrument from the current watchlist; do not browse endlessly.',
   'Write current price.',
   'Write prior close.',
   'Check whether the instrument is a stock or ETF.',
   'Check today’s major company/market news before trading.',
   'If single stock: check whether earnings or a major scheduled company event is imminent.',
   'Define the reason for the trade in one sentence before pressing Buy/Sell.',
   'Define entry price before submitting.',
   'Define the price that proves the idea wrong before submitting.',
   'Define planned exit/target before submitting.',
   'Write the exact maximum dollar amount you are willing to lose on this trade.',
   'Confirm that loss would not affect food, transport, bills, travel obligations, or debt payments.',
   'Use no margin, no options, no shorting during the first live-learning phase.',
   'If any required field is blank → NO TRADE.'
 ]))}
 ${card('Order execution — first live-learning phase',checks('trading-exec-'+dateKey(),[
   'Tap the selected stock/ETF.',
   'Tap Buy only after the pre-trade checklist is complete.',
   'Use a small fractional-share cash amount rather than buying a whole expensive share when appropriate.',
   'Prefer a limit order while learning so the maximum purchase price is explicit.',
   'Review symbol, side, dollar/share quantity, order type and limit price.',
   'Read estimated amount/fees shown by the broker.',
   'Submit only if the order exactly matches the written plan.',
   'Take a screenshot or record the fill price in the journal.',
   'Do not add to the position simply because price moves against you.',
   'Exit according to the rule written before entry, not emotion after entry.'
 ]))}
 ${card('What you are looking for',list([
   'CONTEXT — What is the broad market doing?',
   'CATALYST — Is there actual news/event information affecting the instrument?',
   'DIRECTION — Is price generally trending up, down, or sideways on the timeframe you chose?',
   'LEVEL — Where is the specific entry area?',
   'INVALIDATION — What exact price/action proves the idea wrong?',
   'LIQUIDITY — Can you enter/exit without an obviously wide spread?',
   'RISK — What is the maximum dollar loss before you enter?',
   'REWARD — Is the planned upside worth taking that defined risk?',
   'BEHAVIOUR — Did you follow the plan or react emotionally?'
 ]))}
 ${card('First live-learning rules',list([
   'Real money is allowed; uncontrolled risk is not.',
   'Cash account only at the beginning.',
   'Stocks/ETFs only at the beginning.',
   'One open learning position at a time until your process is consistent.',
   'No borrowed money.',
   'No money needed for essentials, Miami, debt, tuition, rent or near-term obligations.',
   'No revenge trade after a loss.',
   'No trade is a valid decision.',
   'The objective of the first trades is execution quality, not maximum profit.'
 ]))}
 ${card('Journal after every trade',checks('trading-review-'+dateKey(),[
   'Instrument/ticker.',
   'Date and exact entry time.',
   'Entry price.',
   'Exit price.',
   'Position size / dollars used.',
   'Planned maximum loss.',
   'Actual profit/loss.',
   'Reason for entry.',
   'Reason for exit.',
   'Did I follow the original rule? Yes/No.',
   'One thing done correctly.',
   'One mistake.',
   'One rule for the next trade.'
 ]))}
 ${card('Trading scorecard',list([
   'Process compliance % = trades where every pre-trade field was completed ÷ total trades.',
   'Rule compliance % = trades executed exactly according to the written plan ÷ total trades.',
   'Average planned loss vs actual loss.',
   'Number of impulsive trades.',
   'Number of no-trade decisions made correctly.',
   'Net P/L is recorded, but process compliance is the first learning metric.'
 ]))}
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
 ${card('Change history',`<div class="stack">${state.patches.length?state.patches.slice().reverse().map((x,i)=>`<div class="patch"><b>${esc(x.module)} — ${esc(x.date)}</b>${x.source==='AI'?'<div class="badge" style="margin-top:6px">AI-approved patch</div>':''}<p>Trigger: ${esc(x.trigger)}<br>Patch: ${esc(x.fix)}<br>Dependencies: ${esc(x.deps||'None stated')}<br>Preserved: ${esc(Array.isArray(x.preserved)&&x.preserved.length?x.preserved.join(', '):'all non-dependent modules')}</p></div>`).join(''):'<p class="muted">No structural patches logged.</p>'}</div>`)}
 </div>`;
}



function profileLocationLabel(){
 const p=state.profile||{};
 const parts=[p.address,p.city,p.region,p.country].filter(Boolean);
 return parts.length?parts.join(', '):'Location not set';
}
function blueprintList(title,items){
 if(!items||!items.length)return '';
 return `<details class="blueprintSection"><summary>${esc(title)}</summary><div class="blueprintBody">${list(items)}</div></details>`;
}
function moduleBlueprintHTML(id){
 const b=executionBlueprints[id];
 if(!b)return '';
 const p=state.profile||{};
 return `<section class="card blueprintCard">
   <div class="blueprintHeader">
    <div><div class="kicker">Universal execution blueprint</div><h2>${esc(b.parent)}</h2><p class="muted">${esc(b.purpose)}</p></div>
    <div class="blueprintNext"><span>Next smallest step</span><b>${esc(b.next)}</b></div>
   </div>
   <div class="branch-overview cardless">
    <div class="metricTile"><span>Output</span><b>${esc(b.output)}</b></div>
    <div class="metricTile"><span>Location</span><b>${esc(profileLocationLabel())}</b></div>
    <div class="metricTile"><span>Travel radius</span><b>${esc(p.travelRadiusKm?`${p.travelRadiusKm} km`:'Not set')}</b></div>
    <div class="metricTile"><span>Review</span><b>${esc(b.review)}</b></div>
   </div>
   <div class="blueprintGrid">
    ${blueprintList('Exact hub / tools / accounts',b.hub)}
    ${blueprintList('Location / access',b.access)}
    ${blueprintList('Setup — exact order',b.setup)}
    ${blueprintList('Action loop',b.actions)}
    ${blueprintList('Markers — what to inspect',b.markers)}
    ${blueprintList('Decision rules',b.rules)}
    ${blueprintList('Risk / limits',b.limits)}
    ${blueprintList('Metrics',b.metrics)}
    <details class="blueprintSection"><summary>Completion test</summary><div class="blueprintBody"><p>${esc(b.done)}</p></div></details>
   </div>
 </section>`;
}
function setText(id,value){const el=document.getElementById(id);if(el)el.value=Array.isArray(value)?value.join('\n'):(value||'');}

function linesFromText(v=''){ return String(v||'').split(/\n+/).map(x=>x.trim()).filter(Boolean); }
function branchById(id){ return (state.customBranches||[]).find(b=>String(b.id)===String(id)); }
function branchNavItems(){
 return (state.customBranches||[]).filter(b=>b.status!=='archived').map(b=>['branch:'+b.id,b.name]);
}
function branchExecutionStandardHTML(){
 return card('Execution standard — applies to every branch',list([
  'NAME — one clear branch/subcategory name.',
  'PARENT — which larger module/pillar owns it.',
  'PURPOSE — why this branch exists in one sentence.',
  'OUTPUT — the measurable thing this branch must eventually produce.',
  'TOOLS / ACCOUNTS — exact app, website, account, equipment or document used.',
  'LOCATION / ACCESS — where it can be done, eligibility, travel radius, licensing or access constraints.',
  'SETUP — account creation / installation / preparation steps in exact order.',
  'ACTION LOOP — what you physically do when you open this branch.',
  'MARKERS — what information you look at before deciding what to do.',
  'DECISION RULES — “If X, do Y; if not, do Z.”',
  'RISK / LIMITS — what you are not allowed to do.',
  'METRICS — numbers proving whether you are improving.',
  'COMPLETION TEST — what counts as done for today.',
  'REVIEW — when the branch is evaluated or changed.',
  'OPPORTUNITY PATH — where opportunities are found, what qualifies you, and the next access step.',
  'DEPENDENCIES — what other branches are actually affected if this one changes.',
  'NOTES / SOURCES — evidence, lessons and reference links.'
 ]));
}
function branchStatsHTML(branches){
 const active=branches.filter(b=>b.status==='active').length;
 const waiting=branches.filter(b=>b.status==='waiting').length;
 return `<div class="branch-overview cardless">
   <div class="metricTile"><span>Total branches</span><b>${branches.length}</b></div>
   <div class="metricTile"><span>Active</span><b>${active}</b></div>
   <div class="metricTile"><span>Waiting</span><b>${waiting}</b></div>
   <div class="metricTile"><span>Rule</span><b>One clear execution path per branch</b></div>
 </div>`;
}
function branchesHTML(){
 const branches=state.customBranches||[];
 return `<div class="stack stack-lg">
  ${card('Branch system',`<p class="muted">Use this area to create precise subcategories under your main pillars. Every branch should tell you exactly what tool to open, what order to work in, what to inspect, and what counts as finished.</p>${branchStatsHTML(branches)}`)}
  <div class="grid7030">
   ${card('Create a branch / subcategory',`<form id="branchForm" class="form">
    <div class="formSection">
      <div class="formSectionTitle">1) Identity</div>
      <label>Branch name<input id="branchName" required placeholder="Example: Negotiation — Price Objections"></label>
      <label>Parent module / pillar<input id="branchParent" required placeholder="Example: Sales"></label>
      <label>Purpose<textarea id="branchPurpose" rows="2" required placeholder="Why does this branch exist?"></textarea></label>
      <label>Measurable output / end result<textarea id="branchOutput" rows="2" required placeholder="What must this branch produce?"></textarea></label>
      <label>Status<select id="branchStatus"><option value="active">Active</option><option value="waiting">Waiting</option></select></label>
      <div class="actions"><button type="button" id="branchGenerateBtn" class="btn">Build full branch with AI</button><span id="branchGenerateStatus" class="small"></span></div>
    </div>
    <div class="formSection">
      <div class="formSectionTitle">2) Tools and setup</div>
      <label>Exact tools / accounts<textarea id="branchTools" rows="3" placeholder="One per line: app, website, account, equipment, document..."></textarea></label>
      <label>Location / access requirements<textarea id="branchAccess" rows="4" placeholder="Where can this be done? What country/city eligibility, travel, licensing or access constraints matter?"></textarea></label>
      <label>Setup steps — one exact step per line<textarea id="branchSetup" rows="6" placeholder="Step 1...&#10;Step 2..."></textarea></label>
    </div>
    <div class="formSection">
      <div class="formSectionTitle">3) Execution</div>
      <label>Action loop — what I do when I open this branch<textarea id="branchActions" rows="6" placeholder="Open X...&#10;Check Y...&#10;Do Z..."></textarea></label>
      <label>Markers — what I inspect / measure before acting<textarea id="branchMarkers" rows="5" placeholder="Price trend, account balance, open orders, watchlist, calendar..."></textarea></label>
      <label>Decision rules — write If → Then rules<textarea id="branchRules" rows="5" placeholder="If ___, then ___."></textarea></label>
    </div>
    <div class="formSection">
      <div class="formSectionTitle">4) Control and review</div>
      <label>Risk / limits<textarea id="branchLimits" rows="4"></textarea></label>
      <label>Metrics<textarea id="branchMetrics" rows="4"></textarea></label>
      <label>Completion test<textarea id="branchDone" rows="3" placeholder="Today is complete when..."></textarea></label>
      <label>Review frequency<input id="branchReview" placeholder="Example: Sunday 6 PM / every 10 trades"></label>
      <label>Opportunity path<textarea id="branchOpportunity" rows="4" placeholder="Where opportunities are found, what eligibility is required, and the next access step."></textarea></label>
      <label>Dependencies<textarea id="branchDeps" rows="3" placeholder="Which modules genuinely change if this branch changes?"></textarea></label>
    </div>
    <button class="btn primary">Create branch</button>
   </form>`)}
   <div class="stack">
    ${branchExecutionStandardHTML()}
    ${card('Current custom branches', branches.length?`<div class="branch-list">${branches.map(b=>`<div class="branchItem"><div class="branchItemTop"><div><b>${esc(b.name)}</b><div class="small">${esc(b.parent)}</div></div><div class="badge ${b.status==='waiting'?'badge-waiting':'badge-active'}">${esc(b.status)}</div></div><p class="muted">${esc(b.output)}</p><div class="actions" style="margin-top:10px"><button class="btn" data-open-branch="${b.id}">Open</button><button class="btn danger" data-delete-branch="${b.id}">Delete</button></div></div>`).join('')}</div>`:'<p class="muted">No custom branches yet.</p>')}
   </div>
  </div>
 </div>`;
}
function customBranchHTML(id){
 const b=branchById(id);
 if(!b)return card('Branch not found','<p class="muted">This custom branch no longer exists.</p>');
 const make=(title,items)=>card(title,items&&items.length?`<div class="stack">${items.map((x,i)=>check('branch-'+b.id+'-'+title.replace(/\W+/g,'-')+'-'+dateKey()+'-'+i,x)).join('')}</div>`:'<p class="muted">Not defined yet.</p>');
 return `<div class="stack stack-lg">
  ${card(b.name,`<div class="branchHero"><div><div class="badge">${esc(b.parent)}</div><p class="muted" style="margin-top:10px">${esc(b.purpose)}</p></div><div class="branchHeroStats"><div class="metric"><span>Status</span><b>${esc(b.status)}</b></div><div class="metric"><span>Output</span><b>${esc(b.output)}</b></div><div class="metric"><span>Review</span><b>${esc(b.review||'Not set')}</b></div></div></div><div class="actions" style="margin-top:12px"><button type="button" class="btn" data-jump-module="branches">Back to Branches</button></div>`)}
  <div class="grid7030">
   <div class="stack">
    ${make('Tools / accounts',b.tools)}
    ${make('Location / access',b.access)}
    ${make('Setup steps',b.setup)}
    ${make('Action loop',b.actions)}
    ${make('Markers',b.markers)}
    ${make('Decision rules',b.rules)}
    ${make('Risk / limits',b.limits)}
    ${make('Metrics',b.metrics)}
    ${card('Completion test',`<p class="muted">${esc(b.done||'Not defined yet.')}</p>`)}
    ${make('Opportunity path',b.opportunity)}
    ${make('Dependencies',b.dependencies)}
   </div>
   <div class="stack">
    ${branchExecutionStandardHTML()}
    ${card('Branch AI instruction',`<p class="muted">When asking AI about this branch, it receives this branch definition. AI should not answer with vague headings alone. It should identify the exact tool/account, exact next action, exact sequence, markers, decision rules, measurement and completion test.</p>`)}
   </div>
  </div>
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
   profile_location: state.profile||{},
   active_execution_blueprint: executionBlueprints[state.currentModule]||null,
   metrics: state.metrics,
   approved_patches: state.patches.slice(-20),
   custom_branches: (state.customBranches||[]).map(b=>({id:b.id,name:b.name,parent:b.parent,status:b.status,purpose:b.purpose,output:b.output})),
   current_custom_branch: state.currentModule.startsWith('branch:') ? branchById(state.currentModule.split(':')[1]) : null,
   branch_execution_rule: 'Never give a vague branch task. Specify exact tool/account, location/access, exact sequence, markers, decision rules, risk limits, metrics, opportunity path and completion test. Tailor to profile_location. If current availability, law, price or eligibility may have changed and is not verified, explicitly mark it VERIFY CURRENT AVAILABILITY rather than inventing certainty.',
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
 const p=state.profile||{};
 return `<div class="grid2">
 ${card('Profile & location',`<form id="profileForm" class="form">
  <p class="muted">This is the location/access layer used to tailor branches, tools and future opportunities. Exact street address is optional.</p>
  <label>Country<input id="profileCountry" value="${esc(p.country||'')}" placeholder="Example: Guyana"></label>
  <label>Region / state / parish<input id="profileRegion" value="${esc(p.region||'')}" placeholder="Example: Demerara-Mahaica"></label>
  <label>City / town<input id="profileCity" value="${esc(p.city||'')}" placeholder="Example: Georgetown"></label>
  <label>Address or neighborhood — optional<input id="profileAddress" value="${esc(p.address||'')}" placeholder="Use only as much detail as needed for travel/access"></label>
  <label>Preferred currency<input id="profileCurrency" value="${esc(p.currency||'')}" placeholder="Example: GYD / USD"></label>
  <label>Usual transport mode<input id="profileTransport" value="${esc(p.transportMode||'')}" placeholder="Example: car, minibus, walking"></label>
  <label>Practical travel radius (km)<input id="profileRadius" type="number" min="0" step="1" value="${esc(p.travelRadiusKm||'')}"></label>
  <div class="actions"><button class="btn primary">Save profile</button><button type="button" id="useLocationBtn" class="btn">Use phone coordinates</button></div>
  <div id="locationStatus" class="small" style="margin-top:8px">${p.coordinates?`Coordinates saved: ${Number(p.coordinates.lat).toFixed(4)}, ${Number(p.coordinates.lng).toFixed(4)}`:'No coordinates saved.'}</div>
 </form>`)}
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
 const navModules=[...modules,...branchNavItems()];
 document.getElementById('nav').innerHTML=navModules.map(([id,name])=>`<button data-module="${id}" class="${state.currentModule===id?'active':''}">${esc(name)}</button>`).join('');
 const currentModuleName=(navModules.find(([id])=>id===state.currentModule)||[])[1]||'Custom branch';
 const doneToday=Object.entries(state.checks).filter(([k,v])=>v&&k.startsWith('daily-'+dateKey()+'-')).length;
 document.getElementById('content').dataset.currentModule=currentModuleName;
 const map={
  today:()=>todayHTML(d), dashboard:dashboardHTML, master:masterHTML, music:()=>musicHTML(d), sales:salesHTML,
  acting:actingHTML, trading:tradingHTML, fitness:()=>fitnessHTML(d), pharmacy:pharmacyHTML, business:businessHTML,
  miami:miamiHTML, tetr:tetrHTML, content:contentHTML, ideas:ideasHTML, branches:branchesHTML, change:changeHTML, ai:aiHTML, settings:settingsHTML
 };
 if(state.currentModule.startsWith('branch:')){
   document.getElementById('content').innerHTML=customBranchHTML(state.currentModule.split(':')[1]);
 }else{
   const base=map[state.currentModule]();
   document.getElementById('content').innerHTML=(executionBlueprints[state.currentModule]?moduleBlueprintHTML(state.currentModule):'')+base;
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

 const bf=document.getElementById('branchForm');
 if(bf) bf.addEventListener('submit',e=>{
   e.preventDefault();
   if(!state.customBranches)state.customBranches=[];
   const b={
     id:Date.now().toString(36),
     name:document.getElementById('branchName').value.trim(),
     parent:document.getElementById('branchParent').value.trim(),
     purpose:document.getElementById('branchPurpose').value.trim(),
     output:document.getElementById('branchOutput').value.trim(),
     tools:linesFromText(document.getElementById('branchTools').value),
     access:linesFromText(document.getElementById('branchAccess').value),
     setup:linesFromText(document.getElementById('branchSetup').value),
     actions:linesFromText(document.getElementById('branchActions').value),
     markers:linesFromText(document.getElementById('branchMarkers').value),
     rules:linesFromText(document.getElementById('branchRules').value),
     limits:linesFromText(document.getElementById('branchLimits').value),
     metrics:linesFromText(document.getElementById('branchMetrics').value),
     done:document.getElementById('branchDone').value.trim(),
     review:document.getElementById('branchReview').value.trim(),
     opportunity:linesFromText(document.getElementById('branchOpportunity').value),
     dependencies:linesFromText(document.getElementById('branchDeps').value),
     status:document.getElementById('branchStatus').value,
     createdAt:new Date().toISOString()
   };
   state.customBranches.push(b);
   state.currentModule='branch:'+b.id;
   saveState(); render();
 });
 document.querySelectorAll('[data-open-branch]').forEach(btn=>btn.addEventListener('click',()=>{state.currentModule='branch:'+btn.dataset.openBranch;saveState();render();}));
 document.querySelectorAll('[data-delete-branch]').forEach(btn=>btn.addEventListener('click',()=>{
   const id=btn.dataset.deleteBranch;
   if(confirm('Delete this custom branch?')){
     state.customBranches=(state.customBranches||[]).filter(b=>String(b.id)!==String(id));
     if(state.currentModule==='branch:'+id)state.currentModule='branches';
     saveState();render();
   }
 }));


 const pf=document.getElementById('profileForm');
 if(pf) pf.addEventListener('submit',e=>{
   e.preventDefault();
   state.profile={...(state.profile||{}),
     country:document.getElementById('profileCountry').value.trim(),
     region:document.getElementById('profileRegion').value.trim(),
     city:document.getElementById('profileCity').value.trim(),
     address:document.getElementById('profileAddress').value.trim(),
     currency:document.getElementById('profileCurrency').value.trim(),
     transportMode:document.getElementById('profileTransport').value.trim(),
     travelRadiusKm:document.getElementById('profileRadius').value.trim()
   };
   saveState();render();
 });
 const ul=document.getElementById('useLocationBtn');
 if(ul) ul.addEventListener('click',()=>{
   const ls=document.getElementById('locationStatus');
   if(!navigator.geolocation){if(ls)ls.textContent='Phone location is not available in this browser.';return;}
   if(ls)ls.textContent='Requesting phone location…';
   navigator.geolocation.getCurrentPosition(pos=>{
     state.profile={...(state.profile||{}),coordinates:{lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,updatedAt:new Date().toISOString()}};
     saveState();render();
   },err=>{if(ls)ls.textContent='Location was not saved: '+err.message;},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
 });

 const gen=document.getElementById('branchGenerateBtn');
 if(gen) gen.addEventListener('click',async()=>{
   const status=document.getElementById('branchGenerateStatus');
   const name=document.getElementById('branchName').value.trim();
   const parent=document.getElementById('branchParent').value.trim();
   const purpose=document.getElementById('branchPurpose').value.trim();
   const endpoint=state.settings.aiEndpoint, token=state.settings.aiToken||'';
   if(!name||!parent||!purpose){if(status)status.textContent='Enter branch name, parent and purpose first.';return;}
   if(!endpoint||!token){if(status)status.textContent='Connect AI in Settings first.';return;}
   gen.disabled=true;if(status)status.textContent='Building the full execution branch…';
   const location=JSON.stringify(state.profile||{});
   const prompt=`Build a complete Personal OS execution branch. Return ONLY <OS_BRANCH>{valid JSON}</OS_BRANCH>. Branch name: ${name}. Parent: ${parent}. Purpose: ${purpose}. User location/access profile: ${location}. JSON fields: purpose, output, tools (array), access (array), setup (array), actions (array), markers (array), rules (array), limits (array), metrics (array), done (string), review (string), opportunity (array), dependencies (array). Instructions must be extremely concrete and executable: exact tool/account/platform where appropriate, smallest sequential steps, decision rules, measurements, completion criteria. Tailor access/opportunities to the location profile. When a platform, law, fee, availability, licensing condition or opportunity may have changed and is not verified, write VERIFY CURRENT AVAILABILITY instead of pretending certainty. No prose outside the tag.`;
   try{
     const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-App-Token':token},body:JSON.stringify({message:prompt,context:currentContext(),history:[]})});
     if(!res.ok)throw new Error('Server returned '+res.status);
     const data=await res.json();
     const parsed=extractMachineBlock(data.reply||'','OS_BRANCH').value;
     if(!parsed)throw new Error('AI did not return a complete branch blueprint');
     setText('branchPurpose',parsed.purpose||purpose);setText('branchOutput',parsed.output);setText('branchTools',parsed.tools);setText('branchAccess',parsed.access);setText('branchSetup',parsed.setup);setText('branchActions',parsed.actions);setText('branchMarkers',parsed.markers);setText('branchRules',parsed.rules);setText('branchLimits',parsed.limits);setText('branchMetrics',parsed.metrics);setText('branchDone',parsed.done);setText('branchReview',parsed.review);setText('branchOpportunity',parsed.opportunity);setText('branchDeps',parsed.dependencies);
     if(status)status.textContent='Blueprint filled. Review it, edit anything needed, then Create branch.';
   }catch(err){if(status)status.textContent='Could not build branch: '+err.message;}
   finally{gen.disabled=false;}
 });

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
