import express from 'express';
import { engine } from 'express-handlebars';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'hbs');
app.engine(
  'hbs',
  engine({
    layoutsDir: './views/layouts',
    extname: 'hbs',
    defaultLayout: 'default',
    partialsDir: './views/partials',
  })
);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('main', { layout: 'index' });
});

app.get('*', (req, res) => {
  res.status(404).render('404', { layout: 'index' });
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
