// tests/setup/test-env.ts

import dotenv from 'dotenv';


dotenv.config({
  path: '.env.local',
});

// evitar logs enormes en pruebas
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});