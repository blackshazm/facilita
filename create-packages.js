const fs = require('fs');
const path = require('path');

const packages = {
  'packages/database/package.json': {
    name: '@facilita/database',
    version: '1.0.0',
    private: true,
    scripts: {
      "generate": "prisma generate"
    },
    dependencies: {
      "@prisma/client": "^5.0.0",
      "prisma": "^5.0.0"
    }
  },
  'packages/event-bus/package.json': {
    name: '@facilita/event-bus',
    version: '1.0.0',
    private: true,
    main: 'index.js'
  },
  'packages/ui/package.json': {
    name: '@facilita/ui',
    version: '1.0.0',
    private: true,
    main: 'index.js'
  },
  'apps/api/package.json': {
    name: 'api',
    version: '1.0.0',
    private: true,
    scripts: {
      "build": "nest build",
      "start": "nest start"
    },
    dependencies: {
      "@nestjs/common": "^10.0.0",
      "@nestjs/core": "^10.0.0"
    }
  },
  'apps/client/package.json': {
    name: 'client',
    version: '1.0.0',
    private: true,
    scripts: {
      "dev": "next dev",
      "build": "next build",
      "start": "next start"
    },
    dependencies: {
      "next": "^15.0.0",
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  },
  'apps/provider/package.json': {
    name: 'provider',
    version: '1.0.0',
    private: true,
    scripts: {
      "start": "expo start"
    },
    dependencies: {
      "expo": "~50.0.0",
      "react": "18.2.0",
      "react-native": "0.73.0"
    }
  }
};

Object.entries(packages).forEach(([file, content]) => {
  fs.writeFileSync(path.join(__dirname, file), JSON.stringify(content, null, 2));
});

console.log('Packages created');
