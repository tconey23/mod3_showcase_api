const express = require('express');
const fs = require('fs');
const affirmations = require('./affirmations');
const cors = require('cors'); // Import the cors package
const app = express();

let persistentData = {};

try {
    persistentData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
} catch (err) {
    console.error('Error reading data file:', err);
}

app.use(express.json());
app.use(cors()); // Use the cors middleware to enable CORS

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    fs.writeFileSync('data.json', JSON.stringify(persistentData, null, 2));
    app.locals.persistentData = persistentData;
    next();
});

app.get('/api/v1/data/:endpoint', (req, res) => {
    const endpoint = req.params.endpoint
    if (app.locals.persistentData.hasOwnProperty(endpoint)) {
        const responseData = {
            [endpoint]: app.locals.persistentData[endpoint]
        };
        res.json(responseData);
    } else {
        res.status(404).json({ error: "Endpoint not found" });
    }
});

app.get('/api/v1/data/activities/:endpoint', (req, res) => {
    const endpoint = req.params.endpoint
    const findActivity = app.locals.persistentData['activities'].find((act) => act.element === `${endpoint}`)
    if (findActivity) {
        const responseData = {
            [endpoint]: findActivity
        };
        res.json(responseData);
    } else {
        res.status(404).json({ error: "Endpoint not found" });
    }
});

app.get('/api/v1/affirmations', (req, res) => {
    const getRandomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)]
    res.json(getRandomAffirmation)
  });

  app.get('/api/v1/data/users/:id', (req, res) => {
    const id = req.params.id
    const findUser = app.locals.persistentData.users.find((user) => user.id === `${id}`)
    if (findUser) {
        const responseData = findUser
        res.json(responseData);
    } else {
        res.status(404).json({ error: "Endpoint not found" });
    }
  });

  app.patch('/api/v1/data/users/:id', (req, res) => {
    const id = req.params.id;
    const newData = req.body;
    const dataKey = Object.keys(newData)
    const userIndex = app.locals.persistentData.users.findIndex(user => user.id === id);

    if (userIndex !== -1) {
        
        if (!app.locals.persistentData.users[userIndex][dataKey]) {
            app.locals.persistentData.users[userIndex][dataKey] = [];
        }
        const duplicateRecord = app.locals.persistentData.users[userIndex][dataKey].includes(newData[dataKey])
        if(!duplicateRecord){
            app.locals.persistentData.users[userIndex][dataKey].push(newData[dataKey]);
            fs.writeFileSync('data.json', JSON.stringify(app.locals.persistentData, null, 2));
            res.json({ message: `${dataKey} updated successfully`, updatedUser: app.locals.persistentData.users[userIndex] })
        }else {
            res.json('Duplicate Record')
        }
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.put('/api/v1/data/active_user', (req, res) => {
    const activeUser = req.body

    app.locals.persistentData.active_user = activeUser
    fs.writeFileSync('data.json', JSON.stringify(app.locals.persistentData, null, 2));

    res.json({ message: `${activeUser} updated successfully`, updatedUser: app.locals.persistentData.active_user  })
        // if (!app.locals.persistentData.users[userIndex][dataKey]) {
        //     app.locals.persistentData.users[userIndex][dataKey] = [];
        // }
        // const duplicateRecord = app.locals.persistentData.users[userIndex][dataKey].includes(newData[dataKey])
        // if(!duplicateRecord){
        //     app.locals.persistentData.users[userIndex][dataKey].push(newData[dataKey]);
        //     fs.writeFileSync('data.json', JSON.stringify(app.locals.persistentData, null, 2));
        //     res.json({ message: `${dataKey} updated successfully`, updatedUser: app.locals.persistentData.users[userIndex] })
        // }else {
        //     res.json('Duplicate Record')
        // }
});;

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

//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


