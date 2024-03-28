const numOfPrizesOnBoard:number = 15;

const prizesStatsContainer :any = document.getElementById('prizesStatsContainer');
const audioControlDiv :any = document.getElementById('audioControlDiv');
const statsPanelSound :any = document.getElementById('statsPanelSound');
const audioOn  :any = document.getElementById('audioOn');
const audioOff :any = document.getElementById('audioOff');
const collisionSound: any = document.getElementById('collisionSound');
const scoreContainer :any = document.getElementById('scoreContainer');
const gameStartTune: any = document.getElementById('gameStartTune');
const prizeHitSound: any = document.getElementById('prizeHitSound');
const scoreDisplay :any = document.getElementById('scoreDisplay');
const autoPlayBtn:any = document.getElementById('autoPlayBtn');
const endGameDiv :any = document.getElementById('endGameDiv');
const startGameImg :any = document.getElementById('startGame');
const endGameImg :any = document.getElementById('endGame');
const gameCanvas :any = document.getElementById('gameCanvas');
const ctx        :any = gameCanvas.getContext('2d');
const ctxWidth   :number = gameCanvas.width;
const ctxHeight  :number = gameCanvas.height;
const imgSnakeHead_up    :any = document.getElementById('snakeHead_up');
const imgSnakeHead_right :any = document.getElementById('snakeHead_right');
const imgSnakeHead_down  :any = document.getElementById('snakeHead_down');
const imgSnakeHead_left  :any = document.getElementById('snakeHead_left');
// For the prizes: their types
const strawberryImg :any = document.getElementById('strawberryImg');  // Type = 0
const diamondImg    :any = document.getElementById('diamondImg');     // Type = 1
const bitcoinImg    :any = document.getElementById('bitcoinImg');     // Type = 2
const dollarsImg    :any = document.getElementById('dollarsImg');     // Type = 3
const bananaImg     :any = document.getElementById('bananaImg');      // Type = 4
const ringImg       :any = document.getElementById('ringImg');        // Type = 5

const diamondCount    :any = document.getElementById('diamondCount');
const bananaCount     :any = document.getElementById('bananaCount');
const bitcoinCount    :any = document.getElementById('bitcoinCount');
const ringCount       :any = document.getElementById('ringCount');
const strawberryCount :any = document.getElementById('strawberryCount');
const dollarsCount    :any = document.getElementById('dollarsCount');

// Specs of each of the prizes types
class PrizeType {
    img     :any;
    width   :number;
    height  :number;
    score   :number;
    inc_len :number;
    count   :number;

    constructor (img:any, width:number, height:number, score:number, inc_len:number, count:number) {
        this.img = img;
        this.width = width;
        this.height = height;
        this.score = score;
        this.inc_len = inc_len;
        this.count = count;
  }
}

// Specs of each of the allocated prize on the playground - with poiter to the type
class Prize {
    type    :number;
    x       :number;
    y       :number;

    constructor(type:number, x:number, y:number) {
        this.type = type;
        this.x = x;
        this.y = y;
  }
}

let showStatsPanel :boolean = true;
let isAudioOn      :boolean = true;
let gameInit    :boolean = false;
let gameStarted :boolean = false;
let step        :number = 2;
let totalSteps  :number = 2;

let dir         :string;    // values: U, R, D, L
let currDir     :string;    // purpose: avoiding handling the same key repeated striking
let fromX       :number;
let fromY       :number;
let len         :number;
let maxPrizeHeight :number;
let maxPrizeWidth  :number;
let totalScore  :number = 0;
let snakeBody   :any[] = [];
let prizesArr   :Prize[] = [];
let prizeTypArr :PrizeType[] = [];
let randomPrizeSelArr :number[] = [];

