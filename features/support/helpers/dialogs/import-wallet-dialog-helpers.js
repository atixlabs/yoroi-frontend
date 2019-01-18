const IMPORT_WALLET_DIALOG = '.WalletFileImportDialog';

export default {
  waitForDialog: (client, { isHidden } = {}) => (
    client.waitForVisible(IMPORT_WALLET_DIALOG, null, isHidden)
  ),
  selectFile: (client, { filePath }) => (
    client.chooseFile(`${IMPORT_WALLET_DIALOG} .FileUploadWidget_dropZone input`, filePath)
  ),
  clickImport: (client) => (
    this.waitAndClick(client, `${IMPORT_WALLET_DIALOG} .primary`)
  ),
  expectError: (client, { error }) => (
    this.expectTextInSelector(client, {
      selector: `${IMPORT_WALLET_DIALOG}_error`,
      text: error,
    })
  )
};
