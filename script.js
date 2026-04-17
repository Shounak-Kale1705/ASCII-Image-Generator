let video;
const charsets = {
    simple: " .:-=+*#%@@",
    complex: " .'`^ \",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhaoo*#MW&8%B@$",
    binary: " 01"
};

let currentMode = 'matrix';
let currentCharset = 'simple';

function setup() {
    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO);
    video.size(160, 120);
    video.hide();
    
    // UI Logic
    setupUI();
}

function setupUI() {
    document.querySelectorAll('#modeSelect button').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('#modeSelect button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-value');
        };
    });

    document.querySelectorAll('#charsetSelect button').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('#charsetSelect button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCharset = btn.getAttribute('data-value');
        };
    });

    document.getElementById('saveBtn').onclick = () => saveCanvas('neural_export', 'png');
}

function draw() {
    background(2); // Deep off-black
    if (video.width === 0) return;

    document.getElementById('fps').innerText = floor(frameRate());

    let grain = parseInt(document.getElementById('grain').value);
    let intensity = parseFloat(document.getElementById('intensity').value);

    video.loadPixels();
    textFont('monospace');
    textSize(grain); // Dynamic text size to match the grid
    textAlign(CENTER, CENTER);

    if (video.pixels.length > 0) {
        push();
        translate((width - (video.width * grain)) / 2, (height - (video.height * grain)) / 2);

        for (let j = 0; j < video.height; j++) {
            for (let i = 0; i < video.width; i++) {
                const pixelIndex = (i + j * video.width) * 4;
                const r = video.pixels[pixelIndex + 0];
                const g = video.pixels[pixelIndex + 1];
                const b = video.pixels[pixelIndex + 2];
                
                let brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b);
                brightness = pow(brightness / 255, 1 / intensity) * 255;
                
                const density = charsets[currentCharset];
                const charIndex = floor(map(brightness, 0, 255, 0, density.length - 1));
                const char = density.charAt(constrain(charIndex, 0, density.length - 1));
                
                // New Color Profiles
                if (currentMode === 'matrix') fill(0, 242, 255); // Cyber Cyan
                else if (currentMode === 'bw') fill(brightness); 
                else if (currentMode === 'retro') fill(255, 180, 0); 
                else if (currentMode === 'color') fill(r, g, b);
                
                text(char, i * grain, j * grain);
            }
        }
        pop();
    }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }