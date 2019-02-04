// @flow

import { getAddressFromRedemptionKey, getRedemptionSignedTransaction } from './lib/cardanoCrypto/cryptoRedemption';
import bs58 from 'bs58';
import { getUTXOsForAddresses, sendTx } from './lib/yoroi-backend-api';
import { decryptRegularVend } from './lib/decrypt';
import type { RedeemResponse } from '../../../flow/declarations/CardanoCrypto';
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

export async function redeemAda(
  redemptionParams: RedeemAdaParams
) : Promise<BigNumber> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
  const uint8ArrayAddress = getAddressFromRedemptionKey(redemptionKey);
  const senderAddress = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [senderAddress] });
  if (utxos.length === 0) {
    throw new RedemptionKeyAlreadyUsedError();
  }
  const receiverAddress = await getReceiverAddress();
  const redemptionSignedTransaction: RedeemResponse =
    getRedemptionSignedTransaction(redemptionKey, receiverAddress, utxos[0]);
  const cborEncodedTx = redemptionSignedTransaction.result.cbor_encoded_tx;
  const signedTx = Buffer.from(cborEncodedTx).toString('base64');
  await sendTx({ signedTx });
  return new BigNumber(utxos[0].amount);
}

export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<BigNumber> {
  const redemptionCodeBuffer = bs58.decode(redemptionParams.redemptionCode);
  const mnemonicAsString = redemptionParams.mnemonics.join(' ');
  const seed = decryptRegularVend(mnemonicAsString, redemptionCodeBuffer);
  const uint8ArrayAddress = getAddressFromRedemptionKey(Buffer.from(seed, 'base64'));
  const senderAddress = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [senderAddress] });
  if (utxos.length === 0) {
    throw new RedemptionKeyAlreadyUsedError();
  }
  const receiverAddress = await getReceiverAddress();
  const redemptionSignedTransaction: RedeemResponse =
    getRedemptionSignedTransaction(redemptionCodeBuffer, receiverAddress, utxos[0]);
  const cborEncodedTx = redemptionSignedTransaction.result.cbor_encoded_tx;
  const signedTx = Buffer.from(cborEncodedTx).toString('base64');
  await sendTx({ signedTx });
  return new BigNumber(utxos[0].amount);
}