const axios = require('axios');

const API_BASE = 'https://api-sociedad-y-cultura-production.up.railway.app';
const API_KEY = 'p@1@nca_Sobr3hum4n4_sociedad_v1rg3nes';
const apiHeaders = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json'
};

exports.login = async (req, res) => {
  const { documento, password } = req.body;

  if (!documento || !password) {
    return res.render('Login/login', {
      error: 'Por favor ingresa el documento y la contraseña.',
      success: null
    });
  }

  try {
    // 1. Buscar el usuario por documento
    const { data: usuarios } = await axios.get(`${API_BASE}/usuarios`, { headers: apiHeaders });
    const found = usuarios.find(u => u.documento === documento);

    if (!found) {
      return res.render('Login/login', {
        error: 'No existe una cuenta con ese número de documento.',
        success: null
      });
    }

    // 2. Enviar objeto completo al endpoint de login con la contraseña ingresada
    const { data: user } = await axios.post(
      `${API_BASE}/usuarios/login`,
      { ...found, password },
      { headers: apiHeaders }
    );

    req.session.user = {
      documento: user.documento,
      nombre: user.nombre,
      facultad: user.facultad,
      email: user.email,
      edad: user.edad,
      rol: user.rol,
      genero: user.genero
    };

    res.redirect('/dashboard');
  } catch (err) {
    const status = err.response?.status;
    const error = status === 401 || status === 403
      ? 'Contraseña incorrecta.'
      : 'Contraseña incorrecta.';
    res.render('Login/login', { error, success: null });
  }
};

exports.register = async (req, res) => {
  const { documento, nombre, email, edad, facultad, genero, password } = req.body;

  // Validaciones del lado del servidor
  if (!documento || !nombre || !email || !edad || !facultad || !genero || !password) {
    return res.render('Register/register', {
      error: 'Por favor completa todos los campos.',
      old: req.body
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('Register/register', {
      error: 'El correo electrónico no es válido.',
      old: req.body
    });
  }

  if (password.length < 6) {
    return res.render('Register/register', {
      error: 'La contraseña debe tener al menos 6 caracteres.',
      old: req.body
    });
  }

  try {
    await axios.post(
      `${API_BASE}/usuarios`,
      {
        documento,
        nombre,
        facultad,
        email,
        edad: parseInt(edad, 10),
        rol: null,
        genero,
        noticias: null,
        password
      },
      { headers: apiHeaders }
    );

    res.redirect('/?registered=1');
  } catch (err) {
    const status = err.response?.status;
    let error = 'Error al registrar. Inténtalo de nuevo.';
    if (status === 409) error = 'El número de documento ya está registrado.';
    else if (status === 400) error = err.response?.data?.message || 'Datos inválidos. Revisa los campos.';

    res.render('Register/register', { error, old: req.body });
  }
};
