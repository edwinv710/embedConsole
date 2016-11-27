var SandboxConsole = ( function() {

  var placeCaretAtEnd = function( e ) {
    e.focus();
    if ( typeof window.getSelection != "undefined" && typeof document.createRange != "undefined" ) {
      var range = document.createRange();
      range.selectNodeContents(e);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if ( typeof document.body.createTextRange != "undefined" ) {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(e);
      textRange.collapse(false);
      textRange.select();
    }
  };

  var buildRadioButton = function( sandbox ) {
    var radio   = document.createElement('input');
    radio.id    = sandbox.id+"-radio-"+sandbox.history.items.length;
    radio.value = sandbox.history.items.length;
    radio.setAttribute('type', 'radio');
    radio.setAttribute('name', 'log');
    radio.onchange = function(e){
      if( this.checked ) sandbox.updateInput( parseInt( this.value ) );
    }
    return radio
  };

  var buildLogItem = function ( sandbox, input, output, klass, stringify ) {
    var outputClass   = "nohighlight";
    var radio   = input ? buildRadioButton( sandbox ) : undefined;
    var element = document.createElement('li');

    if (output instanceof Error) klass += " log-error";

    if ( ! (output instanceof Error) && stringify != false ){
      outputClass = 'javascript';
      output = JSON.stringify( output );  
    }

    var innerHTML = '<code class="'+outputClass+' log-output">'+ output + '</code>';
    if ( input ) innerHTML = '<label for="'+radio.id+'"><code class="javascript log-input">'+input+'</code>'+innerHTML+'</label>'

    element.className = klass || '';
    element.innerHTML = innerHTML;

    return { element: element, radio: radio };
  }

  var buildLayout = function ( containterId ) {
    var parent = document.getElementById( containterId );
    
    if (!parent) throw "Please provide a valid container.";
    
    var elements = {
      parent:    parent,
      container: document.createElement('div'),
    };

    elements.log   = elements.container.appendChild( document.createElement('ul') );
    elements.input = elements.container.appendChild( document.createElement('div') );
     
    elements.container.className = 'console-sandbox';
    elements.log.className       = 'console-log';
    elements.input.className     = 'console-input';   
    
    elements.input.setAttribute("contenteditable", "true");

    elements.parent.appendChild( elements.container );

    return elements;
  }

  var SandboxConsole = function( containterId ) {
    var sbox = this;

    this.id       = (Math.random() + 1).toString(36).substring(16);
    this.elements = buildLayout( containterId );

    this.elements.input.onkeydown = function( e ) {
      var value = this.innerText;
      if ( e.which == 13 ){
        if ( e.shiftKey ) return;
        e.preventDefault();        
        if ( /\S/.test(value) ) sbox.execute( value );
      }    
      else if ( e.which === 38 ) { e.preventDefault(); sbox.history.traverseUp( this );   }
      else if ( e.which === 40 ) { e.preventDefault(); sbox.history.traverseDown( this ); };
    } 
  }

  SandboxConsole.prototype = {
    history: {
      position: 0,
      items: [],
      add: function( radio, element, input, output ) {
        this.items.push({ radio: radio, element: element, input: input, output: output });
        this.position = this.items.length;
      },
      traverseUp: function( e ) {
        var item = this.items[ this.position - 1 ];
        if ( !item ) return;
        item.radio.click();
      },
      traverseDown: function( e ) {
        var item = this.items[ this.position + 1 ];
        if ( !item ) return this.reset( e );
        item.radio.click();
      },
      reset: function( e ) {
        for ( var i in this.items ) this.items[i].radio.checked = false;
        this.position = this.items.length;
        return e.innerText = '';
      }
    },
    populate: function( arr ) {
      for (var i = 0; i < arr.length; i++ ) this.execute( arr[i] );
    },
    updateInput: function ( position ) {
      var item  = this.history.items[ position ];
      this.elements.input.innerHTML = item ? item.input : '';
      this.history.position         = item ? position   : this.history.items.length;
      placeCaretAtEnd( this.elements.input );
    },
    add: function( opts ) { 
      var logItem = buildLogItem( this, opts.input, opts.output, opts.klass, opts.javascript );
      var codes   = logItem.element.getElementsByTagName( "code" );

      for ( var i = 0; i < codes.length;  i++ ) hljs.highlightBlock( codes[i] );
     
      if ( logItem.radio ) {
        this.elements.log.appendChild( logItem.radio );  
        this.history.add( logItem.radio, logItem.element, opts.input, opts.output );
      }
      
      this.elements.log.appendChild( logItem.element );
      this.elements.log.scrollTop = this.elements.log.scrollHeight;

    },
    execute: function( command ) {
      var output;
      try {
        output =  eval.call({}, command );
      }catch(e) {
        output = e;
      };

      this.add( { input: command, output: output } );
      this.history.reset( this.elements.input );
    }
  };
  
  return SandboxConsole; 

})();