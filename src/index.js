import './main.css';

const init = () => {
  const getBody = document.getElementById('display');
  const createDisplay = document.createElement('div');
  createDisplay.style.width = `${1024}px`;
  createDisplay.style.height = `${512}px`;
  createDisplay.style.backgroundColor = 'rgb(41 41 41)';
  createDisplay.id = 'canvas';

  getBody.appendChild(createDisplay);
};
const mapX = 8;
const mapY = 8;
const mapS = mapX * mapY;
const mapArr = [
  // eslint-disable-next-line prettier/prettier
    1,1,1,1,1,1,1,1,
    1,0,1,0,0,0,0,1,
    1,0,1,0,0,0,0,1,
  // eslint-disable-next-line prettier/prettier
    1,0,1,0,0,0,0,1,
    1,0,0,0,0,0,0,1,
    1,0,0,0,0,1,0,1,
  // eslint-disable-next-line prettier/prettier
    1,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,
];

const loadMap = () => {
  let x0;
  let y0;
  for (let i = 0; i < mapX; i++) {
    for (let j = 0; j < mapY; j++) {
      let color = '#000000';
      if (mapArr[j * mapX + i] === 1) {
        color = '#ffffff';
      }
      x0 = j * mapS;
      y0 = i * mapS;
      const canvas = document.getElementById('canvas');
      const createWall = document.createElement('div');
      createWall.style.width = `${64}px`;
      createWall.style.height = `${64}px`;
      createWall.style.backgroundColor = color;
      createWall.style.position = 'absolute';
      createWall.style.top = `${x0}px`;
      createWall.style.left = `${y0}px`;
      canvas.appendChild(createWall);
    }
  }
};

const player = () => {
  let playerX = 300;
  let playerY = 300;
  let deltaX = 0;
  let deltaY = 0;
  let angle = 0;
  const drawPlayer = () => {
    const canvas = document.getElementById('canvas');
    const createPlayer = document.createElement('div');
    createPlayer.style.position = 'relative';
    createPlayer.style.width = `${8}px`;
    createPlayer.style.height = `${8}px`;
    createPlayer.style.top = `${playerY}px`;
    createPlayer.style.left = `${playerX}px`;
    createPlayer.style.backgroundColor = 'yellow';
    createPlayer.style.zIndex = '10';
    createPlayer.id = 'player';

    const faceLine = document.createElement('div');
    faceLine.style.width = '2px';
    faceLine.style.height = '12px';
    faceLine.style.backgroundColor = 'yellow';
    faceLine.style.position = 'absolute';
    faceLine.style.transform = `translateX(-50%)`;
    faceLine.style.zIndex = `11`;
    faceLine.id = 'faceLine';

    const centerX = playerX + 8 / 2;
    const centerY = playerY - 4 / 2;
    const x = centerX + 10 * Math.cos(angle);
    const y = centerY + 10 * Math.sin(angle);
    faceLine.style.top = `${y}px`;
    faceLine.style.left = `${x}px`;
    faceLine.style.transform = `rotate(${angle + 1.5708}rad)`;
    canvas.appendChild(faceLine);

    for (let i = 0; i < 60; i++) {
      const rayLine = document.createElement('div');
      rayLine.style.position = 'absolute';
      rayLine.style.zIndex = '10';
      rayLine.style.height = '1px';
      rayLine.style.width = '0px';
      rayLine.style.backgroundColor = 'green';
      rayLine.classList.add('line');

      canvas.appendChild(rayLine);
    }

    canvas.appendChild(createPlayer);
  };
  const movePlayer = () => {
    document.addEventListener('keydown', (e) => {
      let newPlayerX = playerX;
      let newPlayerY = playerY;
      if (e.code === 'KeyW') {
        newPlayerX += deltaX;
        newPlayerY += deltaY;
      }
      if (e.code === 'KeyS') {
        newPlayerX -= deltaX;
        newPlayerY -= deltaY;
      }
      if (e.code === 'KeyA') {
        angle -= 0.1;
        if (angle < 0) {
          angle += 2 * Math.PI;
        }
        deltaX = Math.cos(angle) * 5;
        deltaY = Math.sin(angle) * 5;
      }
      if (e.code === 'KeyD') {
        angle += 0.1;
        if (angle > 2 * Math.PI) {
          angle -= 2 * Math.PI;
        }
        deltaX = Math.cos(angle) * 5;
        deltaY = Math.sin(angle) * 5;
      }
      const playerCollisionTopX = Math.floor((newPlayerX + 8) / 64);
      const playerCollisionTopY = Math.floor((newPlayerY + 8) / 64);
      const playerCollisionX = Math.floor(newPlayerX / 64);
      const playerCollisionY = Math.floor(newPlayerY / 64);
      const getPlayer = document.getElementById('player');
      if (mapArr[playerCollisionY * mapX + playerCollisionX] === 0) {
        if (mapArr[playerCollisionTopY * mapX + playerCollisionTopX] === 0) {
          playerX = newPlayerX;
          playerY = newPlayerY;

          getPlayer.style.top = `${playerY}px`;
          getPlayer.style.left = `${playerX}px`;
        }
      }
      const centerX = getPlayer.offsetLeft + getPlayer.offsetWidth / 2;
      const centerY = getPlayer.offsetTop + getPlayer.offsetHeight / 2;
      const x = centerX + 10 * Math.cos(angle);
      const y = centerY + 10 * Math.sin(angle);

      const getFaceLine = document.getElementById('faceLine');

      getFaceLine.style.top = `${y - getFaceLine.offsetHeight / 2}px`;
      getFaceLine.style.left = `${x - getFaceLine.offsetWidth / 2}px`;
      getFaceLine.style.transform = `rotate(${angle + 1.5708}rad)`;
      rayCast();
    });
  };
  const createRayLine = (startX, startY, endX, endY, line, angleNew) => {
    const getPlayer = document.getElementById('player');
    const getLine = line;
    // Calculate the angle and length of the ray line
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx ** 2 + dy ** 2);
    getLine.style.width = `${length}px`;

    const centerX = getPlayer.offsetLeft + getPlayer.offsetWidth / 2;
    const centerY = getPlayer.offsetTop + getPlayer.offsetHeight / 2;

    const x = centerX + (length / 2) * Math.cos(angleNew);
    const y = centerY + (length / 2) * Math.sin(angleNew);

    getLine.style.top = `${y - getLine.offsetHeight / 2}px`;
    getLine.style.left = `${x - getLine.offsetWidth / 2}px`;
    getLine.style.transform = `rotate(${angleNew}rad)`;
  };

  const rayCast = () => {
    const DR = 0.0174533;
    const getlines = document.getElementsByClassName('line');
    let ra = angle - DR * 30;
    for (let i = 0; i < 60; i++) {
      let rx = playerX;
      let ry = playerY;

      while (!mapArr[Math.floor(ry / 64) * mapX + Math.floor(rx / 64)]) {
        rx += Math.cos(ra);
        ry += Math.sin(ra);
      }

      createRayLine(playerX, playerY, rx, ry, getlines[i], ra);
      ra += DR;
    }
  };
  return { drawPlayer, movePlayer };
};

init();
const newPlayer = player();
newPlayer.drawPlayer();
newPlayer.movePlayer();

const newMap = loadMap();
