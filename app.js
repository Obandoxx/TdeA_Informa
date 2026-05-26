const express = require('express');
const path = require('path');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.render('Login/login'));
app.get('/register', (req, res) => res.render('Register/register'));
app.get('/dashboard', (req, res) => res.render('Dashboard/dashboard'));
app.get('/news', (req, res) => res.render('News/news'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TdeA Informa corriendo en http://localhost:${PORT}`);
});
