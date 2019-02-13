// @flow

import { getAddressFromRedemptionKey, getRedemptionSignedTransaction } from './lib/cardanoCrypto/cryptoRedemption';
import bs58 from 'bs58';
import { getUTXOsForAddresses, sendTx } from './lib/yoroi-backend-api';
import { decryptRegularVend } from './lib/decrypt';
import { getReceiverAddress } from './adaAddress';
import { RedemptionKeyAlreadyUsedError } from './errors';
import BigNumber from 'bignumber.js';

export type RedeemAdaParams = {
  redemptionCode: string,
  walletId: string,
  accountIndex: number
};

export type RedeemPaperVendedAdaParams = {
  redemptionCode: string,
  walletId: string,
  accountIndex: number,
  mnemonics: Array<string>,
};

async function createAndSendTx(
  redemptionKey: Buffer
) : Promise<BigNumber> {
  // The address associated to the redemption key is obtained
  const uint8ArrayAddress = getAddressFromRedemptionKey(redemptionKey);
  const senderAddress = bs58.encode(Buffer.from(uint8ArrayAddress));
  // The UTXO belonging to the certificate's address is fetched
  const utxos = await getUTXOsForAddresses({ addresses: [senderAddress] });
  if (utxos.length === 0) {
    throw new RedemptionKeyAlreadyUsedError();
  }
  const receiverAddress = await getReceiverAddress();
  // Ada Redemption Signed Transaction is created with the redemption key and the UTXO
  const redemptionSignedTransaction: RedeemResponse =
    getRedemptionSignedTransaction(redemptionKey, receiverAddress, utxos[0]);
  const cborEncodedTx = redemptionSignedTransaction.result.cbor_encoded_tx;
  const signedTx = Buffer.from(cborEncodedTx).toString('base64');
  // Transaction is broadcasted
  await sendTx({ signedTx });
  // If the broadcast didn't fail, the UTXO's amount is returned
  return new BigNumber(utxos[0].amount);
}

export async function redeemAda(
  redemptionParams: RedeemAdaParams
) : Promise<BigNumber> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');

  return createAndSendTx(redemptionKey);
}

export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<BigNumber> {
  // Redemption key is obtained by decrypting the redemption code with the mnemonics
  const redemptionCodeBuffer = bs58.decode(redemptionParams.redemptionCode);
  const mnemonicAsString = redemptionParams.mnemonics.join(' ');
  const seed = decryptRegularVend(mnemonicAsString, redemptionCodeBuffer);
  const redemptionKey = Buffer.from(seed, 'base64');

  return createAndSendTx(redemptionKey);
}
