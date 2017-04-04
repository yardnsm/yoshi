import React from 'react';
import loadable from 'react-loadable';
import Loading from '../Loading';

const LoadableDashboard = loadable({
  loader: () => delay(200).then(() => import('../Dashboard')),
  LoadingComponent: Loading
});

export default function App() {
  return (
    <div>
      <LoadableDashboard/>
    </div>
  );
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
