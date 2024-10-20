import { startMapW, startMapF, startMapC, startMapX, startMapY, startPlayerX, startPlayerY, startPlayerAng} from "../assets/maps/startMap.js";
import ROUNDEDBRICKWALL from '../assets/textures/ROUNDBRICKS.js'
import PATHROCKSFLOOR from "../assets/textures/PATHROCKS.js";
import HEXAGONSCIELING from "../assets/textures/HEXAGONS.js";

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

        const playerCollisionTopX = Math.floor((newPlayerX + xf)>>6);
        const playerCollisionTopY = Math.floor((newPlayerY + yf)>>6);
        const playerCollisionBotX = Math.floor((newPlayerX - xb)>>6);
        const playerCollisionBotY = Math.floor((newPlayerY - yb)>>6);
        const playerCollisionX = Math.floor(newPlayerX>>6);
        const playerCollisionY = Math.floor(newPlayerY>>6);

        if (w === 1) {
          if (mapW[playerCollisionY * mapX + playerCollisionTopX] === 0 && mapF[playerCollisionY * mapX + playerCollisionTopX] > 0) {
            playerX = newPlayerX;
          }
          if (mapW[playerCollisionTopY * mapX + playerCollisionX] === 0 && mapF[playerCollisionTopY * mapX + playerCollisionX] > 0) {
            playerY = newPlayerY;
          }
        }
        if (s === 1) {
          if (mapW[playerCollisionY * mapX + playerCollisionBotX] === 0 && mapF[playerCollisionY * mapX + playerCollisionBotX] > 0) {
            playerX = newPlayerX;
          }
          if (mapW[playerCollisionBotY * mapX + playerCollisionX] === 0 && mapF[playerCollisionBotY * mapX + playerCollisionX] > 0) {
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
      const fov = 60;
      let shade = false;
      let ra = angle - DR * 30;
      if(ra < 0) {
        ra += 2*PI;
      }
      if(ra > 2*PI){
        ra -= 2*PI
      }
      let hx=playerX, hy=playerY;
      let my,mx,mp,dof,rx,ry,yo,xo,distT;
      for (let i = 0; i < fov; i++) {

        // Check horizontal
        dof = 0;
        let distH = 10000000;
        let aTan = -1/Math.tan(ra);
        if(ra > PI){
          ry = Math.floor(playerY>>6)*64 - 0.0001;
          rx = (playerY - ry) * aTan + playerX; 
          yo = -64;
          xo = - yo * aTan;
        } else if(ra < PI){
          ry = Math.floor(playerY>>6)*64 + 64;
          rx = (playerY - ry) * aTan + playerX; 
          yo = 64;
          xo = - yo * aTan;
        } else {
          rx = playerX;
          ry = playerY;
          dof = 8;
        }
        while(dof < 8){
          mx = Math.floor(rx>>6);
          my = Math.floor(ry>>6);
          mp = my * mapX + mx;
          if(mp > 0 && mp < mapX*mapY && mapW[mp] > 0){
            dof = 8;
            hx=rx;
            hy=ry;
            distH = dist(playerX,playerY,hx,hy,ra);
          }
          else {
            rx += xo;
            ry += yo;
            dof +=1;
          }
        }

        // Check vertical
        dof = 0;
        let distV = 10000000, vx=playerX, vy=playerY;
        let nTan = -Math.tan(ra);
        if(ra > PI2 && ra < PI3){
          rx = Math.floor(playerX>>6)*64 - 0.0001;
          ry = (playerX - rx) * nTan + playerY; 
          xo = -64;
          yo = - xo * nTan;
        } else if(ra < PI2 || ra > PI3){
          rx = Math.floor(playerX>>6)*64 + 64;
          ry = (playerX - rx) * nTan + playerY; 
          xo = 64;
          yo = - xo * nTan;
        } else {
          rx = playerX;
          ry = playerY;
          dof = 8;
        }
        while(dof < 8){
          mx = Math.floor(rx>>6);
          my = Math.floor(ry>>6);
          mp = my * mapX + mx;
          if(mp > 0 && mp < mapX*mapY && mapW[mp] > 0){
            dof = 8;
            vx=rx;
            vy=ry;
            distV = dist(playerX,playerY,vx,vy,ra);
          }
          else {
            rx += xo;
            ry += yo;
            dof +=1;
          }
        }

        if(distV < distH){
          rx = vx;
          ry = vy;
          distT = distV
          shade = true;
        }
        if(distV > distH){
          rx = hx;
          ry = hy;
          distT = distH
          shade = false;
        }

        const centerX = playerX + playerSize / 2;
        const centerY = playerY + playerSize / 2;

        createRayLine(centerX, centerY, rx, ry);

        let ca = angle - ra;
        if (ca < 0) {
          ca += 2 * PI;
        }
        if (ca > 2 * PI) {
          ca -= 2 * PI;
        }

        distT *= Math.cos(ca);

        let lineHeight = (mapS * 320) / distT;

        draw3DWall(i, lineHeight, rx, ry, ra, shade);

        ra += DR;
        if(ra < 0) {
          ra += 2*PI;
        }
        if(ra > 2*PI){
          ra -= 2*PI
        }
      }
    };

    const draw3DWall = (x, lineHeight, rx, ry, ra, shade) => {
      const newDrawBlock = canvas.getContext('2d');
      let tyStep = 32.0/lineHeight
      let tyO = 0;

      if (lineHeight > 320) {
        tyO = (lineHeight - 320) / 2.0;
        lineHeight = 320;
      }

      const lineO = 160 - lineHeight / 2;
      
      let y;
      let ty = tyO * tyStep;
      let tx ;

      if (shade) { 
        tx = Math.floor((ry / 2.0) % 32);
        if (ra > Math.PI / 2 && ra < (3 * Math.PI) / 2) {
          tx = 31 - tx;  
        }
      } else { 
        tx = Math.floor((rx / 2.0) % 32);
        if (ra < Math.PI) {
          tx = 31 - tx;  
        }
      }
      // WALL RENDER 
      for(y = 0 ; y < lineHeight ; y++){
        let r,g,b,pixel;
        pixel = (Math.floor(ty) * 32 + Math.floor(tx))*3;
        r = ROUNDEDBRICKWALL[pixel + 0]
        g = ROUNDEDBRICKWALL[pixel + 1]
        b = ROUNDEDBRICKWALL[pixel + 2]
        let mx = Math.floor(rx>>6);
        let my = Math.floor(ry>>6);
        let mp = my * mapX + mx;
        let color;
        // if(mapW[mp] === 1){
        //   color = basicTextures[Math.floor(ty) * 32 + Math.floor(tx)];
        // } else if(mapW[mp] === 2){
        //   color = brickTexture[Math.floor(ty) * 32 + Math.floor(tx)];
        // }

        // let c = color * 255;
        newDrawBlock.fillStyle = `rgb(
          ${r},
          ${g},
          ${b}
        )`
        newDrawBlock.fillRect(x * 8 + 530, y + 160 + lineO, 8, 8);
        ty+=tyStep;
      }
      // FLOOR AND CEILING RENDER
      for(y = lineO+lineHeight ; y < 320 ; y++){
        let dy=y-(320/2.0), deg = ra, raFix = Math.cos(angle-ra);
        tx = playerX / 2 + Math.cos(deg)*158*32/dy/raFix;
        ty = playerY / 2 + Math.sin(deg)*158*32/dy/raFix;
        let mp = mapF[Math.floor(ty/32.0) * mapX + Math.floor(tx/32.0)];
        let r,g,b,pixel;
        pixel = ((Math.floor(ty)&31) * 32 + (Math.floor(tx)&31))*3;
        r = PATHROCKSFLOOR[pixel + 0]
        g = PATHROCKSFLOOR[pixel + 1]
        b = PATHROCKSFLOOR[pixel + 2]
        // let color;
        // if(mp === 1){
        //   color = brickTexture[(Math.floor(ty)&31) * 32 + (Math.floor(tx)&31)];
        // }

        // let c 
        newDrawBlock.fillStyle = `rgb(
          ${r},
          ${g},
          ${b}
        )`
        if(mp > 0){
          newDrawBlock.fillRect(x * 8 + 530, y + 160, 8, 8);
        }

        mp = mapC[Math.floor(ty/32.0) * mapX + Math.floor(tx/32.0)];
        pixel = ((Math.floor(ty)&31) * 32 + (Math.floor(tx)&31))*3;
        r = HEXAGONSCIELING[pixel + 0]
        g = HEXAGONSCIELING[pixel + 1]
        b = HEXAGONSCIELING[pixel + 2]
        // if(mp === 1){
        //   color = brickTexture[(Math.floor(ty)&31) * 32 + (Math.floor(tx)&31)];
        // } else if (mp === 2){
        //   color = windowTexture[(Math.floor(ty)&31) * 32 + (Math.floor(tx)&31)];
        // }

        // c = color * 255;
        newDrawBlock.fillStyle = `rgb(
          ${r},
          ${g},
          ${b}
        )`
        if(mp > 0){
          newDrawBlock.fillRect(x * 8 + 530,312 - y + 160, 8, 8);
        }
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

    const drawPlayer = (x, y) => {
      newPlayer.fillStyle = 'yellow'; 
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
