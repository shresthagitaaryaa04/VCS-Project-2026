const DEFAULT_USER = {
  name:"Aarya Shrestha", email:"aarya@example.com", initials:"AS",
  bio:"Computer science student who loves exploring Nepal one trail at a time.",
  province:"Bagmati", district:"Lalitpur", experience:"Intermediate",
  availability:"Weekends", budget:"Medium",
  interests:["nature","adventure","photography"], languages:["Nepali","English"],
  completed:[2], saved:[1,4], friends:[101], incoming:[102], sent:[103]
};

const state = {
  user: JSON.parse(localStorage.getItem("hikeSathiUser") || "null") || DEFAULT_USER,
  loggedIn: JSON.parse(localStorage.getItem("hikeSathiLoggedIn") || "false"),
  activeTrail: null,
  selectedConversation: 101,
  map: null
};

const app = document.getElementById("app");
const modalRoot = document.getElementById("modal-root");
const toastRoot = document.getElementById("toast-root");

function persist(){
  localStorage.setItem("hikeSathiUser", JSON.stringify(state.user));
  localStorage.setItem("hikeSathiLoggedIn", JSON.stringify(state.loggedIn));
}
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }
function toast(msg,type="success"){
  const el=document.createElement("div"); el.className=`toast ${type}`; el.textContent=msg;
  toastRoot.appendChild(el); setTimeout(()=>el.remove(),2800);
}
function initials(name){ return name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(); }
function route(){ return location.hash.replace("#","").split("/")[0] || "home"; }
function isAuthRoute(){ return ["login","signup"].includes(route()); }

function avatar(u, size="md"){ return `<div class="avatar ${size}">${esc(u.initials||initials(u.name))}</div>`; }
function badge(text,kind="green"){ return `<span class="badge ${kind}">${esc(text)}</span>`; }
function trailCard(t){
  const saved=state.user.saved.includes(t.id);
  return `<article class="trail-card" onclick="openTrail(${t.id})">
    <div class="trail-image" style="background-image:url('${t.image}')"><div class="trail-top">${badge(t.difficulty,t.difficulty.toLowerCase())}<button class="save-btn ${saved?"saved":""}" onclick="event.stopPropagation();toggleSave(${t.id})">${saved?"♥":"♡"}</button></div></div>
    <div class="trail-body">
      <div class="eyebrow">${esc(t.province)} · ${esc(t.district)}</div>
      <h3>${esc(t.name)}</h3>
      <p class="muted clamp">${esc(t.desc)}</p>
      <div class="trail-meta"><span>⏱ ${t.days} day${t.days>1?"s":""}</span><span>↗ ${t.altitude}</span><span>★ ${t.rating}</span></div>
      <div class="tag-row">${t.tags.slice(0,3).map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</div>
    </div>
  </article>`;
}
function userCard(u){
  const friend=state.user.friends.includes(u.id);
  const sent=state.user.sent.includes(u.id);
  return `<article class="person-card">
    <div class="person-head">${avatar(u)}<div><h3>${esc(u.name)}</h3><p>${esc(u.location)}</p></div><span class="match">${u.match}%</span></div>
    <div class="person-stats">${badge(u.experience,"soft")} <span>🗣 ${u.languages.slice(0,2).map(esc).join(", ")}</span></div>
    <p class="muted">${esc(u.bio)}</p>
    <div class="tag-row">${u.interests.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</div>
    <button class="btn ${friend?"secondary":sent?"ghost":"primary"} full" onclick="event.stopPropagation();${friend?"openChat("+u.id+")":sent?"cancelRequest("+u.id+")":"sendRequest("+u.id+")"}">${friend?"Message":sent?"Request Sent":"Add Sathi"}</button>
  </article>`;
}

function render(){
  const r=route();
  document.querySelectorAll(".main-nav a").forEach(a=>a.classList.toggle("active",a.dataset.route===r));
  if((r==="profile"||r==="preferences"||r==="messages"||r==="groups"||r==="explore"||r==="trail") && !state.loggedIn){
    location.hash="#login"; return;
  }
  if(r==="home") renderHome();
  else if(r==="explore") renderExplore();
  else if(r==="trail") renderTrail();
  else if(r==="groups") renderGroups();
  else if(r==="messages") renderMessages();
  else if(r==="profile") renderProfile();
  else if(r==="preferences") renderPreferences();
  else if(r==="login") renderLogin();
  else if(r==="signup") renderSignup();
  else renderHome();
  window.scrollTo({top:0,behavior:"instant"});
}

