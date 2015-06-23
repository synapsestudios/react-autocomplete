'use strict';

var React      = require('react');
var classNames = require('classnames');
var Input      = require('synfrastructure').Input;

var TextInput = React.createClass({

    displayName : 'TextInput',

    propTypes : {
        id          : React.PropTypes.string.isRequired,
        placeholder : React.PropTypes.string,
        value       : React.PropTypes.any,
        disabled    : React.PropTypes.bool,
        onFocus     : React.PropTypes.func,
        onBlur      : React.PropTypes.func,
        onChange    : React.PropTypes.func,
        onKeyPress  : React.PropTypes.func,
        onKeyUp     : React.PropTypes.func,
        onKeyDown   : React.PropTypes.func,
        className   : React.PropTypes.string,
        collapse    : React.PropTypes.bool,
        type : React.PropTypes.oneOf([
            'date',
            'datetime',
            'datetime-local',
            'email',
            'month',
            'number',
            'password',
            'search',
            'tel',
            'text',
            'url',
            'week'
        ])
    },

    getDefaultProps : function()
    {
        return {
            placeholder : null,
            value       : null,
            disabled    : false,
            onFocus     : null,
            onBlur      : null,
            onChange    : null,
            onKeyPress  : null,
            onKeyUp     : null,
            onKeyDown   : null,
            collapse    : false,
            className   : null,
            type        : 'text',
        };
    },

    render : function()
    {
        var classes = {
            'input--disabled'    : this.props.disabled,
            'input--collapse'    : this.props.collapse
        };

        classes[this.props.className] = this.props.className;

        return (
            <Input
                ref         = 'input'
                className   = {classNames(classes)}
                id          = {this.props.id}
                placeholder = {this.props.placeholder}
                value       = {this.props.value}
                disabled    = {this.props.disabled}
                onFocus     = {this.props.onFocus}
                onBlur      = {this.props.onBlur}
                onChange    = {this.props.onChange}
                onKeyUp     = {this.props.onKeyUp}
                onKeyDown   = {this.props.onKeyDown}
                onKeyPress  = {this.props.onKeyPress}
                type        = {this.props.type}
            />
        );
    }

});

module.exports = TextInput;
