const express = require('express');
const fs = require('fs');
const app = express();

let persistentData = {};
try {
    persistentData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
} catch (err) {
    console.error('Error reading data file:', err);
}
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    persistentData.user = {name: 'Tom'}
    fs.writeFileSync('data.json', JSON.stringify(persistentData, null, 2));
    app.locals.persistentData = persistentData;
    next();
});

app.get('/data', (req, res) => {
    res.json(app.locals.persistentData);
});

app.post('/data', (req, res) => {
    const newData = req.body; 
    
    let existingData = [];
    console.log(newData);
    try {
        existingData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        if (!Array.isArray(existingData)) {
            throw new Error('Data in data.json is not an array');
        }
    } catch (err) {
        console.error('Error reading or parsing data file:', err);
        res.status(500).send('Internal Server Error');
        return;
    }
    
    existingData.push(newData);
    fs.writeFileSync('data.json', JSON.stringify(existingData, null, 2));

    res.send('Data received and persisted successfully');
});


app.listen(3001, () => {
    console.log('Server is running on port 3001');
});


