import Express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = Express();
const PORT = 8080;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(Express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
