const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

const boundary = canvas.getBoundingClientRect();

canvas.width = 400;
canvas.height = 400;

let isPainting = false;
let lineWidth = 10;
let startX;
let startY;

toolbar.addEventListener('click', (e) => {
  if (e.target.id === 'clear') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});

toolbar.addEventListener('change', (e) => {
  if (e.target.id === 'lineWidth') {
    lineWidth = e.target.value;
  }
});

const draw = (e) => {
  if (!isPainting) {
    return;
  }

  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  const boundary = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - boundary.left, e.clientY - boundary.top);
  ctx.stroke();
};

canvas.addEventListener('mousedown', (e) => {
  isPainting = true;
  startX = e.clientX;
  startY = e.clientY;
});

canvas.addEventListener('mouseup', (e) => {
  isPainting = false;
  ctx.stroke();
  ctx.beginPath();

  const img = canvas.toDataURL('image/png');
  console.log(img.size)

  document.getElementById('result').src = img;
});

canvas.addEventListener('mousemove', draw);
