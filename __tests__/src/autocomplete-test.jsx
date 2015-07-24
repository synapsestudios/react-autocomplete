/* globals beforeEach, describe, it*/
'use strict';

var React        = require('react');
var TestUtils    = require('react/addons').addons.TestUtils;
var expect       = require('chai').expect;
var Autocomplete = require('../../src/autocomplete');

var getOptions = function() {
    return [
        {
            label : 'Option One',
            value : 1
        },
        {
            label : 'Option Two',
            value : 2
        }
    ];
};

describe('Autocomplete', function() {

    beforeEach(function() {

    });

    it('renders element with class autocomplete__dropdown', function() {
        var component, rendered, options;

        options = getOptions();

        component = (
            <Autocomplete
                options = {options}
            />
        );
        rendered = TestUtils.renderIntoDocument(component);

        TestUtils.findRenderedDOMComponentWithClass(
            rendered,
            'autocomplete__dropdown'
        );
    });

});
