import Express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const app = Express();
const PORT = 8080;

app.use(Express.json());

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const serverDb = new sqlite3.Database('./db/server.db', sqlite3.OPEN_READWRITE,(err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        serverDb.run(
            `CREATE TABLE IF NOT EXISTS races (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )`,
            (err) => {
                if (err) {
                    console.error('Error creating table: ' + err.message);
                } else {
                    console.log('Table created successfully.');
                }
            }
        );

        serverDb.run(
            `CREATE TABLE IF NOT EXISTS race_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                race_id INTEGER NOT NULL,
                position INTEGER NOT NULL,
                time REAL NOT NULL,
                FOREIGN KEY (race_id) REFERENCES races(id)
            )`,
            (err) => {
                if (err) {
                    console.error('Error creating table: ' + err.message);
                } else {
                    console.log('Table created successfully.');
                }
            }
        );
    }
});

app.post('/upload-results', (req, res) => {
    const positions = req.body;
    console.log('Server received positions:', positions);
    if (!Array.isArray(positions)) {
        return res.status(400).json('Invalid data format.')
    }

    insertResults(serverDb, positions, res);

});

app.get('/get-races', (req, res) => {
    serverDb.all(`SELECT * FROM races`, [], (err, rows) => {
        if (err) {
            console.error('Error fetching data: ', err.message);
            res.status(500).json('Error fetching data.');
        } else {
            console.log('Fetched results:', rows);
            res.status(200).json(rows);
        }

    });
});

app.get('/get-results/:race_id', (req, res) => {
    const raceId = req.params.race_id;
    serverDb.all(`SELECT * FROM race_results WHERE race_id = ?`, [raceId], (err, rows) => {
        if (err) {
            console.error('Error fetching data: ', err.message);
            res.status(500).json('Error fetching data.');
        } else {
            console.log('Fetched results:', rows);
            res.status(200).json(rows);
        }

    });
});

app.use(Express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function insertResults(db, positions, res) {
    const insertQuery = `INSERT INTO race_results (race_id, position, time) VALUES (?, ?, ?)`;
    let raceId = await createRace(db);
    console.log("Preparing to insert results for race with id:", raceId);
    db.serialize(() => {
        const statement = db.prepare(insertQuery);
        let posId = 1;
        positions.forEach((pos) => {
            const timeAsReal = parseFloat(pos.time);
            console.log('Inserting position:', posId, timeAsReal);
            statement.run(raceId, posId, timeAsReal, (err) => {
                if (err) {
                    console.error('Error inserting data: ' + err.message);
                }
            });
            posId++;
        });

        statement.finalize();

        res.status(200).json('Data uploaded successfully.');
    });
}

async function createRace(db) {
    return new Promise((resolve, reject) => {
        const currentDate = new Date(Date.now());
        const formattedDate = currentDate.toISOString().split('T')[0];
        const raceName = "race_" + formattedDate;
        console.log('Creating race:', raceName);
        db.run(`INSERT INTO races (name) VALUES (?)`, [raceName], (err) => {
            if (err) {
                console.error('Error inserting race: ' + err.message);
                reject(err);
            } else {
                db.get(`SELECT last_insert_rowid() AS id`, (err, row) => {
                    if (err) {
                        console.error('Error getting last inserted row id: ' + err.message);
                        reject(err);
                    } else {
                        console.log('Race created with ID:', row.id);
                        resolve(row.id);
                    }
                });
            }
        });
    });
}