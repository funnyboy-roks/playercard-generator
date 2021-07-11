const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const genImg = require('./genImg');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(morgan('tiny'));
app.use(cors());

app.get('/playercard', async (req, res) => {
	res.set({ 'Content-Type': 'image/png' });

    const {query} = req;

    const stats = {};

    (query.stats || ':').split(',').forEach((str) => {
        const [k, v] = str.split(':');

        if(k !== '') {
            stats[k] = v;
        }
    });

    const options = {
        name: query.name,
        color: (isNaN(parseInt(query.color, 16)) ? query.color : '#' + query.color) || '#fff',
        stats
    }
	res.send(await genImg(options.name, options));
});

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});

// fs.writeFileSync('img.png', genImg());
