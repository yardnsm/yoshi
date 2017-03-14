'use strict';

module.exports = extractCSS => {
  const cssLoaderOptions = {
    sourceMap: true
  };

  return {
    client: {
      test: /\.raw\.css$/,
      loader: clientLoader(extractCSS, 'style', [
        `css-loader?${JSON.stringify(cssLoaderOptions)}`
      ])
    },
    specs: {
      test: /\.raw\.css$/,
      loaders: [
        `css-loader/locals?${JSON.stringify(cssLoaderOptions)}`
      ]
    }
  };
};

function clientLoader(extractCSS, l1, l2) {
  return extractCSS ? extractCSS.extract(l1, l2) : [l1].concat(l2).join('!');
}
