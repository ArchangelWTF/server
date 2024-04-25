# Single Player Tarkov - Server Project

This is the Server project for the Single Player Tarkov mod for Escape From Tarkov. It can be run locally to replicate responses to the modified Escape From Tarkov client.

# Table of Contents

- [Features](#features)
- [Installation](#installation)
	- [Requirements](#requirements)
	- [Initial Setup](#initial-setup)
- [Development](#development)
	- [Commands](#commands)
	- [Debugging](#debugging)
	- [Mod Debugging](#mod-debugging)
- [Contributing](#contributing)
	- [Branches](#branchs)
	- [Pull Request Guidelines](#pull-request-guidelines)
	- [Tests](#tests)
- [License](#license)

## Features

For a full list of features, please see [FEATURES.md](FEATURES.md).

## Installation

### Requirements

This project has been built in [Visual Studio Code](https://code.visualstudio.com/) (VSC) using [Node.js](https://nodejs.org/). We recommend using [NVM](https://github.com/coreybutler/nvm-windows) to manage installation and switching Node versions. If you do not wish to use NVM, you will need to install the version of Node.js listed within the `.nvmrc` file manually.

There are a number of VSC extensions that we recommended for this project. VSC will prompt you to install these when you open the workspace file. If you do not see the prompt, you can install them manually:

- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) - Editor Settings Synchronization
- [Dprint Code Formatter](https://marketplace.visualstudio.com/items?itemName=dprint.dprint) - Formatting on Save
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Linting for Coding Issues & Naming Conventions
- [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) - Linting for Coding Standards
- [Vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) - Debugging Tests
- [SPT ID Highlighter](https://marketplace.visualstudio.com/items?itemName=refringe.spt-id-highlighter) - Converts IDs to Names


### Initial Setup

To prepare the project for development you will need to:

1. Run `git clone https://dev.sp-tarkov.com/SPT-AKI/Server.git server` to clone the repository.
2. Run `git lfs pull` to download LFS files locally.
2. Open the `project/mod.code-workspace` file in Visual Studio Code (VSC).
3. Run `nvm use 20.11.1` in the VSC terminal.
4. Run `npm install` in the VSC terminal.

## Development

### Commands

The following commands are available after the initial setup. Run them with `npm run <command>`.

| Command                  | Description                                                          |
|--------------------------|----------------------------------------------------------------------|
| `check:circular`         | Check for circular dependencies in the project.                      |
| `lint`                   | Lint the project for coding standards.                               |
| `lint:fix`               | Attempt to automatically fix coding standard issues.                 |
| `style`                  | Check the project for style/formatting issues.                       |
| `style:fix`              | Attempt to automatically fix style/formatting issues.                |
| `test`                   | Run all tests.                                                       |
| `test:watch`             | Run tests in watch mode. Tests will re-run when files are changed.   |
| `test:coverage`          | Run tests and generate a coverage report.                            |
| `test:ui`                | Run tests in UI mode. This will open a browser window to view tests. |
| `build:release`          | Build the project for release.                                       |
| `build:debug`            | Build the project for debugging.                                     |
| `build:bleeding`         | Build the project on the bleeding edge.                              |
| `build:bleedingmods`     | Build the project on the bleeding edge with mods.                    |
| `run:build`              | Run the project in build mode.                                       |
| `run:debug`              | Run the project in debug mode.                                       |
| `run:profiler`           | Run the project in profiler mode.                                    |
| `gen:types`              | Generate types for the project.                                      |
| `gen:docs`               | Generate documentation for the project.                              |

### Debugging

To debug the project in Visual Studio Code, you can select the `Run` tab and then select the `Start Debugging` option (or the `F5` shortcut). This will start the server in debug mode, attaching a debugger to code execution, allowing you to set breakpoints and step through the code as it runs.

### Mod Debugging

To debug a server mod in Visual Studio Code, you can copy the mod files into the `user/mods` folder and then start the server in [debug mode](#debugging). You should now be able to set breakpoints in the mod's Typescript files and they will be hit when the server runs the mod files.

## Contributing 

We're really excited that you're interested in contributing! Before submitting your contribution, please consider the following:

### Branchs

- __master__  
  The default branch used for the latest stable release. This branch is protected and typically is only merges with release branches.
- __3.9.0-DEV__  
  Development for the next minor release of SPT. Minor releases target the latest version of EFT. Late in the minor release cycle the EFT version is frozen for stability to prepare for release. Larger changes to the project structure may be included in minor releases.
- __3.8.1-DEV__  
  Development for the next hotfix release of SPT. Hotfix releases include bug fixes and minor features that do not effect the coding structure of the project. Special care is taken to not break server mod stability. These always target the same version of EFT as the last minor release.

### Pull Request Guidelines

- __Keep Them Small__  
  If you're fixing a bug, try to keep the changes to the bug fix only. If you're adding a feature, try to keep the changes to the feature only. This will make it easier to review and merge your changes.
- __Perform a Self-Review__  
  Before submitting your changes, review your own code. This will help you catch any mistakes you may have made.
- __Remove Noise__  
  Remove any unnecessary changes to white space, code style formatting, or some text change that has no impact related to the intention of the PR.
- __Create a Meaningful Title__  
  When creating a PR, make sure the title is meaningful and describes the changes you've made.
- __Write Detailed Commit Messages__  
  Bring out your table manners, speak the Queen's English and be on your best behaviour.

### Style Guide

We use Dprint to enforce a consistent code style. Please run `npm run style` and/or `npm run style:fix` before submitting your changes. This is made easier by using the recommended VSC extensions to automatically format your code whenever you save a file.

### Tests

We have a number of tests that are run automatically when you submit a pull request. You can run these tests locally by running `npm run test`. If you're adding a new feature or fixing a bug, please conceder adding tests to cover your changes so that we can ensure they don't break in the future.

## License

This project is licensed under the NCSA Open Source License. See the [LICENSE](LICENSE.md) file for details.