function renderHome(){
  const rec=TRAILS.filter(t=>t.tags.some(x=>state.user.interests.includes(x))).slice(0,4);
  const people=USERS.filter(u=>u.interests.some(x=>state.user.interests.includes(x))).sort((a,b)=>b.match-a.match).slice(0,4);
  app.innerHTML=`<section class="hero">
    <div class="hero-copy"><span class="pill">🇳🇵 Made for Nepal's trails</span><h1>Find your path.<br><em>Find your sathi.</em></h1><p>Discover trekking routes, meet compatible hikers, create groups and plan your next Himalayan adventure — all in one place.</p>
    <div class="hero-search"><span>⌕</span><input id="home-search" placeholder="Search trails, districts, mountains..." onkeydown="if(event.key==='Enter')goExplore(this.value)"><button onclick="goExplore(document.getElementById('home-search').value)">Explore</button></div>
    <div class="hero-stats"><span><strong>120+</strong> trails</span><span><strong>2.4k</strong> trekkers</span><span><strong>38</strong> active groups</span></div></div>
  </section>
  <section class="section"><div class="section-head"><div><span class="eyebrow">PERSONALIZED</span><h2>Recommended for you</h2><p>Trails matched to your interests and experience.</p></div><a href="#explore" class="text-link">View all →</a></div><div class="card-grid">${rec.map(trailCard).join("")}</div></section>
  <section class="section tinted"><div class="section-head"><div><span class="eyebrow">SOCIAL</span><h2>Find trekking partners</h2><p>Connect with people who share your pace, language and interests.</p></div><a href="#groups" class="text-link">See more →</a></div><div class="people-grid">${people.map(userCard).join("")}</div></section>
  <section class="section"><div class="feature-banner"><div><span class="eyebrow">PLAN TOGETHER</span><h2>Not sure where to start?</h2><p>Set your hiking preferences and Hike Sathi will rank trails and companions around your style.</p><a href="#preferences" class="btn light">Tune my preferences</a></div><div class="feature-icons"><span>🥾</span><span>🗺️</span><span>🤝</span></div></div></section>`;
}

function goExplore(q=""){ location.hash="#explore"+(q?`?q=${encodeURIComponent(q)}`:""); }

function renderExplore(){
  const params=new URLSearchParams(location.hash.split("?")[1]||"");
  let q=params.get("q")||"";
  app.innerHTML=`<section class="page-head"><div><span class="eyebrow">DISCOVER</span><h1>Explore Nepal</h1><p>Search and filter trails by location, difficulty, duration and budget.</p></div></section>
  <section class="explore-layout"><aside class="filter-panel">
    <div class="filter-title"><b>Filters</b><button class="text-link" onclick="clearFilters()">Reset</button></div>
    <label>Search<input id="filter-q" value="${esc(q)}" placeholder="Trail or district" oninput="filterTrails()"></label>
    <label>Province<select id="filter-province" onchange="filterTrails()">${PROVINCES.map(x=>`<option>${x}</option>`).join("")}</select></label>
    <label>Difficulty<select id="filter-difficulty" onchange="filterTrails()"><option>All</option><option>Easy</option><option>Moderate</option><option>Challenging</option></select></label>
    <label>Duration<select id="filter-days" onchange="filterTrails()"><option>All</option><option>1-5 days</option><option>5-10 days</option><option>10+ days</option></select></label>
    <label>Budget<select id="filter-budget" onchange="filterTrails()"><option>All</option><option>Low</option><option>Medium</option><option>High</option></select></label>
    <div class="filter-note">💡 <b>Tip:</b> Save trails to build your personal shortlist.</div>
  </aside><div><div class="results-head"><b id="result-count"></b><select id="sort-trails" onchange="filterTrails()"><option value="rating">Top rated</option><option value="cost">Lowest cost</option><option value="days">Shortest</option></select></div><div id="explore-results" class="card-grid"></div></div></section>`;
  filterTrails();
}
function filterTrails(){
  const q=(document.getElementById("filter-q")?.value||"").toLowerCase();
  const p=document.getElementById("filter-province")?.value||"All", d=document.getElementById("filter-difficulty")?.value||"All", days=document.getElementById("filter-days")?.value||"All", budget=document.getElementById("filter-budget")?.value||"All", sort=document.getElementById("sort-trails")?.value||"rating";
  let arr=TRAILS.filter(t=>(!q||(t.name+" "+t.district+" "+t.province+" "+t.type).toLowerCase().includes(q))&&(p==="All"||t.province===p)&&(d==="All"||t.difficulty===d)&&
    (days==="All"||(days==="1-5 days"&&t.days<=5)||(days==="5-10 days"&&t.days>=5&&t.days<=10)||(days==="10+ days"&&t.days>=10))&&
    (budget==="All"||(budget==="Low"&&t.cost<20000)||(budget==="Medium"&&t.cost>=20000&&t.cost<=40000)||(budget==="High"&&t.cost>40000)));
  arr.sort((a,b)=>sort==="cost"?a.cost-b.cost:sort==="days"?a.days-b.days:b.rating-a.rating);
  document.getElementById("result-count").textContent=`${arr.length} trails found`;
  document.getElementById("explore-results").innerHTML=arr.length?arr.map(trailCard).join(""):`<div class="empty full-span"><span>🏔️</span><h3>No trails found</h3><p>Try changing your filters.</p></div>`;
}
function clearFilters(){ renderExplore(); }

