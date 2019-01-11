// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedProps } from '../../types/injectedPropsType';
import AdaRedemptionForm from '../../components/wallet/ada-redemption/AdaRedemptionForm';
import AdaRedemptionNoWallets from '../../components/wallet/ada-redemption/AdaRedemptionNoWallets';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { ADA_REDEMPTION_TYPES } from '../../types/redemptionTypes';
import { AdaRedemptionCertificateParseError } from '../../i18n/errors';
import validWords from '../../api/ada/lib/valid-words.en';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';

@observer
export default class AdaRedemptionPage extends Component<InjectedProps> {
  static defaultProps = { actions: null, stores: null };

  handleGoToCreateWalletClick = () => {
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
  };

  render() {
    const { ada, adaRedemption } = this.props.stores;
    const isMainnet = environment.isMainnet();
    const { wallets } = ada;
    const {
      redeemAdaRequest, redeemPaperVendedAdaRequest,
      isCertificateEncrypted, redemptionType, error,
      isRedemptionDisclaimerAccepted, isValidRedemptionMnemonic,
      isValidRedemptionKey, isValidPaperVendRedemptionKey
    } = adaRedemption;
    const {
      chooseRedemptionType, setRedemptionCode, setCertificate, setPassPhrase, setEmail,
      setAdaAmount, setAdaPasscode, setDecryptionKey, acceptRedemptionDisclaimer
    } = this.props.actions.ada.adaRedemption;

    const selectableWallets = wallets.all.map((w) => ({
      value: w.id, label: w.name
    }));

    if (!wallets.all.length) {
      return (
        <div>
          <AdaRedemptionNoWallets
            onGoToCreateWalletClick={this.handleGoToCreateWalletClick}
          />
        </div>
      );
    }

    if (selectableWallets.length === 0) return <div><LoadingSpinner /></div>;

    const request = (redemptionType === ADA_REDEMPTION_TYPES.PAPER_VENDED ?
      redeemPaperVendedAdaRequest : redeemAdaRequest
    );
    const isCertificateSelected = adaRedemption.certificate !== null;

    const showInputsForDecryptingForceVendedCertificate = (
      isCertificateSelected && isCertificateEncrypted &&
      redemptionType === ADA_REDEMPTION_TYPES.FORCE_VENDED
    );
    const showInputForDecryptionKey = (
      isCertificateSelected && isCertificateEncrypted &&
      redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_FORCE_VENDED
    );
    const showPassPhraseWidget = redemptionType === ADA_REDEMPTION_TYPES.PAPER_VENDED || (
      isCertificateSelected && isCertificateEncrypted && (
        redemptionType === ADA_REDEMPTION_TYPES.REGULAR ||
        redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_REGULAR
      )
    );

    return (
      <div>
        <AdaRedemptionForm
          onCertificateSelected={(certificate) => setCertificate.trigger({ certificate })}
          onPassPhraseChanged={(passPhrase) => setPassPhrase.trigger({ passPhrase })}
          onRedemptionCodeChanged={(redemptionCode) => {
            setRedemptionCode.trigger({ redemptionCode });
          }}
          onEmailChanged={(email) => setEmail.trigger({ email })}
          onAdaAmountChanged={(adaAmount) => setAdaAmount.trigger({ adaAmount })}
          onAdaPasscodeChanged={(adaPasscode) => setAdaPasscode.trigger({ adaPasscode })}
          onDecryptionKeyChanged={(decryptionKey) => setDecryptionKey.trigger({ decryptionKey })}
          mnemonicValidator={isValidRedemptionMnemonic}
          redemptionCodeValidator={isValidRedemptionKey}
          postVendRedemptionCodeValidator={isValidPaperVendRedemptionKey}
          wallets={selectableWallets}
          isCertificateSelected={isCertificateSelected}
          isCertificateEncrypted={isCertificateEncrypted}
          showPassPhraseWidget={showPassPhraseWidget}
          showInputForDecryptionKey={showInputForDecryptionKey}
          showInputsForDecryptingForceVendedCertificate={
            showInputsForDecryptingForceVendedCertificate
          }
          suggestedMnemonics={validWords}
          isCertificateInvalid={error instanceof AdaRedemptionCertificateParseError}
          onRemoveCertificate={() => {}} // TODO: for now this is a mock just to test the UI
          redemptionType={redemptionType}
          redemptionCode={adaRedemption.redemptionCode}
          getSelectedWallet={walletId => wallets.getWalletById(walletId)}
          onChooseRedemptionType={(choice) => {
            chooseRedemptionType.trigger({ redemptionType: choice });
          }}
          error={adaRedemption.error}
          isSubmitting={false} // TODO: for now this is a mock just to test the UI
          onSubmit={() => {}} // TODO: for now this is a mock just to test the UI
          isRedemptionDisclaimerAccepted={isMainnet || isRedemptionDisclaimerAccepted}
          onAcceptRedemptionDisclaimer={() => acceptRedemptionDisclaimer.trigger()}
        />
      </div>
    );
  }
}
