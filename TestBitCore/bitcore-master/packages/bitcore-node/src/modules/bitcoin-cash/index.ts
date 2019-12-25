import { BitcoinP2PWorker } from '../bitcoin/p2p';
import { BaseModule } from '..';
import { BCHStateProvider } from '../../providers/chain-state/bch/bch';

export default class BCHModule extends BaseModule {
  constructor(services) {
    super(services);
    services.Libs.register('BCH', 'bitcore-lib-cash', 'bitcore-p2p-cash');
    services.P2P.register('BCH', BitcoinP2PWorker);
    services.CSP.registerService('BCH', new BCHStateProvider());
  }
}
