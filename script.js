

let video;

// Character sets ordered by density to ensure correct brightness mapping
const charsets = {
    simple: " .:-=+*#%@@",
    complex: " .'`^ \",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhaoo*#MW&8%B@$",
    binary: " 01"
};

// Global state variables for UI selection
let currentMode = 'matrix';
let currentCharset = 'simple';


// setup() runs once at start. Initializes the camera and UI listeners.
function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Initialize Camera - Lower res (160x120) is used to optimize math 
    // processing while maintaining visual fidelity via the grain scale.
    video = createCapture(VIDEO);
    video.size(160, 120);
    video.hide();
    
    // Attach event listeners to HUD buttons
    setupUI();
}

// Handles DOM interaction and button state management
function setupUI() {
    // Mode Selection Logic
    document.querySelectorAll('#modeSelect button').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('#modeSelect button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-value');
        };
    });

    // Charset Selection Logic
    document.querySelectorAll('#charsetSelect button').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('#charsetSelect button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCharset = btn.getAttribute('data-value');
        };
    });

    // Export functionality
    document.getElementById('saveBtn').onclick = () => saveCanvas('neural_export', 'png');
}


// draw() runs in a continuous loop (aiming for 60fps)
 
function draw() {
    background(2); // Deep off-black background for contrast
    
    // Exit if video stream is not yet active
    if (video.width === 0) return;

    // Update real-time FPS counter in the HUD
    document.getElementById('fps').innerText = floor(frameRate());

    // Retrieve live values from HUD sliders
    let grain = parseInt(document.getElementById('grain').value);
    let intensity = parseFloat(document.getElementById('intensity').value);

    // Prepare pixel data for manipulation
    video.loadPixels();
    textFont('monospace');
    textSize(grain); // Sync text size with grid grain for a clean layout
    textAlign(CENTER, CENTER);

    if (video.pixels.length > 0) {
        push();
        // Center the ASCII grid within the browser window
        translate((width - (video.width * grain)) / 2, (height - (video.height * grain)) / 2);

        // Nested loop to iterate through every pixel of the video buffer
        for (let j = 0; j < video.height; j++) {
            for (let i = 0; i < video.width; i++) {
                const pixelIndex = (i + j * video.width) * 4;
                const r = video.pixels[pixelIndex + 0];
                const g = video.pixels[pixelIndex + 1];
                const b = video.pixels[pixelIndex + 2];
                
                // MATH: Perceived Luminance calculation (Standard CCIR 601 weights)
                // This captures facial features much better than a simple average.
                let brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b);
                
                // QUALITY: Apply Intensity (Gamma) correction to expand mid-tone details
                brightness = pow(brightness / 255, 1 / intensity) * 255;
                
                // MAPPING: Convert 0-255 brightness to a character index
                const density = charsets[currentCharset];
                const charIndex = floor(map(brightness, 0, 255, 0, density.length - 1));
                const char = density.charAt(constrain(charIndex, 0, density.length - 1));
                
                // STYLE: Apply color profiles based on selected mode
                if (currentMode === 'matrix') fill(0, 242, 255); // Cyber Cyan
                else if (currentMode === 'bw') fill(brightness); // Monochromatic Gray
                else if (currentMode === 'retro') fill(255, 180, 0); // Amber Phosphor
                else if (currentMode === 'color') fill(r, g, b); // True RGB Color
                
                // Render the character at the grid position
                text(char, i * grain, j * grain);
            }
        }
        pop();
    }
}

// Ensures the canvas remains full-screen during window resizing.
function windowResized() { 
    resizeCanvas(windowWidth, windowHeight); 
}