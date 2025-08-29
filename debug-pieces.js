const path = require('path');
const fs = require('fs');

console.log('=== ACTIVEPIECES CUSTOM PIECES DEBUG ===\n');

// 1. Check environment configuration
console.log('1. Environment Configuration:');
console.log('   AP_PIECES_SOURCE:', process.env.AP_PIECES_SOURCE || 'NOT SET (default: DB)');
console.log('   AP_DEV_PIECES:', process.env.AP_DEV_PIECES || 'NOT SET');
console.log('');

// 2. Check if .env file exists and read it
console.log('2. .env File Configuration:');
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const relevantLines = envContent
        .split('\n')
        .filter(line => line.includes('PIECES_SOURCE') || line.includes('DEV_PIECES'))
        .filter(line => !line.startsWith('#'));
    
    if (relevantLines.length > 0) {
        relevantLines.forEach(line => console.log('   ' + line));
    } else {
        console.log('   No PIECES configuration found in .env');
    }
} else {
    console.log('   .env file not found');
}
console.log('');

// 3. Check built pieces
console.log('3. Built Pieces in dist/:');
const distPiecesPath = path.resolve('dist/packages/pieces');
if (fs.existsSync(distPiecesPath)) {
    const findPieces = (dir, depth = 0) => {
        const entries = fs.readdirSync(dir);
        const indent = '   ' + '  '.repeat(depth);
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && depth < 3) {
                console.log(`${indent}📁 ${entry}/`);
                if (entry !== 'node_modules' && entry !== '.git') {
                    findPieces(fullPath, depth + 1);
                }
            } else if (entry === 'package.json') {
                try {
                    const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    console.log(`${indent}📦 ${packageJson.name} (v${packageJson.version})`);
                    
                    // Check if there's an index.js file
                    const indexPath = path.join(dir, 'src', 'index.js');
                    if (fs.existsSync(indexPath)) {
                        console.log(`${indent}   ✅ index.js exists`);
                    } else {
                        console.log(`${indent}   ❌ index.js missing`);
                    }
                } catch (e) {
                    console.log(`${indent}📦 (invalid package.json)`);
                }
            }
        }
    };
    
    findPieces(distPiecesPath);
} else {
    console.log('   dist/packages/pieces not found - need to build first');
}
console.log('');

// 4. Check source pieces
console.log('4. Source Pieces in packages/:');
const srcPiecesPath = path.resolve('packages/pieces');
if (fs.existsSync(srcPiecesPath)) {
    const customPath = path.join(srcPiecesPath, 'custom');
    const communityPath = path.join(srcPiecesPath, 'community');
    
    if (fs.existsSync(customPath)) {
        const customPieces = fs.readdirSync(customPath).filter(item => {
            const fullPath = path.join(customPath, item);
            return fs.statSync(fullPath).isDirectory() && item !== 'node_modules';
        });
        console.log(`   Custom pieces (${customPieces.length}):`, customPieces.length > 0 ? customPieces.join(', ') : 'none');
    }
    
    if (fs.existsSync(communityPath)) {
        const communityPieces = fs.readdirSync(communityPath).filter(item => {
            const fullPath = path.join(communityPath, item);
            return fs.statSync(fullPath).isDirectory() && item !== 'node_modules';
        });
        console.log(`   Community pieces: ${communityPieces.length} found`);
    }
} else {
    console.log('   packages/pieces not found');
}
console.log('');

// 5. Deployment recommendations
console.log('5. Deployment Recommendations:');
console.log('   For custom pieces to appear in UI:');
console.log('   ');
console.log('   A. Development Mode (FILE):');
console.log('      1. Set AP_PIECES_SOURCE=FILE in .env');
console.log('      2. Set AP_DEV_PIECES=@activepieces/piece-my-custom-piece');
console.log('      3. Build the piece: npx nx build pieces-my-custom-piece');
console.log('      4. Start server: npm run dev:backend');
console.log('   ');
console.log('   B. Production Mode (DB):');
console.log('      1. Keep AP_PIECES_SOURCE=DB (default)');
console.log('      2. Build piece as archive: npm run build-piece');
console.log('      3. Upload via UI or API');
console.log('   ');
console.log('   C. Docker Mode:');
console.log('      1. Build piece in Docker image');
console.log('      2. Configure environment in docker-compose.yml');
console.log('');

// 6. Check if server builds are ready
console.log('6. Server Build Status:');
const serverApiPath = 'dist/packages/server/api/main.js';
const enginePath = 'dist/packages/engine/main.js';

console.log(`   Server API: ${fs.existsSync(serverApiPath) ? '✅ Built' : '❌ Need to build'}`);
console.log(`   Engine: ${fs.existsSync(enginePath) ? '✅ Built' : '❌ Need to build'}`);
console.log('');

console.log('=== END DEBUG ===');