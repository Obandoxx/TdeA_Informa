const axios = require('axios');

const API_BASE = 'https://api-sociedad-y-cultura-production.up.railway.app';
const API_KEY = 'p@1@nca_Sobr3hum4n4_sociedad_v1rg3nes';
const apiHeaders = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json'
};

exports.getDashboard = async (req, res) => {
  const user = req.session.user;
  let totalNoticias = 0;
  let recentNews = [];
  let facultadNews = [];

  try {
    const [allRes, facultadRes] = await Promise.all([
      axios.get(`${API_BASE}/noticias`, { headers: apiHeaders }),
      axios.get(
        `${API_BASE}/noticias/facultad?facultad=${encodeURIComponent(user.facultad)}`,
        { headers: apiHeaders }
      )
    ]);

    totalNoticias = allRes.data.length;
    recentNews = allRes.data.slice(0, 3);
    facultadNews = facultadRes.data.slice(0, 3);
  } catch (err) {
    // Usamos los valores por defecto vacíos si la API falla
  }

  res.render('Dashboard/dashboard', { user, totalNoticias, recentNews, facultadNews });
};

exports.getNews = async (req, res) => {
  const user = req.session.user;
  try {
    const { data: noticias } = await axios.get(`${API_BASE}/noticias`, { headers: apiHeaders });
    res.render('News/news', { user, noticias, error: null });
  } catch (err) {
    res.render('News/news', { user, noticias: [], error: 'Error al cargar las noticias.' });
  }
};

exports.createNews = async (req, res) => {
  const user = req.session.user;
  const { titulo, subtitulo, descripcion, imagen, categoria } = req.body;

  if (!titulo || !subtitulo || !descripcion || !categoria) {
    let noticias = [];
    try {
      const r = await axios.get(`${API_BASE}/noticias`, { headers: apiHeaders });
      noticias = r.data;
    } catch {}
    return res.render('News/news', {
      user,
      noticias,
      error: 'Por favor completa todos los campos de la noticia.'
    });
  }

  try {
    await axios.post(
      `${API_BASE}/noticias?userId=${encodeURIComponent(user.documento)}`,
      {
        titulo,
        subtitulo,
        descripcion,
        imagen: imagen.trim() || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
        categoria
      },
      { headers: apiHeaders }
    );

    res.redirect('/news');
  } catch (err) {
    let noticias = [];
    try {
      const r = await axios.get(`${API_BASE}/noticias`, { headers: apiHeaders });
      noticias = r.data;
    } catch {}
    res.render('News/news', {
      user,
      noticias,
      error: 'Error al publicar la noticia. Inténtalo de nuevo.'
    });
  }
};
