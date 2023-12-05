function setCookie(field, name)
{
    const d = new Date();
    d.setTime(d.getTime() + 1000*60*20);
    let expires = "expires=" + d.toUTCString();
    document.cookie += field + name + ";" + expires + ";path=/";
}

function getCookie(cname) 
{
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function checkCookie()
{
    let user = getCookie("username");
    if (user != "")
    {
        username = user;
        clearNameBlock();
    } else {
        document.querySelector('input').addEventListener('keydown', updateName);
    }
}

document.querySelectorAll("button").forEach( function(item) {
    item.addEventListener('focus', function() {
        this.blur();
    })
});

const NameBox = document.getElementById('NameBox');
const cover = document.getElementById('cover');
const canvas = document.getElementById('Tetris');
const hint = document.getElementById('HintBox');
const ctx = canvas.getContext('2d');
const hintCtx = hint.getContext('2d');
const score = document.getElementById('score_field');
const level = document.getElementById('lvl_field');
document.getElementById('startBtn').onclick = startGame;
document.getElementById('resetBtn').onclick = resetGame;

let controls_set = false;
let username = 'Johnny Doe';
// размер квадрата (атом фигур)
const grid = 48;
// последовательность фигур
var tetrominoSequence = [];
// Поле
var playfield = [];
var hintfield = [];
// reset fields
for (let row = 0; row < 5; row++)
{
    hintfield[row] = [];
    for (let col = 0; col < 6; col++)
    {
        hintfield[row][col] = 0;
    }
}
// заполняем нулями
for (let row = -2; row < 20; row++)
{
    playfield[row] = [];
    for (let col = 0; col < 12; col++)
    {
        playfield[row][col] = 0;
    }
}
// Фигуры
const tetrominos = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O': [
        [1,1],
        [1,1],
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
};
const colors = {
    'I': ['cyan', '#05baba'],
    'J': ['yellow', '#bcbc00'],
    'L': ['magenta', '#be09be'],
    'O': ['LawnGreen', '#64c505'],
    'S': ['red', '#c50404'],
    'Z': ['blue', '#0303c0'],
    'T': ['orange', '#c68103'],
};
// счетчик кадров
let count = 0;
let difficulty = 50;
let points = 0;
let lvl = 0;
let lines_top = 10;
let lines = 0;
// текущая фигура
let tetromino = getNextTetromino();
// Hint
let nextTetromino = getNextTetromino(); 
// Кадр анимации и флаги проигрыша и паузы
let rAF = null;
let gameOver = false;
let gamePause = false;
// рандом в диапазоне
function getRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Создать последовательность
function generateSequence()
{
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while (sequence.length)
    {
        const rand = getRandomInt(0, sequence.length - 1);
        const name = sequence.splice(rand, 1)[0];

        tetrominoSequence.push(name);
    }
}
// Получить структуру следующего тетромино
function getNextTetromino()
{
    if (tetrominoSequence.length === 0)
    {   
        generateSequence();
    }
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];

    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;

    return {
        name: name,
        matrix: matrix,
        row: row,
        col: col
    };
}
// Поворот матрицы
function rotate(matrix)
{
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N-j][i])
    );
    return result;
}
// Может ли фигура здесь стоять
function isValidMove(matrix, cellRow, cellCol)
{
    for (let row = 0; row < matrix.length; row++)
    {
        for (let col = 0; col < matrix[row].length; col++)
        {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                playfield[cellRow + row][cellCol + col])) 
            {
                return false;
            }
        }
    }
    return true;
}
// Поставить фигуру
function placeTetromino()
{
    for (let row = 0; row < tetromino.matrix.length; row++)
    {
        for (let col = 0; col < tetromino.matrix[row].length; col++)
        {
            if (tetromino.matrix[row][col])
            {
                if (tetromino.row + row < 0)
                {
                    return showGameOver();
                }
                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }        
        }
    }
    // Очистить ряды
    var current_points = 0;
    for (let row = playfield.length -1; row >= 0;)
    {
        if (playfield[row].every(cell => !!cell))
        {
          current_points++;
            for (let r = row; r >= 0; r--)
            {
                for (let c = 0; c <playfield[r].length; c++)
                {
                    playfield[r][c] = playfield[r-1][c];
                }
            }
        }
        else 
        {
            row--;
        }
    }
    lines += current_points;
    switch (current_points) {
        case 1:
            points += 40 * (lvl + 1);
            break;
        case 2:
            points += 100 * (lvl + 1);
            break;
        case 3:
            points += 300 * (lvl + 1);
            break;
        case 4:
            points += 1200 * (lvl + 1);
            break;
        default:
            break;
    }
    if (lines >= lines_top && difficulty > 1)
    {
      lvl++;
      lines -= lines_top;
      if ((lvl <= 9 || lvl >= 16) && lvl < 26)
      {
          lines_top += 10;
      }
      
      if (difficulty === 5)
      {
          difficulty = 1;
      }
      else
      {
          difficulty = difficulty - 5;
      }
    }
    tetromino = nextTetromino;
    nextTetromino = getNextTetromino();
    for (let row = 1; row < 5; row++)
    {
        for (let col = 1; col < 5; col++)
        {
            hintfield[row][col] = 0;
            if (nextTetromino.matrix.length >= row && nextTetromino.matrix.length >= col)
            if (nextTetromino.matrix[row-1][col-1])
            {
                hintfield[row][col] = nextTetromino.name;
            }
        }
    }
}

