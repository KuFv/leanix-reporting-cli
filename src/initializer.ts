import * as chalk from 'chalk';
import * as path from 'path';
import * as process from 'process';
import * as inquirer from 'inquirer';
import * as _ from 'lodash';
import { spawn } from 'cross-spawn';
import { TemplateExtractor } from './template-extractor';
import { UserInitInput } from "./interfaces";

export class Initializer {

  private extractor = new TemplateExtractor();

  public init(): Promise<any> {
    console.log(chalk.green('Initializing new project...'));

    return inquirer.prompt(this.getInquirerQuestions())
    .then(answers => {
      answers = this.handleDefaultAnswers(answers);
      answers['node_version'] = process.versions.node;
      this.extractor.extractTemplateFiles(answers as UserInitInput);
      console.log(chalk.green('\u2713 Your project is ready!'));
      console.log(chalk.green('Please run `npm install` to install dependencies and then run `npm start` to start developing!'));
      // return this.installViaNpm();
    });

  }

  private getInquirerQuestions(): inquirer.Questions {
    // The name properties correspond to the variables in the package.json template file
    return [
      {
        type: 'input',
        name: 'name',
        message: 'Name of your project for package.json'
      },
      {
        type: 'input',
        name: 'id',
        message: 'Unique id for this report in Java package notation (e.g. net.leanix.barcharts)'
      },
      {
        type: 'input',
        name: 'author',
        message: 'Who is the author of this report (e.g. LeanIX GmbH <support@leanix.net>)'
      },
      {
        type: 'input',
        name: 'title',
        message: 'A title to be shown in LeanIX when report is installed'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description of your project'
      },
      {
        type: 'input',
        name: 'licence',
        message: 'Which licence do you want to use for this project? (Default: UNLICENSED)'
      },
      {
        type: 'input',
        name: 'host',
        message: 'Which host do you want to work with? (Default: app.leanix.net)'
      },
      {
        type: 'input',
        name: 'workspace',
        message: 'Which is the workspace you want to test your report in?'
      },
      {
        type: 'input',
        name: 'apitoken',
        message: 'API-Token for Authentication (see: https://dev.leanix.net/docs/authentication#section-generate-api-tokens)'
      },
      {
        type: 'confirm',
        name: 'behindProxy',
        message: 'Are you behind a proxy?',
        default: false
      },
      {
        when: answers => answers.behindProxy,
        type: 'input',
        name: 'proxyURL',
        message: 'Proxy URL?'
      }
    ];
  }

  private handleDefaultAnswers(answers: inquirer.Answers) {
    answers = _.mapValues(answers, (val) => val === '' ? undefined : val);
    return _.defaults(answers, {
      licence: 'UNLICENSED',
      host: 'app.leanix.net',
      apitoken: '',
      workspace: '',
      proxyURL: '',
      'readme_title': answers.title || answers.name
    });
  }

  private installViaNpm(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(chalk.green('Installing project dependencies via npm...'));
      const installProc = spawn('npm', ['install']);
/*
      installProc.stdout.on('data', (data) => {
        console.log(chalk.yellow(data.toString()));
      });
*/
      installProc.on('close', (exitCode) => {
        if (exitCode === 0) {
          console.log(chalk.green('npm install successful!'));
          resolve();
        } else {
          console.log(chalk.red('npm install failed!'));
          reject();
        }
      });
    });
  }
}
