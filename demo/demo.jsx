'use strict';

var React        = require('react');
var Autocomplete = require('./input-autocomplete');

require('../scss/autocomplete');

var autocompleteOptions = [
    {
        option : 'Apple'
    },
    {
        option : 'Banana'
    },
    {
        option : 'Carrot'
    },
    {
        option : 'Delicious Apple'
    },
    {
        option : 'Eggplant'
    },
    {
        option : 'Fuji Apple'
    },
    {
        option : 'Grapefruit'
    },
    {
        option : 'Head of Lettuce'
    }
];

var AutocompleteDemo = React.createClass({

    displayName : 'AutocompleteDemo',

    render()
    {
        var styles = {
            maxWidth : '720px',
            margin   : '0 auto',
            padding  : '20px'
        }

        return (
            <div style={styles}>
                <Autocomplete
                    className                   = {'demo__autocomplete'}
                    id                          = {'autocompleteDemo'}
                    searchField                 = {'option'}
                    options                     = {autocompleteOptions}
                    placeholder                 = {'What\'s your favorite fruit?'}
                    minimumCharacters           = {0}
                    maximumCharacters           = {10}
                    maximumSuggestions          = {10}
                    clearOnSelect               = {false}
                    dropdownPosition            = {'bottom'}
                    dropdownHeight              = {400}
                    showSuggestionsOnEmptyFocus = {true}
                />
            </div>
        );
    }

});

module.exports = AutocompleteDemo;
