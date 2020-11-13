# sfdx-devops

SFDX plugin for DevOps actions related to Salesforce Development

[![Version](https://img.shields.io/npm/v/sfdx-devops.svg)](https://npmjs.org/package/sfdx-devops)
[![CircleCI](https://circleci.com/gh/aheber/sfdx-devops/tree/master.svg?style=shield)](https://circleci.com/gh/aheber/sfdx-devops/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/aheber/sfdx-devops?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-devops/branch/master)
[![Codecov](https://codecov.io/gh/aheber/sfdx-devops/branch/master/graph/badge.svg)](https://codecov.io/gh/aheber/sfdx-devops)
[![Greenkeeper](https://badges.greenkeeper.io/aheber/sfdx-devops.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/aheber/sfdx-devops/badge.svg)](https://snyk.io/test/github/aheber/sfdx-devops)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-devops.svg)](https://npmjs.org/package/sfdx-devops)
[![License](https://img.shields.io/npm/l/sfdx-devops.svg)](https://github.com/aheber/sfdx-devops/blob/master/package.json)

<!-- toc -->
* [sfdx-devops](#sfdx-devops)
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
* [sfdx-devops](#sfdx-devops)
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->

<!-- install -->

<!-- usage -->
```sh-session
$ npm install -g sfdx-devops
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sfdx-devops/0.3.7 win32-x64 node-v12.16.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g sfdx-devops
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sfdx-devops/0.3.3 win32-x64 node-v12.18.3
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->

<!-- commands -->
* [`sfdx devops:chat:button [-b <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-devopschatbutton--b-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx devops:mdsource:compare:build -b <string> -c <string> -o <string> [-d <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-devopsmdsourcecomparebuild--b-string--c-string--o-string--d-string--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx devops:site:settings -s <string> [-g <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-devopssitesettings--s-string--g-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx devops:workflow:emailalert:replaceaddress -c <string> [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-devopsworkflowemailalertreplaceaddress--c-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx devops:chat:button [-b <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Load Live Chat Buttons into the org via the UI

```
USAGE
  $ sfdx devops:chat:button [-b <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --buttons=buttons                                                             Comma-separated names of the buttons
                                                                                    that should be loaded. Omission will
                                                                                    load all buttons in source

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ devops:chat:buttons
  $ devops:chat:buttons -b Button_1,Button_2
```

_See code: [src\commands\devops\chat\button.ts](https://github.com/aheber/sfdx-devops/blob/v0.3.7/src\commands\devops\chat\button.ts)_

## `sfdx devops:mdsource:compare:build -b <string> -c <string> -o <string> [-d <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Compare two metadata format source directories and build a third with the changes

```
USAGE
  $ sfdx devops:mdsource:compare:build -b <string> -c <string> -o <string> [-d <string>] [-v <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --basedir=basedir                                                             (required) Baseline metadata
                                                                                    directory

  -c, --changeddir=changeddir                                                       (required) Changed metadata
                                                                                    directory

  -d, --destructivechanges=pre|post                                                 If destructive changes should be
                                                                                    included and if so which mode

  -o, --outputdir=outputdir                                                         (required) Output directory for
                                                                                    identified changes

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234
  
  $ sfdx hello:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

_See code: [src\commands\devops\mdsource\compare\build.ts](https://github.com/aheber/sfdx-devops/blob/v0.3.7/src\commands\devops\mdsource\compare\build.ts)_

## `sfdx devops:site:settings -s <string> [-g <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Change settings on a Site

```
USAGE
  $ sfdx devops:site:settings -s <string> [-g <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -g, --guestapi=true|false                                                         Value to set on the guest API
                                                                                    checkbox

  -s, --sitename=sitename                                                           (required) Site name that should be
                                                                                    modified

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ devops:site:settings -s Help_Center -g true
  $ devops:site:settings -s Help_Center -g false
```

_See code: [src\commands\devops\site\settings.ts](https://github.com/aheber/sfdx-devops/blob/v0.3.7/src\commands\devops\site\settings.ts)_

## `sfdx devops:workflow:emailalert:replaceaddress -c <string> [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Compare two metadata format source directories and build a third with the changes

```
USAGE
  $ sfdx devops:workflow:emailalert:replaceaddress -c <string> [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -c, --configfile=configfile                                                       (required) [default:
                                                                                    config/alertconfig.yaml] Config file
                                                                                    with a replacement map (needs
                                                                                    instructions)

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx devops:workflow:emailalert:replaceaddress --configfile config/alertconfig.yaml
```

_See code: [src\commands\devops\workflow\emailalert\replaceaddress.ts](https://github.com/aheber/sfdx-devops/blob/v0.3.7/src\commands\devops\workflow\emailalert\replaceaddress.ts)_
<!-- commandsstop -->
* [`sfdx devops:chat:button [-b <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-devopschatbutton--b-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx devops:mdsource:compare:build -b <string> -c <string> -o <string> [-d <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-devopsmdsourcecomparebuild--b-string--c-string--o-string--d-string--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx devops:site:settings -s <string> [-g <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-devopssitesettings--s-string--g-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx devops:workflow:emailalert:replaceaddress -c <string> [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-devopsworkflowemailalertreplaceaddress--c-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx devops:chat:button [-b <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Load Live Chat Buttons into the org via the UI

```
USAGE
  $ sfdx devops:chat:button [-b <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --buttons=buttons                                                             Comma-separated names of the buttons
                                                                                    that should be loaded. Omission will
                                                                                    load all buttons in source

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ devops:chat:buttons
  $ devops:chat:buttons -b Button_1,Button_2
```

_See code: [src\commands\devops\chat\button.ts](https://github.com/aheber/sfdx-devops/blob/v0.3.3/src\commands\devops\chat\button.ts)_

## `sfdx devops:mdsource:compare:build -b <string> -c <string> -o <string> [-d <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Compare two metadata format source directories and build a third with the changes

```
USAGE
  $ sfdx devops:mdsource:compare:build -b <string> -c <string> -o <string> [-d <string>] [-v <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --basedir=basedir                                                             (required) Baseline metadata
                                                                                    directory

  -c, --changeddir=changeddir                                                       (required) Changed metadata
                                                                                    directory

  -d, --destructivechanges=pre|post                                                 If destructive changes should be
                                                                                    included and if so which mode

  -o, --outputdir=outputdir                                                         (required) Output directory for
                                                                                    identified changes

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
     Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
     My hub org id is: 00Dxx000000001234
  
  $ sfdx hello:org --name myname --targetusername myOrg@example.com
     Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

_See code: [src\commands\devops\mdsource\compare\build.ts](https://github.com/aheber/sfdx-devops/blob/v0.3.3/src\commands\devops\mdsource\compare\build.ts)_

## `sfdx devops:site:settings -s <string> [-g <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Change settings on a Site

```
USAGE
  $ sfdx devops:site:settings -s <string> [-g <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -g, --guestapi=true|false                                                         Value to set on the guest API
                                                                                    checkbox

  -s, --sitename=sitename                                                           (required) Site name that should be
                                                                                    modified

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ devops:site:settings -s Help_Center -g true
  $ devops:site:settings -s Help_Center -g false
```

_See code: [src\commands\devops\site\settings.ts](https://github.com/aheber/sfdx-devops/blob/v0.3.3/src\commands\devops\site\settings.ts)_

## `sfdx devops:workflow:emailalert:replaceaddress -c <string> [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Compare two metadata format source directories and build a third with the changes

```
USAGE
  $ sfdx devops:workflow:emailalert:replaceaddress -c <string> [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -c, --configfile=configfile                                                       (required) [default:
                                                                                    config/alertconfig.yaml] Config file
                                                                                    with a replacement map (needs
                                                                                    instructions)

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx devops:workflow:emailalert:replaceaddress --configfile config/alertconfig.yaml
```

_See code: [src\commands\devops\workflow\emailalert\replaceaddress.ts](https://github.com/aheber/sfdx-devops/blob/v0.3.3/src\commands\devops\workflow\emailalert\replaceaddress.ts)_
<!-- commandsstop -->

<!-- debugging-your-plugin -->

# Debugging your plugin

We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command:

1. Start the inspector

If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch:

```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```

Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:

```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program.
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
   <br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
   Congrats, you are debugging!
