import * as fs from 'fs';
import { google } from 'googleapis';
import * as readline from 'readline';
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

export default class SpreaReader {
    auth: any;

    constructor() {

    }
    public init(): Promise<any> {
        return new Promise((resolve: () => void) => {
            fs.readFile('credentials.json', (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
                // Authorize a client with credentials, then call the Google Sheets API.
                this.authorize(JSON.parse(content as any), resolve);
            });

        });
    }
    authorize(credentials: any, callback: (data: any) => void) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return this.getNewToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token as any));
            this.auth = oAuth2Client;
            callback(oAuth2Client);
        });
    }

    getNewToken(oAuth2Client: any, callback: (data: any) => void) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err: any, token: any) => {
                if (err) return console.error('Error while trying to retrieve access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }
    public readSheet(spreadsheetId: string, range: string): Promise<Array<any>> {
        return new Promise((resolve) => {
            const sheets = google.sheets({ version: 'v4', auth: this.auth });
            sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: range,
            }, (err: any, res: any) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                resolve(rows);
            });
        });

    }
}