let addPrizeTyp :PrizeType;           // img, width, height, score, addition to snake, count
addPrizeTyp = new PrizeType(strawberryImg, 44, 65, 10, 10, 0);  
prizeTypArr.push(addPrizeTyp);
addPrizeTyp = new PrizeType(diamondImg,    50, 42, 20, 20, 0);
prizeTypArr.push(addPrizeTyp);
addPrizeTyp = new PrizeType(bitcoinImg,    60, 52, 50, 50, 0);
prizeTypArr.push(addPrizeTyp);
addPrizeTyp = new PrizeType(dollarsImg,    80, 54, 40, 40, 0);
prizeTypArr.push(addPrizeTyp);
addPrizeTyp = new PrizeType(bananaImg,     75, 41, 15, 10, 0);
prizeTypArr.push(addPrizeTyp);
addPrizeTyp = new PrizeType(ringImg,       60, 60, 40, 40, 0);
prizeTypArr.push(addPrizeTyp);

// Array to support a random selection of a new Prize to render
let j:number = 0;
for (let i:number = 0; i <= 99; i++) {
    randomPrizeSelArr.push(j++);

    if (j > prizeTypArr.length -1) j = 0;
}

// For Prizes auto-placement allocation on the Canvas
maxPrizeHeight = 0;
maxPrizeWidth = 0;
for (let i:number = 0; i < prizeTypArr.length; i++) {
    if (prizeTypArr[i].height > maxPrizeHeight) maxPrizeHeight = prizeTypArr[i].height;
    if (prizeTypArr[i].width  > maxPrizeWidth)  maxPrizeWidth  = prizeTypArr[i].width;
}

// Set the background color
ctx.fillStyle = 'lightblue'; // Change 'lightblue' to your desired color
ctx.fillRect(0, 0, ctxWidth, ctxHeight);

/********************************
 * Function: preGameInfo
 ********************************/
function preGameInfo(): any{
    window.open('info.html', '_blank');

    gameStartTune.play();
    gameStartTune.loop = true;

    if (isAudioOn)
        gameStartTune.volume = 0.3;
    else
        gameStartTune.volume = 0;
}

/********************************
 * Function: showStartGameMsg
 ********************************/
function showStartGameMsg():any {
    startGameImg.style.display = 'inline';
}

// Controlling Audio ON / OFF
audioControlDiv.onclick = ()=> {

    if (!isAudioOn) {
        audioOff.style.display = 'none';
        audioOn.style.display  = 'inline';

        document.querySelectorAll('audio').forEach(audio => {
            audio.volume = 0.3;
        });
    } else {
        audioOn.style.display  = 'none';
        audioOff.style.display = 'inline';

        document.querySelectorAll('audio').forEach(audio => {
            audio.volume = 0;
        });
    }

    isAudioOn = !isAudioOn;
}

document.body.onkeyup = (eV)=>{
    controller(eV);
}

/********************************
 * Function: controller(eV)
 * Purpose: Main Logic Control
 ********************************/
function controller(eV :any){
    switch(eV.keyCode){
        case 32: //space bar
            console.log("Spacebar pressed");

            if (!gameInit) {
                preGameInfo();
            
                gameInit = !gameInit;
            } else if (!gameStarted) {
                initGame();
                startGame();

                gameStarted = !gameStarted;
            }
            break;
        case 37: //left
            console.log("Left pressed");
            dir = 'L';
            break;
        case 38: //up
            console.log("Up pressed");
            dir = 'U';
            break;
        case 39: //right
            console.log("Right pressed");
            dir = 'R';
            break;
        case 40: //down
            console.log("Down pressed");
            dir = 'D';
            break;
        case 73: // CTRL+ i key, for controlling stats panel display
            if (eV.ctrlKey) {
                if (!showStatsPanel)
                    prizesStatsContainer.style.display = 'inline';
                else
                    prizesStatsContainer.style.display = 'none';
              
                showStatsPanel = !showStatsPanel; 

                if (isAudioOn)
                    statsPanelSound.play();
            }         
            break;
        default:
            break;
    }

    if ((eV.keyCode != 32) && validDirChange(dir, currDir)) {   // Only for U, R, D, L moves
        fromX = snakeBody[0].toX;
        fromY = snakeBody[0].toY;
        
        len = 0;
        snakeBody.unshift({'fromX':fromX, 'fromY':fromY, 'toX':null, 'toY':null, 'len':len, 'dir':dir});

        currDir = dir;
   }
}


