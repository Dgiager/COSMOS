'use strict';
const cities=[
  ['Fairview, Oklahoma','Founding Observatory No. 1',36.2689,-98.4798],
  ['London, England','Northern sky',51.5072,-.1276],
  ['Nairobi, Kenya','Equatorial sky',-1.2921,36.8219],
  ['Tokyo, Japan','Northern sky',35.6762,139.6503],
  ['Sydney, Australia','Southern sky',-33.8688,151.2093],
  ['Ushuaia, Argentina','Far southern sky',-54.8019,-68.303]
];

const objects=[
{id:'sirius',name:'Sirius',kind:'Star',sub:'Canis Major · brightest night-sky star',ra:6.7525,dec:-16.716,mag:-1.46,distance:'8.6 light-years',size:'1.71 Suns',detail:'9,940 K',emoji:'✦',style:'starBlue',desc:'Sirius is a brilliant binary star system. Its intense blue-white light comes from Sirius A, while a faint white dwarf companion called Sirius B circles nearby.'},
{id:'vega',name:'Vega',kind:'Star',sub:'Lyra · future north star',ra:18.616,dec:38.784,mag:.03,distance:'25 light-years',size:'2.36 Suns',detail:'9,602 K',emoji:'✧',style:'starBlue',desc:'Vega is one of the three stars of the Summer Triangle. Rapid rotation makes it slightly flattened, and Earth’s precession will place it near the north celestial pole in roughly 12,000 years.'},
{id:'betelgeuse',name:'Betelgeuse',kind:'Star',sub:'Orion · red supergiant',ra:5.92,dec:7.407,mag:.5,distance:'About 550 light-years',size:'Hundreds of Suns wide',detail:'3,500 K',emoji:'✹',style:'starRed',desc:'Betelgeuse is an enormous red supergiant nearing the end of its life. Its brightness changes as its outer atmosphere expands, contracts, and sheds material.'},
{id:'polaris',name:'Polaris',kind:'Star',sub:'Ursa Minor · North Star',ra:2.53,dec:89.264,mag:1.98,distance:'About 323 light-years',size:'About 46 Suns wide',detail:'6,015 K',emoji:'✦',style:'starGold',desc:'Polaris sits close to the north celestial pole, so northern skywatchers see other stars appear to circle around it. It is actually a multiple-star system.'},
{id:'antares',name:'Antares',kind:'Star',sub:'Scorpius · red supergiant',ra:16.49,dec:-26.432,mag:.96,distance:'About 550 light-years',size:'About 680 Suns wide',detail:'3,660 K',emoji:'✹',style:'starRed',desc:'Antares marks the heart of Scorpius. Its reddish color inspired a name meaning rival of Mars, and its immense atmosphere would extend beyond Mars if placed at the center of our solar system.'},
{id:'deneb',name:'Deneb',kind:'Star',sub:'Cygnus · luminous supergiant',ra:20.691,dec:45.28,mag:1.25,distance:'Roughly 2,600 light-years',size:'About 200 Suns wide',detail:'8,525 K',emoji:'✧',style:'starBlue',desc:'Deneb looks bright despite its enormous distance because it is one of the most luminous stars visible to the unaided eye. It forms a corner of the Summer Triangle.'},
{id:'andromeda',name:'Andromeda Galaxy',kind:'Galaxy',sub:'M31 · nearest large galactic neighbor',ra:.712,dec:41.269,mag:3.44,distance:'2.5 million light-years',size:'About 220,000 light-years',detail:'Around 1 trillion stars',emoji:'🌀',style:'spiral',desc:'The Andromeda Galaxy is the closest large spiral galaxy to the Milky Way. The two galaxies are gravitationally approaching and are expected to merge billions of years from now.'},
{id:'whirlpool',name:'Whirlpool Galaxy',kind:'Galaxy',sub:'M51 · interacting spiral pair',ra:13.498,dec:47.195,mag:8.4,distance:'About 23 million light-years',size:'About 76,000 light-years',detail:'Active star formation',emoji:'🌀',style:'spiral',desc:'The Whirlpool Galaxy displays clear spiral arms shaped by its interaction with a smaller companion. Bright knots in the arms are regions where new stars are forming.'},
{id:'sombrero',name:'Sombrero Galaxy',kind:'Galaxy',sub:'M104 · edge-on galaxy',ra:12.667,dec:-11.623,mag:8,distance:'About 29 million light-years',size:'About 50,000 light-years',detail:'Large central bulge',emoji:'🌌',style:'edge',desc:'The Sombrero Galaxy is famous for its bright central bulge and dark dust lane. Its unusual shape is best seen nearly edge-on from Earth.'},
{id:'triangulum',name:'Triangulum Galaxy',kind:'Galaxy',sub:'M33 · Local Group spiral',ra:1.564,dec:30.66,mag:5.72,distance:'2.7 million light-years',size:'About 60,000 light-years',detail:'40 billion stars',emoji:'🌀',style:'spiral',desc:'Triangulum is the third-largest galaxy in the Local Group. Under exceptionally dark skies, it is among the most distant objects visible to the unaided eye.'},
{id:'centaurusA',name:'Centaurus A',kind:'Galaxy',sub:'NGC 5128 · active galaxy',ra:13.425,dec:-43.019,mag:6.84,distance:'About 12 million light-years',size:'About 60,000 light-years',detail:'Supermassive black hole',emoji:'🌌',style:'dust',desc:'Centaurus A is a peculiar galaxy crossed by a thick dust lane. Its active core launches enormous radio-emitting jets powered by a supermassive black hole.'},
{id:'blackeye',name:'Black Eye Galaxy',kind:'Galaxy',sub:'M64 · dusty spiral',ra:12.946,dec:21.682,mag:8.52,distance:'About 17 million light-years',size:'About 54,000 light-years',detail:'Counter-rotating gas',emoji:'🌌',style:'dust',desc:'The Black Eye Galaxy has a dark band of absorbing dust in front of its bright center. Its outer gas rotates opposite the inner material, likely due to an ancient galactic collision.'}
];

const ranks=[['Stargazer',0],['Sky Scout',100],['Constellation Hunter',250],['Cosmic Navigator',500],['Galaxy Ranger',900],['Stellar Captain',1500],['Master of COSMOS',2500]];
const badgeDefs=[
{id:'firstlight',icon:'🌟',name:'First Light',desc:'Log your first cosmic discovery.',test:p=>p.discoveries.length>=1},
{id:'mission',icon:'🎯',name:'Mission Ready',desc:'Complete your first daily challenge.',test:p=>p.totalChallenges>=1},
{id:'scholar',icon:'🔭',name:'Star Scholar',desc:'Log five star discoveries.',test:p=>p.discoveries.filter(id=>findObj(id)?.kind==='Star').length>=5},
{id:'galaxy',icon:'🌀',name:'Galaxy Gazer',desc:'Log a galaxy discovery.',test:p=>p.discoveries.some(id=>findObj(id)?.kind==='Galaxy')},
{id:'cartographer',icon:'🧭',name:'Cosmic Cartographer',desc:'Use device location for your expedition.',test:p=>p.usedGPS},
{id:'collector',icon:'🏅',name:'Badge Collector',desc:'Build a broad exploration record.',test:p=>p.discoveries.length>=6&&p.totalChallenges>=3},
{id:'veteran',icon:'🚀',name:'Mission Veteran',desc:'Complete ten challenges.',test:p=>p.totalChallenges>=10},
{id:'captain',icon:'👑',name:'Stellar Captain',desc:'Reach 1,500 XP.',test:p=>p.xp>=1500}
];
