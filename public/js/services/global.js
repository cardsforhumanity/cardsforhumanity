angular.module('mean.system')
  .factory('Global', [function() {
    var _this = this;
    _this._data = {
        user: window.user,
        authenticated: !! window.user
    };

    return _this._data;
  }])
  .factory('AvatarService', ['$http', '$q', function($http, $q) {
    return {
      getAvatars: function() {
        return $q.all([
          $http.get('/avatars')
        ])
        .then(function(results) {
          return results[0].data;
        });
      }
    };
  }])
  .factory('DonationService', ['$http', '$q', function($http, $q) {
    return {
      userDonated: function(donationObject) {
        return $q.all([
          $http.post('/donations', donationObject)
        ])
        .then(function(results) {
          console.log('userDonated success', results);
        });
      }
    };
  }])
  .factory('MakeAWishFactsService', [function() {
    return {
      getMakeAWishFacts: function() {
        var facts = ['Health professionals who treat wish kids, including nurses and doctors, overwhelmingly believe that the wish experience can improve a wish kids’ physical health.',
  'Most health professionals say a wish come true has the potential to be a positive turning point in the child’s battle for health.',
  'Parents and volunteers observe that a wish come true makes kids feel stronger and more energetic.',
  'Wish kids are more willing to comply with difficult, but vital, treatment regimens.',
  'Parents and medical professionals alike describe the wish experience as a frequent turning point in wish kids’ battles for health.',
  'A combined 89 percent of doctors, nurses and health professionals surveyed say they believe a wish experience can influence wish kids’ physical health.',
  'Children and their parents alike experience more happiness and less fear in their lives.',
  'Children are less isolated from friends, and feel a return of self-confidence that comes with feeling “normal” again.',
  'Children are empowered to take back control of their lives, and to keep up the fight against their life-threatening medical conditions.',
  'Parents say their family units – often strained to the limit by stresses of the illnesses – are repaired and strengthened through the shared experience of the wish process.',
  'Ninety-nine percent of parents reported that the wish experience gave their children increased feelings of happiness and 96 percent said that the wish experience strengthened their families.',
  'A wish is much more than just a nice thing. And its reach extends far beyond a single event, or moment in time. Wish kids, parents, medical professionals, volunteers, and others say that wish experiences can change the lives of everyone involved, forever.',
  'Make-A-Wish® grants a wish, on average, every 38 minutes and, on average, a child is referred for a wish every 28 minutes.',
  'Every wish experience is driven by the wish kid’s interests, creativity and personality.',
  'Make-A-Wish granted nearly 14,000 wishes in 2012 alone.',
  'To qualify for a wish, a child with a life-threatening medical condition must be older than 2½ years and younger than 18 (at the time of referral) and must not have received a wish from another wish-granting organization.',
  'A child can be referred by a parent or guardian, a medical professional, or by the child.',
  'Following referral, a certified medical professional must verify that the child has a life-threatening medical condition. There are no other qualifications based on sex, race, religion, socioeconomic status or any other demographic category.',
  'Make-A-Wish chapters serve every community in the United States and its territories.',
  'Make-A-Wish has approximately 25,000 active volunteers in the United States.',
  'Make-A-Wish needs 2.5 billion frequent flier miles to meet all the travel needs for wish kids and their families.',
  'Nearly 75 percent of wish experiences involve travel.',
  'The Walt Disney Company is involved in 40 percent of the wishes Make-A-Wish grants.',
  'As of August 2012, the average cost of a wish was $8,141.'];
        var shuffleIndex = facts.length;
        var temp;
        var randNum;

        while (shuffleIndex) {
          randNum = Math.floor(Math.random() * shuffleIndex--);
          temp = facts[randNum];
          facts[randNum] = facts[shuffleIndex];
          facts[shuffleIndex] = temp;
        }

        return facts;
      }
    };
  }]);