import app from './api/index.js';
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Local development server running on port ${PORT}`);
});
