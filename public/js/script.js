let model;
tf.loadLayersModel('model/model.json').then((md) => {
  model = md;
});

const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

const initializeToolbar = (canvas, toolbar, ctx) => {
  toolbar.addEventListener('click', (e) => {
    if (e.target.id === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById('result-number').innerText = '-';
      clearBarChart();
    }
  });

  toolbar.addEventListener('change', (e) => {
    if (e.target.id === 'lineWidth') {
      lineWidth = e.target.value;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.shadowBlur = lineWidth / 4;
      ctx.shadowColor = '#111';
    }
  });
};

const useDrawingCanvas = (canvas, ctx) => {
  canvas.width = 350;
  canvas.height = 350;

  let isPainting = false;
  ctx.lineWidth = 10;

  const draw = (e) => {
    if (!isPainting) {
      return;
    }

    const boundary = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - boundary.left, e.clientY - boundary.top);
    ctx.stroke();
  };

  canvas.addEventListener('mousedown', (e) => {
    isPainting = true;
  });

  canvas.addEventListener('mousemove', draw);

  canvas.addEventListener('mouseup', (e) => {
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();

    const img = canvas.toDataURL('image/png');

    runPrediction(img);
  });
};

const runPrediction = (img) => {
  const resizeCanvas = document.getElementById('dummy-canvas');
  const resizeCtx = resizeCanvas.getContext('2d');

  resizeCanvas.width = 28;
  resizeCanvas.height = 28;

  let resizeImage = new Image();

  resizeImage.onload = () => {
    resizeCtx.drawImage(resizeImage, 0, 0, resizeCanvas.width, resizeCanvas.height);

    // process and predict the image
    const arr = resizeCtx.getImageData(0, 0, resizeCanvas.width, resizeCanvas.height);
    const mono = convertToMono(arr.data, resizeCanvas.width, resizeCanvas.height);
    const imageTensor = tf.tensor4d(mono, [1, resizeCanvas.width, resizeCanvas.height, 1]);

    const prediction = model.predict(imageTensor);

    // send to the document
    document.getElementById('result-number').innerText = prediction.argMax(1).dataSync()[0];

    updateBarChart(Array.from(prediction.dataSync()));
  };

  resizeImage.src = img;
};

const convertToMono = (arr, width, height) => {
  const result = new Float32Array(width * height);

  let idx;
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      idx = j * 4 * width + i * 4;
      result[j * width + i] = arr[idx + 3] / 255.0;
    }
  }

  return result;
};

// BAR CHART
let HEIGHT = 300,
  WIDTH = 500,
  margin = { top: 30, right: 0, bottom: 60, left: 30 };
let x = d3.scaleBand().range([0, WIDTH]).paddingInner(0.25);
let y = d3.scaleLog().range([HEIGHT, 0]);
let svg;

const initializeBarChart = (data) => {
  svg = d3
    .select('#detail-chart')
    .attr('width', WIDTH + margin.left + margin.right)
    .attr('height', HEIGHT + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  function createAxisLeft(data) {
    y.domain([10e-7, 1.0]).nice();

    svg.append('g').call(d3.axisLeft(y));
  }

  function createAxisBottom(data) {
    x.domain(data.map((e) => e.toString()));

    svg.append('g').attr('transform', `translate(0, ${HEIGHT})`).call(d3.axisBottom(x)).style('font-size', '16px');
  }

  createAxisLeft(data);
  createAxisBottom(data);
};

const clearBarChart = () => {
  svg.selectAll('.bars').remove();
};

const updateBarChart = (arr) => {
  const data = arr.map((e, i) => ({ name: i.toString(), value: e }));
  console.log(data);

  clearBarChart();
  function createBars(data) {
    let bars = svg
      .selectAll('.bars')
      .data(data, (d) => d)
      .enter()
      .append('g')
      .attr('class', 'bars')
      .style('opacity', 1)
      .attr('transform', `translate(0, -1)`);

    bars
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.name))
      .attr('width', x.bandwidth())
      .style('fill', 'aquamarine')
      .attr('y', (d) => y(d.value))
      .attr('height', (d) => Math.max(0, HEIGHT - y(d.value)))
      .style('margin', '10px');
  }


  createBars(data);
};

initializeToolbar(canvas, toolbar, ctx);
useDrawingCanvas(canvas, ctx);
initializeBarChart([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
