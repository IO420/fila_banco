let canvas = document.getElementById("canvas");

let is_dragging = false;
let selected_circle = null;
let circles = [];
let queue = [];
var window_height = window.innerHeight;
var window_width = window.innerWidth;

const redSquare = { x: window_width*.3, y: window_height*.2, w: 50, h: 50 };
const greenSquare = { x: window_width*.6, y: window_height*.4, w: 200, h: 50 };
const blueScuare = { x: window_width*.9, y: window_height*.350, w: 50, h: 150 };
const blackScuare = { x: window_width*.6, y: window_height*.400, w: 200, h: 5 };
const blackScuare2 = { x: window_width*.6, y: window_height*.450, w: 200, h: 5 };

if (!canvas) {
  console.log("Canvas element not found!");
} else {
  let context = canvas.getContext("2d");
  // Set the canvas dimensions
  canvas.width = window_width;
  canvas.height = window_height;

  // Set the canvas background color
  canvas.style.background = "#cfcfcf";

  // Draw the red square
  context.fillStyle = "red";
  context.fillRect(redSquare.x, redSquare.y, redSquare.w, redSquare.h);

  // Draw the green square
  context.fillStyle = "green";
  context.fillRect(greenSquare.x, greenSquare.y, greenSquare.w, greenSquare.h);

  context.fillStyle = "black";
  context.fillRect(blackScuare.x, blackScuare.y, blackScuare.w, blackScuare.h);

  context.fillStyle = "black";
  context.fillRect(
    blackScuare2.x,
    blackScuare2.y,
    blackScuare2.w,
    blackScuare2.h
  );

  // Draw the blue square
  context.fillStyle = "blue";
  context.fillRect(blueScuare.x, blueScuare.y, blueScuare.w, blueScuare.h);

  if (context) {
    var sprite = new Image();
    sprite.src = "pngwing.com.png";

    sprite.onload = function () {
      let columns = 10;
      let rows = 8;
      let frameWidth = sprite.width / columns;
      let frameHeight = sprite.height / rows;

      let animationRow = 5; // Fila inicial (hacia abajo)

      const getDirectionRow = (dx, dy) => {
        if (Math.abs(dx) > Math.abs(dy)) {
          return dx > 0 ? 7 : 6; // Derecha o Izquierda
        } else {
          return dy > 0 ? 5 : 4; // Abajo o Arriba
        }
      };

      Circle.prototype.moveToTarget = function (targetX, targetY, callback) {
        this.is_moving = true;

        const animate = () => {
          if (!this.is_moving) return;

          let dx = targetX - this.xpos;
          let dy = targetY - this.ypos;
          let distance = Math.sqrt(dx ** 2 + dy ** 2);

          animationRow = getDirectionRow(dx, dy);

          if (distance < 5) {
            this.xpos = targetX;
            this.ypos = targetY;
            this.is_moving = false;
            redraw();

            if (isInsideShape(this, greenSquare)) {
              queue.push(this);
              processQueue();
            }

            if (callback) callback();
            return;
          }

          let speed = 3;
          this.xpos += (dx / distance) * speed;
          this.ypos += (dy / distance) * speed;

          redraw();
          requestAnimationFrame(animate);
        };

        animate();
      };

      function redraw() {
        let context = canvas.getContext("2d");

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw the squares
        context.fillStyle = "red";
        context.fillRect(redSquare.x, redSquare.y, redSquare.w, redSquare.h);

        context.fillStyle = "green";
        context.fillRect(
          greenSquare.x,
          greenSquare.y,
          greenSquare.w,
          greenSquare.h
        );

        context.fillStyle = "black";
        context.fillRect(
          blackScuare.x,
          blackScuare.y,
          blackScuare.w,
          blackScuare.h
        );

        context.fillRect(
          blackScuare2.x,
          blackScuare2.y,
          blackScuare2.w,
          blackScuare2.h
        );

        context.fillStyle = "blue";
        context.fillRect(
          blueScuare.x,
          blueScuare.y,
          blueScuare.w,
          blueScuare.h
        );

        // Draw all sprites
        for (let circle of circles) {
          let column = circle.currentFrame % columns;

          // Escalar el sprite para que sea más pequeño
          const scaleFactor = 0.5; // Cambia este valor para ajustar el tamaño
          const scaledWidth = frameWidth * scaleFactor;
          const scaledHeight = frameHeight * scaleFactor;

          context.drawImage(
            sprite,
            column * frameWidth,
            animationRow * frameHeight,
            frameWidth,
            frameHeight,
            circle.xpos - scaledWidth / 2,
            circle.ypos - scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );
        }
      }

      // Sprite animation loop
      setInterval(() => {
        for (let circle of circles) {
            circle.updateAnimation();
          }
      }, 100);
      
    };
  }
}

