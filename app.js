// --- 1. 卡牌数据配置 ---
const CARDS_DATA = [
  {
    id: 'lovers',
    name: 'VI - THE LOVERS (恋人)',
    desc: '红恶魔与蓝天使同谐共生。爱跨越极性，接纳彼此的尖锐与温柔。',
    frontImage: 'assets/cat_lovers.jpg'
  },
  {
    id: 'fool',
    name: '0 - THE FOOL (愚者)',
    desc: '背对悬崖跃向星空与红蝶。纯真无畏的初心将指引你开启全新篇章。',
    frontImage: 'assets/cat_fool.jpg'
  },
  {
    id: 'magician',
    name: 'I - THE MAGICIAN (魔术师)',
    desc: '头顶无限符号，权杖指引万物。专注与创造力兼备，行动的最佳时刻已至。',
    frontImage: 'assets/cat_magician.jpg'
  },
  {
    id: 'moon',
    name: 'XVIII - THE MOON (月亮)',
    desc: '猫面弯月倒映在深邃池塘中。潜意识与梦境正在共鸣，跟随直觉破除迷惘。',
    frontImage: 'assets/cat_moon.jpg'
  }
];

// --- 2. 模拟 PS1 / Y2K 低保真像素降采样 ---
const LOW_RES_WIDTH = 380;
const LOW_RES_HEIGHT = Math.round(LOW_RES_WIDTH * (window.innerHeight / window.innerWidth));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0720);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 7.5);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(LOW_RES_WIDTH, LOW_RES_HEIGHT, false);
renderer.setPixelRatio(1);
document.getElementById('webgl-container').appendChild(renderer.domElement);

// --- 3. 光照与旋转背景 ---
const ambientLight = new THREE.AmbientLight(0xcfd8dc, 1.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffdf80, 2.2, 20);
pointLight.position.set(2, 4, 4);
scene.add(pointLight);

const blueLight = new THREE.PointLight(0x00c8ff, 1.5, 15);
blueLight.position.set(-3, -2, 3);
scene.add(blueLight);

function createStarburst() {
  const points = [];
  const spikes = 16;
  const outerR = 5.6;
  const innerR = 2.5;
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
  }
  const shape = new THREE.Shape(points);
  const geom = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshBasicMaterial({ color: 0x16123a, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.z = -1.5;
  return mesh;
}
const starburst = createStarburst();
scene.add(starburst);

// --- 4. 材质与几何体 ---
const textureLoader = new THREE.TextureLoader();
function loadPixelTexture(url) {
  const tex = textureLoader.load(url);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

const cardGeo = new THREE.BoxGeometry(2.1, 3.3, 0.06, 4, 6, 1);
const sideMat = new THREE.MeshStandardMaterial({
  color: 0xd4a017,
  roughness: 0.35,
  metalness: 0.6,
  flatShading: true
});
const backTexture = loadPixelTexture('assets/card_back.jpg');
const backMat = new THREE.MeshStandardMaterial({
  map: backTexture,
  roughness: 0.4,
  flatShading: true
});
const defaultFrontMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  roughness: 0.4,
  flatShading: true
});

// --- 5. 构建 7 张卡牌扇形牌堆 ---
const NUM_CARDS = 7;
const cardMeshes = [];
const cardsGroup = new THREE.Group();
scene.add(cardsGroup);

for (let i = 0; i < NUM_CARDS; i++) {
  const mats = [sideMat, sideMat, sideMat, sideMat, defaultFrontMat.clone(), backMat];
  const mesh = new THREE.Mesh(cardGeo, mats);
  mesh.userData = {
    index: i,
    targetX: 0,
    targetY: 0,
    targetRotZ: 0,
    targetRotY: Math.PI
  };
  mesh.rotation.y = Math.PI;
  cardMeshes.push(mesh);
  cardsGroup.add(mesh);
}

let appState = 'spread'; 
let selectedCard = null;
let chosenCardData = null;
let dragOffset = 0;
let targetDragOffset = 0;

function updateSpreadLayout() {
  cardMeshes.forEach((mesh, i) => {
    if (appState === 'spread') {
      const normalized = (i - (NUM_CARDS - 1) / 2);
      mesh.userData.targetX = normalized * 0.7 + dragOffset;
      mesh.userData.targetY = -Math.abs(normalized) * 0.12 - 0.2;
      mesh.userData.targetRotZ = -normalized * 0.08;
      mesh.userData.targetRotY = Math.PI;
      mesh.position.z = i * 0.03;
    }
  });
}
updateSpreadLayout();

// --- 6. 鼠标滑动与拾取交互 ---
let isPointerDown = false;
let startPointerX = 0;
let startDragOffset = 0;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => {
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
  if (appState !== 'spread') return;
  isPointerDown = true;
  startPointerX = e.clientX;
  startDragOffset = targetDragOffset;
});

window.addEventListener('pointermove', (e) => {
  if (isPointerDown && appState === 'spread') {
    const deltaX = (e.clientX - startPointerX) / window.innerWidth * 3.5;
    targetDragOffset = Math.max(-1.8, Math.min(1.8, startDragOffset + deltaX));
  }

  if (appState === 'spread') {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cardMeshes);

    cardMeshes.forEach(m => m.userData.isHovered = false);
    if (intersects.length > 0) {
      intersects[0].object.userData.isHovered = true;
    }
  }
});

window.addEventListener('pointerup', (e) => {
  if (!isPointerDown) return;
  const moveDist = Math.abs(e.clientX - startPointerX);
  isPointerDown = false;

  if (moveDist < 6 && appState === 'spread') {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cardMeshes);
    if (intersects.length > 0) {
      pickCard(intersects[0].object);
    }
  }
});

