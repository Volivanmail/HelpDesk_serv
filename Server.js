const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const path = require('path');
const fs = require('fs');
const json = require('koa-json');

const host = 'localhost';
const port = 8080;
const app = new Koa();
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data.json')));

app.use(koaBody({
  urlencoded: true,
}));
app.use(cors());
app.use(json());

// POST-req
app.use((ctx, next) => {
  if (ctx.request.method === 'POST') {
    const myList = [];
    data.forEach((el) => {
      myList.push(el.id);
    });
    ctx.request.body.forEach((element) => {
      if (!myList.includes(element.id)) {
        data.push(element);
        fs.writeFileSync(path.resolve(__dirname, './data.json'), JSON.stringify(data));
      }
    });
  }

  next();
});

// PUT-req
app.use((ctx, next) => {
  if (ctx.request.method === 'PUT') {
    data.forEach((el) => {
      if (el.id === ctx.request.body.id) {
        const index = data.indexOf(el);
        data[index] = ctx.request.body;
      }
    });
    fs.writeFileSync(path.resolve(__dirname, './data.json'), JSON.stringify(data));
  }

  next();
});

// DELETE-req
app.use((ctx, next) => {
  if (ctx.request.method === 'DELETE') {
    data.forEach((el) => {
      if (el.id === ctx.request.url.replace('/', '')) {
        data.splice(data.indexOf(el), 1);
      }
    });
    fs.writeFileSync(path.resolve(__dirname, './data.json'), JSON.stringify(data));
  }

  next();
});

// GET-req
app.use((ctx) => {
  ctx.response.body = data;
});

const server = http.createServer(app.callback());

server.listen(port, host, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server is running on http://${host}:${port}`);
});
