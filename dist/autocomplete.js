'use strict';

var win = typeof window !== 'undefined' ? window : false;
var _ = require('lodash');
var React = require('react');
var classNames = require('classnames');
var TextInput = require('synfrastructure').Input;
var Fuse = require('fuse.js');

var KC_ENTER = 13,
    KC_ESC = 27,
    KC_UP = 38,
    KC_DOWN = 40,
    KC_PAGE_UP = 33,
    KC_PAGE_DOWN = 34;

// Number of items to jump up/down using page up / page down
var PAGE_UP_DOWN_JUMP = 5;

var ReactAutocomplete = React.createClass({

    displayName: 'ReactAutocomplete',

    propTypes: {
        // makeSelection is responsible for responding when a user selects a suggested item
        // options is list of objects
        labelField: React.PropTypes.string,
        valueField: React.PropTypes.string,
        id: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]).isRequired,
        makeSelection: React.PropTypes.func,
        onChange: React.PropTypes.func,
        onBlur: React.PropTypes.func,
        onFocus: React.PropTypes.func,
        options: React.PropTypes.arrayOf(React.PropTypes.object),
        initialValue: React.PropTypes.object,
        minimumCharacters: React.PropTypes.number,
        maximumCharacters: React.PropTypes.number,
        maximumSuggestions: React.PropTypes.number,
        placeholder: React.PropTypes.string,
        clearOnFocus: React.PropTypes.bool,
        retainValueOnBlur: React.PropTypes.bool,
        showSuggestionsOnEmptyFocus: React.PropTypes.bool,
        value: React.PropTypes.string, // Value to display in text box
        dropdownPosition: React.PropTypes.oneOf(['top', 'bottom']),
        dropdownHeight: React.PropTypes.number,
        InputComponent: React.PropTypes.any,
        inputProps: React.PropTypes.object,
        className: React.PropTypes.string
    },

    /**
     * maximumCharacters exists to help optimize usage of Fuse.js
     * After maximumCharacters is met, the input will be reset to a blank string
     * for a better user experience
     *
     * @link https://github.com/krisk/Fuse
     */
    getDefaultProps: function getDefaultProps() {
        return {
            labelField: 'label',
            valueField: 'value',
            makeSelection: null,
            onChange: null,
            options: null,
            initialValue: null,
            value: null,
            minimumCharacters: 3,
            maximumCharacters: 32,
            maximumSuggestions: 5,
            placeholder: '',
            retainValueOnBlur: false,
            showSuggestionsOnEmptyFocus: false,
            dropdownPosition: null,
            dropdownHeight: null,
            InputComponent: TextInput,
            inputProps: {},
            className: null
        };
    },

    getInitialState: function getInitialState() {
        var selection = this.props.value || this.props.initialValue;

        return {
            dropdownIndex: 0,
            fuse: this.createFuseObject(this.props.options, this.props.labelField),
            suggestions: [],
            selection: selection || null,
            searchQuery: this.props.value || '',
            dropdownPosition: this.props.dropdownPosition
        };
    },

    componentDidMount: function componentDidMount() {
        this.setDropdownPosition();
    },

    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        var filterIgnoredProps, shallowPropsChanged;

        if (!_.isEqual(nextState, this.state)) {
            return true;
        }

        filterIgnoredProps = function (props) {
            return _.omit(props, 'options');
        };

        shallowPropsChanged = !_.isEqual(filterIgnoredProps(nextProps), filterIgnoredProps(this.props));

        return shallowPropsChanged || nextProps.options.length !== this.props.options.length;
    },

    componentWillMount: function componentWillMount() {
        this.makeCurrentSelection = _(this.makeCurrentSelection).bind(this);
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var state = {
            dropdownIndex: 0,
            fuse: this.createFuseObject(nextProps.options, nextProps.labelField)
        };

        if (nextProps.value) {
            state.searchQuery = nextProps.value;
        }

        this.setState(state);
    },

    componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        this.setDropdownPosition();
    },

    createFuseObject: function createFuseObject(items, labelField) {
        var options = {
            caseSensitive: false,
            includeScore: false,
            shouldSort: true,
            threshold: 0.35,
            maxPatternLength: this.props.maximumCharacters,
            keys: [labelField]
        };

        return new Fuse(items, options);
    },

    getSuggestions: function getSuggestions(query) {
        var suggestions = this.state.fuse.search(query);

        suggestions = suggestions.slice(0, this.props.maximumSuggestions);

        if (!suggestions) {
            suggestions = [];
        }

        return suggestions;
    },

    incrementAutoselect: function incrementAutoselect(amount) {
        var maxPosition = this.state.suggestions.length - 1;

        if (amount === undefined) {
            amount = 1;
        }

        if (this.state.dropdownIndex < maxPosition) {
            this.updateDropdownPosition(Math.min(maxPosition, this.state.dropdownIndex + amount));
        }
    },

    decrementAutoselect: function decrementAutoselect(amount) {
        if (amount === undefined) {
            amount = 1;
        }

        if (this.state.dropdownIndex > 0) {
            this.updateDropdownPosition(Math.max(0, this.state.dropdownIndex - amount));
        }
    },

    updateDropdownPosition: function updateDropdownPosition(newPosition) {
        this.setState({ dropdownIndex: newPosition });
        this.adjustScrollPosition(newPosition);
    },

    adjustScrollPosition: function adjustScrollPosition(dropdownIndex) {
        var list, selectedChild, minScroll, maxScroll;

        list = this.refs.list.getDOMNode();
        selectedChild = list.children[0].children[dropdownIndex];
        minScroll = selectedChild.offsetTop + selectedChild.offsetHeight - list.clientHeight;
        maxScroll = selectedChild.offsetTop;

        if (list.scrollTop < minScroll) {
            list.scrollTop = minScroll;
        } else if (list.scrollTop > maxScroll) {
            list.scrollTop = maxScroll;
        }
    },

    makeCurrentSelection: function makeCurrentSelection() {
        if (this.state.suggestions.length === 0) {
            return;
        }

        this.makeSelection(this.state.suggestions[this.state.dropdownIndex]);
    },

    makeSelection: function makeSelection(selection) {
        var inputDOMNode = React.findDOMNode(this.refs.inputComponent.refs.input);

        this.setState({
            suggestions: [],
            selection: selection,
            searchQuery: selection[this.props.labelField]
        });

        if (this.props.onChange) {
            this.props.onChange(selection[this.props.valueField]);
        }

        if (this.props.makeSelection) {
            this.props.makeSelection(selection);
        }

        inputDOMNode.blur();
    },

    dropdownVisible: function dropdownVisible() {
        return this.state.suggestions && this.state.suggestions.length > 0;
    },

    handleChange: function handleChange(value) {
        var newState, suggestions, noPossibleMatches, updatingLastQuery;

        if (value.length >= this.props.minimumCharacters) {
            updatingLastQuery = value.substring(0, value.length - 1) === this.state.searchQuery;

            noPossibleMatches = updatingLastQuery && value.length >= this.props.minimumCharacters + 5 && this.state.suggestions.length === 0;

            suggestions = noPossibleMatches ? [] : this.getSuggestions(value);
        } else {
            suggestions = [];
        }

        newState = {
            searchQuery: value,
            selection: null,
            suggestions: suggestions
        };

        if (value === '' && this.props.showSuggestionsOnEmptyFocus) {
            newState.suggestions = this.props.options;
            newState.dropdownIndex = 0;
        }

        this.setState(newState);

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    },

    handleBlur: function handleBlur(e) {
        var state = {};

        if (this.state.selection === null) {
            state.suggestions = [];
        }

        if (this.props.retainValueOnBlur === false) {
            state.searchQuery = '';
        }

        this.setState(state);

        if (this.props.onBlur) {
            this.props.onBlur(e);
        }
    },

    handleFocus: function handleFocus(e) {
        if (this.props.clearOnFocus && !this.state.selection && this.props.showSuggestionsOnEmptyFocus === true) {
            this.setState({
                searchQuery: '',
                suggestions: this.props.options,
                dropdownIndex: 0
            });
        }

        if (this.props.onFocus) {
            this.props.onFocus(e);
        }
    },

    /**
     * Respond to user keypresses by going up or down the autocomplete list,
     * hiding the autoselect box or choosing the selected item.
     *
     * @param  Event event
     */
    handleKeyDown: function handleKeyDown() {
        var event;

        // The default InputComponent includes the current value as the first arg and the event as the second.
        // If InputComponent is overridden, this value will likely not be included.
        if (_(arguments[0]).isObject()) {
            event = arguments[0];
        } else {
            event = arguments[1];
        }

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
                    suggestions: [],
                    selection: null
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
                        searchQuery: event.key,
                        selection: null,
                        suggestions: []
                    });
                }
                break;
        }
    },

    /**
     * Set suggestion list dropdown based on Y postion to viewport
     * explicitly passing dropdownPosition prop will disable this
     */
    setDropdownPosition: function setDropdownPosition() {
        if (!win) {
            return null;
        }

        var offset = this.props.dropdownHeight || 250,
            winHeight = win.innerHeight,
            componentPosition = React.findDOMNode(this.refs.autocomplete).getBoundingClientRect().top,
            dropdownPosition = componentPosition + offset > winHeight ? 'top' : 'bottom';

        if (!this.props.dropdownPosition && this.state.dropdownPosition !== dropdownPosition) {
            this.setState({ dropdownPosition: dropdownPosition });
        }
    },

    renderInput: function renderInput() {
        var props, value, Component;

        value = this.props.value;
        Component = this.props.InputComponent;

        if (!value) {
            value = this.state.selection ? this.state.selection[this.props.labelField] : this.state.searchQuery;
        }

        props = {
            ref: 'inputComponent',
            className: 'autocomplete__input',
            id: this.props.id,
            onKeyDown: this.handleKeyDown,
            onChange: this.handleChange,
            onBlur: this.handleBlur,
            onFocus: this.handleFocus,
            initialValue: null,
            value: value,
            placeholder: this.props.placeholder,
            autoComplete: false,
            type: 'text'
        };

        _.extend(props, this.props.inputProps);

        return React.createElement(Component, props);
    },

    renderDropdownItems: function renderDropdownItems() {
        var component = this;

        return this.state.suggestions.map(function (suggestion, index) {
            var classes = classNames({
                'autocomplete__item': true,
                'autocomplete__item--selected': index === component.state.dropdownIndex
            });

            return React.createElement(
                'li',
                {
                    className: classes,
                    onMouseDown: _.partial(component.makeSelection, suggestion),
                    key: suggestion[component.props.labelField]
                },
                suggestion[component.props.labelField]
            );
        });
    },

    renderDropdown: function renderDropdown() {
        var classes, dropdownStyles, dropdownHeight;

        classes = {
            'autocomplete__dropdown': true,
            'autocomplete__dropdown--top': this.state.dropdownPosition === 'top',
            'autocomplete__dropdown--bottom': this.state.dropdownPosition === 'bottom',
            'autocomplete__dropdown--visible': this.dropdownVisible()
        };

        dropdownHeight = this.dropdownVisible() ? this.props.dropdownHeight : 0;

        if (this.props.dropdownHeight) {
            dropdownStyles = {
                maxHeight: dropdownHeight + 'px'
            };
        }

        return React.createElement(
            'div',
            {
                ref: 'list',
                className: classNames(classes),
                style: dropdownStyles
            },
            React.createElement(
                'ul',
                { className: 'autocomplete__list' },
                this.renderDropdownItems()
            )
        );
    },

    render: function render() {
        var classes = ['autocomplete', this.props.className];

        return React.createElement(
            'div',
            { ref: 'autocomplete', className: classNames(classes) },
            React.createElement(
                'div',
                { className: 'autocomplete__input-wrapper' },
                this.renderInput()
            ),
            this.renderDropdown()
        );
    }
});

module.exports = ReactAutocomplete;