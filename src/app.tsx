import React from 'react';
import ReactDom from 'react-dom';
import AppLayout from './containers/AppLayout/AppLayout';
import { LoadingStateProvider } from './contexts/loadingState';

import 'antd/dist/antd.css'

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {
  return (
    <LoadingStateProvider>
      <AppLayout />
    </LoadingStateProvider>
  )
}

ReactDom.render(<App />, mainElement);
