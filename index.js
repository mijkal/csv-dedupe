const {
    parseCsv,
    readFile,
    writeFile,
    getFileParams,
    convertJsonToCsv,
    getUserInputFromCli,
} = require('./utils/index.js');

exports.MODE_ENUMS = {
    EMAIL: 'email',
    PHONE: 'phone',
    EMAIL_OR_PHONE: 'email_or_phone',
};

exports.main = async (csv, mode) => {
    const parsedData = parseCsv(csv);
    if (!parsedData) {
        console.error('Invalid csv data provided');
        return null;
    }
    const { json, headers } = parsedData;
    const recordKeys = {};
    const dupeRowIdx = [];

    json.forEach((rec, idx) => {
        // Store values as keys to quickly assertain if a duplicate row exists
        let keys = [];
        switch (mode) {
            case this.MODE_ENUMS.EMAIL:
                if (rec.Email) keys.push(rec.Email);
                break;
            case this.MODE_ENUMS.PHONE:
                if (rec.Phone) keys.push(rec.Phone);
                break;
            case this.MODE_ENUMS.EMAIL_OR_PHONE:
                if (rec.Email || rec.Phone) {
                    keys.push(rec.Email);
                    keys.push(rec.Phone);
                };
                break;
            default:
                break;
        }

        // Iterate over records and update keys in hash map
        keys.forEach((key) => {
            if (!recordKeys[key] && recordKeys[key] !== 0) {
                recordKeys[key] = idx;
            } else {
                // Store duplicate index and reference to original
                dupeRowIdx.push({ idx, firstSeenIdx: recordKeys[key] });
            }
        });
    });

    if (dupeRowIdx.length === 0) {
        console.log('No duplicate records detected in csv!');
        return csv;
    }

    // Remove duplicates from records (from back to preseve index positions)
    const duplicateLog = [];
    for (let i = dupeRowIdx.length - 1; i >= 0; i--) {
        const { idx, firstSeenIdx } = dupeRowIdx[i];
        const original = json[firstSeenIdx];
        const dupe = json[idx];
        duplicateLog.push(`Row ${idx + 1} removed (Duplicates row ${firstSeenIdx + 1})\n+Original: ${original.FirstName ?? '*MISSING FIRST NAME VALUE*'}, ${original.LastName ?? '*MISSING LAST NAME VALUE*'}, ${original.Email ?? '*MISSING EMAIL VALUE*'}, ${original.Phone ?? '*MISSING PHONE VALUE*'}\n-Duplicate: ${dupe.FirstName ?? '*MISSING FIRST NAME VALUE*'}, ${dupe.LastName ?? '*MISSING LAST NAME VALUE*'}, ${dupe.Email ?? '*MISSING EMAIL VALUE*'}, ${dupe.Phone ?? '*MISSING PHONE VALUE*'}`);
        json.splice(idx, 1);
    }
    const dedupedCsv = convertJsonToCsv({ json , headers });
    console.log(`${dupeRowIdx.length} duplicate ${dupeRowIdx.length === 1 ? 'record was' : 'records were'} found and removed:\n\n${duplicateLog.reverse().join('\n\n')}`);
    return dedupedCsv;
};

// CLI interface
exports.cliApp = async (args) => {
    console.log('\n🌲 CSV Dedupe 🌲\n');
    let [,,filePath, mode] = args ?? process.argv;
    if (!filePath) {
        filePath = getUserInputFromCli('Enter complete file path for csv file:');
    }
    if (!mode) {
        const userInputMode = await getUserInputFromCli('Duplicate detection mode\n(Enter number):\n1-Email\n2-Phone\n3-Email AND Phone\n');
        switch (userInputMode) {
            case '1':
                mode = this.MODE_ENUMS.EMAIL;
                break;
            case '2':
                mode = this.MODE_ENUMS.PHONE;
                break;
            case '3':
                mode = this.MODE_ENUMS.EMAIL_OR_PHONE;
                break;
            default:
                break;
        }
    }
    const isValidMode = [this.MODE_ENUMS.EMAIL, this.MODE_ENUMS.PHONE, this.MODE_ENUMS.EMAIL_OR_PHONE].includes(mode);
    if (!isValidMode) {
        console.error('Invalid duplicate detection mode selected. Try again.');
        return null;
    }
    const { fileName, dir } = getFileParams(filePath, __dirname);
    if (!fileName || !dir) return null;

    const csvData = await readFile({ fileName, dir  });
    const result = await this.main(csvData, mode);

    if (args) return result; // Test mode — don't write result file
    const dupeFileName = `deduped-${fileName}`;
    await writeFile({ data: result, fileName: dupeFileName, dir });
    console.log(`\n=====\nFile saved: ${dir}/${dupeFileName}\n`);
};

// TODO HTTP interface

(async () => {
    await this.cliApp();
    process.exit(1);
})();
