const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'modules');

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else {
      if (
        fullPath.endsWith('.controller.ts') ||
        fullPath.endsWith('.usecase.ts') ||
        fullPath.endsWith('.listener.ts') ||
        fullPath.endsWith('.repository.ts')
      ) {
        generateSpecFile(fullPath);
      }
    }
  }
}

function generateSpecFile(tsFilePath) {
  const specFilePath = tsFilePath.replace(/\.ts$/, '.spec.ts');
  
  if (fs.existsSync(specFilePath)) {
    return; // Already exists
  }

  const fileName = path.basename(tsFilePath);
  const classNameMatch = fs.readFileSync(tsFilePath, 'utf8').match(/export class (\w+)/);
  const className = classNameMatch ? classNameMatch[1] : fileName.replace('.ts', '');

  const content = `import { Test, TestingModule } from '@nestjs/testing';
import { ${className} } from './${fileName.replace('.ts', '')}';

describe('${className}', () => {
  let provider: ${className};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${className},
        // TODO: Add mocked dependencies here
      ],
    }).compile();

    provider = module.get<${className}>(${className});
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
`;

  fs.writeFileSync(specFilePath, content);
  console.log(`Generated: ${specFilePath}`);
}

console.log('Generating spec files for all modules...');
traverseDirectory(srcDir);
console.log('Done.');
