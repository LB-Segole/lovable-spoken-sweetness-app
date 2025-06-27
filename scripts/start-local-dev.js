
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Voice Agent in Local Development Mode...');

// Set environment variable
process.env.VITE_USE_LOCAL_BACKEND = 'true';

// Start backend
console.log('📡 Starting local backend...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'local-backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('🎨 Starting frontend...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, VITE_USE_LOCAL_BACKEND: 'true' }
  });

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Backend error:', err);
});