function openTrail(id){ location.hash=`#trail/${id}`; }
function renderTrail(){
  const id=Number(routeId()), t=TRAILS.find(x=>x.id===id)||TRAILS[0]; state.activeTrail=t;
  app.innerHTML=`<section class="trail-detail"><button class="back-btn" onclick="history.back()">← Back to explore</button>
  <div class="trail-hero-detail"><img src="${t.image}" alt="${esc(t.name)}"><div class="trail-overlay"><span class="pill">${esc(t.province)} · ${esc(t.district)}</span><h1>${esc(t.name)}</h1><div>${badge(t.difficulty,t.difficulty.toLowerCase())} <span class="rating">★ ${t.rating} · ${t.reviews} reviews</span></div></div></div>
  <div class="detail-grid"><div class="detail-main">
    <div class="info-strip"><div><small>Duration</small><b>${t.days} days</b></div><div><small>Distance</small><b>${t.distance}</b></div><div><small>Max altitude</small><b>${t.altitude}</b></div><div><small>Est. cost</small><b>NPR ${t.cost.toLocaleString()}</b></div></div>
    <section class="content-card"><div class="section-head compact"><div><h2>About this trail</h2><p>${esc(t.desc)}</p></div><button class="btn ${state.user.saved.includes(t.id)?"secondary":"primary"}" onclick="toggleSave(${t.id})">${state.user.saved.includes(t.id)?"♥ Saved":"♡ Save trail"}</button></div><div class="tag-row">${t.tags.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</div></section>
    <section class="content-card"><div class="section-head compact"><div><h2>Route map</h2><p>${esc(t.start)} → ${esc(t.end)} · approximate route overview</p></div></div><div id="trail-map"></div></section>
    <section class="content-card"><h2>Elevation & itinerary</h2><div class="elevation"><span style="height:28%"></span><span style="height:45%"></span><span style="height:38%"></span><span style="height:64%"></span><span style="height:76%"></span><span style="height:92%"></span><span style="height:71%"></span><span style="height:98%"></span><span style="height:80%"></span><span style="height:58%"></span></div><div class="day-list"><div><b>Day 1</b> ${esc(t.start)} → Forest village</div><div><b>Middle days</b> Gradual ascent, viewpoints and local teahouses</div><div><b>Final day</b> ${esc(t.end)} → return transfer</div></div></section>
    <section class="content-card"><h2>Weather & preparation</h2><div class="weather-grid"><div>☀️ <b>Morning</b><small>Clear · 8°C</small></div><div>⛅ <b>Afternoon</b><small>Partly cloudy · 16°C</small></div><div>🌙 <b>Night</b><small>Cold · 4°C</small></div></div><p class="muted">Weather changes quickly in the mountains. Check local conditions before departure and carry appropriate layers, water and navigation essentials.</p></section>
  </div><aside class="detail-side"><div class="content-card sticky"><h3>Quick facts</h3><dl><dt>Start</dt><dd>${esc(t.start)}</dd><dt>End</dt><dd>${esc(t.end)}</dd><dt>Trail type</dt><dd>${esc(t.type)}</dd><dt>Experience</dt><dd>${esc(t.difficulty)}</dd><dt>Accommodation</dt><dd>Teahouse / lodge</dd></dl><button class="btn primary full" onclick="createGroupForTrail(${t.id})">Create a group</button><button class="btn secondary full" onclick="goExplore('${esc(t.name)}')">Find companions</button></div></aside></div></section>`;
  setTimeout(()=>initMap(t),50);
}
function routeId(){ return location.hash.split("/")[1]?.split("?")[0] || "1"; }
function initMap(t){
  if(!window.L || !document.getElementById("trail-map")) return;
  if(state.map) state.map.remove();
  state.map=L.map("trail-map").setView([t.lat,t.lng],10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(state.map);
  L.marker([t.lat,t.lng]).addTo(state.map).bindPopup(`<b>${esc(t.name)}</b><br>${esc(t.start)} → ${esc(t.end)}`).openPopup();
  const line=[[t.lat-.06,t.lng-.08],[t.lat-.025,t.lng-.02],[t.lat+.02,t.lng+.04],[t.lat+.05,t.lng+.08]];
  L.polyline(line,{color:"#0b7a5c",weight:4}).addTo(state.map);
}

function renderGroups(){
  app.innerHTML=`<section class="page-head"><div><span class="eyebrow">COMMUNITY</span><h1>Hiking groups</h1><p>Join an existing plan or create your own group around a trail.</p></div><button class="btn primary" onclick="createGroup()">＋ Create group</button></section>
  <div class="tabs"><button class="tab active" data-tab="browse" onclick="groupTab('browse')">Browse Groups</button><button class="tab" data-tab="mine" onclick="groupTab('mine')">My Groups</button><button class="tab" data-tab="friends" onclick="groupTab('friends')">Suggested Friends</button><button class="tab" data-tab="search" onclick="groupTab('search')">Search Users</button></div>
  <section id="group-content"></section>`;
  groupTab("browse");
}
function groupTab(tab){
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));
  const box=document.getElementById("group-content");
  if(tab==="browse"){
    box.innerHTML=`<div class="toolbar"><input id="group-search" placeholder="Search groups by name or trail" oninput="renderGroupCards()"><select id="group-trail" onchange="renderGroupCards()"><option>All Trails</option>${TRAILS.map(t=>`<option>${esc(t.name)}</option>`).join("")}</select></div><div id="group-cards" class="group-grid"></div>`; renderGroupCards();
  } else if(tab==="mine"){
    const joined=GROUPS.filter(g=>g.id===1||g.id===3); box.innerHTML=`<div class="group-grid">${joined.map(groupCard).join("")}</div>`;
  } else if(tab==="friends"){
    box.innerHTML=`<div class="people-grid">${USERS.filter(u=>!state.user.friends.includes(u.id)).slice(0,6).map(userCard).join("")}</div>`;
  } else {
    box.innerHTML=`<div class="search-large"><input id="user-search" placeholder="Search by name, city or interest" oninput="renderUserSearch()"><div id="user-results" class="people-grid"></div></div>`; renderUserSearch();
  }
}
function renderGroupCards(){
  const q=(document.getElementById("group-search")?.value||"").toLowerCase(), tr=document.getElementById("group-trail")?.value||"All Trails";
  const arr=GROUPS.filter(g=>(!q||(g.name+" "+g.trail+" "+g.desc).toLowerCase().includes(q))&&(tr==="All Trails"||g.trail===tr));
  document.getElementById("group-cards").innerHTML=arr.map(groupCard).join("");
}
function groupCard(g){
  const joined=state.user.joinedGroups?.includes(g.id);
  return `<article class="group-card"><div class="group-avatar">${g.avatar}</div><div class="group-card-top"><div><span class="eyebrow">${esc(g.trail)}</span><h3>${esc(g.name)}</h3></div>${badge(g.level,"soft")}</div><p>${esc(g.desc)}</p><div class="group-meta"><span>📅 ${esc(g.date)}</span><span>👥 ${g.members}/${g.max}</span></div><div class="group-owner">${avatar({initials:initials(g.owner),name:g.owner},"sm")} <span>Organized by ${esc(g.owner)}</span></div><button class="btn ${joined?"secondary":"primary"} full" onclick="joinGroup(${g.id})">${joined?"✓ Joined":"Join group"}</button></article>`;
}
function joinGroup(id){ state.user.joinedGroups=state.user.joinedGroups||[]; if(!state.user.joinedGroups.includes(id)){state.user.joinedGroups.push(id);persist();toast("You joined the group!");}else toast("You are already in this group.","info"); groupTab("browse"); }
function createGroupForTrail(id){ createGroup(id); }
function createGroup(preselect){
  modal(`<div class="modal-head"><h2>Create a hiking group</h2><button onclick="closeModal()">×</button></div><form onsubmit="submitGroup(event)" class="form-grid"><label>Group name<input name="name" required placeholder="e.g. Langtang Weekend Crew"></label><label>Trail<select name="trail">${TRAILS.map(t=>`<option ${t.id===preselect?"selected":""}>${esc(t.name)}</option>`).join("")}</select></label><label>Date<input type="date" name="date" required></label><label>Max members<select name="max"><option>6</option><option>8</option><option>10</option><option>15</option></select></label><label class="span-2">Description<textarea name="desc" placeholder="What is the group vibe?"></textarea></label><button class="btn primary span-2">Create group</button></form>`);
}
function submitGroup(e){ e.preventDefault(); const f=new FormData(e.target); GROUPS.unshift({id:Date.now(),name:f.get("name"),trail:f.get("trail"),date:f.get("date"),members:1,max:Number(f.get("max")),level:state.user.experience,owner:state.user.name,desc:f.get("desc")||"New Hike Sathi group.",avatar:initials(String(f.get("name")))}); closeModal(); toast("Group created successfully!"); renderGroups(); }

