Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    var operators = ["==", "<", ">"];
    function transform(player) {      
      player.nameBackwards = player.name.split('').reverse().join('');
      player.nameAllCaps = player.name.toUpperCase();
      player.nameShuffled = _.shuffle(player.name).join('');
      player.operators = operators;
      player.eval = function() {
        var result = eval(player.name.length + player.is + parseInt(player.than));
	if (result)
		return "Yes!";
	else
		return "No";
      }
      return player;
    }
    return Players.find(
      {}, {sort: {name: 1}, transform: transform});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };
  Template.player.helpers({   
   'selectedOp': function(is, operator) {      
      return operator == is ? {selected: 'selected'} : '';
    }
  });
  Template.leaderboard.events({
    'change select.is': function () {
      var player = Session.get("selected_player");
      var is = document.getElementById(player);
      is = is.options[is.selectedIndex].value;
      Players.update(Session.get("selected_player"), {$set: {is: is}});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });

  Template.new_player.events = {
    'click input.add': function() {
      var new_player_name = document.getElementById("new_player_name").value;
      Players.insert({name: new_player_name, is:'==', than:'10'});
    }
  };
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    return;
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
