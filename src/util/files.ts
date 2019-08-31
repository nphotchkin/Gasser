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

  createDirectoryInCwd(directoryName: string) {
    
    fsExtra.ensureDirSync(directoryName, (err: any) => {
      if (err) { 
        throw new Error(err);
      } else {
        console.log(chalk.bgBlue(directoryName) + ' directory created.');
      }
    });
  
  }

  removeDirectoryIfExists(directory: string) {
      try {
          fsExtra.removeSync(directory);
          console.log(chalk.bgBlue(directory) + " directory deleted.");

      } catch (err) {
          console.error(err);
      };
  }

  copySync(source: string, destination: string) {
      fsExtra.copySync(source, destination, { overwrite: false, errorOnExist: true }, function(err: any, data: any) {
        if (err) return new Error(err);
      })
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
   
}