const DEMO_MESSAGES={
  101:[["Sujal Gurung","Hey Aarya! Are you still interested in Mardi this month?","09:41"],["Aarya Shrestha","Yes! I was thinking about the weekend group.","09:44"],["Sujal Gurung","Perfect. I can share the route and packing plan.","09:45"]],
  102:[["Riya Lama","Hi! I saw your profile and we both like cultural trails.","Yesterday"],["Aarya Shrestha","Absolutely. Langtang or Tamang Heritage could be good.","Yesterday"]],
  103:[["Aayush Karki","Panch Pokhari looks amazing for photography.","Mon"],["Aarya Shrestha","Agreed. Let's compare dates.","Mon"]]
};
function renderMessages(){
  const list=USERS.filter(u=>state.user.friends.includes(u.id)||state.user.sent.includes(u.id)||state.user.incoming.includes(u.id));
  const current=USERS.find(u=>u.id===state.selectedConversation)||list[0]||USERS[0];
  app.innerHTML=`<section class="page-head compact-head"><div><span class="eyebrow">MESSAGING</span><h1>Messages</h1><p>Chat with your trekking buddies.</p></div></section>
  <div class="chat-shell"><aside class="conversation-list">${list.map(u=>`<button class="conversation ${u.id===current.id?"active":""}" onclick="selectConversation(${u.id})">${avatar(u,"sm")}<span><b>${esc(u.name)}</b><small>${esc((DEMO_MESSAGES[u.id]?.at(-1)?.[1]||"Start a conversation"))}</small></span></button>`).join("")}</aside>
  <section class="chat-main"><div class="chat-header">${avatar(current)}<div><b>${esc(current.name)}</b><small>${esc(current.location)}</small></div><span class="online">● Online</span></div><div class="message-list" id="message-list">${(DEMO_MESSAGES[current.id]||[]).map(m=>`<div class="message ${m[0]===state.user.name?"mine":""}"><small>${esc(m[0])} · ${esc(m[2])}</small><p>${esc(m[1])}</p></div>`).join("")}</div><form class="message-input" onsubmit="sendMessage(event,${current.id})"><input id="message-box" placeholder="Write a message..." autocomplete="off"><button>➤</button></form></section></div>`;
}
function selectConversation(id){state.selectedConversation=id;renderMessages();}
function openChat(id){state.selectedConversation=id;location.hash="#messages";}
function sendMessage(e,id){e.preventDefault();const input=document.getElementById("message-box");const txt=input.value.trim();if(!txt)return;DEMO_MESSAGES[id]=DEMO_MESSAGES[id]||[];DEMO_MESSAGES[id].push([state.user.name,txt,"now"]);input.value="";renderMessages();setTimeout(()=>toast("Message saved locally. Connect a backend for real-time chat.","info"),200);}
function sendRequest(id){if(!state.user.sent.includes(id)){state.user.sent.push(id);persist();toast("Friend request sent!");render();}}
function cancelRequest(id){state.user.sent=state.user.sent.filter(x=>x!==id);persist();toast("Request cancelled.","info");render();}
function acceptRequest(id){state.user.incoming=state.user.incoming.filter(x=>x!==id);if(!state.user.friends.includes(id))state.user.friends.push(id);persist();toast("Friend request accepted!");renderProfile();}
function removeFriend(id){state.user.friends=state.user.friends.filter(x=>x!==id);persist();toast("Friend removed.","info");renderProfile();}
function toggleSave(id){state.user.saved=state.user.saved.includes(id)?state.user.saved.filter(x=>x!==id):[...state.user.saved,id];persist();toast(state.user.saved.includes(id)?"Trail saved!":"Trail removed from saved.","info");render();}
function markCompleted(id){if(!state.user.completed.includes(id))state.user.completed.push(id);persist();toast("Trail marked as completed!");}

