// eslint-disable-next-line @typescript-eslint/no-var-requires
const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner(
  {
    serverUrl: 'http://localhost:9000',
    token: 'sqp_1939486f3399d819308426fe424ecee3968eed2e',
    options: {
      'sonar.projectName': 'coredns-kitchen',
      'sonar.sources': 'src',
      'sonar.tests': 'src',
      'sonar.inclusions': 'src/**/*.ts', // Entry point of your code
      'sonar.test.inclusions':
        'src/**/*.spec.ts,src/**/*.spec.jsx,src/**/*.test.js,src/**/*.test.jsx',
    },
  },
  () => {
    console.log('Error Occurred while scanning');
  },
);
