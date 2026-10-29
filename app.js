// --- 数据与卡牌配置 ---
const CARDS_DATA = [
  {
    id: 'lovers',
    name: '06 - THE LOVERS (恋人)',
    desc: '红恶魔与蓝天使同谐共生。爱跨越正邪极性，接纳彼此的尖锐与温柔。',
    frontImage: 'assets/cat_lovers.png' // 刚才你上传的那张双猫图片
  },
  {
    id: 'fool',
    name: '00 - THE FOOL (愚者)',
    desc: '带上小鱼干与三叉戟，无所畏惧迈入未知的数码虚空。',
    frontImage: 'assets/cat_lovers.png'
  },
  {
    id: 'star',
    name: '17 - THE STAR (星星)',
    desc: '多边形星芒照耀着深夜的灵感，光芒指引平静心境。',
    frontImage: 'assets/cat_lovers.png'
  }
];

// --- 像素降采样参数配置 (模拟 PS1 分辨率) ---
const LOW_RES_WIDTH = 360;
const LOW_RES_HEIGHT = Math.round(LOW_RES_WIDTH * (window.innerHeight / window.innerWidth));

// 1. 初始化场景与相机
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1259);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 7.5);

// 2. 降采样渲染器 (Pixel Downsampling)
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(LOW_RES_WIDTH, LOW_RES_HEIGHT, false);
renderer.setPixelRatio(1);
document.getElementById('webgl-container').appendChild(renderer.domElement);

// 3. 灯光配置
const ambientLight = new THREE.AmbientLight(0xb499ff, 1.2); // 淡紫环境光
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xfff5e6, 2.5, 20); // 暖白点光源产生多边形折射高光
pointLight.position.set(3, 4, 5);
scene.add(pointLight);

const cyanLight = new THREE.PointLight(0x00ffff, 1.5, 15);
cyanLight.position.set(-4, -2, 3);
scene.add(cyanLight);

// 4. 背景：16 角星芒多边形（Starburst）
function createStarburst() {
  const points = [];
  const spikes = 16;
  const outerR = 5.2;
  const innerR = 2.4;
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push(new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r));
  }
  const shape = new THREE.Shape(points);
  const geom = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshBasicMaterial({ color: 0x82b4ff, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.z = -1.2;
  return mesh;
}
const starburst = createStarburst();
scene.add(starburst);

// 5. 几何体细分与折面扰动
const textureLoader = new THREE.TextureLoader();
function loadPixelTexture(url) {
  const tex = textureLoader.load(url);
  tex.magFilter = THREE.NearestFilter; // 纹理保持像素颗粒不模糊
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

// 细分薄立方体
const cardGeo = new THREE.BoxGeometry(2.2, 3.4, 0.08, 6, 8, 2);

// 顶点微扰动制造多边形反光刻面
const posAttr = cardGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const z = posAttr.getZ(i);
  if (Math.abs(z) > 0.02) {
    posAttr.setZ(i, z + (Math.random() - 0.5) * 0.035);
  }
}
cardGeo.computeVertexNormals();

const sideMat = new THREE.MeshStandardMaterial({
  color: 0xff3b7a,
  roughness: 0.35,
  metalness: 0.1,
  flatShading: true
});

// 生成一张程序化的几何像素卡背（不需要外部贴图）
function createBackCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f0529';
  ctx.fillRect(0, 0, 128, 192);
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 112, 176);
  ctx.fillStyle = '#ff3e6c';
  ctx.beginPath();
  ctx.arc(64, 96, 28, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}
const backTexture = new THREE.CanvasTexture(createBackCanvas());
backTexture.magFilter = THREE.NearestFilter;

const backMat = new THREE.MeshStandardMaterial({
  map: backTexture,
  roughness: 0.4,
  flatShading: true
});

let frontMat = new THREE.MeshStandardMaterial({
  color: 0x22223b,
  roughness: 0.4,
  flatShading: true
});

// 立方体材质排列：[右, 左, 顶, 底, 正面, 背面]
const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
const cardMesh = new THREE.Mesh(cardGeo, materials);
cardMesh.rotation.y = Math.PI; // 默认卡背朝向玩家
scene.add(cardMesh);

// 6. 交互状态管理
let isFlipping = false;
let isFaceUp = false;
let targetRotationY = Math.PI;

const drawBtn = document.getElementById('drawBtn');
const resetBtn = document.getElementById('resetBtn');
const readingBox = document.getElementById('readingBox');
const cardTag = document.getElementById('cardTag');
const cardDesc = document.getElementById('cardDesc');

function drawCard() {
  if (isFlipping || isFaceUp) return;
  isFlipping = true;
  drawBtn.disabled = true;

  const randomCard = CARDS_DATA[Math.floor(Math.random() * CARDS_DATA.length)];

  const newFrontTex = loadPixelTexture(randomCard.frontImage);
  materials[4] = new THREE.MeshStandardMaterial({
    map: newFrontTex,
    roughness: 0.35,
    flatShading: true
  });
  cardMesh.material = materials;

  targetRotationY = 0; // 翻向正面

  setTimeout(() => {
    cardTag.innerText = randomCard.name;
    cardDesc.innerText = randomCard.desc;
    readingBox.classList.remove('hidden');
    resetBtn.disabled = false;
    isFlipping = false;
    isFaceUp = true;
  }, 1200);
}

function resetDeck() {
  if (isFlipping || !isFaceUp) return;
  isFlipping = true;
  resetBtn.disabled = true;
  readingBox.classList.add('hidden');

  targetRotationY = Math.PI; // 翻回背面

  setTimeout(() => {
    isFlipping = false;
    isFaceUp = false;
    drawBtn.disabled = false;
  }, 1000);
}

drawBtn.addEventListener('click', drawCard);
resetBtn.addEventListener('click', resetDeck);

// 7. 动画主循环
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  starburst.rotation.z = elapsedTime * 0.15;
  cardMesh.position.y = Math.sin(elapsedTime * 2) * 0.08;
  cardMesh.rotation.x = Math.sin(elapsedTime * 1.5) * 0.05;

  cardMesh.rotation.y += (targetRotationY - cardMesh.rotation.y) * 0.08;

  renderer.render(scene, camera);
}
animate();

// 8. 窗口缩放适配
window.addEventListener('resize', () => {
  const newH = Math.round(LOW_RES_WIDTH * (window.innerHeight / window.innerWidth));
  renderer.setSize(LOW_RES_WIDTH, newH, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});