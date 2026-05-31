# Google Sheets registration integration

The membership form always prepares a WhatsApp message for **+91 6265219497**. It can also log each registration to a private Google Sheet through a Google Apps Script web app.

## Connect the Sheet

1. Create or open the Google Sheet that should receive membership enquiries.
2. In the Sheet, open **Extensions → Apps Script**.
3. Replace the editor contents with the code from [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
4. Select **Deploy → New deployment**.
5. Choose **Web app** as the deployment type.
6. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
7. Deploy the app and copy the generated URL ending in `/exec`.
8. Paste that URL into [`registration-config.js`](registration-config.js):

   ```js
   window.IRON_MAN_REGISTRATION_CONFIG = {
     googleSheetsWebhookUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
   };
   ```

## Stored columns

The Apps Script creates a **Membership Registrations** tab automatically and stores:

| Submitted At | Name | Phone | Email | Plan | Source |
| --- | --- | --- | --- | --- | --- |

The receiver escapes values that begin with spreadsheet formula characters before appending them.

## Verify the integration

1. Serve the site and open `register.html`.
2. Fill in the form and select a plan.
3. Submit the form. WhatsApp should open with a prefilled message addressed to **+91 6265219497**.
4. Return to the Sheet and confirm that a new row appears in **Membership Registrations**.

> WhatsApp requires the visitor to press **Send** in WhatsApp. Browsers cannot send a WhatsApp message automatically on the visitor's behalf.
