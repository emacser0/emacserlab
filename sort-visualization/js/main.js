document.oncontextmenu = () => {return false;}

let visualizerCanvas = document.getElementById("canvas-visualizer");

let visualizer = visualizerCanvas.getContext("webgl2",  {preserveDrawingBuffer: true});

visualizerCanvas.width = visualizerCanvas.clientWidth;
visualizerCanvas.height = visualizerCanvas.clientHeight;

let objectRenderer = new GLObjectRenderer({
  glContext: visualizer,
  vertexShaderSource: document.getElementById("vertex-shader").innerText,
  fragmentShaderSource: document.getElementById("fragment-shader").innerText
});

objectRenderer.addObject("background-0", new GLRectangle(
  [
    [0, 0, 0],
    [0.5, 0, 0],
    [0, 0.5, 0],
    [0.5, 0.5, 0]
  ],
  [255, 255, 255]
));

objectRenderer.addObject("background-1", new GLRectangle(
  [
    [0, 0, 0.5],
    [0.5, 0, 0.5],
    [0, 0.5, 0.5],
    [0.5, 0.5, 0.5]
  ],
  [255, 0, 255]
));

objectRenderer.addObject("background-2", new GLRectangle(
  [
    [0.5, 0, 0],
    [0.5, 0.5, 0],
    [0.5, 0, 0.5],
    [0.5, 0.5, 0.5]
  ],
  [0, 0, 255]
));

objectRenderer.addObject("background-3", new GLRectangle(
  [
    [0, 0, 0.5],
    [0, 0.5, 0],
    [0, 0, 0.5],
    [0, 0.5, 0.5]
  ],
  [255, 0, 0]
));

function updateRotateMatrix() {
  let sinX = Math.sin(rotateX), cosX = Math.cos(rotateX);
  let sinY = Math.sin(rotateY), cosY = Math.cos(rotateY);
  let sinZ = Math.sin(rotateZ), cosZ = Math.cos(rotateZ);
  rotateMatrix[0][0] = cosY * cosZ;
  rotateMatrix[0][1] = cosX * sinZ + sinX * sinY * cosZ;
  rotateMatrix[0][2] = sinX * sinZ - cosX * sinY * cosZ;
  rotateMatrix[1][0] = -cosY * sinZ;
  rotateMatrix[1][1] = cosX * cosZ - sinX * sinY * sinZ;
  rotateMatrix[1][2] = sinX * cosZ + cosX * sinY * sinZ
  rotateMatrix[2][0] = sinY;
  rotateMatrix[2][1] = -sinX * cosY;
  rotateMatrix[2][2] = cosX * cosY;
}

let cameraPan = 0;
let cameraTilt = 0;

let cameraPosition = [0, 0, 0];

let cameraRotationMatrix = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1]
];

function updateCameraRotateMatrix() {
  let sinP = Math.sin(cameraPan), cosP = Math.cos(cameraPan);
  let sinT = Math.sin(cameraTilt), cosT = Math.cos(cameraTilt);

  cameraRotationMatrix[0][0] = cosP;
  cameraRotationMatrix[0][1] =  -sinP * sinT;
  cameraRotationMatrix[0][2] = -sinP * cosT;
  cameraRotationMatrix[1][0] = sinP;
  cameraRotationMatrix[1][1] = cosP * sinT;
  cameraRotationMatrix[1][2] = cosP * cosT;
  cameraRotationMatrix[2][0] = 0;
  cameraRotationMatrix[2][1] = -cosT;
  cameraRotationMatrix[2][2] = sinT;
}

let keys = {};

document.body.addEventListener("keydown", event => {
  keys[event.key] = true;
});

document.body.addEventListener("keyup", event => {
  keys[event.key] = false;
});

let sensitivity = 0.002;

let mouseButtons = {};

document.body.addEventListener("mousedown", event => {
  mouseButtons[event.button] = true;
})

document.body.addEventListener("mousemove", event => {
  if(mouseButtons[0] === true) {
    cameraPan += sensitivity * event.movementX;
    cameraTilt += sensitivity * event.movementY;
    updateCameraRotateMatrix();
  }

  if(mouseButtons[1] === true) {
    rotateY += sensitivity * event.movementX;
    updateRotateMatrix();
  }

  if(mouseButtons[2] === true) {
    rotateX += sensitivity * event.movementY;
    rotateZ += sensitivity * event.movementX;
    updateRotateMatrix();
  }
});

document.body.addEventListener("mouseup", event => {
  mouseButtons[event.button] = false;
});

document.body.addEventListener("wheel", event => {
  if(event.deltaY > 0) {
    cameraPosition[1] -= 0.05;
  }
  else if(event.deltaY < 0) {
    cameraPosition[1] += 0.05;
  }
});

let rotateX = 0;
let rotateY = 0;
let rotateZ = 0;

function handleKeyboardEvent() {
  if(keys["w"]) {
    cameraPosition[2] -= 0.05;
  }
  if(keys["a"]) {
    cameraPosition[0] -= 0.05;
  }
  if(keys["s"]) {
    cameraPosition[2] += 0.05;
  }
  if(keys["d"]) {
    cameraPosition[0] += 0.05;
  }
}

let renderloop = setInterval(() => {
  handleKeyboardEvent();

  objectRenderer.render((program, buffers) => {
    visualizer.uniform3f(
      program.uniformLocation("cameraPosition"),
      cameraPosition[0],
      cameraPosition[1],
      cameraPosition[2]
    )

    visualizer.uniformMatrix3fv(
      program.uniformLocation("cameraRotationMatrix"),
      false,
      new Float32Array(getFlattenArray(cameraRotationMatrix))
    );
  });
  console.log(cameraPan, cameraTilt);
}, 33);