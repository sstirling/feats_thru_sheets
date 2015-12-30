$(window).load(function() {

    var qsRegex;
    var buttonFilter;
    var $quicksearch = $('#quicksearch');
    var $container = $('#pdb-content')
    var timeout;

    var public_spreadsheet_url = '10cED_tPOK9THBQkFMmlhJxOLkGZx53nMbfLhSjKVT9M';

    var timestampdata = "https://spreadsheets.google.com/feeds/cells/" + public_spreadsheet_url + "/od6/public/basic?alt=json"

 // Call the Google Spreadsheet as a regular JSON to get latest timestamp which is not included in Tabletop.js


    $.ajax({
    url:timestampdata,
    dataType:"jsonp",
    success:function(data) {
        // Get timestamp and parse it to readable format

        
        var date = data.feed.updated.$t

        var MM = {Jan:"Jan.", Feb:"Feb.", Mar:"March", Apr:"April", May:"May", Jun:"June", Jul:"July", Aug:"Aug.", Sep:"Sept.", Oct:"Oct.", Nov:"Nov.", Dec:"Dec."}

var formatdate = String(new Date(date)).replace(
    /\w{3} (\w{3}) (\d{2}) (\d{4}) (\d{2}):(\d{2}):[^(]+\(([A-Z]{3})\)/,
    function($0,$1,$2,$3,$4,$5,$6){
        return MM[$1]+" "+$2+", "+$3+" at "+$4%12+":"+$5+(+$4>12?"PM":"AM")+" "+$6 
    }
)


        $('.pdb-updated').append("Last updated " + formatdate)
    },
});



    // Tabletop initialization

    Tabletop.init({
        key: public_spreadsheet_url,
        callback: getTable,
        simpleSheet: true
    })

    // Function that fetches the Google Spreadsheet


    function getTable(data, tabletop) {

        var sheetname = tabletop.foundSheetNames[0];
        var sheetnamecontrol = tabletop.foundSheetNames[1];

        // Get title of datasheet

        var title = sheetname; 
        $("h2").append(title)

        // Get credits and explainer from "Control spreadsheet"

        $.each(tabletop.sheets(sheetnamecontrol).all(), function(i, v) {
      
          var explainer = v.explainer
          var credits = v.credits
          $(".pdb-credit").append(credits)
          $(".pdb-explainer").append(explainer)
        });

        var result = [];
        var count = 1;


        $.each(tabletop.sheets(sheetname).all(), function(i, v) {


            // Parses the resulting JSON into individual squares

      $container.append('<div id="element-item"><div class="name">' + v.name + '</div><div class="tooltip"><div class="description">' + v.name + ' was killed in a mass shooting on ' + v.date2 + ' in ' + v.place + '. ' + v.tooltiptext + '</div><div class="readmore"><a href="' + v.link + ' " target="_blank">Read more</a></div><div class="hidden">' + v.date + v.shooter + '</div></div></div>');


            // Gets all unique filtercategory values and puts them into an array
            if ($.inArray(v.filtercategory, result) == -1) {

                result.push(v.filtercategory);

                // Creates the filter buttons

                $('#filter').append('<button id="' + v.filtercategory + '" class="btn btn-default" data-value="choice' + count++ + '">' + v.filtercategory + '</button>')

            }




        });

        var pymChild = new pym.Child;

        // Adds the search function


        $quicksearch.keyup(debounce(function() {
            qsRegex = new RegExp($quicksearch.val(), 'gi');
            $container.isotope();
        }));


        // Sorts them into responsive square layout using isotope.js
        $container.imagesLoaded(function() {

            $container.isotope({
                itemSelector: '#element-item',
                layoutMode: 'masonry',
                // get sort data
                getSortData: {
                    name: '.name',
                    place: '.place',
                    date: '.date parseInt',
                },
                // so that isotope will filter both search and filter results
                filter: function() {
                    var $this = $(this);
                    var searchResult = qsRegex ? $this.text().match(qsRegex) : true;

                    return searchResult ;

                }

            });
        });



        // debounce so filtering doesn't happen every millisecond
        function debounce(fn, threshold) {

            return function debounced() {
                if (timeout) {
                    clearTimeout(timeout);
                }

                function delayed() {
                    fn();
                    timeout = null;
                }
                timeout = setTimeout(delayed, threshold || 100);
            }
        }



  // bind sort button click & is-checked class on buttons

  $('.sort-by-button-group').each( function( i, buttonGroup ) {
    var $buttonGroup = $( buttonGroup );
    $buttonGroup.on( 'click', 'button', function() {
        var sortValue = $(this).attr('data-sort-value');
    $container.isotope({ sortBy: sortValue });
      $buttonGroup.find('.is-checked').removeClass('is-checked');
      $( this ).addClass('is-checked');
  
            });
        });


    };

});
