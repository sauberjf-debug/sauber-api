const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const TAG = 'af20251213135858';

app.use(cors());

app.get('/buscar', async (req, res) => {
  const query = req.query.q || 'limpeza higiene';
  const limite = parseInt(req.query.limite) || 32;
  try {
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limite}&condition=new&sort=relevance`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SAUberBot/1.0)',
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    console.log('Status:', response.status, 'Total:', data.paging?.total);
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
