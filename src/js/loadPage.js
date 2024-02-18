import playerMovements from './playerMovements';

const loadPage = () => {
  const ball = document.getElementById('ball');
  const player = playerMovements(ball);
};

export default loadPage;