// --- 7. 聚集选牌逻辑 ---
const subPrompt = document.getElementById('subPrompt');
const drawBtn = document.getElementById('drawBtn');
const resetBtn = document.getElementById('resetBtn');
const questionInput = document.getElementById('questionInput');
const readingBox = document.getElementById('readingBox');
const cardTag = document.getElementById('cardTag');
const cardDesc = document.getElementById('cardDesc');

function pickCard(pickedMesh) {
  appState = 'picked';
  selectedCard = pickedMesh;

  subPrompt.innerText = 'PRESS [DRAW CARD] TO REVEAL DESTINY';
  drawBtn.disabled = false;
  drawBtn.classList.add('pulse-ready');

  cardMeshes.forEach(mesh => {
    if (mesh === pickedMesh) {
      mesh.userData.targetX = 0;
      mesh.userData.targetY = 0.6;
      mesh.userData.targetRotZ = 0;
      mesh.userData.targetRotY = Math.PI;
      mesh.position.z = 0.5;
    } else {
      mesh.userData.targetY = -8;
    }
  });
}

// --- 8. 抽牌揭晓与重置 ---
drawBtn.addEventListener('click', () => {
  if (appState !== 'picked' || !selectedCard) return;
  appState = 'flipped';
  drawBtn.disabled = true;
  drawBtn.classList.remove('pulse-ready');

  chosenCardData = CARDS_DATA[Math.floor(Math.random() * CARDS_DATA.length)];
  const frontTex = loadPixelTexture(chosenCardData.frontImage);
  selectedCard.material[4] = new THREE.MeshStandardMaterial({
    map: frontTex,
    roughness: 0.35,
    flatShading: true
  });

  selectedCard.userData.targetRotY = 0;

  setTimeout(() => {
    const question = questionInput.value.trim() || '心中所想';
    cardTag.innerText = chosenCardData.name;
    cardDesc.innerText = `【求问：${question}】\n` + chosenCardData.desc;
    readingBox.classList.remove('hidden');
    resetBtn.disabled = false;
  }, 1000);
});

resetBtn.addEventListener('click', () => {
  if (appState !== 'flipped') return;
  resetBtn.disabled = true;
  readingBox.classList.add('hidden');
  subPrompt.innerText = '◀ DRAG TO SPREAD CARDS & PICK ONE ▶';

  if (selectedCard) {
    selectedCard.userData.targetRotY = Math.PI;
  }

  setTimeout(() => {
    appState = 'spread';
    selectedCard = null;
    targetDragOffset = 0;
    dragOffset = 0;
    cardMeshes.forEach(m => {
      m.userData.targetRotY = Math.PI;
    });
  }, 600);
});

// --- 9. 主动画循环 ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  starburst.rotation.z = elapsedTime * 0.08;
  dragOffset += (targetDragOffset - dragOffset) * 0.1;
  updateSpreadLayout();

  cardMeshes.forEach(mesh => {
    const ud = mesh.userData;
    let hoverOffsetY = 0;
    if (appState === 'spread' && ud.isHovered) {
      hoverOffsetY = 0.3;
    } else if (appState === 'picked' && mesh === selectedCard) {
      hoverOffsetY = Math.sin(elapsedTime * 2.5) * 0.06;
    }

    mesh.position.x += (ud.targetX - mesh.position.x) * 0.1;
    mesh.position.y += ((ud.targetY + hoverOffsetY) - mesh.position.y) * 0.1;
    mesh.rotation.z += (ud.targetRotZ - mesh.rotation.z) * 0.1;
    mesh.rotation.y += (ud.targetRotY - mesh.rotation.y) * 0.1;
  });

  renderer.render(scene, camera);
}
animate();

// 窗口适配
window.addEventListener('resize', () => {
  const newH = Math.round(LOW_RES_WIDTH * (window.innerHeight / window.innerWidth));
  renderer.setSize(LOW_RES_WIDTH, newH, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
// ==========================================
// ♫ 音频模块 (真实 BGM 音频 assets/bgm.m4a + 8-bit 点击音效)
// ==========================================
let audioCtx = null;

// 1. 初始化背景音乐对象 (调用左侧 assets/bgm.m4a)
const bgmAudio = new Audio('assets/bgm.m4a');
bgmAudio.loop = true;      // 开启循环播放
bgmAudio.volume = 0.5;    // 设置合适音量 (0.0 ~ 1.0)
let isBgmPlaying = false;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// 2. 清脆按键音效 (8-bit High Blip)
function playClickSound() {
  initAudio();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.04);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
}

// 3. 卡牌翻转音效 (Card Flip Shimmer)
function playFlipSound() {
  initAudio();
  const now = audioCtx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
    gain.gain.setValueAtTime(0, now + idx * 0.06);
    gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.06 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.45);
  });
}

// 4. BGM 开关控制
const soundToggleBtn = document.getElementById('soundToggleBtn');
if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    playClickSound();
    if (!isBgmPlaying) {
      bgmAudio.play().then(() => {
        isBgmPlaying = true;
        soundToggleBtn.innerText = '♫ BGM: ON';
        soundToggleBtn.classList.add('playing');
      }).catch(err => {
        console.warn('播放被浏览器阻止，需用户主动触发交互:', err);
      });
    } else {
      bgmAudio.pause();
      isBgmPlaying = false;
      soundToggleBtn.innerText = '♫ BGM: OFF';
      soundToggleBtn.classList.remove('playing');
    }
  });
}

// 绑定抽卡和重置音效
drawBtn.addEventListener('click', () => {
  playClickSound();
  playFlipSound();
});

resetBtn.addEventListener('click', () => {
  playClickSound();
});

// 选牌点击音效
const originalPickCard = pickCard;
pickCard = function(pickedMesh) {
  playClickSound();
  originalPickCard(pickedMesh);
};