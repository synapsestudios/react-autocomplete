'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _lodashIsEqual = require('lodash/isEqual');

var _lodashIsEqual2 = _interopRequireDefault(_lodashIsEqual);

var _lodashOmit = require('lodash/omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

var _lodashExtend = require('lodash/extend');

var _lodashExtend2 = _interopRequireDefault(_lodashExtend);

var _lodashPartial = require('lodash/partial');

var _lodashPartial2 = _interopRequireDefault(_lodashPartial);

var _lodashFind = require('lodash/find');

var _lodashFind2 = _interopRequireDefault(_lodashFind);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _fuseJs = require('fuse.js');

var _fuseJs2 = _interopRequireDefault(_fuseJs);

var win = typeof window !== 'undefined' ? window : false;

var KC_ENTER = 13,
    KC_ESC = 27,
    KC_UP = 38,
    KC_DOWN = 40,
    KC_PAGE_UP = 33,
    KC_PAGE_DOWN = 34;

// Number of items to jump up/down using page up / page down
var PAGE_UP_DOWN_JUMP = 5;

exports['default'] = _react2['default'].createClass({

    displayName: 'ReactAutocomplete',

    propTypes: {
        // makeSelection is responsible for responding when a user selects a suggested item
        // options is list of objects
        labelField: _react2['default'].PropTypes.string,
        valueField: _react2['default'].PropTypes.string,
        translationFunction: _react2['default'].PropTypes.func,
        id: _react2['default'].PropTypes.oneOfType([_react2['default'].PropTypes.string, _react2['default'].PropTypes.number]).isRequired,
        makeSelection: _react2['default'].PropTypes.func,
        onChange: _react2['default'].PropTypes.func,
        onBlur: _react2['default'].PropTypes.func,
        onFocus: _react2['default'].PropTypes.func,
        options: _react2['default'].PropTypes.arrayOf(_react2['default'].PropTypes.object),
        minimumCharacters: _react2['default'].PropTypes.number,
        maximumCharacters: _react2['default'].PropTypes.number,
        maximumSuggestions: _react2['default'].PropTypes.number,
        placeholder: _react2['default'].PropTypes.string,
        clearOnFocus: _react2['default'].PropTypes.bool,
        retainValueOnBlur: _react2['default'].PropTypes.bool,
        showSuggestionsOnEmptyFocus: _react2['default'].PropTypes.bool,
        value: _react2['default'].PropTypes.string,
        dropdownPosition: _react2['default'].PropTypes.oneOf(['top', 'bottom']),
        dropdownHeight: _react2['default'].PropTypes.number,
        InputComponent: _react2['default'].PropTypes.any,
        inputProps: _react2['default'].PropTypes.object,
        className: _react2['default'].PropTypes.string
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
            translationFunction: null,
            makeSelection: null,
            onChange: null,
            options: null,
            value: null,
            minimumCharacters: 3,
            maximumCharacters: 32,
            maximumSuggestions: 5,
            placeholder: '',
            retainValueOnBlur: false,
            showSuggestionsOnEmptyFocus: false,
            dropdownPosition: null,
            dropdownHeight: null,
            InputComponent: 'input',
            inputProps: {},
            className: null
        };
    },

    getInitialState: function getInitialState() {
        var where = {},
            selection;

        where[this.props.valueField] = this.props.value;

        selection = this.props.options.findWhere(where);

        return {
            dropdownIndex: 0,
            fuse: this.createFuseObject(this.getOptions(), this.props.labelField),
            suggestions: [],
            selection: selection || null,
            searchQuery: this.getDisplayValue(this.props.value) || '',
            dropdownPosition: this.props.dropdownPosition
        };
    },

    getDisplayValue: function getDisplayValue(value) {
        var selectedOption;

        if (value) {
            selectedOption = this.props.options.findWhere({ label: value });

            if (selectedOption) {
                return selectedOption.label;
            }
        }

        return value;
    },

    // Get options with translated labels, if translation function is set
    getOptions: function getOptions() {
        var self = this,
            t = this.props.translationFunction;

        if (!this.options) {
            if (t) {
                this.options = this.props.options.map(function (option) {
                    option[self.props.labelField] = t(option[self.props.labelField]);
                    return option;
                });
            } else {
                this.options = this.props.options;
            }
        }

        return this.options;
    },

    componentDidMount: function componentDidMount() {
        this.setDropdownPosition();
    },

    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        var filterIgnoredProps, shallowPropsChanged;

        if (!_lodashIsEqual2['default'](nextState, this.state)) {
            return true;
        }

        filterIgnoredProps = function (props) {
            return _lodashOmit2['default'](props, 'options');
        };

        shallowPropsChanged = !_lodashIsEqual2['default'](filterIgnoredProps(nextProps), filterIgnoredProps(this.props));

        return shallowPropsChanged || nextProps.options.length !== this.props.options.length;
    },

    componentWillMount: function componentWillMount() {
        this.makeCurrentSelection = _(this.makeCurrentSelection).bind(this);
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        // Reset lazily-loaded options property if options have changed
        if (!_(this.props.options).isEqual(nextProps.options)) {
            this.options = null;
        }
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

        return new _fuseJs2['default'](items, options);
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
    },

    dropdownVisible: function dropdownVisible() {
        return this.state.suggestions && this.state.suggestions.length > 0;
    },

    handleChange: function handleChange(eventOrValue) {
        var newState, suggestions, noPossibleMatches, updatingLastQuery, value;

        // A CustomInput component may return an event instead of the value
        if (_(eventOrValue).isObject()) {
            value = eventOrValue.currentTarget.value;
        } else {
            value = eventOrValue;
        }

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
            newState.suggestions = this.getOptions();
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
        if (this.props.clearOnFocus && this.props.showSuggestionsOnEmptyFocus === true) {
            this.setState({
                searchQuery: '',
                selection: null,
                suggestions: this.getOptions(),
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
                event.preventDefault();
                this.decrementAutoselect();
                break;
            case KC_DOWN:
                event.preventDefault();
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
            componentPosition = _react2['default'].findDOMNode(this.refs.autocomplete).getBoundingClientRect().top,
            dropdownPosition = componentPosition + offset > winHeight ? 'top' : 'bottom';

        if (!this.props.dropdownPosition && this.state.dropdownPosition !== dropdownPosition) {
            this.setState({ dropdownPosition: dropdownPosition });
        }
    },

    renderInput: function renderInput() {
        var props, value, Component;

        value = this.state.selection ? this.state.selection[this.props.labelField] : this.state.searchQuery;

        props = {
            ref: 'inputComponent',
            className: 'autocomplete__input',
            id: this.props.id,
            onKeyDown: this.handleKeyDown,
            onChange: this.handleChange,
            onBlur: this.handleBlur,
            onFocus: this.handleFocus,
            value: value,
            placeholder: this.props.placeholder,
            autoComplete: false,
            type: 'text'
        };

        Component = this.props.InputComponent;
        _lodashExtend2['default'](props, this.props.inputProps);

        console.log(Component);
        return _react2['default'].createElement(Component, props);
    },

    renderDropdownItems: function renderDropdownItems() {
        var component = this;

        return this.state.suggestions.map(function (suggestion, index) {
            var classes = _classnames2['default']({
                'autocomplete__item': true,
                'autocomplete__item--selected': index === component.state.dropdownIndex
            });

            return _react2['default'].createElement(
                'li',
                {
                    className: classes,
                    onMouseDown: _lodashPartial2['default'](component.makeSelection, suggestion),
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

        return _react2['default'].createElement(
            'div',
            {
                ref: 'list',
                className: _classnames2['default'](classes),
                style: dropdownStyles
            },
            _react2['default'].createElement(
                'ul',
                { className: 'autocomplete__list' },
                this.renderDropdownItems()
            )
        );
    },

    render: function render() {
        var classes = ['autocomplete', this.props.className];

        return _react2['default'].createElement(
            'div',
            { ref: 'autocomplete', className: _classnames2['default'](classes) },
            _react2['default'].createElement(
                'div',
                { className: 'autocomplete__input-wrapper' },
                this.renderInput()
            ),
            this.renderDropdown()
        );
    }
});
module.exports = exports['default'];