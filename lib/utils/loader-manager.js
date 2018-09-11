'use babel';

export default class LoaderPanel{

  static panel = null;

  static init() {
    let message = document.createElement('div');
    message.classList.add("loader-message-container");
    let messageSpan = document.createElement('span');
    messageSpan.setAttribute("id", "mehi-loader-message");
    message.appendChild(messageSpan);

    let ringRight = document.createElement('div');
    ringRight.classList.add("loader-ring-light");

    let ringLeft = document.createElement('div');
    ringLeft.classList.add("loader-ring-left");

    let element = document.createElement('div');
    element.classList.add("loader-ring");

    element.appendChild(message);
    element.appendChild(ringRight);
    element.appendChild(ringLeft);

    LoaderPanel.panel = atom.workspace.addModalPanel( {item: element, visible: false} );
    element.parentElement.classList.add("loader-modal");
  }

  static showWithMessage(message){
    let msg = document.getElementById("mehi-loader-message");
    msg.innerHTML = message;
		LoaderPanel.toggle();
  }

  static setMessage(message){
    let msg = document.getElementById("mehi-loader-message");
    msg.innerHTML = message;
  }

  static show(){
		if (!LoaderPanel.panel.isVisible()){
			LoaderPanel.panel.show();
		}
	}

	static hide(){
		if (LoaderPanel.panel.isVisible())
			LoaderPanel.panel.hide();
	}

  static toggle(){
		LoaderPanel.panel.isVisible() ? LoaderPanel.hide() : LoaderPanel.show();
	}

}
