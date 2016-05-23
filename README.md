React Autocomplete - [View Demo](http://synapsestudios.github.io/react-autocomplete/)
----
A lightweight autocomplete input component

### Install
`npm install --save synapse-react-autocomplete`

### Props
```
className : string
id : 'string'
labelField : 'string'
options : [{option : 'string'}]
placeholder : 'string'
minimumCharacters : number
maximumCharacters : number
maximumSuggestions : number
clearOnSelect : bool
dropdownPosition : string ('top' or 'bottom')
dropdownHeight : number
showSuggestionsOnEmptyFocus : bool
```

### Styles
Styles are not included by default. Include `scss/autocomplete.scss` in your local app.scss file to include the base styles.

### Development
* Development - `npm run demo`
* Distribution - `npm run build`
