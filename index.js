import DE from '@dreamirl/dreamengine';
import './index.css';

const DEFAULT_DOM_CONTAINER_ID = 'render';

/***
 * line return must be a /n with space before and after
 */
const ChooseBox = function()
{
  DE.Events.Emitter.call( this );
  
  this.trigger = this.emit;
  
  this.DEName       = "ChooseBox";
  this.el           = null;
  this.inited       = false;

  this.choices     = [];
  this.choiceIndex = 0;
  this.cursor      = undefined;
  this.cbox        = undefined;
  this.callback    = undefined;
  this.isActive    = false;
  this.clean       = true;

  var _self = this;

  this.init = function( params )
  {
    if ( this.inited )
      return;
    params = params || {};

    let domContainer = document.getElementById( params.containerId || DEFAULT_DOM_CONTAINER_ID );
    
    if ( !domContainer ) {
      throw new Error( "FATAL ERROR: Can't init ChooseBox without an element -- "
        + "selector:: " + params.selector );
    }

    this.el = document.createElement( 'div' );
    this.el.id = 'de-plugin-choosebox-container';

    domContainer.appendChild( this.el );
    this.inited = true;
    
    DE.Inputs.on( "keyDown", "choose-down", () => {
      if ( !_self.isActive )
        return;
      this.moveCursorTo( this.choiceIndex + 1 );
    } );
    DE.Inputs.on( "keyDown", "choose-up", () => {
      if ( !_self.isActive )
        return;
      this.moveCursorTo( this.choiceIndex - 1 );
    } );
    DE.Inputs.on( "keyDown", "choose-enter", () => {
      if ( !_self.isActive )
        return;
      this.selectMessage();
    } );
  };

  /****
   * create a message box in the window, fill to window with js detection
   text is the content
    callback when close is called
    -> if there is a close className, it will close the ChooseBox on click
    -> you can configure an "closeChooseBox" inputs in the list to closes the messagesBox
    */
  this.create = function( options, callback, context, params )
  {
    params = params || {};
    
    if ( !this.inited ) {
      return;
    }

    var cbox = document.createElement( 'div' );
    var choices = [];
    for ( let i = 0, opt; opt = options[ i ]; ++i ) {
      let el = document.createElement( 'span' );
      el.className = 'de-choosebox-choice';
      el.innerHTML = opt.key ? DE.Locales.get( opt.key ) : opt.text;
      el.id = i;

      el.addEventListener( "pointerup", ( e ) => {
        this.selectMessage();
        e.stopPropagation();
        e.preventDefault();
        return false;
      }, false );
      el.addEventListener('pointerenter', ( e ) => {
        this.moveCursorTo( i );
        e.stopPropagation();
        e.preventDefault();
        return false;
      } );

      let cursor = document.createElement( 'div' );
      cursor.className = 'de-choosebox-cursor';
      el.appendChild( cursor );

      cbox.appendChild( el );
      choices.push( el );
    }

    this.el.appendChild( cbox );
    
    this.cbox    = cbox;
    this.options = options;
    this.choices = choices;
    this.context = context;
    this.callback = callback;
    this.trigger( "create", cbox );
    this.clean = false;
    this.isActive  = true;

    setTimeout(() => {
      this.moveCursorTo( 0 );
    });
    
    return cbox;
  };

  this.selectMessage = function()
  {
    var opt = this.options[ this.choiceIndex ];

    if ( opt.callback ) {
      opt.callback.call( opt.context || this.context || this, opt.value );
    }
    else {
      this.callback.call( this.context || this, opt.value );
    }
    this.close();
  }

  this.moveCursorTo = function( index )
  {
    if ( index >= this.choices.length ) {
      index = 0;
    }
    if ( index < 0 ) {
      index = this.choices.length - 1;
    }

    this.choices.forEach( el => { el.className = el.className.replace( /active/gi, "" ); } );
    var choice = this.choices[ index ];
    choice.className += " active";
    this.choiceIndex = index;
  };
  
  this.close = function()
  {
    if ( !this.cbox ) {
      return;
    }
    
    this.el.removeChild( this.cbox );
    this.choices     = [];
    this.choiceIndex = 0;
    this.cursor      = undefined;
    this.cbox        = undefined;
    this.callback    = undefined;
    this.isActive    = false;
    this.clean       = true;

    this.trigger( "kill" );
  };
};

ChooseBox.prototype = Object.create( DE.Events.Emitter.prototype );
ChooseBox.prototype.constructor = ChooseBox;

const mb = new ChooseBox();
export default mb;
