Cards for Humanity - [http://cfh.io](http://cfh.io)
===========
Cards for Humanity is a fast-paced online version of the popular card game, Cards Against Humanity, that gives you the opportunity to donate to children in need - all while remaining as despicable and awkward as you naturally are.

Our Team
--------
Cards for Humanity was created at [Hack Reactor](http://www.hackreactor.com) by:
* [Matt Silverstein](http://www.mattsilverstein.com/)
* [Will Ngo](https://mrngoitall.net)
* [Tyler McGinnis](http://www.tylermcginnis.com)
* [David Gonzalez](http://www.truthyfalsy.com)

About the Game
-------------
The game is simple - each player is given 10 answer cards which are used to fill in the question card. For each round, one player is the "Card Czar". Their sole job is to select a submitted answer card that they think best fits the question. Whoever's card is selected wins a point for the round.

Cards Against Humanity is open-source and licensed under Creative Commons. The idea for Cards for Humanity was to create a web version of the game we love so much, while still doing something good for humanity. To achieve this we integrated the option to donate to the Make a Wish Foundation.

The app is completely functional across all devices - from iPhone to full-sized desktop. We used Socket.io to create rooms which hold up 6 players at a time, and also included the functionality to create private rooms once logged in. Passport handles authentication with Local, Twitter, Facebook, Google and Github strategies implemented. 

![alt-text](https://dl.dropboxusercontent.com/u/7390609/CFHforGit.png "Cards for Humanity views")

![alt-text](http://www.tylermcginnis.com/images/cfh3.png "Desktop with Cards")

Our Tech Stack
--------------
Cards for Humanity uses AngularJS and Sass on the front-end, with Node.js/Express.js, MongoDB and Socket.io on the back-end. It's currently deployed to Amazon EC2. 

![alt-text](https://dl.dropboxusercontent.com/u/7390609/tech.png "Tech Stack Overview")


## License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
