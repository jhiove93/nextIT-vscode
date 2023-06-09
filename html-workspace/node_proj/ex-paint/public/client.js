const canvas = document.querySelector('#draw');
const context = canvas.getContext('2d');
const nextButton = document.querySelector('#next');
const clearButton = document.querySelector('#clear');

let drawing = false;
let isDrawer = false;
let lastX = 0;
let lastY = 0;

const socket = io();

socket.on('connect', () => {
    socket.emit('join');
});

socket.on('drawer', () => {
    isDrawer = true;
    nextButton.disabled = false;
    clearButton.disabled = false;
});

socket.on('userCount', (count) => {
    const userCountElement = document.querySelector('#user-count');
    userCountElement.textContent = count;
});

socket.on('currentDrawer', (drawerId) => {
    isDrawer = socket.id === drawerId;
    const currentDrawerElement = document.querySelector('#current-drawer');
    currentDrawerElement.textContent = isDrawer ? 'You' : drawerId;

    if (isDrawer) {
        nextButton.disabled = false;
        clearButton.disabled = false;
    } else {
        nextButton.disabled = true;
        clearButton.disabled = true;
    }
});

function startDrawing(x, y, isEmit = true) {
    lastX = x;
    lastY = y;

    if (!isEmit) {
        return;
    }

    const data = {
        x: x,
        y: y
    };
    socket.emit('start', data);
}

function draw(x, y, isEmit = true) {
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(x, y);
    context.stroke();
    context.closePath();
    lastX = x;
    lastY = y;

    if (!isEmit) {
        return;
    }

    const data = {
        x: x,
        y: y
    };
    socket.emit('draw', data);
}

function nextTurn() {
    if (isDrawer) {
        socket.emit('nextTurn');
    }
}

canvas.addEventListener('mousedown', (event) => {
    drawing = isDrawer;
    if (drawing) {
        startDrawing(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        draw(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (drawing) {
        draw(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    }
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
});

canvas.addEventListener('mouseleave', () => {
    drawing = false;
});

socket.on('start', (data) => {
    startDrawing(data.x, data.y, false);
});

socket.on('draw', (data) => {
    draw(data.x, data.y, false);
});

nextButton.addEventListener('click', nextTurn);

clearButton.addEventListener('click', () => {
    clearCanvas();
    socket.emit('clearCanvas');
});


function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

socket.on('clearCanvas', () => {
    clearCanvas();
});
