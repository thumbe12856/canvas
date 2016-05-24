var gameStart = false;
var defaultEnemy;
var rightEnemy;
var explosion;
var sideEnemyW = 46;
var sideEnemyH = 83;
var leftEnemy;
var life = 1000;
var distance = 1000;
var explodeTime = 0;
var gameOver = false;

// inner variables
var canvas, ctx;
var backgroundImage;
var iBgShiftX = 100;

var dragon, enemy = null; // game objects
var balls = [];
var enemies = [];
var sideEnemies = [];

var dragonW = 100; // dragon width
var dragonH = 100; // dragon height
var iEnemyW = 128; // enemy width
var iEnemyH = 128; // enemy height
var iBallSpeed = 10/2; // initial ball speed
var iEnemySpeed = 5/2; // initial enemy speed

var dragonSound; // dragon sound
var explodeSound, explodeSound2; // explode sounds

var up = false;
var down = false;
var right = false;
var left = false;

var bMouseDown = false; // mouse down state
var iScore = 0;

// -------------------------------------------------------------

// objects :
function Dragon(x, y, w, h, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.image = image;
    this.bDrag = false;
}
function Ball(x, y, w, h, speed, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.image = image;
}
function Enemy(x, y, w, h, speed, image) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
    this.image = image;
}
// -------------------------------------------------------------
// get random number between X and Y
function getRand(x, y) {
    return Math.floor(Math.random()*y)+x;
}

// draw functions :
function drawScene() { // main drawScene function
    if(!gameStart) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas

    // in case of mouse down - move dragon more close to our mouse
    if (bMouseDown) {
        if(left) dragon.x -= 10;
        if(up) dragon.y -= 10;
        if(right) dragon.x += 10;
        if(down) dragon.y += 10;
        //bMouseDown = false;
    }

    // draw dragon
    ctx.drawImage(dragon.image, dragon.x , dragon.y);

    // draw fireballs
    if (balls.length > 0) {
        for (var key in balls) {
            if (balls[key] != undefined) {
                ctx.drawImage(balls[key].image, balls[key].x, balls[key].y);
                balls[key].x += balls[key].speed;

                if (balls[key].x > canvas.width) {
                    delete balls[key];
                }
            }
        }
    }

    // draw enemies
    if (enemies.length > 0) {
        for (var ekey in enemies) {
            if (enemies[ekey] != undefined) {
                ctx.drawImage(enemies[ekey].image, enemies[ekey].x, enemies[ekey].y);
                enemies[ekey].x += enemies[ekey].speed;

                if (enemies[ekey].x < - iEnemyW) {
                    delete enemies[ekey];
                }
            }
        }
    }

    if (sideEnemies.length > 0) {
        for (var ekey in sideEnemies) {
            if (sideEnemies[ekey] != undefined) {
                ctx.drawImage(sideEnemies[ekey].image, sideEnemies[ekey].x, sideEnemies[ekey].y);
                sideEnemies[ekey].y += sideEnemies[ekey].speed;
            }
        }
    }

    // collision detection
    if (balls.length > 0) {
        for (var key in balls) {
            if (balls[key] != undefined) {
                if (enemies.length > 0) attack(enemies, key);
                if (sideEnemies.length > 0) attack(sideEnemies, key);
            }
        }
    }

    if(explodeTime) {
        ctx.drawImage(explosion, dragon.x , dragon.y);
        explodeTime--;
    }

    if(life > 0) {
        hurt(enemies);
        hurt(sideEnemies);
    } else {
        gameStart = false;
        gameOver = true;
    }

    $('#score').html('Score: ' + iScore * 10);
}

// -------------------------------------------------------------

// initialization
$(function(){
    $('.modal-trigger').leanModal();
    addRank();

    $('#rankBtn').on('click', function(event){
        if($(this).hasClass('disabled')) {
            $('#rankModal').closeModal();
        }
    });
    $('#restart').on('click', function(){
        start();
    });
    $('#pauseBtn').on('click', function(){
        if(life > 0) gameStart = !gameStart;

        if(gameStart) $('#rankBtn').addClass('disabled');
        else $('#rankBtn').removeClass('disabled');
    });
    //testStart();
});

