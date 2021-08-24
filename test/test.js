const Mocha = require('mocha');
const assert = require('assert');
const { cliApp, MODE_ENUMS } = require('../index.js');

const MOCK_CSV_DATA_FILE = 'mockData.csv';
const MOCK_CSV_DATA_NO_DUPES_FILE = 'mockDataNoDupes.csv';
const INVALID_MOCK_CSV_DATA_FILE = 'invalidMockData.csv';

const MOCK_CSV_RESULT_NO_DUPES = `FirstName,LastName,Email,Phone
Emily,Howard,emily@example.com,5551111
Bubbles,DeVere,bubbles@example.com,5552222
Marjorie,Dawes,marjorie@example.com,5553333
Ellie-Grace,Day,ellie@example.com,5554444
Daffyd,Thomas,daffyd@example.com,5555555
Bing,Gordon,bing@example.com,5556666
Edward,Grant,edward@example.com,5557777
Phyllis,Church,phyllis@example.com,5558888
Carol,Beer,carol@example.com,5559999
John,Doe,doe@example.com,5550088\n`;

const MOCK_CSV_RESULT_EMAIL_MODE = `FirstName,LastName,Email,Phone
Emily,Howard,emily@example.com,5551111
Bubbles,DeVere,bubbles@example.com,5552222
Marjorie,Dawes,marjorie@example.com,5553333
Ellie-Grace,Day,ellie@example.com,5554444
Daffyd,Thomas,daffyd@example.com,5555555
Bing,Gordon,bing@example.com,5556666
Edward,Grant,edward@example.com,5557777
Samantha,Grant,samantha@example.com,5557777
Sebastian,Love,sebastian@example.com,
Phyllis,Church,phyllis@example.com,5558888
Carol,Beer,carol@example.com,5559999
John,Doe,doe@example.com,5550088`;

const MOCK_CSV_RESULT_PHONE_MODE = `FirstName,LastName,Email,Phone
Emily,Howard,emily@example.com,5551111
Bubbles,DeVere,bubbles@example.com,5552222
Bubbles,DeVere,bubbles@example.com,
Marjorie,Dawes,marjorie@example.com,5553333
Ellie-Grace,Day,ellie@example.com,5554444
Daffyd,Thomas,daffyd@example.com,5555555
Bing,Gordon,bing@example.com,5556666
Edward,Grant,edward@example.com,5557777
Sebastian,Love,sebastian@example.com,
Phyllis,Church,phyllis@example.com,5558888
Carol,Beer,carol@example.com,5559999
John,Doe,doe@example.com,5550088
Jane,Doe,doe@example.com,5550099`;

const MOCK_CSV_RESULT_EMAIL_OR_PHONE_MODE = `FirstName,LastName,Email,Phone
Emily,Howard,emily@example.com,5551111
Bubbles,DeVere,bubbles@example.com,5552222
Marjorie,Dawes,marjorie@example.com,5553333
Ellie-Grace,Day,ellie@example.com,5554444
Daffyd,Thomas,daffyd@example.com,5555555
Bing,Gordon,bing@example.com,5556666
Edward,Grant,edward@example.com,5557777
Phyllis,Church,phyllis@example.com,5558888
Carol,Beer,carol@example.com,5559999
John,Doe,doe@example.com,5550088`;

// =================================================================

describe('CLI app', () => {
  describe('dedupe csv in email mode', () => {
    it('should return csv with duplicate EMAIL rows removed', async () => {
      const args = [,,MOCK_CSV_DATA_FILE, MODE_ENUMS.EMAIL];
      const csvResult = await cliApp(args);
      assert.equal(csvResult, MOCK_CSV_RESULT_EMAIL_MODE);
    });
  });

  describe('dedupe csv in phone mode', () => {
    it('should return csv with duplicate PHONE rows removed', async () => {
      const args = [,,MOCK_CSV_DATA_FILE, MODE_ENUMS.PHONE];
      const csvResult = await cliApp(args);
      assert.equal(csvResult, MOCK_CSV_RESULT_PHONE_MODE);
    });
  });

  describe('dedupe csv in email_or_phone mode', () => {
    it('should return csv with duplicate EMAIL_OR_PHONE rows removed', async () => {
      const args = [,,MOCK_CSV_DATA_FILE, MODE_ENUMS.EMAIL_OR_PHONE];
      const csvResult = await cliApp(args);
      assert.equal(csvResult, MOCK_CSV_RESULT_EMAIL_OR_PHONE_MODE);
    });
  });

  describe('no-op for csv with no dupes', () => {
    it('should return original csv when no dupes detected', async () => {
      const args = [,,MOCK_CSV_DATA_NO_DUPES_FILE, MODE_ENUMS.EMAIL_OR_PHONE];
      const csvResult = await cliApp(args);
      assert.equal(csvResult, MOCK_CSV_RESULT_NO_DUPES);
    });
  });

  describe('invalid mode input', () => {
    it('should exit gracefully with invalid mode entry', async () => {
      const args = [,,MOCK_CSV_DATA_FILE, 'INVALID'];
      const csvResult = await cliApp(args);
      assert.equal(csvResult, null);
    });
  });

  describe('invalid file path input', () => {
    it('should exit gracefully with invalid file path entry', async () => {
      const args = [,,'INVALID', MODE_ENUMS.EMAIL];
      const csvResult = await cliApp(args);
      assert.equal(csvResult, null);
    });
  });

  describe('invalid csv data input', () => {
    it('should exit gracefully with invalid csv data entry', async () => {
      const args = [,,INVALID_MOCK_CSV_DATA_FILE, MODE_ENUMS.EMAIL];
      const csvResult = await cliApp(args);
      assert.equal(csvResult, null);
    });
  });

});
