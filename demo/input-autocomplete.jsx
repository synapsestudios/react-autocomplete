import React from 'react';
import {Input as TextInput} from 'synfrastructure';
import Autocomplete from '../src/autocomplete';

export default React.createClass({
    displayName : 'AutocompleteInput',

    propTypes : {
        // makeSelection is responsible for responding when a user selects a suggested item
        // options is list of objects
        searchField                 : React.PropTypes.string,
        id                          : React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number ]).isRequired,
        makeSelection               : React.PropTypes.func,
        onChange                    : React.PropTypes.func,
        options                     : React.PropTypes.arrayOf(React.PropTypes.object),
        initialValue                : React.PropTypes.object,
        minimumCharacters           : React.PropTypes.number,
        maximumCharacters           : React.PropTypes.number,
        maximumSuggestions          : React.PropTypes.number,
        placeholder                 : React.PropTypes.string,
        clearOnSelect               : React.PropTypes.bool,
        retainValueOnBlur           : React.PropTypes.bool,
        showSuggestionsOnEmptyFocus : React.PropTypes.bool,
        value                       : React.PropTypes.string, // Value to display in text box
        dropdownPosition            : React.PropTypes.oneOf(['top', 'bottom']),
        dropdownHeight              : React.PropTypes.number,
        className                   : React.PropTypes.string
    },

    /**
     * maximumCharacters exists to help optimize usage of Fuse.js
     * After maximumCharacters is met, the input will be reset to a blank string
     * for a better user experience
     *
     * @link https://github.com/krisk/Fuse
     */
    getDefaultProps()
    {
        return {
            makeSelection               : null,
            onChange                    : null,
            options                     : null,
            initialValue                : null,
            value                       : null,
            minimumCharacters           : 3,
            maximumCharacters           : 32,
            maximumSuggestions          : 5,
            placeholder                 : '',
            retainValueOnBlur           : false,
            clearOnSelect               : false,
            showSuggestionsOnEmptyFocus : false,
            dropdownPosition            : null,
            dropdownHeight              : null,
            className                   : null
        };
    },

    render()
    {
        return (
            <Autocomplete
                className                   = {this.props.className}
                id                          = {this.props.id}
                searchField                 = {this.props.searchField}
                makeSelection               = {this.props.makeSelection}
                onChange                    = {this.props.onChange}
                options                     = {this.props.options}
                initialValue                = {this.props.initialValue}
                value                       = {this.props.value}
                minimumCharacters           = {this.props.minimumCharacters}
                maximumCharacters           = {this.props.maximumCharacters}
                maximumSuggestions          = {this.props.maximumSuggestions}
                placeholder                 = {this.props.placeholder}
                retainValueOnBlur           = {this.props.retainValueOnBlur}
                clearOnSelect               = {this.props.clearOnSelect}
                showSuggestionsOnEmptyFocus = {this.props.showSuggestionsOnEmptyFocus}
                dropdownPosition            = {this.props.dropdownPosition}
                dropdownHeight              = {this.props.dropdownHeight}
                InputComponent              = {TextInput}
            />
        );
    }

});
