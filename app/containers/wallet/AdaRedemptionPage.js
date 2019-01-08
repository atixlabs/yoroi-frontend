// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import type { InjectedProps } from '../../types/injectedPropsType';
import AdaRedemptionChoices from '../../components/wallet/ada-redemption/AdaRedemptionChoices';
import RegularAdaRedemption from '../../components/wallet/ada-redemption/RegularAdaRedemption';
import { ADA_REDEMPTION_TYPES } from '../../types/redemptionTypes';

@inject('stores', 'actions') @observer
export default class AdaRedemptionPage extends Component<InjectedProps> {
  static defaultProps = { actions: null, stores: null };

  render() {
    const { stores, actions } = this.props;

    const {
      redeemAdaRequest, redeemPaperVendedAdaRequest, isCertificateEncrypted, isValidRedemptionKey,
      redemptionType, isValidRedemptionMnemonic, isValidPaperVendRedemptionKey,
      isRedemptionDisclaimerAccepted, error
    } = stores.adaRedemption;
    const {
      chooseRedemptionType, setCertificate, setPassPhrase, setRedemptionCode, removeCertificate,
      setEmail, setAdaPasscode, setAdaAmount, setDecryptionKey, acceptRedemptionDisclaimer
    } = actions.ada.adaRedemption;

    const onChooseRedemptionType = (choice) =>
      chooseRedemptionType.trigger({ redemptionType: choice });

    return (
      <div>
        {/* TODO: move this component to Ada Redemption Form once it's created */}
        <AdaRedemptionChoices
          activeChoice={redemptionType}
          onSelectChoice={(choice: RedemptionTypeChoices) => {
            /* TODO: reset form */
            onChooseRedemptionType(choice);
          }}
        />
        <RegularAdaRedemption
          onCertificateSelected={(certificate) => setCertificate.trigger({ certificate })}
          onPassPhraseChanged={(passPhrase) => setPassPhrase.trigger({ passPhrase })}
          onRedemptionCodeChanged={(redemptionCode) => {
            setRedemptionCode.trigger({ redemptionCode });
          }}
          onEmailChanged={(email) => setEmail.trigger({ email })}
          onAdaAmountChanged={(adaAmount) => setAdaAmount.trigger({ adaAmount })}
          onAdaPasscodeChanged={(adaPasscode) => setAdaPasscode.trigger({ adaPasscode })}
          onDecryptionKeyChanged={(decryptionKey) => setDecryptionKey.trigger({ decryptionKey })}
          onChooseRedemptionType={(choice) => {
            chooseRedemptionType.trigger({ redemptionType: choice });
          }}
          redemptionCode={stores.adaRedemption.redemptionCode}
          // wallets={selectableWallets}
          // suggestedMnemonics={validWords}
          // isCertificateSelected={isCertificateSelected}
          isCertificateEncrypted={isCertificateEncrypted}
          // isCertificateInvalid={error instanceof AdaRedemptionCertificateParseError}
          // isSubmitting={request.isExecuting}
          error={stores.adaRedemption.error}
          onRemoveCertificate={removeCertificate.trigger}
          onSubmit={(redemptionType === ADA_REDEMPTION_TYPES.PAPER_VENDED ?
            this.onSubmitPaperVended : this.onSubmit
          )}
          mnemonicValidator={isValidRedemptionMnemonic}
          redemptionCodeValidator={isValidRedemptionKey}
          postVendRedemptionCodeValidator={isValidPaperVendRedemptionKey}
          redemptionType={redemptionType}
          // showInputsForDecryptingForceVendedCertificate={
          //   showInputsForDecryptingForceVendedCertificate
          // }
          // showInputForDecryptionKey={showInputForDecryptionKey}
          // showPassPhraseWidget={showPassPhraseWidget}
          isRedemptionDisclaimerAccepted={isRedemptionDisclaimerAccepted}
          onAcceptRedemptionDisclaimer={() => acceptRedemptionDisclaimer.trigger()}
          getSelectedWallet={() => ({})}
        />
      </div>
    );
  }
}
