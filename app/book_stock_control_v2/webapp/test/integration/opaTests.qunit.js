sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'bookstockcontrolv2/test/integration/FirstJourney',
		'bookstockcontrolv2/test/integration/pages/BooksList',
		'bookstockcontrolv2/test/integration/pages/BooksObjectPage'
    ],
    function(JourneyRunner, opaJourney, BooksList, BooksObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('bookstockcontrolv2') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBooksList: BooksList,
					onTheBooksObjectPage: BooksObjectPage
                }
            },
            opaJourney.run
        );
    }
);