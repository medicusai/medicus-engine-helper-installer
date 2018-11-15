'use babel';

import {Readable} from 'stream';
import extract from 'extract-zip'
import fs from 'fs-plus'
import fse from 'fs-extra'
import path from 'path'
import utils from './utils'
import loader from './loader-manager'
import fetch from './fetchWithTimeout'


export default class VCS{

  static packagesPath = "";
  static zipPath = "";
  static generalTempPath = "";
  static tempPath = "";
  static packagePath = "";
  static repositoryUrl = "https://bitbucket.org/medicus/medicus-engine-helper/get/master.zip";
  static timeout = 15000;

  static initPathes(){
    VCS.packagesPath = atom.packages.packageDirPaths.filter(item => !item.includes('dev'))[0];
    VCS.generalTempPath = path.join(atom.getConfigDirPath() ,"temp");
    fs.makeTreeSync( VCS.generalTempPath );
    VCS.zipPath = path.join(VCS.generalTempPath, "tmp.zip");
    VCS.tempPath = path.join(VCS.generalTempPath, "temp" + (new Date()).getTime());
    VCS.packagePath = path.join(VCS.packagesPath, "medicus-engine-helper");
  }

  static async convertToFsReadable(readable){
    const reader = readable.getReader();
    const rs = new Readable();
    rs._read = async () => {
        const result = await reader.read();
        if(!result.done){
            rs.push(Buffer.from(result.value));
        }else{
            rs.push(null);
            return;
        }
    };
    return rs;
  };

  static async fetchPackageFile(username, password){

    return fetch(VCS.repositoryUrl, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/zip",
            "Authorization": "basic "+ btoa(username+":"+password)
        },
        redirect: "manual", // manual, *follow, error
        referrer: "no-referrer"
    },
    VCS.timeout).then(response => {
      if(!response.ok){
        if(response.status === 0 || response.status === 403){
          response.errorMessage = "Wrong Username or Password!";
        }else{
          atom.notifications.addWarning("Something went wrong! please try again.", {
            detail: "Error code (" + response.status + ")",
            dismissable: true,
          });
        }
      }
      return response;
      })
    .catch(error => {
      throw error;
    });
  }


  static saveFile(readable){
      return new Promise(resolve =>
        readable.pipe(fs.createWriteStream(VCS.zipPath))
              .on('finish', resolve));
  }

  static extractZip(){
      return new Promise(resolve =>
        extract(VCS.zipPath, {dir: VCS.tempPath}, resolve));
  }

  static async deleteFolder(p) {
    if (fs.existsSync(p)) {
      fs.readdirSync(p).forEach(function(file, index){
        var curPath = path.join(p , file);
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          await VCS.deleteFolder(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(p);
    }
  }

  static removeTempZip(){
    return new Promise(resolve =>
       fs.unlink(VCS.zipPath, resolve));
  }

  static async installEngineHelperPacakage(options){
    let username = options.username;
    let password = options.password;

    //Initialize the used pathes values
    VCS.initPathes();

    try{

      //fetch the repository files as zip file using Web API (Fetch API)
      let response = await VCS.fetchPackageFile(username, password);

      if(response.errorMessage) return response.errorMessage;

      loader.showWithMessage("Fetching package data!")

      //Convert web compatiple readable to Node/Fs-plus readable
      let readable = await VCS.convertToFsReadable(response.body);

      //save zip
      await VCS.saveFile(readable);

      loader.setMessage("Extracting package files!");

      //extract zip files
      let error = await VCS.extractZip();

      loader.setMessage("Setting up the package!");

      //copy package files to the atom packages folder
      await VCS.copyPackageToPackagesFolder();

      loader.setMessage("Cleaning up the mess!");

      //delete temp zip files
      error = await VCS.removeTempZip();

      //delete temp extracted folder and its content
      fse.remove(VCS.tempPath, (err)=>{console.log(err);});

      loader.hide();

      atom.notifications.addSuccess("Medicus Engine Helper installed succesfully!", {
        detail: "Please reload Atom to activate the new installed package.",
        dismissable: true,
        buttons: [
         {
         className: "btn-details",
         onDidClick: function() {
           atom.reload();
         },
         text: "Reload!"
         }
       ],
      });

    }catch(err){
      loader.hide();
      atom.notifications.addWarning("Something went wrong! please try again.", {
        detail: err,
        dismissable: true,
      });
    }

  }

  static async copyPackageToPackagesFolder(){

    let fromPath = fs.readdirSync(VCS.tempPath).map( file => path.join(VCS.tempPath, file))[0];

    utils.scanTree(fromPath, function(err,fileInfo){

			if (!fileInfo.isDir){
				let toPath = fileInfo.basepath.replace( fromPath, VCS.packagePath);
				fs.makeTreeSync( toPath);
				toPath = path.join( toPath, fileInfo.name);

			 	fs.createReadStream(fileInfo.fullpath).pipe(fs.createWriteStream(toPath));

			}
			else{
				let toPath = fileInfo.fullpath.replace( fromPath, VCS.packagePath );
				fs.makeTreeSync( toPath );
			}

		});

  }

}
