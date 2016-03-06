# Population.io

## Setup

* Clone the repository
* Install node.js ([nodejs.org](http://nodejs.org))
* Install package manager `bower`

        $ npm install -g bower

* Install build system `gulp`

        $ npm install -g gulp

* Install dependencies

        $ npm install
        $ bower install

* Install required `nib` module for `gulp-stylus`

        $ cd node_modules/gulp-stylus
        $ npm install nib

## Prepare

1. Create a `dist` folder
2. Copy the `assets` folder into dist the folder `dist/assets`

## Run

* Navigate to *PROJECT_ROOT* and start the server by using `gulp`

        $ gulp

* Open http://localhost:1983

## Deploy

* Add `.ftppass` file to your *PROJECT_ROOT* and enter ftp credentials

        {
          "keyMain": {
            "user": USER,
            "pass": PASS
          }
        }

* Run `gulp deploy`