function start()
{
    life = 1000;
    distance = 1000;
    iScore = 0;
    gameStart = true;
    gameOver = false;
    $('#rankBtn').addClass('disabled');
    $('#lifeProgressBarDiv h2').html('Life: 1000/1000');
    $('#lifeProgressBar').width('100%').html('100%');
    $('#score').html('Score: 0');
    $('#distance').html('1000km');
    $('#rankModal').closeModal();
    for (var i = 1; i < 99999; i++)
        window.clearInterval(i);

    deleteOBJ(enemies);
    deleteOBJ(sideEnemies);
    deleteOBJ(balls);

    canvas = document.getElementById('scene');
    ctx = canvas.getContext('2d');
    canvas.width  = 1920;
    canvas.height = 600;

    // 'Dragon' music init
    if(dragonSound) {
        dragonSound.pause();
        dragonSound.currentTime = 0;
        delete(dragonSound);
    }
    dragonSound = new Audio('http://dmplus.cs.ccu.edu.tw/~s402410052/canvas/media/dragon.wav');
    dragonSound.volume = 0.9;
    dragonSound.addEventListener('ended', function() { // loop wings sound
        this.pause();
        this.currentTime = 0;
        this.play();
    }, false);
    dragonSound.pause();
    dragonSound.currentTime = 0;
    dragonSound.play();



    // 'Explode' music inits
    explodeSound = new Audio('http://dmplus.cs.ccu.edu.tw/~s402410052/canvas/media/explode1.wav');
    explodeSound.volume = 0.9;
    explodeSound2 = new Audio('http://dmplus.cs.ccu.edu.tw/~s402410052/canvas/media/explosion.wav');
    explodeSound2.volume = 0.9;

    // 'Wings' music init
    /*wingsSound = new Audio('media/wings.wav');
    wingsSound.volume = 0.9;
    wingsSound.addEventListener('ended', function() { // loop wings sound
        this.currentTime = 0;
        this.play();
    }, false);
    wingsSound.play();*/

    // initialization of empty ball
    var oBallImage = new Image();
    oBallImage.src = 'http://dmplus.cs.ccu.edu.tw/~s402410052/canvas/images/fireball.png';
    oBallImage.onload = function() { }

    // initialization of empty enemy
    defaultEnemy = new Image();
    defaultEnemy.src = 'http://dmplus.cs.ccu.edu.tw/~s402410052/canvas/images/default_enemy.png';
    defaultEnemy.onload = function() { }
    //default enemy
    DRAW();

    // initialization of right empty enemy
    rightEnemy = new Image();
    rightEnemy.src = 'http://dmplus.cs.ccu.edu.tw/~s402410052/canvas/images/right_enemy.png';
    rightEnemy.onload = function() { }

    // initialization of left empty enemy
    leftEnemy = new Image();
    leftEnemy.src = 'http://dmplus.cs.ccu.edu.tw/~s402410052/canvas/images/left_enemy.png';
    leftEnemy.onload = function() { }

    //explode image
    explosion = new Image();
    explosion.src = 'http://dmplus.cs.ccu.edu.tw/~s402410052/canvas/images/explosion.png';
    explosion.onload = function() { }

    // initialization of dragon
    var oDragonImage = new Image();
    oDragonImage.id = 'dragon';
    //oDragonImage.src = 'images/dragon-purple.png';
    oDragonImage.src = dragonImg;

    oDragonImage.onload = function() {
        dragon = new Dragon(400, 300, dragonW, dragonH, oDragonImage);
    }

    $(window).keydown(function(e) {
        bMouseDown = true;
        switch(e.keyCode)
        {
            case 37: //left
                left = true;
                break;

            case 38: //up
                up = true;
                break;

            case 39: //right
                right = true;
                break;

            case 40: //down
                down = true;
                break;
        }
    });

    $(window).keyup(function(e) {
        bMouseDown = false;
        switch(e.keyCode)
        {
            case 37: //left
                left = false;
                break;

            case 38: //up
                up = false;
                break;

            case 39: //right
                right = false;
                break;

            case 40: //down
                down = false;
                break;
        }

    });

    $(window).keydown(function(event){ // keyboard alerts
        switch (event.keyCode) {
            case 70: // 'f' key
                balls.push(new Ball(dragon.x + 100, dragon.y + 50, 32, 32, iBallSpeed, oBallImage));

                // play explode sound #1
                explodeSound.currentTime = 0;
                explodeSound.play();
                break;

            case 37: //left
                bMouseDown = true;
                left = true;
                break;

            case 38: //up
                bMouseDown = true;
                up = true;
                break;

            case 39: //right
                bMouseDown = true;
                right = true;
                break;

            case 40: //down
                bMouseDown = true;
                down = true;
                break;
        }
    });

    setInterval(function() {
        if(!gameOver) return;
        gameOver = false;
        if(!localStorage.rank1Score) {
            localStorage.rank1Score = iScore * 10;
            localStorage.rank1Name = userName;
        } else if(iScore * 10 > localStorage.rank1Score ) {
            localStorage.rank3Score = localStorage.rank2Score;
            localStorage.rank3Name = localStorage.rank2Name;

            localStorage.rank2Score = localStorage.rank1Score;
            localStorage.rank2Name = localStorage.rank1Name;

            localStorage.rank1Score = iScore * 10;
            localStorage.rank1Name = userName;
        } else if(!localStorage.rank2Score) {
            localStorage.rank2Score = iScore * 10;
            localStorage.rank2Name = userName;
        } else if(iScore * 10 > localStorage.rank2Score || localStorage.rank2Score == 0 || !localStorage.rank2Score) {
            localStorage.rank3Score = localStorage.rank2Score;
            localStorage.rank3Name = localStorage.rank2Name;

            localStorage.rank2Score = iScore * 10;
            localStorage.rank2Name = userName;
        } else if(!localStorage.rank3Score) {
            localStorage.rank3Score = iScore * 10;
            localStorage.rank3Name = userName;
        } else if(iScore * 10 > localStorage.rank3Score || localStorage.rank3Score == 0 || !localStorage.rank3Score) {
            localStorage.rank3Score = iScore * 10;
            localStorage.rank3Name = userName;
        }
        addRank();
        $('#rankModal .modal-content h1').html(userName + ' scores ' + iScore * 10 + ' points.');
        $('#rankModal').openModal();
    }, 1000); //draw distance

    setInterval(function() {
        if(!gameStart) return;
        distance -= 10;
        if(distance < 0) {
            gameStart = false;
            gameOver = true;
            return;
        }
        $('#distance').html(distance + 'km');
    }, 1000); //draw distance

    setInterval(drawScene, 10);

    // generate enemies randomly
    var enTimer = null;
    function addEnemy() {
        if(!gameStart) return;
        clearInterval(enTimer);
        var randY = getRand(0, canvas.height - iEnemyH);
        enemies.push(new Enemy(canvas.width, randY, iEnemyW, iEnemyH, - iEnemySpeed, defaultEnemy));

        var randX = getRand(0, canvas.width - sideEnemyW);
        sideEnemies.push(new Enemy(randX, canvas.height, sideEnemyW, sideEnemyH , - iEnemySpeed, rightEnemy));

        randX = getRand(0, canvas.width - sideEnemyW);
        sideEnemies.push(new Enemy(randX, 0, sideEnemyW, sideEnemyH , iEnemySpeed, leftEnemy));


        var interval = getRand(1000, 1500);
        enTimer = setInterval(addEnemy, interval); // loop drawScene
    }
    addEnemy();
}

