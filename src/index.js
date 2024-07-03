import { setupServer } from './server.js';
import { initMongoDB } from './db/initMongoConnection.js';
import { createDirIfItNotExists } from './utils/createDirIfNotExists.js';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './constants/index.js';

const bootstrap = async () => {
  await initMongoDB();
  await createDirIfItNotExists(TEMP_UPLOAD_DIR);
  await createDirIfItNotExists(UPLOAD_DIR);
  setupServer();
};

bootstrap();
