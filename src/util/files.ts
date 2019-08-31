import chalk from 'chalk';

const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');

export default class Files {

  getCurrentDirectoryBase() {
    return path.basename(process.cwd());
  }

  directoryExists(filePath: string) {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  }

  fileExists(fileName: string) {
    try {
      if (fs.existsSync(path)) {
        return true;
      }
    } catch(err) {
      return false;
    }
  }

  changeCwd(path : string) {
    console.log(`Starting directory: ${process.cwd()}`);
    try {
      process.chdir(path);
      console.log(`New directory: ${process.cwd()}`);
    } catch (err) {
      console.error(`chdir: ${err}`);
    }
  }

  async createDirectoryInCwd(directoryName: string) {
    return new Promise((resolve, reject) => {
      fs.mkdir(process.cwd()  + '\\' + directoryName, { recursive: true }, (err: any) => {
        if (err) { 
          reject(err);
        } else {
          console.log(chalk.bgBlue(directoryName) + ' directory created.');
          resolve();
        }
      });
    });
  }

   async removeDirectoryIfExists(src?: any, dest?: any) {
      return new Promise((resolve, reject) => {
          try {
              fsExtra.remove('./gas-build');
               
              console.log(chalk.bgBlue('gas-build') + " directory deleted.");
              resolve();
          } catch (err) {
              console.error(err)
              reject(new Error(err));
          };
      });
  }

  createFile(fileName: string, fileContents: string) {
    fs.appendFile(fileName, fileContents, function (err: any) {
      if (err) throw err;
      console.log('Saved!');
    });

  }

  readFile(path: string) {

    return new Promise(function(resolve, reject) {
        fs.readFile(path, 'utf8', function(err: any, data: any) {
          if (err) { reject(); throw err; }
    
          resolve(data);
        })
    });
  }

  copy(source: string, destination: string) {

    return new Promise(function(resolve, reject) {
        fsExtra.copy(source, destination, function(err: any, data: any) {
          if (err) { reject(); throw err; }
    
          resolve();
        })
     });
  }
  
}