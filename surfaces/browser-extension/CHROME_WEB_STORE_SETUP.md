# Chrome Web Store — Publishing Setup

Instructions to configure manual or automated publishing for the extension.

## Summary of Manual vs Automated Publishing

- First publish is manual: Upload the packaged zip file once via the Chrome Web Store dashboard, fill in the store listing and privacy practices, and submit it for Google's review. This generates the unique extension Item ID.
- Version packaging is automated: Creating a git tag trigger (e.g., v0.1.1) builds, packages, and pushes a release archive.
- Web Store automated upload: The GitHub action step is optional. Enable it only after performing the first manual publish. Every uploaded version still undergoes standard Google review.

## Initial Manual Publish

1. Access the developer console at <https://chrome.google.com/webstore/devconsole> and pay the developer registration fee.
2. Package the extension workspace:
   ```bash
   npm run package --workspace @waterusedbyourai/browser-extension
   ```
   This generates `waterusedbyourai.zip` (or the configured zip archive).
3. Click "New item" and upload the zip file.
4. Fill in the Store Listing details using `STORE_LISTING.md` and screenshots (such as `docs/media/widget-preview.png`).
5. Complete the Privacy practices page using `PRIVACY_POLICY.md` (declare no remote data collection).
6. Submit the item for review. Copy the Item ID from the dashboard url.

## Automated Version Publishing (Optional)

Configure this workflow once updates are shipped regularly.

### 1. Configure OAuth Credentials in Google Cloud Console

1. Navigate to <https://console.cloud.google.com> and create a new project (e.g., "waterusedbyourAi").
2. Go to APIs and Services, access the Library, and enable the "Chrome Web Store API".
3. Configure the OAuth Consent Screen as External, fill in the developer email details, and publish the app (marking yourself as a test user to ensure refresh token persistence).
4. Navigate to Credentials, select Create credentials, select OAuth Client ID, and select Desktop App. Save the Client ID and Client Secret.

### 2. Retrieve the Refresh Token

1. Construct the authorization URL by replacing `YOUR_CLIENT_ID` in this template:
   ```
   https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&redirect_uri=urn:ietf:wg:oauth:2.0:oob&client_id=YOUR_CLIENT_ID
   ```
2. Paste the URL into your browser, grant the permissions, and copy the authorization code.
3. Exchange the code for a refresh token using this request:
   ```bash
   curl "https://oauth2.googleapis.com/token" \
     -d "client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&code=YOUR_AUTH_CODE&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob"
   ```
4. Copy the returned `refresh_token` value.

### 3. Add GitHub Repository Secrets

1. In your GitHub repository, navigate to Settings, select Secrets and Variables, click Actions, and add the following repository secrets:
   - `CWS_CLIENT_ID`
   - `CWS_CLIENT_SECRET`
   - `CWS_REFRESH_TOKEN`
2. Update `.github/workflows/release.yml` by uncommenting the Web Store publish task and setting `extension-id` to your Item ID.
