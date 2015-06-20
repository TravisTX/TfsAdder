'use strict';

Init();

function Init() {
    console.log('TFS Adder is acting on this page');
    ShowPageActionIcon();

    $(document).ready(function () {
        ApplyEnhancements();
    });
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
    if (UrlContains('/_backlogs') || UrlContains('/_workitems')) {
        $('.hubs-section ul').append('<li><a href="/tfs/DefaultCollection/CareBookScrum/_workItems/create/Product%20Backlog%20Item">+ New PBI</a></li>');
        $('.hubs-section ul').append('<li><a href="/tfs/DefaultCollection/CareBookScrum/_workItems/create/Bug">+ New Bug</a></li>');
    }
}

function AddRowStyles() {
    if (UrlContains('taskboard')) {
        var tfsPayloadData = JSON.parse($('#taskboard script')[0].text).payload.data;

        var $rows = $('td.taskboard-parent.highlight-on-row-change');
        $rows.each(function () {
            var $row = $(this);
            var rowId = $row.attr('id').substr(17); // todo: smarter way to find the id here.
            //$row.find(".witTitle").text("test");
            var rowType = tfsPayloadData[rowId][1]; // todo: smarter way to do the magic index here.

            $row.siblings('.taskboard-expander').css({
                'background-color': RowTypeToColor(rowType),
                'border-top': '5px solid white',
                'border-bottom': '5px solid white'
            });

            $row.css({
                'padding-left': '5px'
            });
            $row.attr('title', rowType);
        });
    }
}

function AddWiStyles() {
    if (UrlContains('taskboard')) {
        var tfsPayloadData = JSON.parse($('#taskboard script')[0].text).payload.data;
        var username = $('li[command = \'user\']').text();

        var $cards = $('.tbTile');
        $cards.each(function () {
            var $card = $(this);
            var cardId = $card.attr('id').substr(5); // todo: smarter way to find the id here.
            var activity = tfsPayloadData[cardId][7]; // todo: smarter way to do the magic index here.

            var colors = ActivityToColor(activity);
            $card.find('.tbTileContent').css({
                'background-color': colors.light,
                'border-left-color': colors.dark
            });
            $card.attr('title', activity);
            AddSelfStyles($card, username);
        });
    }
}

function AddSelfStyles($card, username) {
    var cardUsername = $card.find('.witAssignedTo').text();
    if (username === cardUsername) {
        $card.css({
            'font-weight': 'bold'
        });
    }

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