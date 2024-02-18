const playerMovements = (ball) => {
  let degree = 0;
  let vel = 0;
  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') vel = 5;
    if (e.code === 'KeyS') vel = -5;
    if (e.code === 'KeyA') degree += 15;
    if (e.code === 'KeyD') degree -= 15;
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') vel = 0;
    if (e.code === 'KeyS') vel = 0;
  });
  const moveElement = () => {
    const ballX = ball.offsetLeft;
    const ballY = ball.offsetTop;
    const radians = (degree * Math.PI) / 180;
    if (vel !== 0) {
      const newX = ballX + vel * Math.cos(radians);
      const newY = ballY - vel * Math.sin(radians);
      ball.style.left = `${newX}px`;
      ball.style.top = `${newY}px`;
    }
    ball.style.transform = `rotate(${-degree}deg)`;
    requestAnimationFrame(moveElement);
  };
  moveElement();
};

export default playerMovements;
