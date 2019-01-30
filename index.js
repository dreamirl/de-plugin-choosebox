import DE from '@dreamirl/dreamengine';
import './index.css';

const TEMPLATE = '<div><div class="name"></div><div class="picture"></div><span class="sizer"></span><span class="content"></span><div class="close"></div></div>';

const DEFAULT_DOM_CONTAINER_ID = 'render';

/***
 * line return must be a /n with space before and after
 */
const ChooseBox = function()
{
  DE.Events.Emitter.call( this );
  
  this.trigger = this.emit;
  
  this.DEName       = "ChooseBox";
  this.cboxs        = {};
  this.ncboxs       = 0;
  this.el           = null;
  this.template     = TEMPLATE;
  this.inited       = false;
  this.textView     = null;
  this.closeBtn     = null;
  this.wordsArray   = [];
  this.currentWord  = 0;
  this.currentLetter= 0;
  this.isActive     = false;
  this.typingFx     = '';

  var _self = this;

  this.init = function( params )
  {
    if ( this.inited )
      return;
    params = params || {};

    this.template = params.template || TEMPLATE;
    this.typingFx = params.typingFx || '';

    let domContainer = document.getElementById( params.containerId || DEFAULT_DOM_CONTAINER_ID );
    
    if ( !domContainer ) {
      throw new Error( "FATAL ERROR: Can't init ChooseBox without an element -- "
      + "selector:: " + params.selector );
      return;
    }

    this.el = document.createElement( 'div' );
    this.el.id = 'de-plugin-choosebox-container';

    domContainer.appendChild( this.el );
    this.inited = true;
    DE.MainLoop.additionalModules[ "ChooseBoxUpdate" ] = this;
    
    DE.Inputs.on( "keyDown", "choose-down", function()
    {
      if ( !_self.currentId )
        return;
      // go down
    } );
    DE.Inputs.on( "keyDown", "choose-up", function()
    {
      if ( !_self.currentId )
        return;
      // go up
    } );
    DE.Inputs.on( "keyDown", "choose-enter", function()
    {
      if ( !_self.currentId )
        return;
      // select that message
    } );
    
    if ( params.useBuffer ) {
      this.buffer = new DE.PIXI.autoDetectRenderer( 1, 1, {
        transparent       : true
        ,clearBeforeRender: true
        ,autoResize       : true
      } );
      this.bufferContainer = new DE.PIXI.Container();
    }
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
    for ( var i = 0, opt; opt[ i ]; ++i ) {
      let el = document.createElement( 'span' );
      el.className = 'de-choosebox-choice';
      el.innerHTML = opt.key ? DE.Locales.get( opt.key ) : opt.text;
      el.id = i;

      el.addEventListener( "pointerup", function( e )
      {
        // TODO choose this choice
        e.stopPropagation();
        e.preventDefault();
        return false;
      }, false );
      cbox.appendChild( el );
      choices.push( el );
    }

    var cursor = document.createElement( 'div' );
    cursor.className = 'de-choosebox-cursor';
    cbox.appendChild( cursor );

    this.currentChoice = 0;
    // set cursor position on the current option
    //cursor.

    this.currentId = cbox.id;
    this.el.appendChild( cbox );
    
    this.cbox    = cbox;
    this.cursor  = cursor;
    this.choices = choices;
    
    this.trigger( "create", cbox );
    this.isActive  = true;
    this.prevented = false;

    setTimeout(() => {
      this.moveCursorTo( 0 );
    });
    
    return cbox;
  };

  this.moveCursorTo = function( index )
  {
    // var choice = this.choices[ index ].style.top;
  };
  
  this.remove = function()
  {
    if ( !this.cbox ) {
      return;
    }
    
    this.el.removeChild( this.cbox );
    this.textView  = undefined;
    this.isActive  = false;
    this.choices   = [];
    this.cursor    = undefined;
    this.currentId = undefined;
    this.cbox      = undefined;
    this.clean     = true;

    this.trigger( "kill" );
  };
};

ChooseBox.prototype = Object.create( DE.Events.Emitter.prototype );
ChooseBox.prototype.constructor = ChooseBox;

const mb = new ChooseBox();
export default mb;
