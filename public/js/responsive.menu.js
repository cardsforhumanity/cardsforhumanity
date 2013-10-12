jQuery(document).ready(function($){
  
  
  var main_menu_container = $('.wpb-menu-container');
  
  // On hover display children
  $('.wpb-main-menu>li').hover(function(){
    var li = $(this);
    var sub = $('.wpb-main-menu-child', li);

    if ($(sub).length) {
      $(sub).fadeIn(300);
    }
    
  }, function(){
    var li = $(this);
    var sub = $('.wpb-main-menu-child', li);
    
    if ($(sub).length) {
      $(sub).stop().fadeOut(300);
    }
  });
  
  
  // Generate Responsive DropDown Menu
  $(main_menu_container).append('<select class="wpb-dropdown-menu"></select>');
  
  $('.wpb-main-menu>li').each(function(i, item) {
    var list = $(item);
    var main_menu = $(item).parent();
    var menu_item = $('a', item);
    var item_link = $(menu_item).attr('href');
    var item_id   = $(menu_item).attr('id');
    
    if (item_link == '#') {
      // SmoothScroll
      $('.wpb-dropdown-menu', main_menu_container).append('<option value="#" class="smoothscroll" id="' + item_id + '">' + menu_item.html() + '</option>');
    } else {
      // Reload
      $('.wpb-dropdown-menu', main_menu_container).append('<option value="' + item_link + '">' + menu_item.html() + '</option>');
    }
    
    var sub = $('ul.wpb-main-menu-child', list);

    if ($(sub).length) {
      $('li', sub).each(function(i, item) {
        var menu_item = $('a', item);
        var item_link = $(menu_item).attr('href');
        var item_id   = $(menu_item).attr('id');
        if (item_link == '#') {
          // SmoothScroll
          $('.wpb-dropdown-menu', main_menu_container).append('<option value="#" class="smoothscroll" id="' + item_id + '">- ' + menu_item.html() + '</option>');
        } else {
          // Reload
          $('.wpb-dropdown-menu', main_menu_container).append('<option value="' + item_link + '">- ' + menu_item.html() + '</option>');
        }
      });
    }
    
  });
  
  
  $('.wpb-dropdown-menu').change(function() {
    var href = $(this).val();
    var id = $(this).children(':selected').attr('id');
    console.log(id);
    if (href == '#') {
      // SmoothScroll
      $('html, body').animate({scrollTop: $('.' + id).offset().top - 0}, 'slow');
    } else {
      // Reload
      window.location = href;
    }
  });
  

});