// to start => npm start

// importing liblaries
const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const { TesseractWorker } = require('tesseract.js');
const worker = new TesseractWorker();

// storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

// specyfying upload
const upload = multer({ storage: storage }).single('avatar');

app.set('view engine', 'ejs');
app.use(express.static('public'));

// ROUTES
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/uploads', (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) return console.log('This is ur error ', err);

            worker
                .recognize(data, 'pol', { tessjs_create_pdf: '1' })
                .progress(progress => {
                    console.log(progress)
                })
                .then(result => {
                    res.redirect('/download')
                })
                .finally(() => worker.terminate());
        });
    });
});

app.get('/download', (req,res) => {
    const file = `${__dirname}/output.pdf`;
    res.download(file);
})

// starting server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Im running on port ${PORT}`));