import { startMapW, startMapF, startMapC, startMapX, startMapY, startPlayerX, startPlayerY, startPlayerAng} from "../assets/maps/startMap.js";
import ROUNDEDBRICKWALL from '../assets/textures/ROUNDBRICKS.js'
import PATHROCKSFLOOR from "../assets/textures/PATHROCKS.js";
import HEXAGONSCIELING from "../assets/textures/HEXAGONS.js";
import LAVA from '../assets/textures/LAVA.js';

const PI = Math.PI;
const PI2 = Math.PI/2
const PI3 = 3*Math.PI/2

const canvasRaycast = () => {
  const canvas = document.getElementById('canvas');
  let playerX = startPlayerX;
  let playerY = startPlayerY;
  let angle = startPlayerAng; 
  const mapX = startMapX;
  const mapY = startMapY;
  const mapS = mapX * mapY;
  const mapW = startMapW;
  const mapF = startMapF;
  const mapC = startMapC;
  let deltaX = 0;
  let deltaY = 0;

  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;

  canvas.height = windowHeight;
  canvas.width = windowWidth

  const loadMap = () => {
    for (let i = 0; i < mapX; i++) {
      for (let j = 0; j < mapY; j++) {
        const newBlock = canvas.getContext('2d');
        if (mapW[j * mapX + i] > 0) {
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
    const keys = { w: 0, a: 0, s: 0, d: 0 };

    const movePlayer = () => {
      const handleKey = (e, value) => {
        switch (e.code) {
          case 'KeyW':
            keys.w = value;
            break;
          case 'KeyS':
            keys.s = value;
            break;
          case 'KeyA':
            keys.a = value;
            break;
          case 'KeyD':
            keys.d = value;
            break;
        }
      };

      document.addEventListener('keydown', (e) => handleKey(e, 1));
      document.addEventListener('keyup', (e) => handleKey(e, 0));
      movePlayerOnKey();
    };

    const movePlayerOnKey = () => {
      newPlayer.clearRect(0, 0, canvas.width, canvas.height);

      // loadMap();

      let newPlayerX = playerX;
      let newPlayerY = playerY;

      const speed = 5;
      const rotationSpeed = 0.075;
      deltaX = Math.cos(angle) * speed;
      deltaY = Math.sin(angle) * speed;

      if (keys.w === 1) {
        newPlayerX += deltaX;
        newPlayerY += deltaY;
      }
      if (keys.s === 1) {
        newPlayerX -= deltaX;
        newPlayerY -= deltaY;
      }
      if (keys.a === 1 || keys.d === 1) {
        angle += keys.a === 1 ? -rotationSpeed : rotationSpeed;
        angle = (angle + 2 * Math.PI) % (2 * Math.PI);
    
        deltaX = Math.cos(angle) * speed;
        deltaY = Math.sin(angle) * speed;
      }

      const xf = deltaX < 0 ? -3 : playerSize;
      const yf = deltaY < 0 ? -3 : playerSize;
      const xb = deltaX > 0 ? 0 : -playerSize;
      const yb = deltaY > 0 ? 0 : -playerSize;

      const playerCollisionTopX = Math.floor((newPlayerX + xf)>>6);
      const playerCollisionTopY = Math.floor((newPlayerY + yf)>>6);
      const playerCollisionBotX = Math.floor((newPlayerX - xb)>>6);
      const playerCollisionBotY = Math.floor((newPlayerY - yb)>>6);
      const playerCollisionX = Math.floor(newPlayerX>>6);
      const playerCollisionY = Math.floor(newPlayerY>>6);

      const isPathClear = (y, x) => mapW[y * mapX + x] === 0 && mapF[y * mapX + x] > 0;

      if (keys.w === 1) {
        if (isPathClear(playerCollisionY, playerCollisionTopX)) playerX = newPlayerX;
        if (isPathClear(playerCollisionTopY, playerCollisionX)) playerY = newPlayerY;
      }
      if (keys.s === 1) {
        if (isPathClear(playerCollisionY, playerCollisionBotX)) playerX = newPlayerX;
        if (isPathClear(playerCollisionBotY, playerCollisionX)) playerY = newPlayerY;
      }

      // drawPlayer(playerX, playerY);
      rayCast();
      requestAnimationFrame(movePlayerOnKey);
    };

    const rayCast = () => {
      const graphics = 2;
      const DR = 0.0174533;
      const fov = 60 * graphics;
      const pixelSize = 8 / graphics;

      let shade = false;
      let ra = normalizeAngle(angle - (DR / graphics) * (fov / 2));

      
      for (let i = 0; i < fov; i++) {
        const { distH, hx, hy } = castRayHorizontal(ra);
        const { distV, vx, vy } = castRayVertical(ra);
    
        let distT, rx, ry;

        if (distV < distH) {
          [rx, ry] = [vx, vy];
          distT = distV;
          shade = true;
        } else {
          [rx, ry] = [hx, hy];
          distT = distH;
          shade = false;
        }

        const centerX = playerX + playerSize / 2;
        const centerY = playerY + playerSize / 2;

        // createRayLine(centerX, centerY, rx, ry);

        let ca = normalizeAngle(angle - ra);
        distT *= Math.cos(ca);

        let lineHeight = (mapS * windowHeight) / distT;

        let blockWidth = windowWidth / fov

        drawGraphics(i, lineHeight, rx, ry, ra, shade, pixelSize, blockWidth);

        ra = normalizeAngle(ra + (DR / graphics));
      }
    };

    const drawGraphics = (x, lineHeight, rx, ry, ra, shade, pixelSize, blockWidth) => {
      const newDrawBlock = canvas.getContext('2d');
      let tyStep = 32.0/lineHeight
      let tyO = lineHeight > windowHeight ? (lineHeight - windowHeight) / 2.0 : 0;
      lineHeight = Math.min(lineHeight, windowHeight);

      const lineO = (windowHeight / 2) - lineHeight / 2;
      
      let tx = shade ? Math.floor((ry / 2.0) % 32) : Math.floor((rx / 2.0) % 32);
      if (shade ? (ra > Math.PI / 2 && ra < (3 * Math.PI) / 2) : ra < Math.PI) {
        tx = 31 - tx;
      }
      let ty = tyO * tyStep;

      // WALL RENDER 
      for (let y = 0; y < lineHeight; y++) {
        const pixel = (Math.floor(ty) * 32 + tx) * 3;
        const [r, g, b] = ROUNDEDBRICKWALL.slice(pixel, pixel + 3);
        
        newDrawBlock.fillStyle = `rgb(${r}, ${g}, ${b})`;
        newDrawBlock.fillRect(x * blockWidth, y + lineO, blockWidth, pixelSize);
        ty += tyStep;
      }
    
      // FLOOR AND CEILING RENDER
      for (let y = lineO + lineHeight; y < windowHeight; y++) {
        let dy = y - (windowHeight / 2) + 1;
        let posZ = 0.5 * windowHeight;
        let rowDist = posZ / dy;  
        let rayDirX = Math.cos(ra);
        let rayDirY = Math.sin(ra);  
        let raFix = Math.cos(angle - ra);

        rowDist /= raFix

        let tx = playerX / 2 + rayDirX * rowDist * 32;
        let ty = playerY / 2 + rayDirY * rowDist * 32;
        
        // FLOOR RENDER
        let mp = mapF[Math.floor(ty / 32) * mapX + Math.floor(tx / 32)];
        let choosedTexture;
        if(mp === 5){
          choosedTexture = LAVA;
        } else {
          choosedTexture = PATHROCKSFLOOR;
        }
        renderPixel(newDrawBlock, mp, tx, ty, choosedTexture, x, y, pixelSize, blockWidth);
    
        // CEILING RENDER
        mp = mapC[Math.floor(ty / 32) * mapX + Math.floor(tx / 32)];
        renderPixel(newDrawBlock, mp, tx, ty, HEXAGONSCIELING, x, windowHeight - pixelSize - y, pixelSize, blockWidth);
      }
    };
    
    const drawPlayer = (x, y) => {
      newPlayer.fillStyle = 'yellow'; 
      newPlayer.fillRect(x, y, playerSize, playerSize);
    };

    movePlayer();
    rayCast();
  };

  const castRayHorizontal = (ra) => {
    let dof = 0, distH = 10000000, aTan = -1 / Math.tan(ra);
    let rx, ry, yo, xo, hx, hy;
  
    if (ra > PI) {
      ry = Math.floor(playerY >> 6) * 64 - 0.0001;
      rx = (playerY - ry) * aTan + playerX;
      yo = -64;
      xo = -yo * aTan;
    } else if (ra < PI) {
      ry = Math.floor(playerY >> 6) * 64 + 64;
      rx = (playerY - ry) * aTan + playerX;
      yo = 64;
      xo = -yo * aTan;
    } else {
      rx = playerX;
      ry = playerY;
      dof = 8;
    }
  
    while (dof < 8) {
      const mx = Math.floor(rx >> 6);
      const my = Math.floor(ry >> 6);
      const mp = my * mapX + mx;
  
      if (isValidMapPosition(mp)) {
        distH = dist(playerX, playerY, rx, ry, ra);
        hx = rx;
        hy = ry;
        dof = 8;
      } else {
        rx += xo;
        ry += yo;
        dof++;
      }
    }
  
    return {distH, hx, hy};
  };

  const castRayVertical = (ra) => {
    let dof = 0, distV = 10000000, nTan = -Math.tan(ra);
    let rx, ry, xo, yo, vx, vy;
  
    if (ra > PI2 && ra < PI3) {
      rx = Math.floor(playerX >> 6) * 64 - 0.0001;
      ry = (playerX - rx) * nTan + playerY;
      xo = -64;
      yo = -xo * nTan;
    } else if (ra < PI2 || ra > PI3) {
      rx = Math.floor(playerX >> 6) * 64 + 64;
      ry = (playerX - rx) * nTan + playerY;
      xo = 64;
      yo = -xo * nTan;
    } else {
      rx = playerX;
      ry = playerY;
      dof = 8;
    }
  
    while (dof < 8) {
      const mx = Math.floor(rx >> 6);
      const my = Math.floor(ry >> 6);
      const mp = my * mapX + mx;
  
      if (isValidMapPosition(mp)) {
        distV = dist(playerX, playerY, rx, ry, ra);
        vx = rx;
        vy = ry;
        dof = 8;
      } else {
        rx += xo;
        ry += yo;
        dof++;
      }
    }
  
    return {distV, vx, vy};
  };

  const normalizeAngle = (angle) => {
    if (angle < 0) angle += 2 * PI;
    if (angle > 2 * PI) angle -= 2 * PI;
    return angle;
  };

  const renderPixel = (ctx, mp, tx, ty, texture, x, y, pixelSize, blockWidth) => {
    if (mp > 0) {
      const pixel = ((Math.floor(ty) & 31) * 32 + (Math.floor(tx) & 31)) * 3;
      const [r, g, b] = texture.slice(pixel, pixel + 3);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x * blockWidth, y, blockWidth, pixelSize);
    }
  };

  const createRayLine = (startX, startY, endX, endY) => {
    const rayline = canvas.getContext('2d');
    rayline.beginPath();
    rayline.moveTo(startX, startY);
    rayline.lineTo(endX, endY);
    rayline.strokeStyle = '#00ff00';
    rayline.stroke();
  };

  const isValidMapPosition = (mp) => mp > 0 && mp < mapX * mapY && mapW[mp] > 0;

  const dist = (sx, sy, ex, ey) => Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);

  // loadMap();
  player();
};
export default canvasRaycast;
