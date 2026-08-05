require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`auth-backend listening on http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/auth`);
});
