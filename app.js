const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const crypto = require('crypto');

const app = express();

app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));

const mongoURI = 'mongodb://localhost:27017/pdfdb';
const conn = mongoose.createConnection(mongoURI);

const pdfSchema = new mongoose.Schema({
    pdfFile: {
        type: String,
        required: true
    }
});

let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('pdfs'); 
});


const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'pdfs'
                };
                resolve(fileInfo);
            });
        });
    }
});

storage.on('connectionFailed', (err) => {
    console.error('Connection to MongoDB failed:', err);
});


const PdfSchema = mongoose.model("PdfDetails", pdfSchema);
const upload = multer({ storage });
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'form.html'))
})


app.post('/upload', upload.single('pdf'), async (req, res) => {
    console.log(req.file); 
    const pdfFile = req.file.filename; 

    try {
        await PdfSchema.create({ pdfFile });
        res.send({ status: "Ok" });
    } catch (error) {
        res.json({ status: error });
    }

    if (!req.file) {
        return res.status(500).json({ error: 'Failed to save file to GridFS' });
    }

    res.json({ filename: req.file.filename });
});
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const title = req.body.title;

        const pdf = new Pdf({
            title: title,
            file_id: req.file.id,
            filename: req.file.filename,
        });

        await pdf.save();

        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error uploading PDF' });
    }
});


app.get('/pdfs', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.json([]);
        }
        res.json(files);
    });
});

app.get('/pdf/:id', (req, res) => {
    gfs.files.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }, (err, file) => {
        if (err || !file) {
            return res.status(404).json({ err: 'No file exists' });
        }
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
});

app.get('/pdfview/:id', async (req, res) => {
    try {
        const pdf = await PdfSchema.findById(req.params.id); 
        if (!pdf) return res.status(404).json({ success: false, message: 'PDF not found' });

        res.json(pdf);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving PDF' });
    }
});

app.delete('/pdf/:id', async (req, res) => {
    try {
        const pdf = await PdfSchema.findById(req.params.id); 
        if (!pdf) return res.status(404).json({ success: false, message: 'PDF not found' });

        gfs.remove({ _id: pdf.file_id, root: 'pdfs' }, (err) => {
            if (err) {
                return res.status(404).json({ success: false, message: 'Error deleting file' });
            }

            PdfSchema.findByIdAndDelete(req.params.id, (err) => {
                if (err) return res.status(500).json({ success: false });
                res.json({ success: true });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting PDF' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/pdflist', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/pdflist.html'));
});

app.get('/pdfview', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/pdfview.html'));
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
