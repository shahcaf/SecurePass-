const { createCanvas } = require('canvas');

module.exports = {
  generate: () => {
    const canvas = createCanvas(250, 100);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random styling for captcha
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    ctx.font = 'bold 45px Arial';
    ctx.fillStyle = '#00ff7f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Distortion
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.random() * 0.1 - 0.05);
    ctx.fillText(code, 0, 0);
    ctx.restore();

    // Noise lines
    ctx.strokeStyle = '#00ff7f';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    return { code, buffer: canvas.toBuffer() };
  }
};
