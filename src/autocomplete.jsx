'use strict';

var _               = require('lodash');
var React           = require('react');
var cx              = require('react/lib/cx');
var TextInput       = require('synfrastructure').Input;
var Fuse            = require('fuse.js');

var KC_ENTER     = 13,
    KC_ESC       = 27,
    KC_UP        = 38,
    KC_DOWN      = 40,
    KC_PAGE_UP   = 33,
    KC_PAGE_DOWN = 34;

// Number of items to jump up/down using page up / page down
var PAGE_UP_DOWN_JUMP = 5;

module.exports = React.createClass({

    displayName : 'ReactAutocomplete',

    propTypes : {
        // makeSelection is responsible for responding when a user selects a suggested item
        searchField                 : React.PropTypes.string.isRequired,
        label                       : React.PropTypes.string,
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
        value                       : React.PropTypes.string // Value to display in text box
    },

    shouldComponentUpdate : function(nextProps, nextState)
    {
        var filterIgnoredProps, shallowPropsChanged;

        if (! _.isEqual(nextState, this.state)) {
            return true;
        }

        filterIgnoredProps = function (props) {
            return _.omit(props, 'options');
        };

        shallowPropsChanged = ! _.isEqual(
            filterIgnoredProps(nextProps),
            filterIgnoredProps(this.props)
        );

        return (
            shallowPropsChanged ||
            nextProps.options.length !== this.props.options.length
        );
    },

    getInitialState : function()
    {
        var selection = this.props.value || this.props.initialValue;

        return {
            dropdownIndex : 0,
            fuse          : this.createFuseObject(this.props.options, this.props.searchField),
            suggestions   : [],
            selection     : selection || null,
            searchQuery   : this.props.value || ''
        };
    },

    /**
     * maximumCharacters exists to help optimize usage of Fuse.js
     * After maximumCharacters is met, the input will be reset to a blank string
     * for a better user experience
     *
     * @link https://github.com/krisk/Fuse
     */
    getDefaultProps : function()
    {
        return {
            label              : null,
            minimumCharacters  : 3,
            maximumCharacters  : 32,
            maximumSuggestions : 5,
            placeholder        : '',
            retainValueOnBlur  : false
        };
    },

    componentWillMount : function()
    {
        this.makeCurrentSelection = _(this.makeCurrentSelection).bind(this);
    },

    componentWillReceiveProps : function(nextProps)
    {
        var state = {
            dropdownIndex : 0,
            fuse          : this.createFuseObject(nextProps.options, nextProps.searchField)
        };

        if (nextProps.value) {
            state.searchQuery = nextProps.value;
        }

        this.setState(state);
    },

    createFuseObject : function(items, searchField)
    {
        var options = {
            caseSensitive    : false,
            includeScore     : false,
            shouldSort       : true,
            threshold        : 0.35,
            maxPatternLength : this.props.maximumCharacters,
            keys             : [searchField]
        };

        return new Fuse(items, options);
    },

    getSuggestions : function(query)
    {
        var suggestions = this.state.fuse.search(query);

        suggestions = suggestions.slice(0, this.props.maximumSuggestions);

        if (! suggestions) {
            suggestions = [];
        }

        return suggestions;
    },

    incrementAutoselect : function(amount)
    {
        var maxPosition = (this.state.suggestions.length - 1);

        if (amount === undefined) {
            amount = 1;
        }

        if (this.state.dropdownIndex < maxPosition) {
            this.updateDropdownPosition(
                Math.min(maxPosition, this.state.dropdownIndex + amount)
            );
        }
    },

    decrementAutoselect : function(amount)
    {
        if (amount === undefined) {
            amount = 1;
        }

        if (this.state.dropdownIndex > 0) {
            this.updateDropdownPosition(
                Math.max(0, this.state.dropdownIndex - amount)
            );
        }
    },

    updateDropdownPosition : function(newPosition)
    {
        this.setState({dropdownIndex : newPosition});
        this.adjustScrollPosition(newPosition);
    },

    adjustScrollPosition : function(dropdownIndex)
    {
        var list, selectedChild, minScroll, maxScroll;

        list          = this.refs.list.getDOMNode();
        selectedChild = list.children[0].children[dropdownIndex];
        minScroll     = selectedChild.offsetTop + selectedChild.offsetHeight - list.clientHeight;
        maxScroll     = selectedChild.offsetTop;

        if (list.scrollTop < minScroll) {
            list.scrollTop = minScroll;
        } else if (list.scrollTop > maxScroll) {
            list.scrollTop = maxScroll;
        }
    },

    makeCurrentSelection : function()
    {
        if (this.state.suggestions.length === 0) {
            return;
        }

        this.makeSelection(this.state.suggestions[this.state.dropdownIndex]);
    },

    makeSelection : function(selection)
    {
        if (this.props.clearOnSelect) {
            this.setState({
                suggestions : [],
                selection   : null,
                searchQuery : ''
            });
        } else {
            this.setState({
                suggestions : [],
                selection   : selection,
                searchQuery : selection[this.props.searchField]
            });
        }

        if (this.props.onChange) {
            this.props.onChange(selection[this.props.searchField]);
        }

        if (this.props.makeSelection) {
            this.props.makeSelection(selection);
        }
    },

    dropdownVisible : function()
    {
        return this.state.suggestions && this.state.suggestions.length > 0;
    },

    handleChange : function(value)
    {
        var newState, suggestions, noPossibleMatches, updatingLastQuery;

        if (value.length >= this.props.minimumCharacters) {
            updatingLastQuery = value.substring(0, value.length - 1) === this.state.searchQuery;

            noPossibleMatches = (
                updatingLastQuery &&
                value.length >= this.props.minimumCharacters + 5 &&
                this.state.suggestions.length === 0
            );

            suggestions = noPossibleMatches ? [] : this.getSuggestions(value);
        } else {
            suggestions = [];
        }

        newState = {
            searchQuery : value,
            selection   : null,
            suggestions : suggestions
        };

        if (value === '' && this.props.showSuggestionsOnEmptyFocus) {
            newState.suggestions   = this.props.options;
            newState.dropdownIndex = 0;
        }

        this.setState(newState);

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    },

    handleBlur : function(e)
    {
        var state = {};

        if (this.state.selection === null) {
            state.suggestions = [];
        }

        if (this.props.retainValueOnBlur === false) {
            state.searchQuery = '';
        }

        this.setState(state);
    },

    handleFocus : function()
    {
        if (this.state.searchQuery === '' && ! this.state.selection && this.props.showSuggestionsOnEmptyFocus === true) {
            this.setState({
                suggestions   : this.props.options,
                dropdownIndex : 0
            });
        }
    },

    /**
     * Respond to user keypresses by going up or down the autocomplete list,
     * hiding the autoselect box or choosing the selected item.
     *
     * @param  Event event
     */
    handleKeyDown : function(event)
    {
        event.stopPropagation();

        var code = event.keyCode ? event.keyCode : event.which;

        switch (code) {
            case KC_UP:
                this.decrementAutoselect();
                break;
            case KC_DOWN:
                this.incrementAutoselect();
                break;
            case KC_ESC:
                this.setState({
                    suggestions : [],
                    selection   : null
                });
                break;
            case KC_ENTER:
                if (this.dropdownVisible()) {
                    event.preventDefault();
                    this.makeSelection(this.state.suggestions[this.state.dropdownIndex]);
                }
                break;
            case KC_PAGE_UP:
                this.decrementAutoselect(PAGE_UP_DOWN_JUMP);
                break;
            case KC_PAGE_DOWN:
                this.incrementAutoselect(PAGE_UP_DOWN_JUMP);
                break;
            default:
                if (this.state.selection !== null && event.key.length === 1) {
                    this.setState({
                        searchQuery : event.key,
                        selection   : null,
                        suggestions : []
                    });
                }
                break;
        }
    },

    renderInput : function()
    {
        var value = this.props.value;

        if (! value) {
            value = this.state.selection ? this.state.selection[this.props.searchField] : this.state.searchQuery;
        }

        return (
            <TextInput
                className    = 'autocomplete__input'
                id           = {this.props.id}
                label        = {this.props.label}
                onKeyDown    = {this.handleKeyDown}
                onChange     = {this.handleChange}
                onBlur       = {this.handleBlur}
                onFocus      = {this.handleFocus}
                initialValue = {null}
                value        = {value}
                placeholder  = {this.props.placeholder}
                autoComplete = {false}
                type         = 'text'
            />
        );
    },

    renderDropdownItems : function()
    {
        var component = this;

        return this.state.suggestions.map(function(suggestion, index) {
            var classes = cx({
                'autocomplete__item'              : true,
                'autocomplete__item--is-selected' : index === component.state.dropdownIndex
            });

            return (
                <li onMouseDown = {_.partial(component.makeSelection, suggestion)}
                    key         = {suggestion[component.props.searchField]}
                    className   = {classes}>
                        {suggestion[component.props.searchField]}
                </li>
            );
        });
    },

    renderDropdown : function()
    {
        var classes = cx({
            'autocomplete__dropdown'          : true,
            'autocomplete__dropdown--visible' : this.dropdownVisible()
        });

        return (
            <div className={classes} ref='list'>
                <ul className='autocomplete__list'>
                    {this.renderDropdownItems()}
                </ul>
            </div>
        );
    },

    render : function()
    {
        var autoCompleteClasses = {autocomplete : true};

        if (this.props.className) {
            autoCompleteClasses[this.props.className] = true;
        }

        return (
            <div className={this.props.className}>
                <div className={cx(autoCompleteClasses)}>
                    <div className='autocomplete__input-wrapper'>
                        {this.renderInput()}
                    </div>
                    {this.renderDropdown()}
                </div>
            </div>
        );
    }
});