/**************************************************************
 * Function: validDirChange(new Direction, currect Direction)
 * Purpose: Verifying new vs. curr directions are ligitimate
 **************************************************************/
function validDirChange(newDir:string, currDir:string):boolean {
    if (newDir == currDir)
        return false;

    if (((newDir == 'U') && (currDir == 'D')) || ((newDir == 'D') && (currDir == 'U')))
        return false;

    if (((newDir == 'L') && (currDir == 'R')) || ((newDir == 'R') && (currDir == 'L')))
        return false;

    return true;
}

/**************************************************************
 * Function: colorSnakeBodyAtSelfCollision
 * Purpose: In case Snake collides with itself -
 *          color its body in red
 **************************************************************/
function colorSnakeBodyAtSelfCollision():any {

    let toX:number = 0;
    let toY:number = 0;

    for (let i:number = 3; i< snakeBody.length; i++) {

        // Begin drawing path  
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.setLineDash([10, 3, 2, 3]);  // [dash length, gap length, smaller dash length, gap length]
        ctx.moveTo(snakeBody[i].fromX, snakeBody[i].fromY);

        switch (snakeBody[i].dir) {
            case 'U':
                ctx.lineTo(snakeBody[i].fromX, snakeBody[i].fromY - snakeBody[i].len);
                break;
            case 'R':
                ctx.lineTo(snakeBody[i].fromX + snakeBody[i].len, snakeBody[i].fromY);
                break;
            case 'D':
                ctx.lineTo(snakeBody[i].fromX, snakeBody[i].fromY + snakeBody[i].len);
                break;
            case 'L':
                ctx.lineTo(snakeBody[i].fromX - snakeBody[i].len, snakeBody[i].fromY);
                break;
        }

    ctx.stroke();
    }
}

/*******************************************************************
 * Function: isSnakeBodyCollision
 * @returns boolean: TRUE in case Snake has collided with itself
 *******************************************************************/
function isSnakeBodyCollision():boolean {
    let isCollision :boolean = false;
    let snakeHeadX  :number = 0;
    let snakeHeadY  :number = 0;

    if (snakeBody.length <= 3) 
        return false;

    switch (snakeBody[0].dir) {
        case 'U':     
            snakeHeadX = snakeBody[0].toX;
            snakeHeadY = snakeBody[0].toY - 30;
            break;
        case 'R':
            snakeHeadX = snakeBody[0].toX + 30;
            snakeHeadY = snakeBody[0].toY;
            break;
        case 'D':
            snakeHeadX = snakeBody[0].toX;
            snakeHeadY = snakeBody[0].toY + 30;
            break;
        case 'L':
            snakeHeadX = snakeBody[0].toX - 30;
            snakeHeadY = snakeBody[0].toY;          
            break;
    }

    for (let i:number = 3; i < snakeBody.length; i++) {
    
      switch (snakeBody[0].dir) {
          case 'U':     
              if (isBetween(snakeBody[i].fromY, snakeHeadY, snakeBody[0].fromY) && isBetween(snakeHeadX, snakeBody[i].fromX, snakeBody[i].toX)) {
                  isCollision = true;
                  break;
              }
              break;
          case 'R':
              if (isBetween(snakeBody[i].fromX, snakeHeadX, snakeBody[0].fromX) && isBetween(snakeHeadY, snakeBody[i].fromY, snakeBody[i].toY)) {
                  isCollision = true;
                  console.log("TRUE");
                  break;           
              }
              break;
          case 'D':
              if (isBetween(snakeBody[i].fromY, snakeHeadY, snakeBody[0].fromY) && isBetween(snakeHeadX, snakeBody[i].fromX, snakeBody[i].toX)) {
                  isCollision = true;
                  break;
              }
              break;
          case 'L':
              if (isBetween(snakeBody[i].fromX, snakeHeadX, snakeBody[0].fromX) && isBetween(snakeHeadY, snakeBody[i].fromY, snakeBody[i].toY)) {
                isCollision = true;
                break;
              }
              break;
        }
    }

    if (isCollision) {
        colorSnakeBodyAtSelfCollision();
        
        return true;
    }

    return false;
}

