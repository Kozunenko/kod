// Polling-based Whiteboard client
const ROOM_ID = "room_989"; // replace after gen_config
const API = "http://localhost:8000";
const FILTERS = ["blur", "invert"];
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

// Стиль лінії
ctx.lineWidth = 2;
ctx.strokeStyle = "black";

// ініціалізуємо select, якщо потрібно
const select = document.getElementById("filter-select");
if (select.options.length === 0) {
  FILTERS.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    select.appendChild(opt);
  });
}

// малювання мишею
let drawing = false;

canvas.addEventListener('mousedown', () => {
  drawing = true;
  ctx.beginPath(); // починаємо нову лінію
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
  ctx.beginPath(); // закінчуємо лінію
});

canvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const cmd = { x: e.clientX - rect.left, y: e.clientY - rect.top, type: "line" };
  sendCommand(cmd);
  draw(cmd);
});

// кнопка Apply Filter
document.getElementById("apply-filter")
        .addEventListener("click", applyFilter);

async function applyFilter() {
  const { width, height } = canvas;

  // Додаємо білий фон під малюнок (для інверсії)
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  const imgData = ctx.getImageData(0, 0, width, height);
  const dataArray = Array.from(imgData.data);
  const filterName = select.value;

  const res = await fetch(`${API}/filter/${ROOM_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_data: dataArray,
      filter_name: filterName,
      width,
      height
    })
  });

  const json = await res.json();
  const newData = new Uint8ClampedArray(json.image_data);
  ctx.putImageData(new ImageData(newData, width, height), 0, 0);
}

// кнопка Refresh
document.getElementById('refresh').onclick = poll;

function draw(cmd) {
  ctx.lineTo(cmd.x, cmd.y);
  ctx.stroke();
}

async function sendCommand(cmd) {
  await fetch(`${API}/draw/${ROOM_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
}

async function poll() {
  const res = await fetch(`${API}/draw/${ROOM_ID}`);
  const cmds = await res.json();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  cmds.forEach(draw);
}

// початкове завантаження
poll();
