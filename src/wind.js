import * as THREE from 'three'

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const angleDisplay = document.getElementById("angleDisplay");

canvas.style.backgroundColor = "black";
canvas.style.borderRadius = "50%";
canvas.width = 100;
canvas.height = 100;
const radius = canvas.width / 2 - 10;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

var angleObj = {
  angle: 0
}

var wind = {
  angle: 1.3,
  speed: 10,
  getWindVector(){
    return new THREE.Vector3(Math.cos(this.angle), 0, Math.sin(this.angle)).multiplyScalar(this.speed)
  },
}

function drawCircle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#ff8800";
  ctx.lineWidth = 3;
  ctx.stroke();

  const handleX = centerX + radius * Math.cos(angleObj.angle);
  const handleY = centerY + radius * Math.sin(angleObj.angle);
  ctx.beginPath();
  ctx.arc(handleX, handleY, 5, 0, 2 * Math.PI); 
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
  angleObj.angle = calculateAngle(pos);
  drawCircle();
  updateAngleDisplay();

  function onMouseMove(event) {
    const pos = getMousePos(event);
    angleObj.angle = calculateAngle(pos);
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
  const degrees = (angleObj.angle * (180 / Math.PI) + 360) % 360;
  let finalAngle = 360 - degrees;
  let radians = degreesToRadians(finalAngle);
  wind.angle = radians;
  angleDisplay.innerText = `${finalAngle.toFixed(2)}°`;
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

drawCircle();

export { wind }