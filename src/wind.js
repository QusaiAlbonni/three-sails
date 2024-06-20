const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const angleDisplay = document.getElementById("angleDisplay");

canvas.style.backgroundColor = "black";
canvas.style.borderRadius = "50%";
canvas.width = 100;
canvas.height = 100;
console.log("asdasd");
const radius = canvas.width / 2 - 10;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
import { camera } from "./script";
let angle = 0;

function drawCircle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#ff8800";
  ctx.lineWidth = 3; // تقليل سمك الخط ليناسب الحجم الجديد
  ctx.stroke();

  const handleX = centerX + radius * Math.cos(angle);
  const handleY = centerY + radius * Math.sin(angle);
  ctx.beginPath();
  ctx.arc(handleX, handleY, 5, 0, 2 * Math.PI); // تقليل حجم النقطة
  ctx.fillStyle = "#ff8800";
  ctx.fill();
}

function getMousePos(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function calculateAngle(pos) {
  const dx = pos.x - centerX;
  const dy = pos.y - centerY;
  return Math.atan2(dy, dx);
}

canvas.addEventListener("mousedown", function (event) {
  const pos = getMousePos(event);
  angle = calculateAngle(pos);
  drawCircle();
  updateAngleDisplay();

  function onMouseMove(event) {
    const pos = getMousePos(event);
    angle = calculateAngle(pos);
    drawCircle();
    updateAngleDisplay();
  }

  function onMouseUp() {
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseup", onMouseUp);
  }

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup", onMouseUp);
});

function updateAngleDisplay() {
  const degrees = (angle * (180 / Math.PI) + 360) % 360;
  let finalAngle = 360 - degrees;
  console.log(finalAngle);
  angleDisplay.innerText = `${finalAngle.toFixed(2)}°`;
}

drawCircle();
// export default wind;
