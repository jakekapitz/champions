﻿var CoC = CoC || {};
CoC.synergies = CoC.synergies || {};
CoC.synergies.initialize=function(stars){

  var springy = $('.container').springy({
    stiffness: 100.0,
    repulsion: 800.0,
    damping: 0.5
  });

  var nodes = {},
    typeColors = {
      cosmic:"#3af",
      tech:"#23f",
      mutant:"#fa0",
      skill:"#f30",
      science:"#0a0",
      mystic:"#90f"
    },
    effectColors = {
      attack:"#f00",
      stun:"#f66",
      critrate:"#fa0",
      critdamage:"#fa6",
      powergain:"#a0f",
      powersteal:"#a6f",
      perfectblock:"#00f",
      block:"#66f",
      armor:"#3af",
      health:"#0f0",
      healthsteal:"#af0"
    };
    
  function addNeighbors(n1, n2){
    n1.data.neighbors[ n2.id ] = true;
    n2.data.neighbors[ n1.id ] = true; 
  }
  
  var baseURL = location.href.substr(0, location.href.lastIndexOf('/')+1);
  
  //add nodes
  var champions = CoC.data.champions.where({ stars:stars });
  for(var i=0; i<champions.length; i++)
    (function(champion){
      var link = $('<a>', { href: baseURL+"#page-guide?guide="+champion.get('uid'), class:'hidden', target:'_blank' });
      $(document.body).append(link);
      nodes[ champion.get('uid') ] = springy.graph.newNode({
        label: champion.get('name'),
        image: (function(src){
          var image = new Image();
          image.src = src;
          return image;
        })( champion.portrait() ),
        type: champion.get('typeId'),
        color: typeColors[ champion.get('typeId') ],
        neighbors: {},
        ondoubleclick:function(){
          link[0].click();
        }
      });
    })(champions[i]);
  //add edges
  var synergies = CoC.data.synergies.where({ fromStars:stars });
  for(var i=0; i<synergies.length; i++){
    var synergy = synergies[i];
    if(nodes[ synergy.get("toId") ] === undefined)
      continue;
    addNeighbors(nodes[ synergy.get("fromId") ], nodes[ synergy.get("toId") ])
    springy.graph.newEdge(nodes[ synergy.get("fromId") ], nodes[ synergy.get("toId") ],{
      label: synergy.effect().get('name'),
      effect: synergy.get('effectId'),
      color: effectColors[ synergy.get('effectId') ]
    });
  }
  
  $( "#popup-share" ).enhanceWithin().popup();
  
  //add types to legend
  CoC.data.effects.each(function(type){          
    $('#legend').append( $('<div>', {
      style:'border-color:'+(effectColors[type.get('uid')] || '#000')+';'
    }).text(type.get('name')) );
  });
  
  $(".button[stars="+stars+"]").addClass("active");
  $('.button.legend').click(CoC.synergies.toggleLegend);
  CoC.synergies.toggleLegend();
  
  //track
  if(CoC.trackPageView !== undefined)
    CoC.trackPageView.call(this);
}

CoC.synergies.toggleLegend = function(){
  if($('.button.legend').hasClass('active')){
    $('.button.legend').removeClass('active');
    $('#legend').css('left', -($('#legend').outerWidth()));
  }
  else{
    $('.button.legend').addClass('active');
    $('#legend').css('left', 1);
  }
}