import { assert } from 'chai';

const fs = require('fs');
const path = require('path');
const pdfParser = require('../../../app/api/ada/lib/pdfParser');

describe('PDF read test', () => {
  it('should read PDF content', async () => {
    const PDFContent = 'opqrmev edroxpwghg IS ELIGIBLE FOR 12345 TO BE REDEEMED WITH THE VENDING ADDRESS'
    + ' PcnwlQMQzjRtKvBCz38k-wMoIWZSBtzTT7rvfoARaF8= txboqa —————— TRANSACTION ID —————— '
    + 'llVRYvW7LAyqmDMnUOvrs5ih4OHfLiLZrz5NT+iRuTw= —————— REDEMPTION KEY —————— ';
    const PDFPath = path.resolve('./tests/unit/test/mockData/regular.pdf');
    const file = fs.readFileSync(PDFPath);
    try {
      const result = await pdfParser.parsePDFFile(file);
      assert.equal(result, PDFContent, 'PDF parser result does not equal content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should fail reading PDF content when no file is passed', async () => {
    try {
      await pdfParser.parsePDFFile();
      assert.fail();
    } catch (error) {
      assert.notEqual(error.message, 'assert.fail()', 'Test failed');
    }
  });

  it('should fail reading PDF content when an invalid file is passed', async () => {
    const PDFPath = path.resolve('./tests/unit/test/mockData/regular.txt');
    const file = fs.readFileSync(PDFPath);
    try {
      await pdfParser.parsePDFFile(Buffer.from(file));
      assert.fail();
    } catch (error) {
      assert.notEqual(error.message, 'assert.fail()', 'Test failed');
    }
  });
});

describe('PDF decrypt test', () => {
  it('should decrypt and read encrypted regular PDF content', async() => {
    const PDFContent = 'ン赤 ご新 IS ELIGIBLE FOR 413274 TO BE REDEEMED WITH THE VENDING ADDRESS'
      + ' siZDin74Y6UHsybPvWchSLC8NxNvF+BQuNy88ur4mNA='
      + ' 9d374efcf4623d5623dc59a7cbf742771c4784aa7c487dc34943c565be778679 TRANSACTION ID'
      + ' VPyMsOqAnRJoqCv40OWHfUDLRXDiTsg6WuINDxwyli8= REDEMPTION KEY ';
    const PDFPath = path.resolve('./tests/unit/test/mockData/regular.pdf.enc');
    const file = fs.readFileSync(PDFPath);
    const passphrase = 'uncle bargain pistol obtain amount laugh explain type learn';
    const decryptedFile = pdfParser.decryptFile(passphrase, 'regular', file);
    try {
      const result = await pdfParser.parsePDFFile(Buffer.from(decryptedFile));
      assert.equal(result, PDFContent, 'PDF parser result does not equal content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should decrypt and read encrypted force vended PDF content', async() => {
    const PDFContent = 'opqrmev edroxpwghg IS ELIGIBLE FOR 12345 TO BE REDEEMED WITH THE VENDING'
      + ' ADDRESS PcnwlQMQzjRtKvBCz38k-wMoIWZSBtzTT7rvfoARaF8= txboqa —————— TRANSACTION ID'
      + ' —————— llVRYvW7LAyqmDMnUOvrs5ih4OHfLiLZrz5NT+iRuTw= —————— REDEMPTION KEY —————— ';
    const PDFPath = path.resolve('./tests/unit/test/mockData/force-vended.pdf.enc');
    const file = fs.readFileSync(PDFPath);
    const data = ['nnmbsds@example.org', 'uilfeet', '12345'];
    const decryptedFile = pdfParser.decryptFile(data, 'forceVended', file);
    try {
      const result = await pdfParser.parsePDFFile(Buffer.from(decryptedFile));
      assert.equal(result, PDFContent, 'PDF parser result does not equal content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should fail at decrypting with no data', async() => {
    try {
      const decryptedFile = pdfParser.decryptFile();
      assert.equal(decryptedFile, undefined);
    } catch (error) {
      assert.notEqual(error.message, 'assert.fail()', 'Test failed');
    }
  });

  it('should fail at decrypting when only redemtion key is passed', async() => {
    try {
      pdfParser.decryptFile('uncle bargain pistol obtain amount laugh explain type learn');
      assert.fail();
    } catch (error) {
      assert.notEqual(error.message, 'assert.fail()', 'Test failed');
    }
  });
});
