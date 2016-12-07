# EmbedConsole

Embed Console is an embeddable javascript sandbox. It allows users to communicate with an application directly using javascript and display the results. 

[CodePen](https://codepen.io/recursiveEd/pen/QGMjEL).

## Getting Started

Before using, please make sure you link the css and javascript files `embed-consoe.min.css` and `embed-console.min.js` respectively. Embed Console uses highlight.js by default for syntax highlighting. If you would like syntax highlighting, install [highlight.js](https://highlightjs.org/usage/). If you want to implement your own custom syntax highlighting, check the highlighting section of this documentation.


```javascript
  var embedConsole = new EmbedConsole('console');    
```

To add an embeddable console to your application, create an `EmbededConsole` object passing the `id` of the container where the console will be embeded.

### Methods

#### execute

```javascript
  embedConsole.execute('Math.PI');
```

#### add

```javascript
  embedConsole.add( { 
    output: "<b>Event Triggered</b>: The answers to life greatest question answered.", 
    klass: 'log-event', 
    javascript: false 
  });
```

### populate

```javascript
  embedConsole.populate([
    "Math.PI;", 
    "Math.E;",
    "Math.answer.everything;",
    "Math.answer = { everything: 42 };",
    "Math.answer.everything;"
  ]);
```


### Highlighting

EmbedConsole uses [highlight.js](https://highlightjs.org/usage/) out of the box. You can also use your own custom highlighting solution by passing a method to be executed on any call made though EmbedConsole

```javascript
  var embedConsole = new EmbedConsole('console', {
    highlight: function( element ){
      var codes   = element.getElementsByTagName( "code" );
      for ( var i = 0; i < codes.length;  i++ ) hljs.highlightBlock( codes[i] );
    }
  });
```


## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/edwinv710/cloudconvert-ruby. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
