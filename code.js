storage = {
  url: document.URL,
  state: {},
  save: function(note_box){
    console.log(note_box.note_info.noteid.toString());
    this.state[note_box.note_info.noteid.toString()] = note_box.note_info;
    this.save_state()
  },
  save_state: function(){
    localStorage.setItem(this.url, JSON.stringify(this.state));
  },
  load: function(){
    stored_string = localStorage.getItem(this.url);
    this.state = JSON.parse(stored_string) || {};
    $('.note-box').remove();
    for(key in this.state){
      note_box_note_info = this.state[key];
      create_note_box_a(note_box_note_info);
    }
    activate_boxes();
  }
};

function set_values(note_box){
  $(note_box).css({
    left: note_box.note_info.left,
    top: note_box.note_info.top,
    width: note_box.note_info.width,
    height: note_box.note_info.height,
  });
  $(note_box).children('.text').html(note_box.note_info.text);
  $(note_box).attr("id", note_box.note_info.noteid);
  note_box.noteid = note_box.note_info.noteid;
}


function get_values(note_box){
  note_box.note_info = {
    left: $(note_box).css('left'),
    top: $(note_box).css('top'),
    width:  $(note_box).css('width'),
    height:  $(note_box).css('height'),
    text: $(note_box).children('.text').html(),
    noteid: note_box.note_info.noteid
  };
  $(note_box).attr("id", note_box.note_info.noteid);
}

function activate_boxes(){
  $('.note-box').resizable({
    resize: function(event, ui){
      get_values(event.target);
      storage.save(event.target);
      storage.save_state();
    }
  });
  $('.note-box').draggable({
    drag: function(event, ui){
      get_values(event.target);
      storage.save(event.target);
      storage.save_state();
    }
  });
  $('.note-box .text').on('mousewheel', function (e, delta) {
      // Restricts mouse scrolling to the scrolling range of this element.
      if (
          this.scrollTop < 1 && delta > 0 ||
          (this.clientHeight + this.scrollTop) === this.scrollHeight && delta < 0
      ) {
          e.preventDefault();
      }
  });
  make_dblclick();
}


last_event = 0;
function make_dblclick(){
  $('.note-box .text').dblclick(function(event){
    if(last_event == event.timeStamp){ return; } // event already happened
    last_event = event.timeStamp;
    if($(event.target).parents('.text').length != 0){
      event.target = $(event.target).parents('.text').first()[0];
    }
    if(event.target == this){
      //event.stopPropagation();
      //event.preventDefault();
      if($(event.target).attr('contenteditable') == 'true'){
        new_value = false;
        $(event.target).parents('.note-box').first().css({'background-color': 'rgba(194, 229, 172, 1.0)'});
      }else{
        new_value = true;
        $(event.target).parents('.note-box').first().css({'background-color': 'white'});
      }
      $(event.target).attr('contenteditable', new_value);
      if(new_value){
        $(event.target).focus();
      }
    }
  });
  $('.note-box').click(function(event){
    $(event.target).focus();
  });
}

function create_note_box(noteid){
  var note_box = $('<div class="note-box"><div class="text"></div></div>').appendTo('body')[0];
  $('.note-box').css({
    position: 'absolute',
    'border': '1px solid black',
    'z-index': 9000,
    'word-wrap': 'break-word',
    'background-color': "rgba(194, 229, 172, 1.0)"});
  $('.note-box .text').css({
    'overflow-y': 'scroll',
    'height':'100%'});

  if (noteid == 0){
    if(Object.keys(storage.state).length == 0){
      new_note_id = 'note0';
    }else{
      last = Object.keys(storage.state).length - 1;
      num = parseInt(Object.keys(storage.state).sort()[last].substr(4));
      new_note_id = 'note'+(num+1) || 0;
    }
  }else{
    new_note_id = noteid
  }

  note_box.note_info = {
    left: 0,
    top: $(document).scrollTop(),
    width: 50,
    height: 50,
    text: "Note",
    noteid: new_note_id
  };

  set_values(note_box);

  document.getElementById(note_box.note_info.noteid).addEventListener('input', function(){
    // save note_box to localStorage

    if( $(this).children('.text').first().html() == ""){
      $(this).children('.text').first().html(" ");
    }

    if( $(this).children('.text').first().html() == "delete"){
      storage.state[note_box.note_info.noteid.toString()] = {};
      delete storage.state[note_box.note_info.noteid.toString()];
      $(this).remove();
      storage.save_state();
      return;
    }

    get_values(this);

    storage.save(this);
    storage.save_state();

    make_dblclick();
  }, false);

  activate_boxes();

  storage.save(note_box);
  storage.save_state();

  return note_box;
}

function create_note_box_a(note_info){
  note_box = create_note_box(note_info.noteid);
  note_box.note_info = note_info;
  set_values(note_box);

  storage.save(note_box);
  storage.save_state();

  return note_box;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello"){
      create_note_box(0);
      sendResponse({farewell: "goodbye"});
    }
  });
window.setTimeout(function(){
  storage.load();
}, 2000);
