import React from 'react';
import ReactDOM from 'react-dom';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import omit from 'lodash/omit';
import bind from 'lodash/bind';
import extend from 'lodash/extend';
import partial from 'lodash/partial';
import find from 'lodash/find';
import classNames from 'classnames';
import Fuse from 'fuse.js';

const win = typeof window !== 'undefined' ? window : false;

const KC_TAB = 9,
    KC_ENTER = 13,
    KC_ESC = 27,
    KC_UP = 38,
    KC_DOWN = 40,
    KC_PAGE_UP = 33,
    KC_PAGE_DOWN = 34;

// Number of items to jump up/down using page up / page down
const PAGE_UP_DOWN_JUMP = 5;

export default React.createClass({

    displayName : 'ReactAutocomplete',

    propTypes : {
        // makeSelection is responsible for responding when a user selects a suggested item
        // options is list of objects
        labelField                  : React.PropTypes.string,
        valueField                  : React.PropTypes.string,
        translationFunction         : React.PropTypes.func,
        id                          : React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]).isRequired,
        makeSelection               : React.PropTypes.func,
        onChange                    : React.PropTypes.func,
        onBlur                      : React.PropTypes.func,
        onFocus                     : React.PropTypes.func,
        options                     : React.PropTypes.arrayOf(React.PropTypes.object),
        minimumCharacters           : React.PropTypes.number,
        maximumCharacters           : React.PropTypes.number,
        maximumSuggestions          : React.PropTypes.number,
        placeholder                 : React.PropTypes.string,
        clearOnFocus                : React.PropTypes.bool,
        clearOnSelect               : React.PropTypes.bool,
        retainValueOnBlur           : React.PropTypes.bool,
        showSuggestionsOnEmptyFocus : React.PropTypes.bool,
        value                       : React.PropTypes.string,
        dropdownPosition            : React.PropTypes.oneOf(['top', 'bottom']),
        dropdownHeight              : React.PropTypes.number,
        InputComponent              : React.PropTypes.any,
        inputProps                  : React.PropTypes.object,
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
            labelField                  : 'label',
            valueField                  : 'value',
            translationFunction         : null,
            makeSelection               : null,
            onChange                    : null,
            options                     : null,
            value                       : null,
            minimumCharacters           : 3,
            maximumCharacters           : 32,
            maximumSuggestions          : 5,
            placeholder                 : '',
            retainValueOnBlur           : false,
            showSuggestionsOnEmptyFocus : false,
            dropdownPosition            : null,
            dropdownHeight              : null,
            InputComponent              : 'input',
            inputProps                  : {},
            className                   : null,
            clearOnSelect               : false,
        };
    },

    getInitialState() {
        let where = {},
            selection,
            translatedOptions;

        where[this.props.valueField] = this.props.value;

        selection = find(this.props.options, where);

        translatedOptions = this.translateOptionsIfNecessary(this.props.options);

        return {
            dropdownIndex    : 0,
            fuse             : this.createFuseObject(translatedOptions, this.props.labelField),
            suggestions      : [],
            selection        : selection || null,
            searchQuery      : this.getDisplayValue(this.props.value) || '',
            dropdownPosition : this.props.dropdownPosition,
            options          : translatedOptions
        };
    },

    getDisplayValue : function(value) {
        if (value) {
            let selectedOption = find(this.props.options, {label : value});

            if (selectedOption) {
                return selectedOption.label;
            }
        }

        return value;
    },

    translateOptionsIfNecessary(options) {
        const translate = this.props.translationFunction;

        if (translate) {
            return this.props.options.map(function (option) {
                option[self.props.labelField] = t(option[self.props.labelField]);
                return option;
            });
        }

        return options;
    },

    componentDidMount() {
        this.setDropdownPosition();
    },

    shouldComponentUpdate(nextProps, nextState) {
        let filterIgnoredProps,
            shallowPropsChanged;

        if (! isEqual(nextState, this.state)) {
            return true;
        }

        filterIgnoredProps = function (props) {
            return omit(props, 'options');
        };

        shallowPropsChanged = ! isEqual(
            filterIgnoredProps(nextProps),
            filterIgnoredProps(this.props)
        );

        return (
            shallowPropsChanged ||
            nextProps.options.length !== this.props.options.length
        );
    },

    componentWillMount() {
        this.makeCurrentSelection = bind(this.makeCurrentSelection, this);
    },

    componentWillReceiveProps(nextProps) {
        // Reset lazily-loaded options property if options have changed
        if (! isEqual(this.props.options, nextProps.options)) {
            const newOptions = this.translateOptionsIfNecessary(nextProps.options);

            this.setState({
                options : newOptions,
                fuse: this.createFuseObject(newOptions, nextProps.labelField)
            });
        }

        if (this.props.value !== nextProps.value) {
            this.setState({
                searchQuery: nextProps.value
            });
        }
    },

    componentDidUpdate(prevProps, prevState) {
        this.setDropdownPosition();
    },

    createFuseObject(items, labelField) {
        const options = {
            caseSensitive    : false,
            includeScore     : false,
            shouldSort       : true,
            threshold        : 0.35,
            maxPatternLength : this.props.maximumCharacters,
            keys             : [labelField]
        };

        return new Fuse(items, options);
    },

    getSuggestions(query) {
        let suggestions = this.state.fuse.search(query);

        suggestions = suggestions.slice(0, this.props.maximumSuggestions);

        if (! suggestions) {
            suggestions = [];
        }

        return suggestions;
    },

    incrementAutoselect(amount) {
        const maxPosition = (this.state.suggestions.length - 1);

        if (amount === undefined) {
            amount = 1;
        }

        if (this.state.dropdownIndex < maxPosition) {
            this.updateDropdownPosition(
                Math.min(maxPosition, this.state.dropdownIndex + amount)
            );
        }
    },

    decrementAutoselect(amount) {
        if (amount === undefined) {
            amount = 1;
        }

        if (this.state.dropdownIndex > 0) {
            this.updateDropdownPosition(
                Math.max(0, this.state.dropdownIndex - amount)
            );
        }
    },

    updateDropdownPosition(newPosition) {
        this.setState({dropdownIndex : newPosition});
        this.adjustScrollPosition(newPosition);
    },

    adjustScrollPosition(dropdownIndex) {
        const list          = ReactDOM.findDOMNode(this.refs.list);
        const selectedChild = list.children[0].children[dropdownIndex];
        const minScroll     = selectedChild.offsetTop + selectedChild.offsetHeight - list.clientHeight;
        const maxScroll     = selectedChild.offsetTop;

        if (list.scrollTop < minScroll) {
            list.scrollTop = minScroll;
        } else if (list.scrollTop > maxScroll) {
            list.scrollTop = maxScroll;
        }
    },

    makeCurrentSelection() {
        if (this.state.suggestions.length === 0) {
            return;
        }

        this.makeSelection(this.state.suggestions[this.state.dropdownIndex]);
    },

    makeSelection(selection) {
        this.setState({
            suggestions : [],
            selection   : this.props.clearOnSelect ? null : selection,
            searchQuery : this.props.clearOnSelect ? '' : selection[this.props.labelField]
        });

        if (this.props.onChange) {
            this.props.onChange(selection[this.props.valueField]);
        }

        if (this.props.makeSelection) {
            this.props.makeSelection(selection);
        }
    },

    dropdownVisible() {
        return this.state.suggestions && this.state.suggestions.length > 0;
    },

    handleChange(eventOrValue) {
        let newState,
            suggestions,
            noPossibleMatches,
            updatingLastQuery,
            value;

        // A CustomInput component may return an event instead of the value
        if (isObject(eventOrValue)) {
            value = eventOrValue.currentTarget.value;
        } else {
            value = eventOrValue;
        }

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
            newState.suggestions   = this.state.options;
            newState.dropdownIndex = 0;
        }

        this.setState(newState);

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    },

    handleBlur(e) {
        const state = {};

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

    handleFocus(e) {
        if (this.props.clearOnFocus && this.props.showSuggestionsOnEmptyFocus === true) {
            this.setState({
                searchQuery   : '',
                selection     : null,
                suggestions   : this.state.options,
                dropdownIndex : 0
            });
        }

        this.handleChange(e);

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
    handleKeyDown() {
        let event;

        // The default InputComponent includes the current value as the first arg and the event as the second.
        // If InputComponent is overridden, this value will likely not be included.
        if (isObject(arguments[0])) {
            event = arguments[0];
        } else {
            event = arguments[1];
        }

        event.stopPropagation();

        const code = event.keyCode ? event.keyCode : event.which;

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
                    suggestions : [],
                    selection   : null
                });
                break;
            case KC_ENTER:
            case KC_TAB:
                if (this.dropdownVisible()) {
                    if (code === KC_ENTER) {
                        event.preventDefault();
                    }
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

    /**
     * Set suggestion list dropdown based on Y postion to viewport
     * explicitly passing dropdownPosition prop will disable this
     */
    setDropdownPosition() {
        if (! win) {
            return null;
        }

        const offset            = this.props.dropdownHeight || 250,
            winHeight         = win.innerHeight,
            componentPosition = ReactDOM.findDOMNode(this.refs.autocomplete).getBoundingClientRect().top,
            dropdownPosition  = (componentPosition + offset > winHeight) ?
                'top' : 'bottom';

        if (
            ! this.props.dropdownPosition &&
            this.state.dropdownPosition !== dropdownPosition
        ) {
            this.setState({dropdownPosition : dropdownPosition});
        }
    },

    renderInput() {
        const value = this.state.selection ?
            this.state.selection[this.props.labelField] :
            this.state.searchQuery;

        const props = {
            ref          : 'inputComponent',
            className    : 'autocomplete__input',
            id           : this.props.id,
            onKeyDown    : this.handleKeyDown,
            onChange     : this.handleChange,
            onBlur       : this.handleBlur,
            onFocus      : this.handleFocus,
            value        : value,
            placeholder  : this.props.placeholder,
            autoComplete : false,
            type         : 'text'
        };

        extend(props, this.props.inputProps);

        return React.createElement(this.props.InputComponent, props);
    },

    renderDropdownItems() {
        const component = this;

        return this.state.suggestions.map(function(suggestion, index) {
            const classes = classNames({
                'autocomplete__item'           : true,
                'autocomplete__item--selected' : index === component.state.dropdownIndex
            });

            return (
                <li
                    className   = {classes}
                    onMouseDown = {partial(component.makeSelection, suggestion)}
                    key         = {suggestion[component.props.labelField]}
                >
                    {suggestion[component.props.labelField]}
                </li>
            );
        });
    },

    renderDropdown() {
        let dropdownStyles;

        const classes = {
            'autocomplete__dropdown'          : true,
            'autocomplete__dropdown--top'     : this.state.dropdownPosition === 'top',
            'autocomplete__dropdown--bottom'  : this.state.dropdownPosition === 'bottom',
            'autocomplete__dropdown--visible' : this.dropdownVisible()
        };

        const dropdownHeight = this.dropdownVisible() ?
            this.props.dropdownHeight : 0;

        if (this.props.dropdownHeight) {
            dropdownStyles = {
                maxHeight : dropdownHeight + 'px'
            };
        }

        return (
            <div
                ref       = 'list'
                className = {classNames(classes)}
                style     = {dropdownStyles}
            >
                <ul className='autocomplete__list'>
                    {this.renderDropdownItems()}
                </ul>
            </div>
        );
    },

    render()
    {
        const classes = [
            'autocomplete',
            this.props.className
        ];

        return (
            <div ref='autocomplete' className={classNames(classes)}>
                <div className='autocomplete__input-wrapper'>
                    {this.renderInput()}
                </div>
                {this.renderDropdown()}
            </div>
        );
    }
});