const positions = [
  { x: blueScuare.x, y: blueScuare.y + 25, occupied: false },
  { x: blueScuare.x, y: blueScuare.y + 75, occupied: false },
  { x: blueScuare.x, y: blueScuare.y + 125, occupied: false },
];

function processQueue() {
  if (queue.length > 0) {
    for (let position of positions) {
      if (!position.occupied) {
        let circle = queue.shift(); // Obtén el primer círculo en la fila
        position.occupied = true;
        circle.currentTarget = { x: position.x, y: position.y };
        circle.moveToTarget(position.x, position.y, () => {
          handleCircleAtPosition(circle, position);
        });
        break; // Solo ocupa una posición por llamada
      }
    }
  }
}

let mouse_click_verify = function (x, y, shape) {
  let shape_left = shape.x;
  let shape_right = shape.x + shape.width;
  let shape_top = shape.y;
  let shape_bottom = shape.y + shape.height;

  if (x > shape_left && x < shape_right && y > shape_top && y < shape_bottom)
    return true;

  return false;
};

let mouse_down = function (e) {
  e.preventDefault();
  let startx = parseInt(e.clientX);
  let starty = parseInt(e.clientY);

  for (let circle of circles) {
    let distance = Math.sqrt(
      (circle.xpos - startx) ** 2 + (circle.ypos - starty) ** 2
    );
    if (distance <= circle.radius) {
      is_dragging = true;
      selected_circle = circle;
      circle.is_moving = false;
      return;
    }
  }

  if (
    mouse_click_verify(startx, starty, {
      x: redSquare.x,
      y: redSquare.y,
      width: redSquare.w,
      height: redSquare.h,
    })
  ) {
    is_dragging = true;
    let new_circle = new Circle(startx, starty, 20, "blue");
    circles.push(new_circle);
    selected_circle = new_circle;
    redraw();
  }
};

let mouse_up = function (e) {
  if (!is_dragging) {
    return;
  }
  e.preventDefault();
  is_dragging = false;

  if (selected_circle) {
    selected_circle.moveToTarget(
      selected_circle.currentTarget.x,
      selected_circle.currentTarget.y
    );
  }
  selected_circle = null;
};

let mouse_out = function (e) {
  if (!is_dragging) {
    return;
  }
  e.preventDefault();
  is_dragging = false;
  selected_circle = null;
};

let mouse_move = function (e) {
  if (!is_dragging || !selected_circle) {
    return;
  }
  e.preventDefault();
  let mousex = parseInt(e.clientX);
  let mousey = parseInt(e.clientY);

  selected_circle.xpos = mousex;
  selected_circle.ypos = mousey;
  redraw();
};

function redraw() {
  let context = canvas.getContext("2d");

  // Limpiar el canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar los cuadrados
  context.fillStyle = "red";
  context.fillRect(redSquare.x, redSquare.y, redSquare.w, redSquare.h);

  context.fillStyle = "green";
  context.fillRect(greenSquare.x, greenSquare.y, greenSquare.w, greenSquare.h);

  context.fillStyle = "black";
  context.fillRect(blackScuare.x, blackScuare.y, blackScuare.w, blackScuare.h);

  context.fillRect(
    blackScuare2.x,
    blackScuare2.y,
    blackScuare2.w,
    blackScuare2.h
  );

  context.fillStyle = "blue";
  context.fillRect(blueScuare.x, blueScuare.y, blueScuare.w, blueScuare.h);

  // Dibujar cada bola con su propio sprite
  for (let circle of circles) {
    circle.draw(context, sprite.width / 10, sprite.height / 8, 10); // Pasa columnas y tamaño del sprite
  }
}

