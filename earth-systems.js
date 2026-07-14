(function(){
  'use strict';

  const EARTH_DAY_KEY=()=>new Date().toISOString().slice(0,10);
  const defaultCenter=[36.2689,-98.4798];
  let earthMap=null;
  let layerGroups={warnings:null,quakes:null,events:null};
  let earthData={alerts:[],quakes:[],events:[],forecast:null};
  let activeLayer='all';
  let loadedOnce=false;

  const sources={
    radar:'https://radar.weather.gov/',
    hurricanes:'https://www.nhc.noaa.gov/',
    severe:'https://www.spc.noaa.gov/products/',
    satellite:'https://www.star.nesdis.noaa.gov/GOES/',
    lightningSafety:'https://www.weather.gov/safety/lightning'
  };

  if(typeof badgeDefs!=='undefined'){
    const additions=[
      {id:'earthobserver',icon:'🌎',name:'Earth Observer',desc:'Check the living Earth system.',test:p=>(p.earthChecks||0)>=1},
      {id:'stormaware',icon:'⛈️',name:'Storm Aware',desc:'Review official weather alerts.',test:p=>(p.alertChecks||0)>=1},
      {id:'quakewatcher',icon:'🌐',name:'Quake Watcher',desc:'Explore recent earthquake activity.',test:p=>(p.quakeChecks||0)>=1}
    ];
    additions.forEach(b=>{if(!badgeDefs.some(x=>x.id===b.id))badgeDefs.push(b)});
    if(typeof profile!=='undefined'&&profile&&typeof renderAll==='function')renderAll();
  }

  function addStyles(){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity='sha256-p4NxAoJBhIINfQ3ynFjMZ7bAqJmZyA2D1Pj2pAt5pJc=';
    link.crossOrigin='';
    document.head.appendChild(link);

    const style=document.createElement('style');
    style.textContent=`
      .earth-card{padding:22px;overflow:hidden}.earth-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}.earth-head h2{margin:4px 0}.earth-actions{display:flex;gap:8px;flex-wrap:wrap}.earth-warning{margin:14px 0;padding:12px 14px;border:1px solid rgba(255,216,117,.35);background:rgba(255,216,117,.08);border-radius:14px;font-size:12px;line-height:1.5;color:#f6e4b1}.earth-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:15px 0}.earth-metric{padding:14px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.045)}.earth-metric span,.earth-metric strong,.earth-metric small{display:block}.earth-metric span{font-size:10px;color:var(--muted);font-weight:900;letter-spacing:.08em}.earth-metric strong{font-size:24px;margin:5px 0}.earth-metric small{font-size:11px;color:var(--muted);line-height:1.35}.earth-layout{display:grid;grid-template-columns:1.18fr .82fr;gap:14px}.earth-map{height:520px;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#091127}.earth-panel{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.035);overflow:hidden}.earth-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:10px;border-bottom:1px solid var(--line)}.earth-tab{border:1px solid var(--line);background:rgba(255,255,255,.055);color:#fff;border-radius:11px;padding:9px 5px;font-size:11px;font-weight:850;cursor:pointer}.earth-tab.active{background:rgba(97,229,239,.18);border-color:rgba(97,229,239,.5)}.earth-feed{height:466px;overflow:auto;padding:10px}.earth-item{display:block;width:100%;text-align:left;color:#fff;border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:9px;background:rgba(255,255,255,.04);cursor:pointer}.earth-item:hover{background:rgba(255,255,255,.08)}.earth-item strong,.earth-item span,.earth-item small{display:block}.earth-item span{font-size:11px;color:var(--cyan);font-weight:900;margin-bottom:4px}.earth-item small{font-size:11px;color:var(--muted);line-height:1.4;margin-top:4px}.earth-links{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}.earth-link{border:1px solid var(--line);border-radius:13px;background:rgba(255,255,255,.05);color:#fff;padding:11px 8px;font-size:11px;font-weight:850;cursor:pointer}.earth-source{font-size:11px;color:var(--muted);margin-top:12px;line-height:1.45}.leaflet-container{font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#091127}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#101a3d;color:#fff}.leaflet-popup-content{line-height:1.4}.leaflet-control-attribution{font-size:9px}.earth-loading{opacity:.65;pointer-events:none}.score-good{color:#69e8a3}.score-fair{color:#ffd875}.score-poor{color:#ff8b79}
      @media(max-width:920px){.earth-layout{grid-template-columns:1fr}.earth-feed{height:320px}.earth-map{height:430px}.earth-summary{grid-template-columns:repeat(2,1fr)}.earth-links{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:520px){.earth-summary{grid-template-columns:1fr 1fr}.earth-map{height:360px}.earth-tabs{grid-template-columns:1fr 1fr}.earth-links{grid-template-columns:1fr 1fr}.earth-metric strong{font-size:20px}}
    `;
    document.head.appendChild(style);
  }

  function buildSection(){
    const dashboard=document.getElementById('dash');
    if(!dashboard||document.getElementById('earthSystems'))return;
    const safety=dashboard.querySelector('.safety');
    const section=document.createElement('section');
    section.id='earthSystems';
    section.className='earth-card card';
    section.innerHTML=`
      <div class="earth-head">
        <div><div class="eyebrow">EARTH SYSTEMS LIVE</div><h2>Storms, hazards, and observing conditions</h2><p class="muted">Official science feeds translated into one living map.</p></div>
        <div class="earth-actions"><button class="btn small" id="earthRefresh">Refresh Earth data</button><button class="btn small" id="earthLocate">Use current location</button></div>
      </div>
      <div class="earth-warning"><strong>Safety notice:</strong> COSMOS is an educational awareness tool, not a replacement for Wireless Emergency Alerts, NOAA Weather Radio, local officials, or official National Weather Service warning products.</div>
      <div class="earth-summary">
        <div class="earth-metric"><span>STARGAZING SCORE</span><strong id="stargazeScore">--</strong><small id="stargazeText">Load local conditions</small></div>
        <div class="earth-metric"><span>ACTIVE LOCAL ALERTS</span><strong id="alertCount">--</strong><small id="alertText">NWS warning feed</small></div>
        <div class="earth-metric"><span>M2.5+ EARTHQUAKES</span><strong id="quakeCount">--</strong><small>Past 24 hours</small></div>
        <div class="earth-metric"><span>NASA NATURAL EVENTS</span><strong id="eventCount">--</strong><small>Open events, last 30 days</small></div>
      </div>
      <div class="earth-layout">
        <div id="earthMap" class="earth-map"></div>
        <div class="earth-panel">
          <div class="earth-tabs">
            <button class="earth-tab active" data-earth-layer="all">All</button>
            <button class="earth-tab" data-earth-layer="warnings">Warnings</button>
            <button class="earth-tab" data-earth-layer="quakes">Quakes</button>
            <button class="earth-tab" data-earth-layer="events">NASA events</button>
          </div>
          <div id="earthFeed" class="earth-feed"><p class="muted">Choose Refresh Earth data to load live conditions.</p></div>
        </div>
      </div>
      <div class="earth-links">
        <button class="earth-link" data-earth-link="radar">📡 Official radar</button>
        <button class="earth-link" data-earth-link="hurricanes">🌀 Hurricanes</button>
        <button class="earth-link" data-earth-link="severe">⚡ Severe outlook</button>
        <button class="earth-link" data-earth-link="satellite">🛰 Satellite & lightning</button>
        <button class="earth-link" data-earth-link="lightningSafety">⛈ Lightning safety</button>
      </div>
      <p class="earth-source">Sources: NOAA/National Weather Service, NOAA/National Hurricane Center, NOAA/Storm Prediction Center, NOAA/NESDIS, U.S. Geological Survey, and NASA EONET. Data availability may be delayed or interrupted by the source service.</p>
    `;
    if(safety)dashboard.insertBefore(section,safety);else dashboard.appendChild(section);

    document.getElementById('earthRefresh').onclick=refreshEarth;
    document.getElementById('earthLocate').onclick=()=>{
      if(!navigator.geolocation)return toast('Location is not available in this browser');
      navigator.geolocation.getCurrentPosition(position=>{
        const c=position.coords;
        if(typeof setLocation==='function')setLocation('Current Location','Live Earth and sky',c.latitude,c.longitude,true);
        refreshEarth();
      },()=>toast('Location permission was not granted'),{timeout:10000});
    };
    document.querySelectorAll('[data-earth-layer]').forEach(button=>button.onclick=()=>setLayer(button.dataset.earthLayer));
    document.querySelectorAll('[data-earth-link]').forEach(button=>button.onclick=()=>window.open(sources[button.dataset.earthLink],'_blank','noopener'));
  }

  function loadLeaflet(){
    if(window.L)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin='';
      script.onload=resolve;script.onerror=reject;document.head.appendChild(script);
    });
  }

  function initMap(){
    if(earthMap||!window.L)return;
    const center=getCoordinates();
    earthMap=L.map('earthMap',{worldCopyJump:true}).setView(center,4);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(earthMap);
    layerGroups.warnings=L.layerGroup().addTo(earthMap);
    layerGroups.quakes=L.layerGroup().addTo(earthMap);
    layerGroups.events=L.layerGroup().addTo(earthMap);
    L.circleMarker(center,{radius:7,color:'#61e5ef',weight:2,fillColor:'#61e5ef',fillOpacity:.35}).addTo(earthMap).bindPopup('Your COSMOS expedition location');
  }

  function getCoordinates(){
    if(typeof loc!=='undefined'&&loc&&Number.isFinite(loc.lat)&&Number.isFinite(loc.lon))return[loc.lat,loc.lon];
    return defaultCenter;
  }

  async function fetchJson(url){
    const response=await fetch(url,{headers:{Accept:'application/geo+json, application/json'}});
    if(!response.ok)throw new Error(response.status+' '+response.statusText);
    return response.json();
  }

  async function refreshEarth(){
    const section=document.getElementById('earthSystems');
    if(!section)return;
    section.classList.add('earth-loading');
    document.getElementById('earthRefresh').textContent='Loading live feeds…';
    try{
      await loadLeaflet();initMap();
      const [lat,lon]=getCoordinates();
      if(earthMap)earthMap.setView([lat,lon],loadedOnce?earthMap.getZoom():5);
      const results=await Promise.allSettled([
        loadWeather(lat,lon),
        loadQuakes(),
        loadEvents()
      ]);
      const failures=results.filter(r=>r.status==='rejected');
      if(typeof profile!=='undefined'&&profile){
        profile.earthChecks=(profile.earthChecks||0)+1;
        profile.quakeChecks=(profile.quakeChecks||0)+1;
        profile.alertChecks=(profile.alertChecks||0)+1;
        if(typeof persist==='function')persist();
        if(typeof renderAll==='function')renderAll();
      }
      renderFeed();
      loadedOnce=true;
      if(failures.length)toast((3-failures.length)+' of 3 Earth feeds loaded. Some sources were unavailable.');
      else toast('Earth Systems updated from official feeds');
    }catch(error){
      console.error(error);toast('Earth Systems could not load. Check the connection and try again.');
    }finally{
      section.classList.remove('earth-loading');
      document.getElementById('earthRefresh').textContent='Refresh Earth data';
    }
  }

  async function loadWeather(lat,lon){
    const point=await fetchJson(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`);
    const forecastUrl=point.properties&&point.properties.forecastHourly;
    const [forecast,alerts]=await Promise.all([
      forecastUrl?fetchJson(forecastUrl):Promise.resolve({properties:{periods:[]}}),
      fetchJson(`https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`)
    ]);
    earthData.forecast=forecast.properties.periods||[];
    earthData.alerts=alerts.features||[];
    updateStargazing();
    document.getElementById('alertCount').textContent=earthData.alerts.length;
    document.getElementById('alertText').textContent=earthData.alerts.length?earthData.alerts[0].properties.event:'No active point alerts';
    plotWarnings();
  }

  function updateStargazing(){
    const periods=earthData.forecast||[];
    const period=periods.find(p=>p.isDaytime===false)||periods[0];
    if(!period){document.getElementById('stargazeText').textContent='Forecast unavailable';return;}
    const text=(period.shortForecast||'').toLowerCase();
    const pop=period.probabilityOfPrecipitation?.value||0;
    let score=78-pop*.45;
    if(text.includes('clear'))score+=15;
    if(text.includes('mostly clear'))score+=8;
    if(text.includes('partly cloudy'))score-=8;
    if(text.includes('mostly cloudy'))score-=24;
    if(text.includes('cloudy')&&!text.includes('partly'))score-=32;
    if(/thunder|rain|shower|snow|fog|drizzle/.test(text))score-=35;
    score=Math.round(Math.max(0,Math.min(100,score)));
    const el=document.getElementById('stargazeScore');
    el.textContent=score+'/100';
    el.className=score>=70?'score-good':score>=40?'score-fair':'score-poor';
    document.getElementById('stargazeText').textContent=`${period.name}: ${period.shortForecast} · ${period.temperature}°${period.temperatureUnit}`;
  }

  function warningColor(event=''){
    if(/tornado/i.test(event))return'#ff3b4d';
    if(/severe thunderstorm/i.test(event))return'#ff9f43';
    if(/flash flood|flood/i.test(event))return'#4bd37b';
    if(/winter|snow|ice|blizzard/i.test(event))return'#62b7ff';
    if(/heat/i.test(event))return'#ff6f61';
    return'#b18cff';
  }

  function plotWarnings(){
    if(!earthMap||!layerGroups.warnings)return;
    layerGroups.warnings.clearLayers();
    earthData.alerts.forEach(feature=>{
      if(!feature.geometry)return;
      const event=feature.properties.event||'Weather alert';
      L.geoJSON(feature,{style:{color:warningColor(event),weight:3,fillOpacity:.17}}).bindPopup(`<strong>${escapeHtml(event)}</strong><br>${escapeHtml(feature.properties.areaDesc||'')}<br><small>${escapeHtml(feature.properties.headline||'Official NWS alert')}</small>`).addTo(layerGroups.warnings);
    });
  }

  async function loadQuakes(){
    const data=await fetchJson('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
    earthData.quakes=(data.features||[]).sort((a,b)=>(b.properties.mag||0)-(a.properties.mag||0));
    document.getElementById('quakeCount').textContent=earthData.quakes.length;
    plotQuakes();
  }

  function plotQuakes(){
    if(!earthMap||!layerGroups.quakes)return;
    layerGroups.quakes.clearLayers();
    earthData.quakes.forEach(feature=>{
      const c=feature.geometry&&feature.geometry.coordinates;if(!c)return;
      const mag=Number(feature.properties.mag)||0;
      L.circleMarker([c[1],c[0]],{radius:Math.max(4,mag*1.8),color:'#ffd875',weight:1.5,fillColor:'#ff8c42',fillOpacity:.55})
        .bindPopup(`<strong>M${mag.toFixed(1)} earthquake</strong><br>${escapeHtml(feature.properties.place||'Location unavailable')}<br><small>${new Date(feature.properties.time).toLocaleString()}</small>`)
        .addTo(layerGroups.quakes);
    });
  }

  async function loadEvents(){
    const data=await fetchJson('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=30&limit=60');
    earthData.events=data.events||[];
    document.getElementById('eventCount').textContent=earthData.events.length;
    plotEvents();
  }

  function eventColor(title=''){
    if(/wildfire/i.test(title))return'#ff714a';
    if(/storm|cyclone|hurricane|typhoon/i.test(title))return'#61e5ef';
    if(/volcano/i.test(title))return'#d45cff';
    if(/ice|snow/i.test(title))return'#b9e8ff';
    return'#9c8cff';
  }

  function plotEvents(){
    if(!earthMap||!layerGroups.events)return;
    layerGroups.events.clearLayers();
    earthData.events.forEach(event=>{
      const geometry=event.geometry&&event.geometry[event.geometry.length-1];
      if(!geometry||geometry.type!=='Point'||!Array.isArray(geometry.coordinates))return;
      const [longitude,latitude]=geometry.coordinates;
      const category=(event.categories&&event.categories[0]&&event.categories[0].title)||'Natural event';
      L.circleMarker([latitude,longitude],{radius:7,color:eventColor(category),weight:2,fillColor:eventColor(category),fillOpacity:.35})
        .bindPopup(`<strong>${escapeHtml(event.title)}</strong><br>${escapeHtml(category)}<br><small>NASA EONET · ${new Date(geometry.date).toLocaleDateString()}</small>`)
        .addTo(layerGroups.events);
    });
  }

  function setLayer(layer){
    activeLayer=layer;
    document.querySelectorAll('[data-earth-layer]').forEach(b=>b.classList.toggle('active',b.dataset.earthLayer===layer));
    if(earthMap){
      Object.entries(layerGroups).forEach(([name,group])=>{
        const show=layer==='all'||layer===name;
        if(show&&!earthMap.hasLayer(group))group.addTo(earthMap);
        if(!show&&earthMap.hasLayer(group))earthMap.removeLayer(group);
      });
    }
    renderFeed();
  }

  function renderFeed(){
    const feed=document.getElementById('earthFeed');if(!feed)return;
    const items=[];
    if(activeLayer==='all'||activeLayer==='warnings'){
      earthData.alerts.forEach(feature=>items.push({type:'NWS ALERT',title:feature.properties.event||'Weather alert',text:feature.properties.headline||feature.properties.areaDesc||'',latlon:centerOfGeometry(feature.geometry),url:feature.properties['@id']||feature.id}));
    }
    if(activeLayer==='all'||activeLayer==='quakes'){
      earthData.quakes.slice(0,18).forEach(feature=>{const c=feature.geometry.coordinates;items.push({type:`USGS · M${Number(feature.properties.mag||0).toFixed(1)}`,title:feature.properties.place||'Earthquake',text:new Date(feature.properties.time).toLocaleString(),latlon:[c[1],c[0]],url:feature.properties.url})});
    }
    if(activeLayer==='all'||activeLayer==='events'){
      earthData.events.slice(0,18).forEach(event=>{const g=event.geometry&&event.geometry[event.geometry.length-1];items.push({type:'NASA · '+((event.categories&&event.categories[0]?.title)||'EVENT'),title:event.title,text:g?new Date(g.date).toLocaleDateString():'Open event',latlon:g&&g.type==='Point'?[g.coordinates[1],g.coordinates[0]]:null,url:event.sources&&event.sources[0]?.url})});
    }
    if(!items.length){feed.innerHTML='<p class="muted">No items are available for this layer, or the feed has not loaded yet.</p>';return;}
    feed.innerHTML=items.map((item,index)=>`<button class="earth-item" data-earth-item="${index}"><span>${escapeHtml(item.type)}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.text)}</small></button>`).join('');
    feed.querySelectorAll('[data-earth-item]').forEach(button=>button.onclick=()=>{
      const item=items[Number(button.dataset.earthItem)];
      if(item.latlon&&earthMap){earthMap.setView(item.latlon,Math.max(earthMap.getZoom(),6));}
      if(item.url)window.open(item.url,'_blank','noopener');
    });
  }

  function centerOfGeometry(geometry){
    if(!geometry)return null;
    let points=[];
    if(geometry.type==='Point')points=[geometry.coordinates];
    else if(geometry.type==='Polygon')points=geometry.coordinates.flat();
    else if(geometry.type==='MultiPolygon')points=geometry.coordinates.flat(2);
    if(!points.length)return null;
    const sum=points.reduce((a,p)=>[a[0]+p[0],a[1]+p[1]],[0,0]);
    return[sum[1]/points.length,sum[0]/points.length];
  }

  function escapeHtml(value){return String(value||'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}

  addStyles();
  buildSection();
  if(typeof activeId!=='undefined'&&activeId&&document.getElementById('dash')&&!document.getElementById('dash').classList.contains('hidden')){
    setTimeout(refreshEarth,500);
  }
})();
