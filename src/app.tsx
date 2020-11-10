import React from 'react';
import ReactDom from 'react-dom';
import Sheet from './components/Sheet/Sheet';
import 'antd/dist/antd.css'
import styles from './app.css'
import { message } from 'antd'


const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {
  return (
    <div>
      <h1 className={styles.htest}>Test123</h1>
      <Sheet file={'test'} />
    </div>
  )
}

ReactDom.render(<App />, mainElement);
