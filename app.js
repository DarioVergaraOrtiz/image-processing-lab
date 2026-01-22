let originalMat = null;
let currentMat = null;

let canvasO, canvasP;

cv['onRuntimeInitialized'] = () => {
  canvasO = document.getElementById("canvasOriginal");
  canvasP = document.getElementById("canvasProcessed");

  document.getElementById("upload").addEventListener("change", loadImage);
};

function loadImage(e) {
  let img = new Image();
  img.src = URL.createObjectURL(e.target.files[0]);

  img.onload = () => {
    canvasO.width = img.width;
    canvasO.height = img.height;
    canvasP.width = img.width;
    canvasP.height = img.height;

    let ctx = canvasO.getContext("2d");
    ctx.drawImage(img, 0, 0);

    originalMat = cv.imread(canvasO);
    reset();
    initThree();
  };
}

function apply(fn) {
  if (!originalMat) return;

  currentMat = originalMat.clone();
  fn(currentMat);
  cv.imshow(canvasP, currentMat);
}

function reset() {
  if (!originalMat) return;
  currentMat = originalMat.clone();
  cv.imshow(canvasO, originalMat);
  cv.imshow(canvasP, currentMat);
}

function rotate() {
  let angle = +document.getElementById("angle").value;
  apply(mat => {
    let center = new cv.Point(mat.cols / 2, mat.rows / 2);
    let M = cv.getRotationMatrix2D(center, angle, 1);
    cv.warpAffine(mat, mat, M, mat.size());
  });
}

function scaleImg() {
  let s = +document.getElementById("scale").value / 100;
  apply(mat => {
    cv.resize(mat, mat, new cv.Size(0, 0), s, s, cv.INTER_CUBIC);
    canvasP.width = mat.cols;
    canvasP.height = mat.rows;
  });
}

function sobel() {
  apply(mat => {
    let gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
    cv.Sobel(gray, mat, cv.CV_8U, 1, 1);
    gray.delete();
  });
}

function canny() {
  let t1 = +document.getElementById("canny1").value;
  let t2 = +document.getElementById("canny2").value;

  apply(mat => {
    let gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, mat, t1, t2);
    gray.delete();
  });
}

function clahe() {
  apply(mat => {
    let lab = new cv.Mat();
    cv.cvtColor(mat, lab, cv.COLOR_RGBA2LAB);
    let channels = new cv.MatVector();
    cv.split(lab, channels);

    let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
    clahe.apply(channels.get(0), channels.get(0));

    cv.merge(channels, lab);
    cv.cvtColor(lab, mat, cv.COLOR_LAB2RGBA);
  });
}

function bilateral() {
  apply(mat => {
    cv.bilateralFilter(mat, mat, 9, 75, 75);
  });
}

function exportImage() {
  if (!currentMat) return;
  let link = document.createElement("a");
  link.download = "processed.png";
  link.href = canvasP.toDataURL();
  link.click();
}

const presets = {
  anime: mat => {
    cv.bilateralFilter(mat, mat, 9, 75, 75);
    let gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, mat, 80, 150);
    gray.delete();
  },
  sharpen: mat => {
    let kernel = cv.matFromArray(3, 3, cv.CV_32F,
      [0, -1, 0,
       -1, 5, -1,
       0, -1, 0]);
    cv.filter2D(mat, mat, -1, kernel);
  }
};

function applyPreset(name) {
  if (!name) return;
  apply(presets[name]);
}

/* THREE.JS */
function initThree() {
  const container = document.getElementById("three-container");
  container.innerHTML = "";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(300, 300);
  container.appendChild(renderer.domElement);

  const texture = new THREE.Texture(canvasP);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const geometry = new THREE.PlaneGeometry(2, 3);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  camera.position.z = 3;

  function animate() {
    requestAnimationFrame(animate);
    texture.needsUpdate = true;
    mesh.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
}
