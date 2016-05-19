var gameStart = false;
var defaultEnemy;
var rightEnemy;
var explosion;
var sideEnemyW = 46;
var sideEnemyH = 83;
var leftEnemy;
var life = 1000;
var explodeTime = 0;

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
var iSprPos = 0; // initial sprite frame
var iSprDir = 0; // initial dragon direction
var iEnemyW = 128; // enemy width
var iEnemyH = 128; // enemy height
var iBallSpeed = 10; // initial ball speed
var iEnemySpeed = 5; // initial enemy speed

var dragonSound; // dragon sound
var wingsSound; // wings sound
var explodeSound, explodeSound2; // explode sounds
var laughtSound; // wings sound

var up = false;
var down = false;
var right = false;
var left = false;

var bMouseDown = false; // mouse down state
var iLastMouseX = 0;
var iLastMouseY = 0;
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

    // draw background
    iBgShiftX += 4;
    if (iBgShiftX >= 1045) {
        iBgShiftX = 0;
    }
    //ctx.drawImage(backgroundImage, 0 + iBgShiftX, 0, 2532/2, 940, 0, 0, 1000, 600);

        // update sprite positions
    iSprPos++;
    if (iSprPos >= 9) {
        iSprPos = 0;
    }

    // in case of mouse down - move dragon more close to our mouse
    if (bMouseDown) {
        /*if (iLastMouseX > dragon.x) {
            dragon.x += 5;
        }
        if (iLastMouseY > dragon.y) {
            dragon.y += 5;
        }
        if (iLastMouseX < dragon.x) {
            dragon.x -= 5;
        }
        if (iLastMouseY < dragon.y) {
            dragon.y -= 5;
        }*/
        if(left) dragon.x -= 10;
        if(up) dragon.y -= 10;
        if(right) dragon.x += 10;
        if(down) dragon.y += 10;
        //bMouseDown = false;
    }

    // draw dragon
    //ctx.drawImage(dragon.image, iSprPos*dragon.w, iSprDir*dragon.h, dragon.w, dragon.h, dragon.x - dragon.w/2, dragon.y - dragon.h/2, dragon.w, dragon.h);
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
    }

    // draw score
    ctx.font = '20px Verdana';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + iScore * 10, 900, 580);
    ctx.fillText('Life: ' + life, 100, 580);
    //ctx.fillText('Plese click "1" to cast fireball', 100, 580);
}

// -------------------------------------------------------------

// initialization
$(function(){
    /*$('#startBtn').on('click', function(){
        $('#playground').css('display', 'block');
        $('#userInfo').css('display', 'none');
        gameStart = true;
        start();
    });*/
    $('#pauseBtn').on('click', function(){
        if(life > 0) gameStart = !gameStart;
    });
    //testStart();
});

function start()
{
    canvas = document.getElementById('scene');
    ctx = canvas.getContext('2d');
    canvas.width  = 1920;
    canvas.height = 600;

    // 'Dragon' music init
    dragonSound = new Audio('media/dragon.wav');
    dragonSound.volume = 0.9;

    // 'Explode' music inits
    explodeSound = new Audio('media/explode1.wav');
    explodeSound.volume = 0.9;
    explodeSound2 = new Audio('media/explosion.wav');
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
    oBallImage.src = 'images/fireball.png';
    oBallImage.onload = function() { }

    // initialization of empty enemy
    defaultEnemy = new Image();
    defaultEnemy.src = 'images/default_enemy.png';
    defaultEnemy.onload = function() { }
    //default enemy
    DRAW();

    // initialization of right empty enemy
    rightEnemy = new Image();
    rightEnemy.src = 'images/right_enemy.png';
    rightEnemy.onload = function() { }

    // initialization of left empty enemy
    leftEnemy = new Image();
    leftEnemy.src = 'images/left_enemy.png';
    leftEnemy.onload = function() { }

    //explode image
    explosion = new Image();
    explosion.src = 'images/explosion.png';
    explosion.onload = function() { }

    // initialization of dragon
    var oDragonImage = new Image();
    oDragonImage.id = 'dragon';
    //oDragonImage.src = 'images/dragon-purple.png';
    oDragonImage.src = dragonImg;

    oDragonImage.onload = function() {
        dragon = new Dragon(400, 300, dragonW, dragonH, oDragonImage);
    }

    /*$('#scene').mousedown(function(e) { // binding mousedown event (for dragging)
     var mouseX = e.layerX || 0;
     var mouseY = e.layerY || 0;
     if(e.originalEvent.layerX) { // changes for jquery 1.7
     mouseX = e.originalEvent.layerX;
     mouseY = e.originalEvent.layerY;
     }

     bMouseDown = true;

     if (mouseX > dragon.x- dragon.w/2 && mouseX < dragon.x- dragon.w/2 +dragon.w &&
     mouseY > dragon.y- dragon.h/2 && mouseY < dragon.y-dragon.h/2 +dragon.h) {

     dragon.bDrag = true;
     dragon.x = mouseX;
     dragon.y = mouseY;
     }
     });*/

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

    /*$('#scene').mousemove(function(e) { // binding mousemove event
     var mouseX = e.layerX || 0;
     var mouseY = e.layerY || 0;
     if(e.originalEvent.layerX) {
     mouseX = e.originalEvent.layerX;
     mouseY = e.originalEvent.layerY;
     }

     // saving last coordinates
     iLastMouseX = mouseX;
     iLastMouseY = mouseY;

     // perform dragon dragging
     if (dragon.bDrag) {
     dragon.x = mouseX;
     dragon.y = mouseY;
     }

     // change direction of dragon (depends on mouse position)
     if (mouseX > dragon.x && Math.abs(mouseY-dragon.y) < dragon.w/2) {
     iSprDir = 0;
     } else if (mouseX < dragon.x && Math.abs(mouseY-dragon.y) < dragon.w/2) {
     iSprDir = 4;
     } else if (mouseY > dragon.y && Math.abs(mouseX-dragon.x) < dragon.h/2) {
     iSprDir = 2;
     } else if (mouseY < dragon.y && Math.abs(mouseX-dragon.x) < dragon.h/2) {
     iSprDir = 6;
     } else if (mouseY < dragon.y && mouseX < dragon.x) {
     iSprDir = 5;
     } else if (mouseY < dragon.y && mouseX > dragon.x) {
     iSprDir = 7;
     } else if (mouseY > dragon.y && mouseX < dragon.x) {
     iSprDir = 3;
     } else if (mouseY > dragon.y && mouseX > dragon.x) {
     iSprDir = 1;
     }
     });*/
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

        // play dragon sound
        /*dragonSound.currentTime = 0;
        dragonSound.play();*/
    });

    /*$('#scene').mouseup(function(e) { // binding mouseup event
     dragon.bDrag = false;
     bMouseDown = false;

     // play dragon sound
     dragonSound.currentTime = 0;
     dragonSound.play();
     });*/

    $(window).keydown(function(event){ // keyboard alerts
        switch (event.keyCode) {
            case 49: // '1' key
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

    setInterval(drawScene, 20); // loop drawScene

    // generate enemies randomly
    var enTimer = null;
    function addEnemy() {
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
