(function () {
    'use strict';
    var tfsPayloadData = undefined;
    var currentUsername = undefined;

    Init();

    function Init() {
        console.log('TFS Adder is acting on this page');
        ShowPageActionIcon();

        $(document).ready(function () {
            DiscoverTfsData();
            ApplyEnhancements();
        });

        $(document).on('focus', 'td.taskboard-parent.highlight-on-row-change', OnRowFocused);
        $(document).on('focus', '.tbTile', OnCardFocused);
    }

    function DiscoverTfsData() {
        var tfsPayloadScript = $('#taskboard script')[0];
        if (tfsPayloadScript) {
            tfsPayloadData = JSON.parse(tfsPayloadScript.text).payload.data;
        }
        currentUsername = $('li[command = \'user\']').text();
    }

    function ApplyEnhancements() {
        AddNewLink();
        AddRowStyles();
        AddWiStyles();
    }

    function ShowPageActionIcon() {
        // inform the backgrund page that this tab should have a page-action
        chrome.runtime.sendMessage({
            from: 'content',
            subject: 'showPageAction'
        });
    }

    function AddNewLink() {
        var regEx = new RegExp(/\/([^\/]+)\/([^\/]+)\/_(backlogs|_workitems)\//)
		var regExResults = regEx.exec(document.URL.toLowerCase());
		if(regExResults !== null){
			$('.hubs-section ul').append('<li><a href="/tfs/' + regExResults[1] + '/' + regExResults[2] + '/_workItems/create/Product%20Backlog%20Item">+ New PBI</a></li>');
			$('.hubs-section ul').append('<li><a href="/tfs/' + regExResults[1] + '/' + regExResults[2] + '/_workItems/create/Bug">+ New Bug</a></li>');	
		}
    }

    function AddRowStyles() {
        if (UrlContains('taskboard')) {
            var $rows = $('td.taskboard-parent.highlight-on-row-change');
            $rows.each(function () {
                var $row = $(this);
                StyleRow($row);
            });
        }
    }

    function AddWiStyles() {
        if (UrlContains('taskboard')) {
            var $cards = $('.tbTile');
            $cards.each(function () {
                var $card = $(this);
                StyleCard($card);
            });
        }
    }

    function AddSelfStyles($card) {
        var cardUsername = $card.find('.witAssignedTo').text();
        if (currentUsername === cardUsername) {
            $card.css({
                'font-weight': 'bold'
            });
        } else {
            $card.css({
                'font-weight': 'normal'
            });
        }
    }

    function OnRowFocused() {
        var $row = $(this);
        // without settimeout of 1ms, this gets overwritten by TFS.
        setTimeout(function () {
            StyleRow($row);
        }, 1);
    }

    function OnCardFocused() {
        var $card = $(this);
        StyleCard($card);
    }

    function StyleRow($row) {
        var rowId = $row.attr('id').substr(17); // todo: smarter way to find the id here.
        var rowType = tfsPayloadData[rowId][1]; // todo: smarter way to do the magic index here.

        $row.siblings('.taskboard-expander').css({
            'background-color': RowTypeToColor(rowType),
            'border-top': '5px solid white',
            'border-bottom': '5px solid white'
        });

        $row.css({
            'padding-left': '5px'
        });
        
        // tooltip
        $row.attr('title', rowType);

        // description
        var currentTitle = $row.find(".witTitle").text();
        if (currentTitle.indexOf(rowId) !== 0) {
            var newTitle = rowId + ': ' + currentTitle;
            $row.find(".witTitle").text(newTitle);
        }
    }

    function StyleCard($card) {
        var cardId = $card.attr('id').substr(5); // todo: smarter way to find the id here.
        var activity = tfsPayloadData[cardId][7]; // todo: smarter way to do the magic index here.

        var colors = ActivityToColor(activity);
        $card.find('.tbTileContent').css({
            'background-color': colors.light,
            'border-left-color': colors.dark
        });
        
        // tooltip
        $card.attr('title', activity);
        
        // description
        var currentTitle = $card.find('.witTitle').text();
        if (currentTitle.indexOf(cardId) !== 0) {
            var newTitle = cardId + ': ' + currentTitle;
            $card.find('.witTitle').text(newTitle);
        }
        
        AddSelfStyles($card);
    }

    function UrlContains(match) {
        return document.URL.toLowerCase().indexOf(match.toLowerCase()) >= 0;
    }

    function RowTypeToColor(rowType) {
        if (rowType === 'Bug') {
            return '#CC293D';
        }
        return '#009CCC';
    }

    function ActivityToColor(activity) {
        var knownActivity = false;
        var activityHue = 207;
        if (activity === 'Deployment') {
            knownActivity = true;
            activityHue = 300;
        }
        if (activity === 'Design') {
            knownActivity = true;
            activityHue = 60;
        }
        if (activity === 'Development') {
            knownActivity = true;
            activityHue = 180;
        }
        if (activity === 'Documentation') {
            knownActivity = true;
            activityHue = 120;
        }
        if (activity === 'Requirements') {
            knownActivity = true;
            activityHue = 240;
        }
        if (activity === 'Testing') {
            knownActivity = true;
            activityHue = 0;
        }

        var result = {
            light: 'hsl(0, 0%, 90%)',
            dark: 'hsl(0, 0%, 69%)',
        };

        if (knownActivity) {
            result = {
                light: 'hsl(' + activityHue + ', 50%, 85%)',
                dark: 'hsl(' + activityHue + ', 50%, 69%)'
            };
        }
        return result;
    }
})();