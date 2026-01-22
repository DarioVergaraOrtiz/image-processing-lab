let img = new Image();
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let originalMat;

document.getElementById("upload").addEventListener("change", e => {
  let file = e.target.files[0];
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    originalMat = cv.imread(canvas);
  };
});

function reset() {
  cv.imshow(canvas, originalMat);
}

function rotate() {
  let src = cv.imread(canvas);
  let dst = new cv.Mat();
  let center = new cv.Point(src.cols/2, src.rows/2);
  let M = cv.getRotationMatrix2D(center, 45, 1);
  cv.warpAffine(src, dst, M, src.size());
  cv.imshow(canvas, dst);
  src.delete(); dst.delete();
}

function scale() {
  let src = cv.imread(canvas);
  let dst = new cv.Mat();
  cv.resize(src, dst, new cv.Size(0,0), 1.5, 1.5, cv.INTER_CUBIC);
  canvas.width = dst.cols;
  canvas.height = dst.rows;
  cv.imshow(canvas, dst);
  src.delete(); dst.delete();
}

function sobel() {
  let src = cv.imread(canvas);
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.Sobel(gray, dst, cv.CV_8U, 1, 1);
  cv.imshow(canvas, dst);
  src.delete(); gray.delete(); dst.delete();
}

function canny() {
  let src = cv.imread(canvas);
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.Canny(gray, dst, 100, 200);
  cv.imshow(canvas, dst);
  src.delete(); gray.delete(); dst.delete();
}

function clahe() {
  let src = cv.imread(canvas);
  let lab = new cv.Mat();
  cv.cvtColor(src, lab, cv.COLOR_RGBA2LAB);
  let channels = new cv.MatVector();
  cv.split(lab, channels);
  let clahe = new cv.CLAHE(2.0, new cv.Size(8,8));
  clahe.apply(channels.get(0), channels.get(0));
  cv.merge(channels, lab);
  cv.cvtColor(lab, lab, cv.COLOR_LAB2RGBA);
  cv.imshow(canvas, lab);
  src.delete(); lab.delete();
}

function bilateral() {
  let src = cv.imread(canvas);
  let dst = new cv.Mat();
  cv.bilateralFilter(src, dst, 9, 75, 75);
  cv.imshow(canvas, dst);
  src.delete(); dst.delete();
}
