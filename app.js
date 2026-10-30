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
const LOW_RES_WIDTH = 360;
const LOW_RES_HEIGHT = Math.round(LOW_RES_WIDTH * (window.innerHeight / window.innerWidth));

// 初始化场景与相机
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0b29); // 配合卡牌夜空色调

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 7.2);

// 降采样像素渲染器
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(LOW_RES_WIDTH, LOW_RES_HEIGHT, false);
renderer.setPixelRatio(1);
document.getElementById('webgl-container').appendChild(renderer.domElement);

// --- 3. 光照与氛围 ---
const ambientLight = new THREE.AmbientLight(0xcfd8dc, 1.4); // 柔和冷白环境光
scene.add(ambientLight);

// 暖金点光源（衬托金色边框的折面高光）
const pointLight = new THREE.PointLight(0xffdf80, 2.2, 20);
pointLight.position.set(3, 4, 4);
scene.add(pointLight);

// 辅助青蓝补光
const blueLight = new THREE.PointLight(0x00c8ff, 1.2, 15);
blueLight.position.set(-4, -2, 3);
scene.add(blueLight);

// --- 4. 背景：旋转 16 角星芒 ---
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
  const mat = new THREE.MeshBasicMaterial({ color: 0x1d1a4d, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.z = -1.2;
  return mesh;
}
const starburst = createStarburst();
scene.add(starburst);

// --- 5. 几何体细分与多面体卡牌构建 ---
const textureLoader = new THREE.TextureLoader();
function loadPixelTexture(url) {
  const tex = textureLoader.load(url);
  tex.magFilter = THREE.NearestFilter; // 保持像素颗粒感，不发生羽化模糊
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

// 塔罗牌几何体：宽 2.2, 高 3.4, 厚 0.08，带面细分
const cardGeo = new THREE.BoxGeometry(2.2, 3.4, 0.08, 6, 8, 2);

// 对几何体微调顶点制造硬棱角折面反光
const posAttr = cardGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const z = posAttr.getZ(i);
  if (Math.abs(z) > 0.02) {
    posAttr.setZ(i, z + (Math.random() - 0.5) * 0.03);
  }
}
cardGeo.computeVertexNormals();

// 金色卡牌侧切面材质
const sideMat = new THREE.MeshStandardMaterial({
  color: 0xd4a017,
  roughness: 0.35,
  metalness: 0.6,
  flatShading: true
});

// 加载你设计的卡背图片
const backTexture = loadPixelTexture('assets/card_back.jpg');
const backMat = new THREE.MeshStandardMaterial({
  map: backTexture,
  roughness: 0.4,
  flatShading: true
});

// 默认未抽牌时的正面材质
let frontMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  roughness: 0.4,
  flatShading: true
});

// 立方体材质分配：[右, 左, 顶, 底, 正面, 背面]
const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
const cardMesh = new THREE.Mesh(cardGeo, materials);
cardMesh.rotation.y = Math.PI; // 初始状态背面朝向玩家
scene.add(cardMesh);

// --- 6. 交互状态逻辑 ---
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

  // 随机抽取一张牌
  const randomCard = CARDS_DATA[Math.floor(Math.random() * CARDS_DATA.length)];

  // 加载该牌的高清多边形纹理
  const newFrontTex = loadPixelTexture(randomCard.frontImage);
  materials[4] = new THREE.MeshStandardMaterial({
    map: newFrontTex,
    roughness: 0.35,
    flatShading: true
  });
  cardMesh.material = materials;

  // 翻转目标设定为正面朝向（0弧度）
  targetRotationY = 0;

  // 延时呈现文字反馈
  setTimeout(() => {
    cardTag.innerText = randomCard.name;
    cardDesc.innerText = randomCard.desc;
    readingBox.classList.remove('hidden');
    resetBtn.disabled = false;
    isFlipping = false;
    isFaceUp = true;
  }, 1100);
}

function resetDeck() {
  if (isFlipping || !isFaceUp) return;
  isFlipping = true;
  resetBtn.disabled = true;
  readingBox.classList.add('hidden');

  // 翻转回背面（Math.PI 弧度）
  targetRotationY = Math.PI;

  setTimeout(() => {
    isFlipping = false;
    isFaceUp = false;
    drawBtn.disabled = false;
  }, 900);
}

// 绑定按钮事件
drawBtn.addEventListener('click', drawCard);
resetBtn.addEventListener('click', resetDeck);

// 点击 3D 卡牌本身也能触发翻牌（提升自然交互体验）
window.addEventListener('click', (event) => {
  // 排除点击输入框和按钮的误触
  if (event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') return;
  if (!isFaceUp && !isFlipping) {
    drawCard();
  }
});

// --- 7. 动画主循环 ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // 背景星芒缓慢旋转
  starburst.rotation.z = elapsedTime * 0.12;

  // 卡牌日常悬浮与轻微呼吸摆动
  cardMesh.position.y = Math.sin(elapsedTime * 2.2) * 0.08;
  cardMesh.rotation.x = Math.sin(elapsedTime * 1.5) * 0.04;

  // 平滑插值翻转动画 (Lerp)
  cardMesh.rotation.y += (targetRotationY - cardMesh.rotation.y) * 0.09;

  renderer.render(scene, camera);
}
animate();

// --- 8. 窗口自适应 ---
window.addEventListener('resize', () => {
  const newH = Math.round(LOW_RES_WIDTH * (window.innerHeight / window.innerWidth));
  renderer.setSize(LOW_RES_WIDTH, newH, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});