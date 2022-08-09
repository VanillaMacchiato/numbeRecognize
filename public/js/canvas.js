let model;
tf.loadLayersModel('model/model.json').then((md) => {
  model = md;
});

const useDrawingCanvas = () => {
  const canvas = document.getElementById('drawing-board');
  const toolbar = document.getElementById('toolbar');
  const ctx = canvas.getContext('2d');

  canvas.width = 400;
  canvas.height = 400;

  let isPainting = false;
  let lineWidth = 10;

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

  canvas.addEventListener('mousemove', draw);

  canvas.addEventListener('mouseup', (e) => {
    isPainting = false;
    ctx.stroke();
    ctx.beginPath();

    const img = canvas.toDataURL('image/png');

    const resizeCanvas = document.getElementById('dummy-canvas');
    const resizeCtx = resizeCanvas.getContext('2d');

    resizeCanvas.width = 28;
    resizeCanvas.height = 28;

    let resizeImage = new Image();

    resizeImage.onload = () => {
      resizeCtx.drawImage(resizeImage, 0, 0, resizeCanvas.width, resizeCanvas.height);

      dummyImage = document.getElementById('dummy-img');
      dummyImage.src = resizeCanvas.toDataURL('image/png');

      // process and predict the image
      const arr = resizeCtx.getImageData(0, 0, resizeCanvas.width, resizeCanvas.height);
      const mono = convertToMono(arr.data, resizeCanvas.width, resizeCanvas.height);
      const imageTensor = tf.tensor4d(mono, [1, resizeCanvas.width, resizeCanvas.height, 1]);

      const prediction = model.predict(imageTensor);
      
      // send to the document
      document.getElementById('result-number').innerText = prediction.argMax(1).dataSync()[0];
    };

    resizeImage.src = img;
  });
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

useDrawingCanvas();
