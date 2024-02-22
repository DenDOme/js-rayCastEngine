const canvasRaycast = () => {
  const canvas = document.getElementById('canvas');
  // player-things
  let playerX = 100;
  let playerY = 100;
  let deltaX = 0;
  let deltaY = 0;
  let angle = 0;
  // map-things
  const mapX = 8;
  const mapY = 8;
  const mapS = mapX * mapY;
  const mapArr = [
    // eslint-disable-next-line prettier/prettier
      1,1,1,1,1,1,1,1,
      1,0,0,0,1,0,0,1,
      1,0,1,0,1,0,0,1,
    // eslint-disable-next-line prettier/prettier
      1,0,1,0,1,0,0,1,
      1,0,1,0,0,0,0,1,
      1,0,1,0,1,0,0,1,
    // eslint-disable-next-line prettier/prettier
      1,0,0 ,0,1,0,0,1,
      1,1,1,1,1,1,1,1,
  ];
  const loadMap = () => {
    for (let i = 0; i < mapX; i++) {
      for (let j = 0; j < mapY; j++) {
        const newBlock = canvas.getContext('2d');
        if (mapArr[j * mapX + i] === 1) {
          newBlock.fillStyle = '#ffffff';
        } else {
          newBlock.fillStyle = '#000000';
        }
        const x0 = i * mapS;
        const y0 = j * mapS;
        const x1 = x0 + mapS;
        const y1 = y0;
        const x2 = x0 + mapS;
        const y2 = y0 + mapS;
        const x3 = x0;
        const y3 = y0 + mapS;

        newBlock.beginPath();
        newBlock.moveTo(x0 + 1, y0 + 1);
        newBlock.lineTo(x1 - 1, y1 + 1);
        newBlock.lineTo(x2 - 1, y2 - 1);
        newBlock.lineTo(x3 + 1, y3 - 1);
        newBlock.closePath();
        newBlock.fill();
      }
    }
  };

  const player = () => {
    const newPlayer = canvas.getContext('2d');
    newPlayer.fillStyle = 'yellow';
    const playerSize = 8;
    newPlayer.fillRect(playerX, playerY, playerSize, playerSize);
    const movePlayer = () => {
      let w = 0;
      let a = 0;
      let s = 0;
      let d = 0;
      document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
          w = 1;
        }
        if (e.code === 'KeyS') {
          s = 1;
        }
        if (e.code === 'KeyA') {
          a = 1;
        }
        if (e.code === 'KeyD') {
          d = 1;
        }
      });
      document.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') {
          w = 0;
        }
        if (e.code === 'KeyS') {
          s = 0;
        }
        if (e.code === 'KeyA') {
          a = 0;
        }
        if (e.code === 'KeyD') {
          d = 0;
        }
      });
      const movePlayerOnKey = () => {
        newPlayer.clearRect(0, 0, canvas.width, canvas.height);
        loadMap();
        let newPlayerX = playerX;
        let newPlayerY = playerY;
        deltaX = Math.cos(angle) * 2;
        deltaY = Math.sin(angle) * 2;
        if (w === 1) {
          newPlayerX += deltaX;
          newPlayerY += deltaY;
        }
        if (s === 1) {
          newPlayerX -= deltaX;
          newPlayerY -= deltaY;
        }
        if (a === 1) {
          angle -= 0.05;
          if (angle < 0) {
            angle += 2 * Math.PI;
          }
          deltaX = Math.cos(angle) * 5;
          deltaY = Math.sin(angle) * 5;
        }
        if (d === 1) {
          angle += 0.05;
          if (angle > 2 * Math.PI) {
            angle -= 2 * Math.PI;
          }
          deltaX = Math.cos(angle) * 5;
          deltaY = Math.sin(angle) * 5;
        }

        let xf = playerSize;
        if (deltaX < 0) {
          xf = -3;
        } else {
          xf = playerSize;
        }
        let yf = playerSize;
        if (deltaY < 0) {
          yf = -3;
        } else {
          yf = playerSize;
        }
        let xb = playerSize;
        if (deltaX > 0) {
          xb = 0;
        } else {
          xb = -playerSize;
        }
        let yb = playerSize;
        if (deltaY > 0) {
          yb = 0;
        } else {
          yb = -playerSize;
        }

        const playerCollisionTopX = Math.floor((newPlayerX + xf) / 64);
        const playerCollisionTopY = Math.floor((newPlayerY + yf) / 64);
        const playerCollisionBotX = Math.floor((newPlayerX - xb) / 64);
        const playerCollisionBotY = Math.floor((newPlayerY - yb) / 64);
        const playerCollisionX = Math.floor(newPlayerX / 64);
        const playerCollisionY = Math.floor(newPlayerY / 64);

        if (w === 1) {
          if (mapArr[playerCollisionY * mapX + playerCollisionTopX] === 0) {
            playerX = newPlayerX;
          }
          if (mapArr[playerCollisionTopY * mapX + playerCollisionX] === 0) {
            playerY = newPlayerY;
          }
        }
        if (s === 1) {
          if (mapArr[playerCollisionY * mapX + playerCollisionBotX] === 0) {
            playerX = newPlayerX;
          }
          if (mapArr[playerCollisionBotY * mapX + playerCollisionX] === 0) {
            playerY = newPlayerY;
          }
        }

        drawPlayer(playerX, playerY);
        rayCast();
        requestAnimationFrame(movePlayerOnKey);
      };
      movePlayerOnKey();
    };
    const rayCast = () => {
      const DR = 0.0174533;
      let ra = angle - DR * 30;
      let distance = 10000000;
      let hx;
      let hr;
      for (let i = 0; i < 60; i++) {
        let rx = playerX;
        let ry = playerY;

        while (!mapArr[Math.floor(ry / 64) * mapX + Math.floor(rx / 64)]) {
          rx += Math.cos(ra);
          ry += Math.sin(ra);
        }
        hx = rx;
        hr = ry;
        distance = dist(playerX, playerY, hx, hr);

        const centerX = playerX + playerSize / 2;
        const centerY = playerY + playerSize / 2;

        createRayLine(centerX, centerY, rx, ry);

        let ca = angle - ra;
        if (ca < 0) {
          ca += 2 * Math.PI;
        }
        if (ca > 2 * Math.PI) {
          ca -= 2 * Math.PI;
        }
        distance *= Math.cos(ca);

        let lineHeight = (mapS * 320) / distance;
        if (lineHeight > 320) {
          lineHeight = 320;
        }
        const lineO = 160 - lineHeight / 2;
        draw3DWall(i * 8 + 530, lineHeight, lineO);

        ra += DR;
      }
    };

    const draw3DWall = (x, lineHeight, lineO) => {
      const newDrawBlock = canvas.getContext('2d');
      newDrawBlock.fillStyle = 'red';
      newDrawBlock.fillRect(x, 160 + lineO, 8, lineHeight);
    };

    const createRayLine = (startX, startY, endX, endY) => {
      const rayline = canvas.getContext('2d');
      rayline.beginPath();
      rayline.moveTo(startX, startY);
      rayline.lineTo(endX, endY);
      rayline.strokeStyle = '#00ff00';
      rayline.stroke();
    };

    // Function to draw the player
    const drawPlayer = (x, y) => {
      newPlayer.fillStyle = 'yellow'; // Player color
      newPlayer.fillRect(x, y, playerSize, playerSize);
    };
    movePlayer();
    rayCast();
  };

  const dist = (sx, sy, ex, ey) => Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);

  loadMap();
  player();
};
export default canvasRaycast;
