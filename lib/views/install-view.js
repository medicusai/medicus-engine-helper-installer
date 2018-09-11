'use babel';

import BaseForm from './base-form'
import Loader from '../utils/loader-manager';
import VCS from '../utils/vcs-manager';




export default class InstallView extends BaseForm{


  constructor() {
    super()
  }




  async attach(branches){
    this.clear();

		this.addControl( "input-text", "username", {label: "Username"});
		this.addControl( "input-password", "password", {label: "Password"});

		this.addControl( "block", "error", {class: "error-message"});
		this.addControl("text", "text-console");

		this.setValue( "username", "Enter the username here.");

		this.toggle();
  }

  confirm(){
    console.log("Confirm pressed!");
    this.block(true);

    var cb = (async ()=>{
      try{

        let username = this.getValue("username").trim();
        let password = this.getValue("password").trim();

        let error = await VCS.installEngineHelperPacakage({username: username, password: password});

        if(error) throw(error);



				this.block(false);
				this.hide();

			}catch(err){
				this.setValue("error", err);
				this.block(false);
			}
		}).bind(this);

		setTimeout( cb, 10 );
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
