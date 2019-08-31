
export default class ClaspFiles {
   

    CLASP_FILES = [
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

    claspFiles: Array<ClaspFile>;

    constructor() {
        this.claspFiles = new Array();

        this.CLASP_FILES.map(file => {
            this.claspFiles.push(new ClaspFile(file.fileName, file.errorIfNotExist));
        });
    }

    /**
     * A file descriptor in this case is an object that uniquely identifies a file 
     * and wether the caller should fail quietly if the file doesn't exist.
     */
    getFileDecriptors() {
        return this.claspFiles;
    }

}

export class ClaspFile {
    
    fileName: string = "";

    errorIfNotExist: boolean = true;

    constructor(fileName: string, errorIfNotExist: boolean) {
        this.fileName = fileName;
        this.errorIfNotExist = errorIfNotExist;
    }

}