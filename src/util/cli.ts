const commander = require('commander');

import { GASBuild } from '../commands/build';

export default class CLI {

    processCliArgs() {
        
        commander
            .version('1.0.0')
            .description('A command-line for Creating, building and Deploying Angular [X] applications to Google App Script.');
           

        commander
            .command('build <outputdirectory>')
            .alias('b')
            .description('Build a project ')
            .action((outputDirectory: string) => {
                 var build = new GASBuild(outputDirectory);
                 build.buildProject();
            });



              // error on unknown commands
              commander.on('command:*', function () {
                console.error('Invalid command: %s\nSee --help for a list of available commands.', commander.args.join(' '));
                process.exit(1);
              });
 
        return commander.parse(process.argv);
    }

}
