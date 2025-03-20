// Import React and ReactDOM
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

// Import Framework7
import Framework7 from 'framework7/lite-bundle';
import { Dom7 } from 'framework7';
window.$$ = Dom7;

// Import Framework7-React Plugin
import Framework7React from 'framework7-react';

import jQuery from 'jquery';
window.jQuery = jQuery;
window.$ = jQuery;

// Import Framework7 Styles
import 'framework7/framework7-bundle.css';

// Import Icons and App Custom Styles
// import '../css/icons.css';
import './less/app.less';

// Import App Component
import App from './view/app';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';

import { Provider } from 'mobx-react'
import { stores } from './store/mainStore'

// Init F7 React Plugin
Framework7.use(Framework7React)

// Mount React App
ReactDOM.render(
    <I18nextProvider i18n={i18n}>
        <Provider {...stores}>
            {/*<Suspense fallback="loading...">*/}
                <App />
            {/*</Suspense>*/}
        </Provider>
    </I18nextProvider>,
  document.getElementById('app'),
);