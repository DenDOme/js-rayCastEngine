/* eslint-disable-file */ 
    
const startPlayerX = 250;
const startPlayerY = 250;
const startPlayerAng = 0;
const startMapX = 8
const startMapY = 8
const startMapW = [
    1,2,2,2,1,1,1,1,
    1,0,0,0,0,0,0,1,
    1,0,1,0,0,0,0,1,
    1,0,1,0,0,0,0,1,
    1,0,1,0,0,0,0,1,
    1,0,1,0,1,0,0,1,
    1,0,0,0,1,0,0,1,
    1,1,1,1,1,1,1,1,
]
const startMapF = [
    0,0,0,0,0,0,0,0,
    0,1,1,1,1,1,1,0,
    0,1,0,1,5,1,1,0,
    0,1,0,1,1,1,1,0,
    0,1,0,1,1,1,1,0,
    0,1,0,1,0,1,1,0,
    0,1,1,1,0,1,1,0,
    0,0,0,0,0,0,0,0,
]
const startMapC = [
    0,0,0,0,0,0,0,0,
    0,1,1,1,1,1,1,0,
    0,1,0,1,1,1,1,0,
    0,1,0,1,1,1,1,0,
    0,1,0,1,1,1,1,0,
    0,1,0,1,0,1,1,0,
    0,1,1,1,0,1,1,0,
    0,0,0,0,0,0,0,0,
]

export { startMapW, startMapF, startMapC, startMapX, startMapY, startPlayerX, startPlayerY, startPlayerAng}