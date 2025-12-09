const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Helper function to execute commands
function executeCommand(command, errorMessage) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}${errorMessage}${colors.reset}`);
    console.error(error);
    return false;
  }
}

// Helper function to create .env files
function createEnvFile(directory, content) {
  const envPath = path.join(directory, '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, content);
    console.log(`${colors.green}Created ${envPath}${colors.reset}`);
  }
}

// Main setup function
async function setup() {
  console.log(`${colors.blue}Starting AI Therapist setup...${colors.reset}\n`);

  // Check Node.js version
  console.log(`${colors.yellow}Checking Node.js version...${colors.reset}`);
  const nodeVersion = process.version;
  if (parseInt(nodeVersion.slice(1).split('.')[0]) < 16) {
    console.error(`${colors.red}Node.js version 16 or higher is required. Please update Node.js.${colors.reset}`);
    process.exit(1);
  }

  // Install root dependencies
  console.log(`\n${colors.yellow}Installing root dependencies...${colors.reset}`);
  if (!executeCommand('npm install', 'Failed to install root dependencies')) {
    process.exit(1);
  }

  // Create .env files
  console.log(`\n${colors.yellow}Creating environment files...${colors.reset}`);
  
  // Server .env
  createEnvFile('server', `PORT=3001
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here`);

  // ML service .env
  createEnvFile('ml_models', `ML_SERVICE_PORT=5000`);

  // Install all dependencies
  console.log(`\n${colors.yellow}Installing all project dependencies...${colors.reset}`);
  if (!executeCommand('npm run install:all', 'Failed to install project dependencies')) {
    process.exit(1);
  }

  // Download spaCy model
  console.log(`\n${colors.yellow}Downloading spaCy model...${colors.reset}`);
  if (!executeCommand('python -m spacy download en_core_web_sm', 'Failed to download spaCy model')) {
    process.exit(1);
  }

  console.log(`\n${colors.green}Setup completed successfully!${colors.reset}`);
  console.log(`\n${colors.blue}To start the application, run:${colors.reset}`);
  console.log(`${colors.yellow}npm run start:all${colors.reset}`);
  console.log(`\n${colors.blue}Make sure to update the .env files with your actual API keys and configuration.${colors.reset}`);
}

// Run setup
setup().catch(error => {
  console.error(`${colors.red}Setup failed:${colors.reset}`, error);
  process.exit(1);
}); 