/*****************************************************************
 * Function: isBetween
 * @param n  :number
 * @param n1 :number
 * @param n2 :number
 * @returns boolean: TRUE if n >= Min(n1,n2) and n <= Max(n1,n2)
 *****************************************************************/
function isBetween(n:number, n1:number, n2:number):boolean {
    return (n >= Math.min(n1, n2) && n <= Math.max(n1, n2));
}

/***************************************************************************************
 * Function: isBorderCollision
 * @returns boolean: TRUE in case the Snake collides with any of the 4x canvas borders
 ***************************************************************************************/
function isBorderCollision():boolean {
    let isCollision :boolean = false;

    switch (snakeBody[0].dir) {
        case 'U':     
            if (snakeBody[0].toY <= 30)            isCollision = true;
            break;
        case 'R':
            if (snakeBody[0].toX >= ctxWidth -30)  isCollision = true;  
            break;
        case 'D':
            if (snakeBody[0].toY >= ctxHeight -30) isCollision = true;
            break;
        case 'L':
            if (snakeBody[0].toX <= 30)            isCollision = true;             
            break;
    }

    if (isCollision) {
        gameCanvas.style.border = '5px solid red';
        return true;
    }

    return false;
}

/*************************************************************
 * Function: initGame
 * Purpose: initialization before each game start / restart
 *************************************************************/
function initGame() {

    totalScore = 0;
    
    if (!showStatsPanel)
        prizesStatsContainer.style.display = 'none';
    else
        prizesStatsContainer.style.display = 'inline';

    scoreContainer.style.display = 'inline';
  
    startGameImg.style.display = 'none';
    endGameImg.style.display = 'none';
    gameCanvas.style.border = '5px solid rgb(94, 136, 72)';
    
    while (snakeBody.length > 0) snakeBody.pop();
    while (prizesArr.length > 0) prizesArr.pop();

    for (let i:number = 0; i < prizeTypArr.length; i++)
        prizeTypArr[i].count = 0;

    fromX = ctxWidth /2;
    fromY = ctxHeight;

    len = 200;
    dir = 'U';      // Default is moving up
    currDir = dir;  

    snakeBody.push({'fromX':fromX, 'fromY':fromY, 'toX':null, 'toY':null, 'len':len, 'dir':dir});
}

/**************************************************
 * Function: prizesRender
 * Purpose: Allicated the prizes on the gameboard
 **************************************************/
function prizesRender(): any {

    while (prizesArr.length < numOfPrizesOnBoard) {
        let addPrize :Prize;
        let randomX  :number = 0;
        let randomY  :number = 0;
        let overlappingPrize    :boolean = true;
        let overlappingInPrizes :boolean = false;

        randomX = Math.floor(Math.random() * (ctxWidth - maxPrizeWidth));
        randomY = Math.floor(Math.random() * (ctxHeight - maxPrizeHeight));

        addPrize = new Prize(randomPrizeSelArr[Math.floor(Math.random() *100)], randomX, randomY);
        prizesArr.push(addPrize);
    }   

    for (let i:number = 0; i < prizesArr.length; i++) { //let prize of prizesArr) {    
        ctx.drawImage(prizeTypArr[prizesArr[i].type].img, prizesArr[i].x, prizesArr[i].y);
    }
}

/***************************************************************************************
 * Function: collectPrizeScore
 * Purpose: 1. Check if the Snake has collided with any of the prizes
 *             allocated on the gameboard
 *          2. At confirmed collision - collect the prize and lenghten the Snake body
 ***************************************************************************************/
