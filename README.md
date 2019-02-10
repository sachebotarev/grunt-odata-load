# grunt-odata-load

> Grunt plugin for oData feed load

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-odata-load --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-odata-load');
```

## The "odata_load_feed" task

### Overview
In your project's Gruntfile, add a section named `odata_load_feed` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  odata_load_feed: {
    options: {
      auth: { 
            username: "test",
            possword: "test"
        }
    },
    northwind: {
        url: "https://services.odata.org/V2/Northwind/Northwind.svc/",
        dest: "./tmp",
        feeds: ["*", "!C*"],
        mode: "clean"
    }
  }
});
```

### Options

#### options.url
Type: `String`

oData service url

#### options.dest
Type: `String`
Default value: `./tmp`

Directory for download files

#### options.feed
Type: `String`
Default value: `[*]`

Filters for entity set names


#### options.mode
Type: `String`
Default value: `mock`

Filters for entity set names

### Usage Examples

```js
grunt.initConfig({
  odata_load_feed: {
    options: {
      auth: { 
            username: "test",
            possword: "test"
        }
    },
    northwind: {
        url: "https://services.odata.org/V2/Northwind/Northwind.svc/",
        dest: "./tmp",
        feeds: ["*", "!C*"],
        mode: "clean"
    }
  }
});
```
Download feed

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
