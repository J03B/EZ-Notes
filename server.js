// Import Application Requirements
const express = require('express');
const path = require('path');
const { readAndAppend, readFromFile, writeToFile } = require('./assets/fsUtils');
const { v4: uuidv4 } = require('uuid');
const { clog } = require('./assets/clog');

// Define Application Globals
const app = express();
const PORT = process.env.PORT || 3001;

// Define default directory in the public folder with main pages
app.use(clog);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
// Define GET requests for individual note
app.get('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  readFromFile('./db/db.json').then((data) => {
    const singleNote = data.find(note => note.note_id === id);
    res.status(200).json(JSON.parse(singleNote));
  });
});

// Define DELETE request for individual note calls
app.delete('/api/notes/:note_id', (req, res) => {
  let notes = require('./db/db.json');
  const noteId = req.params.note_id;
  if (notes.find(note => note.note_id === noteId)) {
    const noteIndex = notes.findIndex(note => note.note_id === noteId);
    notes.splice(noteIndex,1);
    writeToFile('./db/db.json', notes);
    res.status(200).json(`Note with ID ${noteId} deleted successfully`);
  } 
  else {
    res.status(404).json('Note ID not found');
  }
});

// Define APIs for POST resquests for notes
app.post('/api/notes', (req, res) => {
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