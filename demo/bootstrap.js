import React from 'react';
import ReactDOM from 'react-dom';
import Demo from './demo';

window.onload = () => {
    ReactDOM.render(
        <Demo />,
        window.document.getElementById('content')
    );
};
