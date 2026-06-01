const express = require('express');
const path = require('path');
const session = require('express-session');

const userController = require('./Controllers/userController');
const newsController = require('./Controllers/newsController');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'tdea-informa-2026-s3cr3t',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 horas
}));

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect('/');
  next();
};

// Rutas públicas
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  const success = req.query.registered ? '¡Registro exitoso! Ya puedes iniciar sesión.' : null;
  res.render('Login/login', { error: null, success });
});

app.post('/login', userController.login);

app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('Register/register', { error: null, old: {} });
});

app.post('/register', userController.register);

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Rutas protegidas
app.get('/dashboard', requireAuth, newsController.getDashboard);
app.get('/news', requireAuth, newsController.getNews);
app.post('/news', requireAuth, newsController.createNews);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TdeA Informa corriendo en http://localhost:${PORT}`);
});
