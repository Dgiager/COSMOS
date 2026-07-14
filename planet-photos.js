(function(){
  const planets=[
    {id:'mercury',name:'Mercury',kind:'Planet',sub:'Inner planet · cratered world',mag:-0.4,distance:'57.9 million km from the Sun',size:'4,879 km diameter',detail:'88-day year',emoji:'☿',style:'planet',desc:'Mercury is the smallest planet and the closest to the Sun. Its ancient surface is covered in impact craters and steep cliffs left behind as the planet slowly cooled and shrank.',photo:'https://science.nasa.gov/wp-content/uploads/2023/05/mercury-from-messenger-pia15160-1920x640-1.jpg?w=1536'},
    {id:'venus',name:'Venus',kind:'Planet',sub:'Inner planet · cloud-covered world',mag:-4.2,distance:'108.2 million km from the Sun',size:'12,104 km diameter',detail:'225-day year',emoji:'♀',style:'planet',desc:'Venus is wrapped in dense clouds and has a crushing carbon-dioxide atmosphere. Beneath the clouds lies a volcanic landscape hotter than any other planetary surface in the solar system.',photo:'https://science.nasa.gov/wp-content/uploads/2023/05/venus-mariner-10-pia23791-1920x640-1.jpg?w=1536'},
    {id:'earth',name:'Earth',kind:'Planet',sub:'Home planet · ocean world',mag:-3.99,distance:'150 million km from the Sun',size:'12,756 km diameter',detail:'365.25-day year',emoji:'🌍',style:'planet',desc:'Earth is the only world known to support life. Liquid oceans cover most of its surface, while its atmosphere and magnetic field help protect a remarkably diverse biosphere.',photo:'https://science.nasa.gov/wp-content/uploads/2023/05/earth-1-jpg.webp?w=1600'},
    {id:'mars',name:'Mars',kind:'Planet',sub:'Red planet · dusty desert world',mag:-1.5,distance:'227.9 million km from the Sun',size:'6,779 km diameter',detail:'687-day year',emoji:'♂',style:'planet',desc:'Mars is a cold desert planet with canyons, volcanoes, polar ice, and evidence that liquid water once flowed across its surface. It remains one of the most studied worlds for possible ancient habitability.',photo:'https://science.nasa.gov/wp-content/uploads/2024/03/pia04304-mars.jpg?w=1536'},
    {id:'jupiter',name:'Jupiter',kind:'Planet',sub:'Gas giant · striped storm world',mag:-2.7,distance:'778.5 million km from the Sun',size:'139,820 km diameter',detail:'12-year orbit',emoji:'♃',style:'planet',desc:'Jupiter is the largest planet in the solar system. Its colorful cloud bands and Great Red Spot reveal powerful winds, towering storms, and a deep atmosphere made mostly of hydrogen and helium.',photo:'https://science.nasa.gov/wp-content/uploads/2024/03/jupiter-marble-pia22946.jpg?w=1536'},
    {id:'saturn',name:'Saturn',kind:'Planet',sub:'Gas giant · ringed world',mag:0.7,distance:'1.43 billion km from the Sun',size:'116,460 km diameter',detail:'29-year orbit',emoji:'♄',style:'planet',desc:'Saturn is famous for its spectacular ring system, built from countless icy particles. Beneath the rings is a giant world of golden clouds, fierce winds, and dozens of moons.',photo:'https://science.nasa.gov/wp-content/uploads/2023/05/saturn-farewell-pia21345-sse-banner-1920x640-1.jpg?w=1536'},
    {id:'uranus',name:'Uranus',kind:'Planet',sub:'Ice giant · tipped sideways',mag:5.7,distance:'2.87 billion km from the Sun',size:'50,724 km diameter',detail:'84-year orbit',emoji:'⛢',style:'planet',desc:'Uranus is an ice giant with a pale blue atmosphere colored by methane. Its rotation axis is tilted so far that the planet essentially rolls around the Sun on its side.',photo:'https://science.nasa.gov/wp-content/uploads/2023/06/uranus-pia18182-1920x640-1-jpg.webp?w=1536'},
    {id:'neptune',name:'Neptune',kind:'Planet',sub:'Ice giant · deep blue world',mag:7.8,distance:'4.50 billion km from the Sun',size:'49,244 km diameter',detail:'165-year orbit',emoji:'♆',style:'planet',desc:'Neptune is a dark blue ice giant known for supersonic winds and giant storms. It is the most distant major planet and was first discovered through mathematics before it was seen in a telescope.',photo:'https://science.nasa.gov/wp-content/uploads/2023/06/neptune-pia01492-1920x640-2-jpg.webp?w=1536'}
  ];

  if(typeof objects!=='undefined' && Array.isArray(objects)){
    for(const planet of planets){
      if(!objects.some(object=>object.id===planet.id)) objects.push(planet);
    }
    if(typeof catalogOffset!=='undefined') catalogOffset=Math.max(0,objects.length-planets.length);
  }

  const style=document.createElement('style');
  style.textContent='.viewer.photo-mode{display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle,#0f1737,#03050d)}.viewerimg{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:18px;transition:transform .18s ease;transform-origin:center}.photo-credit{position:absolute;right:12px;bottom:10px;z-index:3;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:6px 10px;font-size:10px;color:#dbe6ff}';
  document.head.appendChild(style);

  function ensurePhotoElements(){
    const viewer=document.querySelector('.viewer');
    if(!viewer) return {};
    let image=document.getElementById('objectImage');
    if(!image){
      image=document.createElement('img');
      image.id='objectImage';
      image.className='viewerimg hidden';
      image.alt='NASA planet photograph';
      image.referrerPolicy='no-referrer';
      viewer.appendChild(image);
    }
    let credit=document.getElementById('photoCredit');
    if(!credit){
      credit=document.createElement('span');
      credit.id='photoCredit';
      credit.className='photo-credit hidden';
      credit.textContent='Image: NASA';
      viewer.appendChild(credit);
    }
    return {viewer,image,credit};
  }

  function applyPhotoZoom(){
    if(!(selected&&selected.kind==='Planet')) return;
    const image=document.getElementById('objectImage');
    if(!image) return;
    zoom=Number(document.getElementById('zoomSlider').value);
    document.getElementById('zoomLabel').textContent=zoom.toFixed(1)+'×';
    image.style.transform='scale('+zoom+')';
  }

  function showPlanetPhoto(object){
    const elements=ensurePhotoElements();
    const canvas=document.getElementById('objectCanvas');
    if(!elements.viewer||!elements.image||!canvas) return;
    elements.viewer.classList.add('photo-mode');
    canvas.classList.add('hidden');
    elements.image.classList.remove('hidden');
    elements.credit.classList.remove('hidden');
    elements.image.alt=object.name+' photographed by a NASA mission';
    elements.image.onerror=function(){
      this.onerror=null;
      this.alt='The NASA photograph could not be loaded. Refresh and try again.';
      if(typeof toast==='function') toast('Planet photo could not load. Check your connection and refresh.');
    };
    elements.image.src=object.photo;
    applyPhotoZoom();
  }

  function hidePlanetPhoto(){
    const viewer=document.querySelector('.viewer');
    const image=document.getElementById('objectImage');
    const credit=document.getElementById('photoCredit');
    const canvas=document.getElementById('objectCanvas');
    if(viewer) viewer.classList.remove('photo-mode');
    if(canvas) canvas.classList.remove('hidden');
    if(image){image.classList.add('hidden');image.style.transform='scale(1)'}
    if(credit) credit.classList.add('hidden');
  }

  const originalOpenExplorer=openExplorer;
  openExplorer=function(id){
    originalOpenExplorer(id);
    if(selected&&selected.kind==='Planet'&&selected.photo) showPlanetPhoto(selected);
    else hidePlanetPhoto();
  };

  const originalUpdateZoom=updateZoom;
  updateZoom=function(){
    if(selected&&selected.kind==='Planet'&&selected.photo) applyPhotoZoom();
    else {hidePlanetPhoto();originalUpdateZoom();}
  };

  const originalDrawObject=drawObject;
  drawObject=function(){
    if(selected&&selected.kind==='Planet'&&selected.photo){showPlanetPhoto(selected);return;}
    hidePlanetPhoto();
    originalDrawObject();
  };

  if(typeof renderCatalog==='function'&&document.getElementById('dash')&&!document.getElementById('dash').classList.contains('hidden')) renderCatalog();
})();
