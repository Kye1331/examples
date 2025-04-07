import fs from 'fs'

fs.readFile('/mapGenerator.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(data);
  });