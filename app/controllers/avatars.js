/**
 * List of Avatars
 */
avatars = ['/img/chosen/E01.png',
           '/img/chosen/F01.png',
           '/img/chosen/FA04.png',
           '/img/chosen/FB03.png',
           '/img/chosen/FC01.png',
           '/img/chosen/FD01.png',
           '/img/chosen/FE01.png',
           '/img/chosen/FH03.png',
           '/img/chosen/FI02.png',
           '/img/chosen/H01.png',
           '/img/chosen/J01.png',
           '/img/chosen/M05.png',
           '/img/chosen/N02.png',
           '/img/chosen/N03.png',
           '/img/chosen/N04.png',
           '/img/chosen/N05.png'];

exports.allJSON = function(req, res) {
  // Only return the first 12
  // The last 4 are reserved for guests
  res.jsonp(avatars.slice(0,12));
};

exports.all = function() {
  return avatars;
};