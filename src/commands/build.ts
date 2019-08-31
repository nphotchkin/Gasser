
const fse = require('fs-extra');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

import chalk from 'chalk';
import Files from '../util/files';

export class GASBuild {

    files = new Files();

    distPath = "";

    constructor(distPath: string) {
        this.distPath = distPath;
        this._throwIfMissingProjectFiles();
    }

    buildProject() {

        chalk.bgBlue('building from path: ' + this.distPath);
        console.log();

    
            // TODO: copy files
            // create externalied config gasser.json
                // ignore files | directories
            
        this._performHousekeeping().then(() => {
        
                var indexString = this._getIndexFileContents();
        
                let dom = new JSDOM(indexString);

                this._removeAllMatchingElementsByTagName(dom, 'script');
                this._removeAllMatchingElementsByTagName(dom, 'link');

                var interpolatedFileNames = this._saveInterpolatedFilesToDisk();

                interpolatedFileNames.map(fileName => 
                    this._addTemmplateReferenceToIndexHtml(dom, fileName)
                );


                let docHtml: string = dom.window.document.documentElement.outerHTML;
                docHtml =  this._replaceCharacterEntityReferencesWithLiterals(docHtml);
        
                fse.writeFileSync('./gas-build/' + 'index.html', docHtml );

                console.log();
                console.log();
                console.log(chalk.green('Project Built! you can now push your clasp project from ') + chalk.bgBlue('/gas-build') );

            },
            (err) => {
                console.log(chalk.red('unable to create project due to: '));
                console.log(err);
            }
        );
    }

    async _performHousekeeping() {
        await this.files.removeDirectoryIfExists();
        await this.files.createDirectoryInCwd("gas-build");
        console.log();
    }


    _throwIfMissingProjectFiles() {


        if (!this.files.directoryExists(this.distPath)) {
            throw new Error('Project build directory: ' + this.distPath + ' does not exist!'); 
        } 
        
        let appScriptFiles = [
            {
                "fileName": ".clasp.json",
                "errorIfNotExist": true
            },
            {
                "fileName": "appsscript.json",
                "errorIfNotExist": true
            },
            {
                "fileName": ".claspignore",
                "errorIfNotExist": false
            }
        ];

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

    _saveInterpolatedFilesToDisk() {
 
        let interpolatedFileNames: string[] = [];
    
        fse.readdirSync(this.distPath).forEach((fileName: string) => {
    
            var transformedOutput = this._wrapFileContentsWithInclusionElement(fileName);
    
            if (this._getExtension(fileName) != '.html' && transformedOutput != false) {
                fse.writeFileSync('./gas-build/' + fileName + '.html', transformedOutput);
                interpolatedFileNames.push(fileName);
            } else {

                if (this._getExtension(fileName) !== '.html') {
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
    
    _getIndexFileContents() {

        var fileContents;
    
        fse.readdirSync(this.distPath).forEach((fileName: string) => {
            // if file is not ignored file
            // then
            if (this._getExtension(fileName) == '.html') {               
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

        
    _wrapFileContentsWithInclusionElement(fileName: string) {

        var fileExtension = this._getExtension(fileName);

        var fileContents;

        switch (fileExtension) {
            case '.css':
                
                fileContents = this._wrapTextInXml(fileName, 'style');

                break;

            case '.js':


                fileContents = this._wrapTextInXml(fileName, 'script')
                break;


            default:
                chalk.yellow('file name: ' + fileName + ' is not in inclusion or ignore list, this file won\'t be included in the output.');
                return false;

        }

        return fileContents;
    }
    
    _wrapTextInXml(fileName: string, elementName: string) {
        var contents = fse.readFileSync(this.distPath + '/' + fileName);
    
        return '<' + elementName + '> \n' + contents.toString() + '\n </' + elementName + '>';
    }

    _getExtension(filename: string) {
        var i = filename.lastIndexOf('.');
        return (i < 0) ? '' : filename.substr(i);
    }

    /*
     * template refrences literal opening and closing brackets will change to
     * character entity references.
     */
    _addTemmplateReferenceToIndexHtml(dom: any, fileName: string) {

        var templateSyntaxString = this._wrapFileNameInTemplateSyntax(fileName);
     
        var fileExtension = this._getExtension(fileName);
     

        switch (fileExtension) {
            case '.css':
                // last child header insert

                dom.window.document.head.insertAdjacentText('beforeend', "\t" + this._wrapFileNameInTemplateSyntax(fileName) + "\n");
                
                break;

            case '.js':
                dom.window.document.body.insertAdjacentText('beforeend', "\t" + this._wrapFileNameInTemplateSyntax(fileName) + "\n");
                break;
    
        }
     }

    _wrapFileNameInTemplateSyntax(fileName: string) {

        return "<?!= include('" + fileName + "'); ?>";
    }
    
    _removeAllMatchingElementsByTagName(dom: any, tagName: string) {

        var elements = dom.window.document.getElementsByTagName(tagName);
        while (elements[0]) elements[0].parentNode.removeChild(elements[0]);
    }

    _replaceCharacterEntityReferencesWithLiterals(docHtml: string) {
        
        docHtml = docHtml.replace(/(\&lt;)/gi, '<');
        docHtml = docHtml.replace(/(\&gt;)/gi, '>');
    
        return docHtml;
    }
}







