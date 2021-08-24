const fs = require('fs');
const path = require('path');
// const csvtojson = require('csvtojson');

exports.getUserInputFromCli = (label) => {
    readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      return new Promise((resolve) => {
        readline.question(label, userInput => {
            resolve(userInput)
            readline.close();
        });
      });
};

exports.readFile = async ({ fileName, dir = '', encoding = 'utf8' }) => {
    const filePath = path.join(dir, fileName);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                reject(`Error reading ${filePath}`)
            } else {
                resolve(data);
            }
        });
    });
};

exports.writeFile = async ({ data, fileName, dir = '', encoding = 'utf8' }) => {
    const filePath = path.join(dir, fileName);
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, encoding, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                reject(`Error writing ${filePath}`);
            } else resolve();
        });
    });
};

exports.getFileParams = (filePath, projectDir) => {
    let fileName = null;
    let dir = null;
    if (filePath?.includes('/')) {
        const dirArr = filePath.split('/');
        fileName = dir.pop();
        dir = dirArr.join('/');
    } else if (filePath) {
        fileName = filePath;
        dir = projectDir;
    }
    const doesFileExist = !!(fileName && dir) && fs.existsSync(path.join(dir, fileName));
    return doesFileExist ? { fileName, dir } : { fileName: null, dir: null };
};

// Regex to extract csv row values, including quoted fields ( https://thegermancoder.com/2018/11/29/how-to-parse-csv-with-javascript/ )
const csvRowValuesRe = /(?:\"([^\"]*(?:\"\"[^\"]*)*)\")|([^\",]+)/g;

const isValidCsvHeaders = (headers, fields) => {
    let isValid = headers.every((h) => fields.includes(h));
    return isValid;
};

const processRow = (rawRow, headers) => {
    const record = {};
    let field = 0;
    while (matches = csvRowValuesRe.exec(rawRow)) {
        let value = matches[1] || matches[2];
        value = value.replace(/\"\"/g, "\"");
        record[headers[field]] = value ?? '';
        field += 1;
    }
    return record;
};

exports.parseCsv = (csv) => {
    const rows = csv.split(/(?:\r\n|\n)+/).filter((row) => row?.length > 0);
    const headers = rows.splice(0, 1)[0].split(',');
    if (!isValidCsvHeaders(headers, ['FirstName', 'LastName', 'Email', 'Phone'])) {
        console.error('Invalid csv provided:', headers);
        console.error(`Expected fields: 'FirstName', 'LastName', 'Email', 'Phone'`);
        return null;
    };
    const records = rows.map((rawRow) => processRow(rawRow, headers));
    return { json: records, headers };
};

exports.convertJsonToCsv = ({ json, headers }) => {
    let csv = headers.join(',');
    json.forEach((rec) => {
        csv += '\n';
        let rowData = '';
        headers.forEach((field, idx) => {
            if (idx !== 0) rowData += ',';
            let value = rec[field] ?? '';
            if (value.includes(',')) value = `"${value}"`;
            rowData += value;
        });
        csv += rowData;
    });
    return csv;
};
