import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mockData from './mockData/mockData.json';
import { getMockedFileBuffer } from './mockData/mockDataBuilder';

const pdfParser = require('../../../app/api/ada/lib/pdfParser');

chai.use(chaiAsPromised);
const should = chai.should(); // eslint-disable-line

describe('PDF get secret key tests', () => {
  it('should get the secret key from a parsed PDF', () => {
    const { parsePDF } = mockData;
    const secretKey = pdfParser.getSecretKey(parsePDF.PDFContent);

    assert.equal(secretKey, parsePDF.secretKey, 'Secret key should equal specific content');
  });

  it('should fail if PDF is missing', () => {
    assert.throws(
      () => { pdfParser.getSecretKey(); },
      Error
    );
  });

  it('should fail if parsed PDF has no redemption key', () => {
    const { parsePDF } = mockData;

    assert.throws(
      () => { pdfParser.getSecretKey(parsePDF.noKeyPDFContent); },
      'api.errors.invalidCertificateError: {}'
    );
  });
});

describe('PDF parse test', () => {
  it('should parse PDF content', async () => {
    const fileBuffer = getMockedFileBuffer('regular.pdf');
    const result = await pdfParser.parsePDFFile(fileBuffer);
    assert.equal(result, mockData.parsePDF.PDFContent, 'PDF parser result should equal content');
  });

  it('should fail parsing PDF content when no file is passed', () => (
    pdfParser.parsePDFFile().should.be.rejectedWith(mockData.parsePDF.parametersError)
  ));

  it('should fail parsing PDF content when an invalid file is passed', () => {
    const fileBuffer = getMockedFileBuffer('regular.txt');
    return pdfParser.parsePDFFile(Buffer.from(fileBuffer))
      .should.be.rejectedWith(mockData.parsePDF.structureError);
  });
});

describe('PDF decrypt test', () => {
  it('should decrypt regular PDF', () => {
    const fileBuffer = getMockedFileBuffer('regular.pdf.enc');
    const decryptedFileBuffer = getMockedFileBuffer('regular-decrypted.txt');
    const decryptedFile = pdfParser.decryptFile(mockData.decryptPDF.passphrase,
      mockData.decryptPDF.regularTitle, fileBuffer);
    assert(Buffer.from(decryptedFile).equals(decryptedFileBuffer), 'PDF decrypted content should equal specific content');
  });

  it('should decrypt force vended PDF', () => {
    const fileBuffer = getMockedFileBuffer('force-vended.pdf.enc');
    const decryptedFileBuffer = getMockedFileBuffer('force-vended-decrypted.txt');
    const decryptedFile = pdfParser.decryptFile(mockData.decryptPDF.data.toString(), 'forceVended', fileBuffer);
    assert(Buffer.from(decryptedFile).equals(decryptedFileBuffer), 'PDF decrypted content should equal specific content');
  });

  it('should return same file when no decryption key is passed', () => {
    const fileBuffer = getMockedFileBuffer('force-vended.pdf.enc');
    const decryptedFile = pdfParser.decryptFile(undefined, undefined, fileBuffer);
    assert(Buffer.from(decryptedFile).equals(fileBuffer), 'Result content should equal initial content');
  });

  it('should fail at decrypting when only decryption key is passed', () => {
    assert.throws(
      () => pdfParser.decryptFile(mockData.decryptPDF.passphrase),
      mockData.decryptPDF.decryptionError
    );
  });
});