function showGameOver()
{
    cancelAnimationFrame(rAF);
    gameOver = true;
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.75;
    ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 90);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.font = '36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseLine = 'middle';
    ctx.fillText('GAME OVER!', canvas.width /2, canvas.height / 2 + 25);
    processScore();
}

function togglePause()
{
    if (!gamePause)
    {
        gamePause = true;
    }
    else if (gamePause)
    {
        gamePause = false;
    }
}

function loop()
{
    rAF = requestAnimationFrame(loop);
    hintCtx.clearRect(0, 0, hint.width, hint.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gamePause) 
    {
        for (let row = 0; row < 5; row++)
        {
            for (let col = 0; col < 6; col++)
            {
                if (hintfield[row][col])
                {
                    const name = hintfield[row][col];
                    hintCtx.fillStyle = colors[name][0];
                    hintCtx.strokeStyle = colors[name][1];
                    hintCtx.fillRect(col * grid + 4, row * grid + 4, grid-9, grid -9);
                    hintCtx.beginPath();
                    hintCtx.rect(col * grid, row * grid, grid-1, grid -1);
                    hintCtx.rect(col * grid + 1, row * grid + 1, grid-3, grid -3);
                    hintCtx.stroke();
                    hintCtx.fillStyle = 'white';
                    hintCtx.fillRect(col * grid + 4, row * grid + 4, 4, 4);
                    hintCtx.fillRect(col * grid + 8, row * grid + 4, 2, 2);
                    hintCtx.fillRect(col * grid + 4, row * grid + 8, 2, 2);
                }
            }
        }

        for (let row = 0; row < 20; row++)
        {
            for (let col = 0; col < 12; col++)
            {
                if (playfield[row][col])
                {
                    const name = playfield[row][col];
                    ctx.fillStyle = colors[name][0];
                    ctx.strokeStyle = colors[name][1];

                    ctx.fillRect(col * grid + 4, row * grid + 4, grid-9, grid -9);
                    ctx.beginPath();
                    ctx.rect(col * grid, row * grid, grid-1, grid -1);
                    ctx.rect(col * grid + 1, row * grid + 1, grid-3, grid -3);
                    ctx.stroke();
                    ctx.fillStyle = 'white';
                    ctx.fillRect(col * grid + 4, row * grid + 4, 4, 4);
                    ctx.fillRect(col * grid + 8, row * grid + 4, 2, 2);
                    ctx.fillRect(col * grid + 4, row * grid + 8, 2, 2);
                }
            }
        }
        
        
        if (tetromino)
        {
            if (++count > difficulty)
            {
                tetromino.row++;
                count = 0;

                if(!isValidMove(tetromino.matrix, tetromino.row, tetromino.col))
                {
                    tetromino.row--;
                    placeTetromino();
                }
            }

            ctx.strokeStyle = colors[tetromino.name][1];

            for (let row = 0; row < tetromino.matrix.length; row++) 
            {
                for (let col = 0; col < tetromino.matrix[row].length; col++) 
                {
                    if (tetromino.matrix[row][col]) 
                    {
                    
                    ctx.fillStyle = colors[tetromino.name][0];
                    // и снова рисуем на один пиксель меньше
                    ctx.fillRect((tetromino.col + col) * grid + 4, (tetromino.row + row) * grid + 4, grid-9, grid-9);
                    ctx.beginPath();
                    ctx.rect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid -1);
                    ctx.rect((tetromino.col + col) * grid + 1, (tetromino.row + row) * grid + 1, grid-3, grid -3);
                    ctx.stroke();
                    ctx.fillStyle = 'white';
                    ctx.fillRect((tetromino.col + col) * grid + 8, (tetromino.row + row) * grid + 4, 2, 2);
                    ctx.fillRect((tetromino.col + col) * grid + 4, (tetromino.row + row) * grid + 4, 4, 4);
                    ctx.fillRect((tetromino.col + col) * grid + 4, (tetromino.row + row) * grid + 8, 2, 2);
                    }
                }
            }
        }
    }
    else if (gamePause)
    {
            ctx.fillStyle = 'black';
            ctx.globalAlpha = 0.75;
            ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 90);
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.font = '36px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseLine = 'middle';
            ctx.fillText('PAUSE', canvas.width /2, canvas.height / 2 + 25);
    }
    score.innerHTML = "SCORE: " + points;
    level.innerHTML = "LEVEL: " + lvl;

}
// Запустить цикл игры
function startGame()
{
    this.disabled = true;
    if (!controls_set)
    {
        document.addEventListener('keydown', controls);
        controls_set = true;
    }
    rAF = requestAnimationFrame(loop);   
}