function renderProfile(){
  const friends=USERS.filter(u=>state.user.friends.includes(u.id)), incoming=USERS.filter(u=>state.user.incoming.includes(u.id)), saved=TRAILS.filter(t=>state.user.saved.includes(t.id)), done=TRAILS.filter(t=>state.user.completed.includes(t.id));
  app.innerHTML=`<section class="profile-cover"><div class="profile-identity"><div class="profile-avatar">${esc(state.user.initials)}</div><div><span class="pill">Hike Sathi member</span><h1>${esc(state.user.name)}</h1><p>${esc(state.user.province)} · ${esc(state.user.district)} · ${esc(state.user.experience)}</p></div></div><button class="btn light" onclick="editProfile()">Edit profile</button></section>
  <div class="profile-layout"><div class="profile-main"><section class="content-card"><div class="section-head compact"><h2>About</h2><button class="text-link" onclick="editProfile()">Edit</button></div><p>${esc(state.user.bio)}</p><div class="profile-details"><span>📍 ${esc(state.user.district)}, ${esc(state.user.province)}</span><span>🥾 ${esc(state.user.experience)}</span><span>📅 ${esc(state.user.availability)}</span><span>💰 ${esc(state.user.budget)} budget</span><span>🗣 ${state.user.languages.map(esc).join(", ")}</span></div></section>
  ${incoming.length?`<section class="content-card"><h2>Friend requests <span class="count">${incoming.length}</span></h2><div class="request-list">${incoming.map(u=>`<div class="request">${avatar(u,"sm")}<div><b>${esc(u.name)}</b><small>${esc(u.bio)}</small></div><button class="btn primary" onclick="acceptRequest(${u.id})">Accept</button><button class="btn ghost" onclick="removeIncoming(${u.id})">Decline</button></div>`).join("")}</div></section>`:""}
  <section class="content-card"><div class="section-head compact"><div><h2>Saved hikes</h2><p>Your shortlist.</p></div></div><div class="mini-grid">${saved.map(trailCard).join("")||`<div class="empty full-span"><span>♡</span><h3>No saved trails yet</h3><p>Explore Nepal and save a few routes.</p></div>`}</div></section>
  <section class="content-card"><h2>Past hikes</h2><div class="past-list">${done.map(t=>`<div class="past-item"><div class="past-thumb" style="background-image:url('${t.image}')"></div><div><b>${esc(t.name)}</b><small>${t.days} days · ★ ${t.rating}</small></div>${badge("Completed","green")}</div>`).join("")||"<p class='muted'>Your completed hikes will appear here.</p>"}</div></section>
  </div><aside><section class="content-card"><h3>Preferences</h3><div class="tag-row">${state.user.interests.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</div><button class="btn secondary full" onclick="location.hash='#preferences'">Manage preferences</button></section>
  <section class="content-card"><h3>Friends <span class="count">${friends.length}</span></h3>${friends.map(u=>`<div class="friend-row">${avatar(u,"sm")}<div><b>${esc(u.name)}</b><small>${esc(u.location)}</small></div><button class="icon-btn" onclick="openChat(${u.id})">💬</button></div>`).join("")||"<p class='muted'>No friends yet.</p>"}</section>
  <section class="content-card danger-card"><h3>Account</h3><button class="btn danger full" onclick="logout()">Log out</button></section></aside></div>`;
}
function removeIncoming(id){state.user.incoming=state.user.incoming.filter(x=>x!==id);persist();renderProfile();}
function editProfile(){
  modal(`<div class="modal-head"><h2>Edit profile</h2><button onclick="closeModal()">×</button></div><form class="form-grid" onsubmit="saveProfile(event)"><label>Name<input name="name" value="${esc(state.user.name)}" required></label><label>Experience<select name="experience">${["Beginner","Intermediate","Advanced","Expert"].map(x=>`<option ${x===state.user.experience?"selected":""}>${x}</option>`).join("")}</select></label><label class="span-2">Bio<textarea name="bio">${esc(state.user.bio)}</textarea></label><button class="btn primary span-2">Save changes</button></form>`);
}
function saveProfile(e){e.preventDefault();const f=new FormData(e.target);state.user.name=f.get("name");state.user.initials=initials(state.user.name);state.user.experience=f.get("experience");state.user.bio=f.get("bio");persist();closeModal();toast("Profile updated!");renderProfile();}

