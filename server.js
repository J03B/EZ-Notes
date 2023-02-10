// Import Application Requirements
const express = require('express');
const path = require('path');
const { readAndAppend, readFromFile, writeToFile } = require('./assets/fsUtils');
const notes = require('./db/db.json');
const { v4: uuidv4 } = require('uuid');
const { clog } = require('./assets/clog');

// Define Application Globals
const app = express();
const PORT = process.env.PORT || 3001;

// Define default directory in the public folder with main pages
app.use(express.static('public'));
app.use(clog);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define GET requests for each page of the app
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// Define APIs for GET requests for all notes and an individual note
app.get('/api/notes', (req, res) => {
  readFromFile('./db/db.json').then((data) =>
    res.status(200).json(JSON.parse(data)));
});

// Not sure yet if the individual note is even needed
app.delete('/api/notes/:note_id', (req, res) => {
  if (req.params.note_id) {
    const noteId = req.params.note_id;
    const newList = [];
    for (let i = 0; i < notes.length; i++) {
      const currentNote = notes[i];
      if (currentNote.note_id === noteId) {
        res.status(200).json(currentNote);
      } else {
        newList.push(currentNote);
      }
    }
    writeToFile('./db/db.json', newList);
    res.status(404).send('Note not found');
  } else {
    res.status(400).send('Note ID not provided');
  }
});

// Define APIs for POST resquests for notes
app.post('/api/notes', (req, res) => {
  console.log(req.body);
  const { title, text } = req.body;
  
  // Make sure the note has a body before saving it back to the client
  if (title && text) {
    const newNote = {
      note_id: uuidv4().split('-')[0],
      title,
      text
    };

    // Convert to string, then write the string to file
    readAndAppend(newNote, './db/db.json');
    const response = {
      status: 'success',
      body: newNote,
    };
    res.json(response);
  } else {
    res.status(500).json('Error in posting Note');
  }
});

// Make sure that we listen so the page loads on default port
app.listen(PORT, () => 
    console.log(`Application loaded on port ${PORT}!`)
);