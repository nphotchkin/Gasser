
const fse = require('fs-extra');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

import chalk from 'chalk';
import Files from '../util/files';

import ClaspFiles from '../model/ClaspFiles';
import ClaspFile from '../model/ClaspFiles';

export class GASBuild {

    files = new Files();

    distPath = "";

    claspFiles = new ClaspFiles();

    GAS_BUILD_DIR = "gas-build";

    constructor(distPath: string) {
        this.distPath = distPath;
        this.throwIfMissingProjectFiles();
    }

    buildProject() {

        chalk.bgBlue('building from path: ' + this.distPath);
        console.log();
        try {
        this.createNewBuild();
        } catch  (err) {
            console.log(chalk.red('unable to create project due to: '));
            console.log(err);
        }


        let copiedClaspFiles = false;
        try {
            copiedClaspFiles = this.copyClaspFilesToBuild();
        } catch (fileName) {

            console.log(chalk.bgRed(chalk.white(fileName)) + ' does not exist in the directory gasser was ran from, it is a required file for an App Script build.');
            
            this.performHousekeeping();

            console.log('exiting process.');
            process.exit(0);
        }
    
        if (copiedClaspFiles) {
        
        
            var indexString = this.getIndexFileContents();
    
            let dom = new JSDOM(indexString);

            this.removeAllMatchingElementsByTagName(dom, 'script');
            this.removeAllMatchingElementsByTagName(dom, 'link');

            var interpolatedFileNames = this.saveInterpolatedFilesToDisk();

            interpolatedFileNames.map(fileName => 
                this.addTemmplateReferenceToIndexHtml(dom, fileName)
            );


            let docHtml: string = dom.window.document.documentElement.outerHTML;
            docHtml =  this.replaceCharacterEntityReferencesWithLiterals(docHtml);
    
            fse.writeFileSync('./' + this.GAS_BUILD_DIR  +  '/' + 'index.html', docHtml );

            console.log();
            console.log();
            console.log(chalk.green('Project Built! you can now push your clasp project from ') + chalk.bgBlue('/' + this.GAS_BUILD_DIR) );
      }
          
    }
   
    private createNewBuild() {
    
        this.files.removeDirectoryIfExists('./' + this.GAS_BUILD_DIR);
    
        this.files.createDirectoryInCwd('./' + this.GAS_BUILD_DIR);
        console.log();
    }

    private performHousekeeping() {
        this.files.removeDirectoryIfExists('./' + this.GAS_BUILD_DIR );
        console.log();
    }

    private copyClaspFilesToBuild() {

        let claspFiles = this.claspFiles.getFileDecriptors();

        claspFiles.map(claspFile => {
   
            try {
                this.files.copySync('./' + claspFile.fileName,  './' + this.GAS_BUILD_DIR + '/' + claspFile.fileName);
            } catch(error) {

                // i need to catch the error somewhere and prevent further execution
                if (claspFile.errorIfNotExist == true) {

                    throw new Error(claspFile.fileName);
                }
            }
        });

        return true;
    }

    private throwIfMissingProjectFiles() {


        if (!this.files.directoryExists(this.distPath)) {
            throw new Error('Project build directory: ' + this.distPath + ' does not exist!'); 
        } 
        
  

        // appScriptFiles.forEach(appScriptFile => {
        //       if (!this.files.fileExists(appScriptFile.fileName)) {
        //           if (appScriptFile.errorIfNotExist) {
                 
        //             throw new Error('Missing Google Apps Script project file: ' + chalk.bgRed(appScriptFile.fileName) + ' at the root directory.' 
        //               + '\n Have you ran clasp create?')
        //           } else {

        //             console.info(chalk.blue('This project doesn\'t have a: ' + appScriptFile.fileName));
        //           }
        //       }
        // });

    }

    private saveInterpolatedFilesToDisk() {
 
        let interpolatedFileNames: string[] = [];
    
        fse.readdirSync(this.distPath).forEach((fileName: string) => {
    
            var transformedOutput = this.wrapFileContentsWithInclusionElement(fileName);
    
            if (this.getExtension(fileName) != '.html' && transformedOutput != false) {
                fse.writeFileSync('./' + this.GAS_BUILD_DIR + '/' + fileName + '.html', transformedOutput);
                interpolatedFileNames.push(fileName);
            } else {

                if (this.getExtension(fileName) !== '.html') {
                    console.log(
                        chalk.yellow('Ignored file: ' + chalk.black.bgYellow(fileName) + ' only files ending in .css & .js are supported. ')
                    );
                } else {
                    console.log(
                        chalk.yellow('Ignored file: ' + chalk.white.bgBlue(fileName) + ' as its .html i\'m assuming it\'s the index.')
                    );
                }
                
            }
        });
    
        return interpolatedFileNames;
    }
    
    private getIndexFileContents() {

        var fileContents;
    
        fse.readdirSync(this.distPath).forEach((fileName: string) => {
            // if file is not ignored file
            // then
            if (this.getExtension(fileName) == '.html') {               
                fileContents = fse.readFileSync(this.distPath + "/" + fileName).toString();
            }
        });
    
        if (fileContents == null) {
            console.log(
                chalk.red('No default HTML page in directory: ' + this.distPath + ' was found a home page is required.')
            );
            console.log(
                chalk.red('No action was taken application will now exit.')
            );
    
            process.exit();
        }
    
        return fileContents;
    
    }

        
    private wrapFileContentsWithInclusionElement(fileName: string) {

        var fileExtension = this.getExtension(fileName);

        var fileContents;

        switch (fileExtension) {
            case '.css':
                
                fileContents = this.wrapTextInXml(fileName, 'style');

                break;

            case '.js':


                fileContents = this.wrapTextInXml(fileName, 'script')
                break;


            default:
                chalk.yellow('file name: ' + fileName + ' is not in inclusion or ignore list, this file won\'t be included in the output.');
                return false;

        }

        return fileContents;
    }
    
    private wrapTextInXml(fileName: string, elementName: string) {
        var contents = fse.readFileSync(this.distPath + '/' + fileName);
    
        return '<' + elementName + '> \n' + contents.toString() + '\n </' + elementName + '>';
    }

    private getExtension(filename: string) {
        var i = filename.lastIndexOf('.');
        return (i < 0) ? '' : filename.substr(i);
    }

    /*
     * template refrences literal opening and closing brackets will change to
     * character entity references.
     */
    private addTemmplateReferenceToIndexHtml(dom: any, fileName: string) {

        var templateSyntaxString = this.wrapFileNameInTemplateSyntax(fileName);
     
        var fileExtension = this.getExtension(fileName);
     

        switch (fileExtension) {
            case '.css':
                // last child header insert

                dom.window.document.head.insertAdjacentText('beforeend', "\t" + this.wrapFileNameInTemplateSyntax(fileName) + "\n");
                
                break;

            case '.js':
                dom.window.document.body.insertAdjacentText('beforeend', "\t" + this.wrapFileNameInTemplateSyntax(fileName) + "\n");
                break;
    
        }
     }

    private wrapFileNameInTemplateSyntax(fileName: string) {

        return "<?!= include('" + fileName + "'); ?>";
    }
    
    private removeAllMatchingElementsByTagName(dom: any, tagName: string) {

        var elements = dom.window.document.getElementsByTagName(tagName);
        while (elements[0]) elements[0].parentNode.removeChild(elements[0]);
    }

    private replaceCharacterEntityReferencesWithLiterals(docHtml: string) {
        
        docHtml = docHtml.replace(/(\&lt;)/gi, '<');
        docHtml = docHtml.replace(/(\&gt;)/gi, '>');
    
        return docHtml;
    }
}







