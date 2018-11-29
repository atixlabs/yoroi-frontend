// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';

import externalLinkSVG from '../../../../assets/images/link-external.inline.svg';

import globalMessages from '../../../../i18n/global-messages';

import type { ProgressInfo } from '../../../../stores/ada/TrezorConnectStore'

// TODO: remove unwated style
import styles from './HelpLinkBlock.scss';

const messages = defineMessages({
  helpLinkYoroiWithTrezor: {
    id: 'wallet.trezor.dialog.trezor.common.step.link.helpYoroiWithTrezor',
    defaultMessage: '!!!https://yoroi-wallet.com/',
    description: 'Tutorial link about how to use Yoroi with Trezor on the Connect to Trezor Hardware Wallet dialog.'
  },
  helpLinkYoroiWithTrezorText: {
    id: 'wallet.trezor.dialog.trezor.common.step.link.helpYoroiWithTrezor.text',
    defaultMessage: '!!!Click here to know more about how to use Yoroi with Trezor.',
    description: 'Tutorial link text about how to use Yoroi with Trezor on the Connect to Trezor Hardware Wallet dialog.'
  },
});

type Props = {
  progressInfo: ProgressInfo,
};

@observer
export default class HelpLinkBlock extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.yoroiLinkComponent}>
        <a target="_blank" rel="noopener noreferrer" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
          {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
          <SvgInline svg={externalLinkSVG} cleanup={['title']} />
        </a>
      </div>);
  }
}