function renderPreferences(){
  const interests=["adventure","cultural","nature","comfort","spiritual","photography"];
  app.innerHTML=`<section class="preferences-page"><div class="page-head center"><div><span class="eyebrow">PERSONALIZATION</span><h1>What kind of trekker are you?</h1><p>These choices shape your trail and companion recommendations.</p></div></div>
  <form class="preference-form" onsubmit="savePreferences(event)"><section class="content-card"><h2>Interests</h2><p class="muted">Choose everything that sounds like you.</p><div class="interest-grid">${interests.map(x=>`<button type="button" class="interest ${state.user.interests.includes(x)?"selected":""}" onclick="this.classList.toggle('selected')"><span>${({adventure:"⛰️",cultural:"🏛️",nature:"🌿",comfort:"🏡",spiritual:"✨",photography:"📷"})[x]}</span><b>${x[0].toUpperCase()+x.slice(1)}</b><small>${({adventure:"High altitude, remote, challenging",cultural:"Heritage, villages, monasteries",nature:"Lakes, forests, wildlife, views",comfort:"Easy, family-friendly, teahouse",spiritual:"Pilgrimage, meditation, peace",photography:"Sunrise, landscapes, storytelling"})[x]}</small></button>`).join("")}</div></section>
  <section class="content-card"><h2>Trip preferences</h2><div class="form-grid"><label>Experience<select name="experience"><option>Beginner</option><option ${state.user.experience==="Intermediate"?"selected":""}>Intermediate</option><option ${state.user.experience==="Advanced"?"selected":""}>Advanced</option><option ${state.user.experience==="Expert"?"selected":""}>Expert</option></select></label><label>Availability<select name="availability"><option>Weekends</option><option>Weekdays</option><option>Flexible</option><option>Long Breaks</option></select></label><label>Budget<select name="budget"><option>Low</option><option ${state.user.budget==="Medium"?"selected":""}>Medium</option><option>High</option><option>Very High</option></select></label><label>Languages<input name="languages" value="${esc(state.user.languages.join(", "))}" placeholder="Nepali, English"></label></div></section>
  <div class="form-actions"><button type="button" class="btn ghost" onclick="location.hash='#home'">Cancel</button><button class="btn primary">Save preferences</button></div></form></section>`;
}
function savePreferences(e){e.preventDefault();const selected=[...document.querySelectorAll(".interest.selected")].map(x=>x.querySelector("b").textContent.toLowerCase());const f=new FormData(e.target);state.user.interests=selected;state.user.experience=f.get("experience");state.user.availability=f.get("availability");state.user.budget=f.get("budget");state.user.languages=String(f.get("languages")).split(",").map(x=>x.trim()).filter(Boolean);persist();toast("Preferences saved!");location.hash="#home";}

