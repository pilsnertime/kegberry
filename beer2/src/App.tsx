import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { MessagingServiceProvider } from './infrastructure/MessagingContext';
import { Home } from './components/Home/Home';
import { Statistics } from './components/Statistics/Statistics';
import './App.css';

const App: React.FC = () => {

  return (
    <MessagingServiceProvider>
      <Router>
          <Route path="/" exact component={Home} />
          <Route path="/stats/" component={Statistics} />
      </Router>
    </MessagingServiceProvider>
  );
}

export default App;
