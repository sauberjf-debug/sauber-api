const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const TAG = 'af20251213135858';
const CLIENT_ID = '446255657049347';
const CLIENT_SECRET = process.env.ML_SECRET;

app.use(cors());

async function getToken() {
  const resp = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
  });
  const data = await resp.json();
  return data.access_token;
}

app.get('/buscar', async (req, res) => {
  const query = req.query.q || 'limpeza higiene';
  const limite = parseInt(req.query.limite) || 32;
  try {
    const token = await getToken();
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limite}&condition=new`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    console.log('ML response:', JSON.stringify(data).substring(0, 500));
    const produtos = (data.results || []).map(item => ({
      id: item.id,
      titulo: item.title,
      preco: item.price,
      preco_original: item.original_price,
      imagem: item.thumbnail ? item.thumbnail.replace('http://','https://').replace('-I.jpg','-O.jpg') : '',
      link: item.permalink + (item.permalink.includes('?') ? '&' : '?') + 'matt_tool=' + TAG,
      vendidos: item.sold_quantity || 0,
      frete_gratis: item.shipping && item.shipping.free_shipping
    }));
    res.json({ produtos });
  } catch(e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'SAUber API online' }));
app.listen(PORT, () => console.log(`Porta ${PORT}`));