function renderLogin(){
  app.innerHTML=`<section class="auth-page"><div class="auth-art"><span class="pill">🇳🇵 Hike Sathi</span><h1>Your next adventure starts with the right people.</h1><p>Discover Nepal's trails and connect with trekkers who match your style.</p><div class="auth-testimonial">“The easiest way to turn a solo trail idea into a group plan.”<small>— Hike Sathi community</small></div></div><div class="auth-card"><div class="auth-logo">⛰</div><span class="eyebrow">WELCOME BACK</span><h2>Log in to Hike Sathi</h2><p class="muted">Use the demo account or create your own local profile.</p><form onsubmit="login(event)"><label>Email<input name="email" type="email" value="aarya@example.com" required></label><label>Password<input name="password" type="password" value="password" required></label><div class="form-row"><label class="checkbox"><input type="checkbox"> Remember me</label><a href="#" onclick="toast('Password reset would connect to your backend email service.','info');return false">Forgot password?</a></div><button class="btn primary full">Log in</button></form><div class="auth-divider">or</div><button class="btn secondary full" onclick="demoLogin()">Continue with demo account</button><p class="auth-bottom">Don't have an account? <a href="#signup">Create one</a></p></div></section>`;
}
function login(e){e.preventDefault();state.loggedIn=true;persist();toast("Welcome back to Hike Sathi!");location.hash="#home";}
function demoLogin(){state.loggedIn=true;persist();toast("Demo account loaded!");location.hash="#home";}
function renderSignup(){
  app.innerHTML=`<section class="auth-page"><div class="auth-art signup-art"><span class="pill">CREATE YOUR SATHI PROFILE</span><h1>Tell us how you like to hike.</h1><p>Your profile helps Hike Sathi find better trails, groups and companions.</p><div class="signup-benefits"><span>✓ Trail recommendations</span><span>✓ Companion matching</span><span>✓ Groups & messaging</span></div></div><div class="auth-card"><div class="auth-logo">⛰</div><span class="eyebrow">JOIN THE COMMUNITY</span><h2>Create your account</h2><form onsubmit="signup(event)" class="form-grid"><label>Name<input name="name" required placeholder="Full name"></label><label>Email<input name="email" type="email" required placeholder="you@email.com"></label><label>Password<input name="password" type="password" required placeholder="••••••••"></label><label>Province<select name="province">${PROVINCES.slice(1).map(x=>`<option>${x}</option>`).join("")}</select></label><label>Experience<select name="experience"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select></label><label>District<input name="district" placeholder="e.g. Lalitpur"></label><button class="btn primary span-2">Create Hike Sathi account</button></form><p class="auth-bottom">Already have an account? <a href="#login">Log in</a></p></div></section>`;
}
function signup(e){e.preventDefault();const f=new FormData(e.target);state.user={...DEFAULT_USER,name:f.get("name"),email:f.get("email"),initials:initials(f.get("name")),province:f.get("province"),district:f.get("district")||"Not specified",experience:f.get("experience"),saved:[],completed:[],friends:[],incoming:[],sent:[]};state.loggedIn=true;persist();toast("Account created!");location.hash="#preferences";}

function modal(html){modalRoot.innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">${html}</div></div>`;}
function closeModal(){modalRoot.innerHTML="";}
function logout(){state.loggedIn=false;persist();toast("Logged out.","info");location.hash="#login";}

document.addEventListener("click",e=>{
  if(e.target.closest("#notification-btn")) toast("You have 2 new activity updates.","info");
  if(e.target.closest("#profile-shortcut")) location.hash=state.loggedIn?"#profile":"#login";
  if(e.target.closest("#mobile-menu")) document.getElementById("main-nav").classList.toggle("open");
});
window.addEventListener("hashchange",()=>{document.getElementById("main-nav").classList.remove("open");render();});
window.addEventListener("load",render);