function collectPrizeScore():any {
    let index            :number = 0;
    let snakeHeadX       :number = 0;
    let snakeHeadY       :number = 0;
    let isPrizeCollision :boolean = false;

    switch (snakeBody[0].dir) {
      case 'U':     
          snakeHeadX = snakeBody[0].toX;
          snakeHeadY = snakeBody[0].toY - 30;
          break;
      case 'R':
          snakeHeadX = snakeBody[0].toX + 30;
          snakeHeadY = snakeBody[0].toY;
          break;
      case 'D':
          snakeHeadX = snakeBody[0].toX;
          snakeHeadY = snakeBody[0].toY + 30;
          break;
      case 'L':
          snakeHeadX = snakeBody[0].toX - 30;
          snakeHeadY = snakeBody[0].toY;          
          break;
    }

    for (let i:number = 0; i < prizesArr.length; i++) {

        switch (snakeBody[0].dir) {
            case 'U':     
                if (isBetween(prizesArr[i].y + prizeTypArr[prizesArr[i].type].height, snakeHeadY, snakeBody[0].fromY) && isBetween(snakeHeadX, prizesArr[i].x, prizesArr[i].x + prizeTypArr[prizesArr[i].type].width)) {
                    isPrizeCollision = true;
                    index = i;
                    break;
                    }
                break;
            case 'R':
                if (isBetween(prizesArr[i].x, snakeHeadX, snakeBody[0].fromX) && isBetween(snakeHeadY, prizesArr[i].y, prizesArr[i].y + prizeTypArr[prizesArr[i].type].height)) {
                    isPrizeCollision = true;
                    index = i;
                    break;           
                    }
                break;
            case 'D':
                if (isBetween(prizesArr[i].y, snakeHeadY, snakeBody[0].fromY) && isBetween(snakeHeadX, prizesArr[i].x, prizesArr[i].x + prizeTypArr[prizesArr[i].type].width)) {
                    isPrizeCollision = true;
                    index = i;
                    break;
                    }
                break;
            case 'L':
                if (isBetween(prizesArr[i].x + prizeTypArr[prizesArr[i].type].width, snakeHeadX, snakeBody[0].fromX) && isBetween(snakeHeadY, prizesArr[i].y, prizesArr[i].y + prizeTypArr[prizesArr[i].type].height)) {
                    isPrizeCollision = true;
                    index = i;
                    break;
                    }
                break;
        }
    }

    if (isPrizeCollision) {
        // Adding to the total score the current prize score + maintain counting of prizes/type
        totalScore += prizeTypArr[prizesArr[index].type].score;
        prizeTypArr[prizesArr[index].type].count++;

        // Adding to the length of the snake (along with the won score)
        snakeBody[snakeBody.length -1].len += prizeTypArr[prizesArr[index].type].inc_len;
      
        switch (snakeBody[snakeBody.length -1].dir) {
            case 'U':  
                snakeBody[snakeBody.length -1].fromY += prizeTypArr[prizesArr[index].type].inc_len;
                break;
            case 'R':
                snakeBody[snakeBody.length -1].fromX -= prizeTypArr[prizesArr[index].type].inc_len;
                break;
            case 'D':
                snakeBody[snakeBody.length -1].fromY -= prizeTypArr[prizesArr[index].type].inc_len;
                break;
            case 'L':
                snakeBody[snakeBody.length -1].fromX += prizeTypArr[prizesArr[index].type].inc_len;
                break; 
        }

        if (isAudioOn)
            prizeHitSound.play();
        prizesArr.splice(index,1);
    }
}

/*********************************************************************
 * Function: startGame
 * Purpose: Maintain repeatedly the ongoing functionaly of the game
 *********************************************************************/
