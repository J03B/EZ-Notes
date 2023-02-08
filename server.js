// Import Application Requirements
const express = require('express');
const path = require('path');
const fs = require('fs');
const notes = require('./db/db.json');

// Define Application Globals
const app = express();
const PORT = 3001;

// Define default directory in the public folder with main pages
app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// Define APIs for GET requests for all notes and an individual note
app.get('/api/notes', (req, res) => {
  return res.status(200).json(notes);
});

// Not sure yet if the individual note is even needed
app.get('/api/notes/:note_id', (req, res) => {
  if (req.params.note_id) {
    const noteId = req.params.note_id;
    for (let i = 0; i < notes.length; i++) {
      const currentNote = notes[i];
      if (currentNote.note_id === noteId) {
        res.status(200).json(currentNote);
        return;
      }
    }
    res.status(404).send('Note not found');
  } else {
    res.status(400).send('Note ID not provided');
  }
});

// Define APIs for POST resquests for notes
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  
  // Make sure the note has a body before saving it back to the client
  if (title && text) {
    const response = {
      note_id: randomUUID(),
      title,
      text
    };

    // Convert to string, then write the string to file
    fs.readFile('.db/db.json', (err, data) => {
      const noteAr = JSON.parse(data);
      noteAr.push(response);
      const noteStr = JSON.stringify(noteAr);

      fs.writeFile(`./db/db.json`, noteStr, (err) =>
      err
        ? console.error(err)
        : console.log(`Note for ${response.title} has been written to JSON file`)
      );

      console.log(response);
      res.status(201).json(response);
    });
  } else {
    res.status(500).json('Error in posting Note');
  }
});

// Make sure that we listen so the page loads on default port
app.listen(PORT, () => 
    console.log(`Application loaded on port ${PORT}!`)
);