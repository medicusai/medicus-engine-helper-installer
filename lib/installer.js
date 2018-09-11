'use babel';

import { CompositeDisposable } from 'atom';
import LoaderPanel from './utils/loader-manager';
import InstallView from './views/install-view';

export default {

  modalPanel: null,

  async activate(state) {

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that create package creation view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medicus-engine-helper-installer:install': this.install
    }));

    LoaderPanel.init();
  },


  deactivate() {
    this.modalPanel.destroy();

  },

  install() {
    if(!this.install)
      this.install = new InstallView();
    this.install.attach();
  }
};
