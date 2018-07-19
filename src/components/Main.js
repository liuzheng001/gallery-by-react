require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';

// let yeomanImage = require('../images/yeoman.png');
//获取图片相关的数据
var   imageDatas = require('../data/imageDatas.json');
// alert(imageDatas);

//自执行函数,只运行一次
imageDatas = function getImageURL(imageDataArr) {
    for(var i=0,j=imageDataArr.length;i<j;i++) {
        var singleImageData = imageDataArr[i];
        singleImageData.imageURL = require('../images/'+ singleImageData.fileName);
        imageDataArr[i] = singleImageData;
    }
    return imageDataArr;
}(imageDatas);


class AppComponent extends React.Component {
  render() {
    return (
     /* <div className="index">
          <span>hello world!!!!!!</span>
        <img src={yeomanImage} alt="Yeoman Generator" />

        <div className="notice">Please edit <code>src/components/Main.js</code> to get started!</div>
      </div>*/
    <section className="stage" >
        <section className="img-sec">

        </section>
        <nav className="controller-nav">

        </nav>
    </section>

    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
