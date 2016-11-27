var SandboxConsole = ( function() {

  function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
  }

  var SandboxConsole = function( container ) {
    var sbox = this;

    this.id = (Math.random() + 1).toString(36).substring(16);
    this.elements = {};
    this.elements.parent = document.getElementById( container );
    if (!this.elements.parent) throw "Please provide a valid id for a dom element.";

    this.elements.container = document.createElement('div');
    this.elements.container.className = 'console-sandbox';
    this.elements.log = document.createElement('ul');
    this.elements.log.className = 'console-log';
    this.elements.input = document.createElement('div');
    this.elements.input.setAttribute("contenteditable", "true");
    this.elements.input.className = 'console-input';

    this.elements.container.appendChild(this.elements.log);
    this.elements.container.appendChild(this.elements.input);
    this.elements.parent.appendChild(this.elements.container);

    this.elements.input.onkeydown = function( e ) {
      var value = this.innerText;
      if ( e.which == 13 ){
        if ( e.shiftKey ) return;
        e.preventDefault();        
        if ( /\S/.test(value) ) sbox.execute( value );
      }    
      else if ( e.which === 38 ) { e.preventDefault(); sbox.history.traverseUp( this ); }
      else if ( e.which === 40 ) { e.preventDefault(); sbox.history.traverseDown( this ) };
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
      this.history.position = parseInt(position);
      this.elements.input.innerHTML = this.history.items[ this.history.position ] ? 
        this.history.items[ this.history.position].input : '';
      placeCaretAtEnd(this.elements.input);
    },
    buildLogItems: function ( klass, input, output ) {
      var sandbox = this;
      var element = document.createElement('li');
      var radio   = document.createElement('input');

      radio.id = this.id+"-radio-"+this.history.items.length;
      radio.value = this.history.items.length;
      radio.setAttribute('type', 'radio');
      radio.setAttribute('name', 'log');
      radio.onchange = function(e){
        if( this.checked ) sandbox.updateInput( this.value );
      }
      element.className = klass;
      element.innerHTML = '<label><pre><code class="javascript">'+input+'</code><code class="'+klass+'">'+ output + '</code></pre></label>';
      element.childNodes[0].setAttribute('for', radio.id );     

      return { element: element, radio: radio };
    },
    addLogItem: function( input, output, e ) {
      var klass = "javascript";
      var sandbox = this;
      if      ( typeof output === 'undefined'  || e  ) { klass='nohighlight'; output = output || 'undefined' }
      else if ( typeof output === 'object' || typeof output === 'string' ) output = JSON.stringify(output, " ", 2);

      var logItems = this.buildLogItems( klass, input, output );
      var codes = logItems.element.getElementsByTagName( "code" );
      for ( var i = 0; i < codes.length;  i++ ) hljs.highlightBlock( codes[i] );
      this.elements.log.appendChild( logItems.radio );
      this.elements.log.appendChild( logItems.element );

      this.history.add( logItems.radio, logItems.element, input, output );
      this.elements.log.scrollTop = this.elements.log.scrollHeight;
    },

    execute: function( command ) {
      var output;
      var error = false;
      try {
        output =  eval.call({}, command );
      }catch(e) {
        output = e;
        error = true;
      };

      this.addLogItem( command, output, error );
      this.history.reset( this.elements.input );
    }
  };
  
  return SandboxConsole;
 
})();