function startGame() {
    ctx.strokeStyle = 'rgb(94, 136, 72)';
    ctx.setLineDash([10, 3, 2, 3]);  // [dash length, gap length, smaller dash length, gap length]
    ctx.lineWidth = 8;

    ctx.clearRect(0, 0, ctxWidth, ctxHeight);
    ctx.fillStyle = 'lightblue'; 
    ctx.fillRect(0, 0, ctxWidth, ctxHeight);
  
    scoreDisplay.textContent = totalScore;

    strawberryCount.textContent = prizeTypArr[0].count;
    diamondCount.textContent    = prizeTypArr[1].count;
    bitcoinCount.textContent    = prizeTypArr[2].count;
    dollarsCount.textContent    = prizeTypArr[3].count;
    bananaCount.textContent     = prizeTypArr[4].count;
    ringCount.textContent       = prizeTypArr[5].count;
  
    for (let i:number = 0; i< snakeBody.length; i++) {

        if (i > 0 && (snakeBody[i].len == 0)) {     // if last part of the snake body not used anymore
            snakeBody.splice(i, 1);
        } else {
            // Begin drawing path  
            ctx.beginPath();
            ctx.moveTo(snakeBody[i].fromX, snakeBody[i].fromY);

            if (i > 0 && (i == snakeBody.length -1) && (snakeBody[i].len >= step))
                snakeBody[i].len -= step;

            if (i == 0 && (snakeBody.length > 1) && (snakeBody[snakeBody.length -1].len > 0))
                snakeBody[0].len += step;      

            switch (snakeBody[i].dir) {
                case 'U':
                    ctx.lineTo(snakeBody[i].fromX, snakeBody[i].fromY - snakeBody[i].len);
                    snakeBody[i].toX = snakeBody[i].fromX;
                    snakeBody[i].toY = snakeBody[i].fromY - snakeBody[i].len + 4;
                    break;
                case 'R':
                    ctx.lineTo(snakeBody[i].fromX + snakeBody[i].len, snakeBody[i].fromY);
                    snakeBody[i].toX = snakeBody[i].fromX + snakeBody[i].len - 4;
                    snakeBody[i].toY = snakeBody[i].fromY;
                    break;
                case 'D':
                    ctx.lineTo(snakeBody[i].fromX, snakeBody[i].fromY + snakeBody[i].len);
                    snakeBody[i].toX = snakeBody[i].fromX;
                    snakeBody[i].toY = snakeBody[i].fromY + snakeBody[i].len - 4;
                    break;
                case 'L':
                    ctx.lineTo(snakeBody[i].fromX - snakeBody[i].len, snakeBody[i].fromY);
                    snakeBody[i].toX = snakeBody[i].fromX - snakeBody[i].len + 4;
                    snakeBody[i].toY = snakeBody[i].fromY;
                    break;
            }
          
            ctx.stroke();

            if (i == 0) {
                switch (snakeBody[i].dir) {
                    case 'U':
                        ctx.drawImage(imgSnakeHead_up, snakeBody[i].toX -16, snakeBody[i].toY -30, 30, 30);
                        break;
                    case 'R':
                        ctx.drawImage(imgSnakeHead_right, snakeBody[i].toX, snakeBody[i].toY -15, 30, 30);
                        break;
                    case 'D':
                        ctx.drawImage(imgSnakeHead_down, snakeBody[i].toX -15, snakeBody[i].toY, 30, 30);
                        break;
                    case 'L':
                        ctx.drawImage(imgSnakeHead_left, snakeBody[i].toX -30, snakeBody[i].toY -15, 30, 30);
                        break;
                }
            }
          
            if (i == snakeBody.length -1) {
                switch (snakeBody[i].dir) {
                    case 'U':
                        snakeBody[i].fromY += (step * -1);
                        break;
                    case 'R':
                        snakeBody[i].fromX += (step * 1);
                        break;
                    case 'D':
                        snakeBody[i].fromY += (step * 1);
                        break;
                    case 'L':
                        snakeBody[i].fromX += (step * -1);
                        break;
                }   
            }       
        }
    }
    
    if (!isBorderCollision() && !isSnakeBodyCollision()) {
        collectPrizeScore();
        prizesRender();

        setTimeout(startGame, 20);
    }
    else {
        prizesRender();

        if (isAudioOn) {
            collisionSound.play();
            collisionSound.volume = 0.3;
        }

        endGameImg.style.display = 'inline';
        gameStarted = false;
    }
}

showStartGameMsg();