function resetGame()
{
    cancelAnimationFrame(rAF);
    count = 0;
    difficulty = 50;
    points = 0;
    lvl = 0;
    // текущая фигура
    tetromino = getNextTetromino();
    // hint
    nextTetromino = getNextTetromino(); 
    // кадр анимации и флаги проигрыша и паузы
    rAF = null;
    gameOver = false;
    gamePause = false;
    for (let row = 0; row < 5; row++)
    {
        hintfield[row] = [];
        for (let col = 0; col < 6; col++)
        {
            hintfield[row][col] = 0;
        }
    }
// заполняем нулями
    for (let row = -2; row < 20; row++)
    {
        playfield[row] = [];
        for (let col = 0; col < 12; col++)
        {
            playfield[row][col] = 0;
        }
    }
    document.getElementById('startBtn').disabled = false;
    startGame();
    loadScores();
}

function controls(e) 
{
    // если игра закончилась — сразу выходим
    if (gameOver) return;
    
    if (e.which === 27)
    {
    togglePause();
    }
    if (!gamePause)
    {
    // стрелки влево и вправо
    if (e.which === 37 || e.which === 39) {
    const col = e.which === 37
    ? tetromino.col - 1
    : tetromino.col + 1;
    
    // если так ходить можно, то запоминаем текущее положение 
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
    tetromino.col = col;
    }
    }
    
    // стрелка вверх — поворот
    if (e.which === 38) {
    // поворачиваем фигуру на 90 градусов
    const matrix = rotate(tetromino.matrix);
    // если так ходить можно — запоминаем
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
    tetromino.matrix = matrix;
    }
    }
    
    // стрелка вниз — ускорить падение
    if(e.which === 40) {
    // смещаем фигуру на строку вниз
    const row = tetromino.row + 1;
    // если опускаться больше некуда — запоминаем новое положение
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
    tetromino.row = row - 1;
    // ставим на место и смотрим на заполненные ряды
    placeTetromino();
    return;
    }
    // запоминаем строку, куда стала фигура
    tetromino.row = row;
    }
    if (e.which === 32)
    {
    while (true)
    {
    // смещаем фигуру на строку вниз
    const row = tetromino.row + 1;
    // если опускаться больше некуда — запоминаем новое положение
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
    tetromino.row = row - 1;
    // ставим на место и смотрим на заполненные ряды
    placeTetromino();
    return;
    }
    // запоминаем строку, куда стала фигура
    tetromino.row = row;
    }
    }
    }
}

function updateName(e)
{
    const englishAlphabet = /[A-Za-z]/;
    if (e.key === 'Enter')
    {
        username = e.target.value;
        setCookie('username=', username);
        clearNameBlock();
    }
    else if (!englishAlphabet.test(e.key))
    {
        e.preventDefault();
    }
}

function clearNameBlock()
{
        document.getElementById('score_name').textContent = username;
        NameBox.style.opacity = "0%";
        cover.style.opacity = "0%";
        NameBox.addEventListener('transitionend', function () {
            document.getElementById('NameBlock').style.display = "none";
        });
}

function processScore() {
    if (points <= document.getElementById('top3score').textContent)
    {
        return;
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        loadScores();
    }
    xhttp.open("GET", "processscore.php?score=" + points + "&name=" + username, true);
    xhttp.send();
}


function loadScores() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        db = this.responseText;
        if (db != '')
        {
            // alert(db);
            const rows = db.split(';');
            // alert(rows);
            // alert(rows.length);
            for(let i = 1; i <= rows.length - 1; i++) // why do i get length 4 instead of 3?
            {
                const cols = rows[i-1].split(' ');
                document.getElementById('top' + i + 'user').textContent = cols[0];
                document.getElementById('top' + i + 'score').textContent = cols[1];
            }
        }
    }
    xhttp.open("GET", "loadscore.php", true);
    xhttp.send();
    
}

checkCookie();
loadScores();