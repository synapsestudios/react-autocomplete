'use strict';

var React        = require('react');
var Autocomplete = require('./input-autocomplete');

require('./demo.scss');

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
    },
    {
        option : 'Iceberg lettuce'
    },
    {
        option : 'Jackfruit'
    },
    {
        option : 'Kiwi'
    },
    {
        option : 'Lima Beans'
    },
    {
        option : 'Mango'
    },
    {
        option : 'Nuts'
    },
    {
        option : 'Oranges'
    },
    {
        option : 'Pineapple'
    }
];

var AutocompleteDemo = React.createClass({

    displayName : 'AutocompleteDemo',

    render()
    {


        return (
            <div className='demo__wrapper'>
                <h1 className='h1 text-center'>React Autocomplete</h1>
                <p className='p text-center'>A lightweight autocomplete component built by Synapse Studios.</p>
                <p className='p text-center'>View this project on <a href='https://github.com/synapsestudios/react-autocomplete'>Github</a></p>
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
                    dropdownHeight              = {200}
                    showSuggestionsOnEmptyFocus = {true}
                />
            </div>
        );
    }

});

module.exports = AutocompleteDemo;
