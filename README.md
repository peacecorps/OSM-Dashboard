# Open Street Map Dashboard


## Contributing
Make sure you have node and mongoDB installed, and you've cloned this repository.

1. Run `npm install` 
2. Copy config.template.json and rename it config.json. 
3. Create a Google Spreadsheet.  In config.json, add:
    * The spreadsheet key.  This is the string after /spreadsheets/d/ in the url
    * An e-mail address that can access the spreadsheet
    * That email address's password
3. In a new terminal window, run `mongod` to start the database
4. Run `node app.js`