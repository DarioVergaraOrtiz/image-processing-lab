let canvasO, canvasP, ctxO, ctxP;
let originalImage = null;

window.onload = () => {
  canvasO = document.getElementById("canvasOriginal");
  canvasP = document.getElementById("canvasProcessed");
  ctxO = canvasO.getContext("2d");
  ctxP = canvasP.getContext("2d");

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

    ctxO.drawImage(img, 0, 0);
    ctxP.drawImage(img, 0, 0);
    originalImage = ctxO.getImageData(0, 0, img.width, img.height);
  };
}

function reset() {
  if (!originalImage) return;
  ctxP.putImageData(originalImage, 0, 0);
}

function rotate() {
  if (!originalImage) return;
  let angle = +document.getElementById("angle").value * Math.PI / 180;
  let w = canvasO.width;
  let h = canvasO.height;

  ctxP.clearRect(0,0,w,h);
  ctxP.save();
  ctxP.translate(w/2, h/2);
  ctxP.rotate(angle);
  ctxP.drawImage(canvasO, -w/2, -h/2);
  ctxP.restore();
}

function scaleImg() {
  if (!originalImage) return;
  let s = +document.getElementById("scale").value / 100;
  let w = canvasO.width * s;
  let h = canvasO.height * s;

  canvasP.width = w;
  canvasP.height = h;
  ctxP.drawImage(canvasO, 0, 0, w, h);
}

function grayscale() {
  let img = ctxP.getImageData(0,0,canvasP.width,canvasP.height);
  let d = img.data;
  for (let i=0;i<d.length;i+=4){
    let g = (d[i]+d[i+1]+d[i+2])/3;
    d[i]=d[i+1]=d[i+2]=g;
  }
  ctxP.putImageData(img,0,0);
}

function sobel() {
  grayscale();
  let img = ctxP.getImageData(0,0,canvasP.width,canvasP.height);
  let d = img.data;
  for (let i=0;i<d.length;i+=4){
    d[i] = d[i] > 120 ? 255 : 0;
    d[i+1]=d[i+2]=d[i];
  }
  ctxP.putImageData(img,0,0);
}

function blurImg() {
  ctxP.filter = "blur(4px)";
  ctxP.drawImage(canvasP,0,0);
  ctxP.filter = "none";
}

function sharpen() {
  ctxP.filter = "contrast(150%)";
  ctxP.drawImage(canvasP,0,0);
  ctxP.filter = "none";
}

function exportImage() {
  let link = document.createElement("a");
  link.download = "processed.png";
  link.href = canvasP.toDataURL();
  link.click();
}
