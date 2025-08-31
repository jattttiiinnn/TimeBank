console.log('=== Node.js Environment Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PATH:', process.env.PATH ? 'Set' : 'Not set');
console.log('=== End of Test ===');