function attack(enemy, key)
{
    for (var ekey in enemy) {
        if (enemy[ekey] != undefined && balls[key] != undefined) {
            if (balls[key].x + balls[key].w > enemy[ekey].x && balls[key].y + balls[key].h > enemy[ekey].y && balls[key].y < enemy[ekey].y + enemy[ekey].h && balls[key].x < enemy[ekey].x + enemy[ekey].w) {
                ctx.drawImage(explosion, enemy[ekey].x , enemy[ekey].y);
                delete enemy[ekey];
                delete balls[key];
                iScore++;

                // play explode sound #2
                explodeSound2.currentTime = 0;
                explodeSound2.play();
            }
        }
    }
}

function hurt(enemies)
{
    for (var key in enemies) {
        if (enemies[key] != undefined && dragon != undefined) {
            if (dragon.x + dragon.w > enemies[key].x && dragon.y + dragon.h > enemies[key].y && dragon.y < enemies[key].y + enemies[key].h && dragon.x < enemies[key].x + enemies[key].w) {
                delete enemies[key];
                life-=50;
                $('#lifeProgressBarDiv h2').html('Life: ' + life + '/1000');
                $('#lifeProgressBar').width(life/10 + '%').html(life/10 + '%');

                // play explode sound #2
                explodeSound2.currentTime = 0;
                explodeSound2.play();
                explodeTime = 7;
            }
        }
    }
}

function deleteOBJ(who)
{
    for (var key in who) {
        delete who[key];
    }
}

function addRank()
{
    var modal = $('#rankModal .modal-content .row');
    modal.empty().append('<h4><span class="col s4">Rank</span><span class="col s4">Name</span><span class="col s4">Score</span></h4>');
    if(!localStorage.rank1Name) {
        modal.append('<h4><span class="col s4">1</span><span class="col s4">XXXXX</span><span class="col s4">0</span></h4>');
    } else {
        modal.append('<h4><span class="col s4">1</span><span class="col s4">'+localStorage.rank1Name+'</span><span class="col s4">'+localStorage.rank1Score+'</span></h4>');
    }
    if(!localStorage.rank2Name) {
        modal.append('<h4><span class="col s4">2</span><span class="col s4">XXXXX</span><span class="col s4">0</span></h4>');
    } else {
        modal.append('<h4><span class="col s4">2</span><span class="col s4">'+localStorage.rank2Name+'</span><span class="col s4">'+localStorage.rank2Score+'</span></h4>');
    }
    if(!localStorage.rank3Name) {
        modal.append('<h4><span class="col s4">3</span><span class="col s4">XXXXX</span><span class="col s4">0</span></h4>');
    } else {
        modal.append('<h4><span class="col s4">3</span><span class="col s4">'+localStorage.rank3Name+'</span><span class="col s4">'+localStorage.rank3Score+'</span></h4>');
    }
}
