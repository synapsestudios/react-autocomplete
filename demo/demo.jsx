'use strict';

var React        = require('react');
var Autocomplete = require('../src/autocomplete');

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

module.exports = React.createClass({

    render : function()
    {
        var styles = {
            maxWidth : '720px',
            margin   : '0 auto',
            padding  : '20px'
        }

        return (
            <div style={styles}>
                <Autocomplete
                    searchField = 'Search Field'
                    id          = 'autocompleteDemo'
                    options     = {autocompleteOptions}
                />
            </div>
        );
    }

});
