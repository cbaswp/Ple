document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de Elementos del DOM ---
    const player = document.getElementById('player');
    const gameContainer = document.getElementById('game-container');
    const obstaclesContainer = document.getElementById('obstacles-container');
    const itemsContainer = document.getElementById('items-container');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreElement = document.getElementById('final-score');
    const infoPopup = document.getElementById('info-popup');
    const popupText = document.getElementById('popup-text');
    
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const popupCloseButton = document.getElementById('popup-close-button');

    // --- Variables del Juego ---
    let score = 0;
    let highScore = localStorage.getItem('biblioRunnerHighScore') || 0;
    let isJumping = false;
    let isGameOver = true;
    
    // --- NUEVAS VARIABLES DE DIFICULTAD ---
    let gameSpeed = 4; // Velocidad inicial más lenta
    let speedIncrementThreshold = 50; // Aumentar velocidad cada 50 puntos
    let speedIncrementAmount = 0.5; // Cantidad de aumento de velocidad
    let lastSpeedIncreaseScore = 0; // Para controlar cuándo aumentar la velocidad

    let gameInterval;
    let itemSpawnInterval;
    let obstacleSpawnInterval;

    highScoreElement.textContent = `Récord: ${highScore}`;

    // --- Funciones del Juego ---
    
    function jump() {
        if (isJumping || isGameOver) return;
        isJumping = true;
        player.classList.add('jump');
        setTimeout(() => {
            player.classList.remove('jump');
            isJumping = false;
        }, 500);
    }

    function createObstacle() {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        const types = ['noise', 'food'];
        obstacle.classList.add(types[Math.floor(Math.random() * types.length)]);
        obstacle.style.right = '-60px';
        obstaclesContainer.appendChild(obstacle);
    }

    function createItem() {
        const item = document.createElement('div');
        item.classList.add('item');
        const types = ['book', 'ipad'];
        item.classList.add(types[Math.floor(Math.random() * types.length)]);
        item.style.right = '-60px';
        itemsContainer.appendChild(item);
    }

    function isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }

    function gameLoop() {
        if (isGameOver) return;

        const playerRect = player.getBoundingClientRect();

        // --- LÓGICA DE DIFICULTAD PROGRESIVA ---
        // Aumentar la velocidad del juego cada vez que se alcanza el umbral de puntos
        if (score > 0 && score - lastSpeedIncreaseScore >= speedIncrementThreshold) {
            gameSpeed += speedIncrementAmount;
            lastSpeedIncreaseScore = score;
            console.log("¡Dificultad aumentada! Nueva velocidad: " + gameSpeed.toFixed(2));
        }

        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obstacle => {
            let obstacleRight = parseInt(window.getComputedStyle(obstacle).getPropertyValue('right'));
            obstacleRight += gameSpeed;
            obstacle.style.right = `${obstacleRight}px`;

            const obstacleRect = obstacle.getBoundingClientRect();
            if (isColliding(playerRect, obstacleRect)) {
                endGame();
            }

            if (obstacleRight > gameContainer.offsetWidth) {
                obstacle.remove();
            }
        });

        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            let itemRight = parseInt(window.getComputedStyle(item).getPropertyValue('right'));
            itemRight += gameSpeed;
            item.style.right = `${itemRight}px`;

            const itemRect = item.getBoundingClientRect();
            if (isColliding(playerRect, itemRect)) {
                score += 10;
                scoreElement.textContent = `Puntos: ${score}`;
                item.remove();

                // El popup ahora aparece cada 200 puntos para ser menos intrusivo
                if (score % 100 === 0) {
                    showInfoPopup();
                }
            }
            
            if (itemRight > gameContainer.offsetWidth) {
                item.remove();
            }
        });
    }

    function showInfoPopup() {
        isGameOver = true;
        const tips = [
            "¡Tip! Puedes reservar un cubículo de estudio hasta por 2 horas al día.",
            "¡Sabías que! Con tu TIU, tienes acceso a bases de datos de revistas científicas.",
            "¡Importante! Recuerda que no se permite comida en las áreas de estudio.",
            "¿Pregunta! ¿Cuántos días puedes tener un iPad en préstamo? a) 1, b) 3, c) 7. (La respuesta es a)"
        ];
        popupText.textContent = tips[Math.floor(Math.random() * tips.length)];
        infoPopup.classList.remove('hidden');
    }
    
    function startGame() {
        isGameOver = false;
        score = 0;
        gameSpeed = 4; // Reiniciar a la velocidad inicial
        lastSpeedIncreaseScore = 0; // Reiniciar el control de velocidad
        scoreElement.textContent = `Puntos: ${score}`;
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        
        obstaclesContainer.innerHTML = '';
        itemsContainer.innerHTML = '';

        gameInterval = setInterval(gameLoop, 20);
        obstacleSpawnInterval = setInterval(createObstacle, 2000);
        itemSpawnInterval = setInterval(createItem, 1500);
    }

    function endGame() {
        isGameOver = true;
        clearInterval(gameInterval);
        clearInterval(obstacleSpawnInterval);
        clearInterval(itemSpawnInterval);

        finalScoreElement.textContent = `Puntuación Final: ${score}`;
        gameOverScreen.classList.remove('hidden');

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = `Récord: ${highScore}`;
            localStorage.setItem('biblioRunnerHighScore', highScore);
        }
    }

    // --- Event Listeners (Versión robusta para Chrome) ---
    function handleInteraction(element, callback) {
        element.addEventListener('click', callback);
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            callback();
        });
    }

    // Controles de salto
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
            jump();
        }
    });
    handleInteraction(gameContainer, jump);

    // Botones de la UI
    handleInteraction(startButton, startGame);
    handleInteraction(restartButton, startGame);
    
    handleInteraction(popupCloseButton, () => {
        infoPopup.classList.add('hidden');
        isGameOver = false;
    });
});

