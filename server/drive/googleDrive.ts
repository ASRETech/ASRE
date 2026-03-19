import { google } from 'googleapis';
import { ENV } from '../_core/env';

export function getOAuthClient() {
  return new google.auth.OAuth2(
    ENV.googleClientId,
    ENV.googleClientSecret,
    ENV.googleRedirectUri
  );
}

export function getDriveClient(accessToken: string, refreshToken: string) {
  const auth = getOAuthClient();
  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
  return {
    drive: google.drive({ version: 'v3', auth }),
    sheets: google.sheets({ version: 'v4', auth }),
    auth,
  };
}

export async function createFolder(
  accessToken: string,
  refreshToken: string,
  name: string,
  parentId?: string
): Promise<string> {
  const { drive } = getDriveClient(accessToken, refreshToken);
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : [],
    },
    fields: 'id',
  });
  return res.data.id!;
}

export async function createSpreadsheet(
  accessToken: string,
  refreshToken: string,
  title: string,
  folderId: string
): Promise<string> {
  const { sheets, drive } = getDriveClient(accessToken, refreshToken);
  const ss = await sheets.spreadsheets.create({
    requestBody: { properties: { title } },
    fields: 'spreadsheetId',
  });
  const id = ss.data.spreadsheetId!;
  await drive.files.update({ fileId: id, addParents: folderId, fields: 'id' });
  return id;
}

export async function setSheetValues(
  accessToken: string,
  refreshToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number | null)[][]
): Promise<void> {
  const { sheets } = getDriveClient(accessToken, refreshToken);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}

export async function appendSheetRow(
  accessToken: string,
  refreshToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number | null)[]
): Promise<void> {
  const { sheets } = getDriveClient(accessToken, refreshToken);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
}

export async function shareFile(
  accessToken: string,
  refreshToken: string,
  fileId: string,
  email: string,
  role: 'reader' | 'writer'
): Promise<void> {
  const { drive } = getDriveClient(accessToken, refreshToken);
  await drive.permissions.create({
    fileId,
    requestBody: { type: 'user', role, emailAddress: email },
    sendNotificationEmail: false,
  });
}

export function getAuthUrl(): string {
  const auth = getOAuthClient();
  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
    prompt: 'consent',
  });
}

export async function exchangeCodeForTokens(code: string) {
  const auth = getOAuthClient();
  const { tokens } = await auth.getToken(code);
  return tokens;
}
