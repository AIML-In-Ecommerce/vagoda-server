import exec from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = './' // Thay đổi đường dẫn này
const services = fs.readdirSync(rootDir);

services.forEach(service => {
    const servicePath = path.join(rootDir, service);
    if (fs.statSync(servicePath).isDirectory()) {
        console.log(`Installing dependencies for ${service}...`);
        exec('npm install express-gateway', { cwd: servicePath }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error installing Express Gateway: ${error.message}`);
                return;
            }
            console.log(`Express Gateway installed successfully: ${stdout}`);
        });
    }
});