class Circle {
  constructor(xpos, ypos, radius, color, sprite) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.radius = radius;
    this.color = color;
    this.sprite = sprite; // Imagen del sprite
    this.currentFrame = 0; // Frame actual de animación
    this.animationRow = 5; // Fila de animación inicial
    this.is_moving = false;
    this.currentTarget = { x: greenSquare.x + 25, y: greenSquare.y + 25 };
  }

  draw(context, frameWidth, frameHeight, columns) {
    let column = this.currentFrame % columns;

    // Escalar el sprite para que sea más pequeño
    const scaleFactor = 0.5; // Cambia este valor para ajustar el tamaño
    const scaledWidth = frameWidth * scaleFactor;
    const scaledHeight = frameHeight * scaleFactor;

    context.drawImage(
      this.sprite,
      column * frameWidth,
      this.animationRow * frameHeight,
      frameWidth,
      frameHeight,
      this.xpos - scaledWidth / 2,
      this.ypos - scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );
  }

  // Actualiza el fotograma de animación de este círculo
  updateAnimation() {
    this.currentFrame = (this.currentFrame + 1) % 10; // Actualiza el frame
  }

  moveToTarget(targetX, targetY, callback) {
    this.is_moving = true;

    const animate = () => {
      if (!this.is_moving) return;

      let dx = targetX - this.xpos;
      let dy = targetY - this.ypos;
      let distance = Math.sqrt(dx ** 2 + dy ** 2);

      this.animationRow = getDirectionRow(dx, dy); // Actualiza la fila según la dirección

      if (distance < 5) {
        this.xpos = targetX;
        this.ypos = targetY;
        this.is_moving = false;
        this.currentTarget = { x: targetX, y: targetY };
        redraw();
        if (callback) callback();
        return;
      }

      let speed = 3;
      this.xpos += (dx / distance) * speed;
      this.ypos += (dy / distance) * speed;

      redraw();
      requestAnimationFrame(animate);
    };

    animate();
  }
}

function isInsideShape(circle, shape) {
  return (
    circle.xpos + circle.radius > shape.x &&
    circle.xpos - circle.radius < shape.x + shape.w &&
    circle.ypos + circle.radius > shape.y &&
    circle.ypos - circle.radius < shape.y + shape.h
  );
}

function moveToRedSquareAndRemove(circle) {
  circle.moveToTarget(
    redSquare.x + redSquare.w / 2,
    redSquare.y + redSquare.h / 2,
    () => {
      // Elimina el círculo del canvas
      circles = circles.filter((c) => c !== circle);
      redraw();
      console.log("Circle removed after reaching red square.");
    }
  );
}

function handleCircleAtPosition(circle, position) {
  // Tiempo aleatorio entre 5 segundos y 1 minuto
  const waitTime = Math.random() * (60000 - 5000) + 5000;

  setTimeout(() => {
    console.log("Circle leaving position:", position);

    position.occupied = false;

    moveToRedSquareAndRemove(circle);
    processQueue();
  }, waitTime);
}

function isNearObstacle(circle, obstacles) {
  for (let obstacle of obstacles) {
    if (isInsideShape(circle, obstacle)) {
      return true;
    }
  }
  return false;
}

// Función para obtener las posibles direcciones de movimiento del círculo
function getAvailableDirections(circle, obstacles) {
  const directions = [
    { x: 0, y: -1 }, // Arriba
    { x: 0, y: 1 }, // Abajo
    { x: -1, y: 0 }, // Izquierda
    { x: 1, y: 0 }, // Derecha
  ];

  let availableDirections = [];

  for (let dir of directions) {
    let newX = circle.xpos + dir.x * circle.radius * 2; // Multiplicamos por el radio para moverlo completamente
    let newY = circle.ypos + dir.y * circle.radius * 2;

    // Verificamos si la nueva posición colisionaría con algún obstáculo
    if (
      !isNearObstacle(
        { xpos: newX, ypos: newY, radius: circle.radius },
        obstacles
      )
    ) {
      availableDirections.push({ x: newX, y: newY });
    }
  }

  return availableDirections;
}

canvas.onmousedown = mouse_down;
canvas.onmouseup = mouse_up;
canvas.onmouseout = mouse_out;
canvas.onmousemove = mouse_move;
