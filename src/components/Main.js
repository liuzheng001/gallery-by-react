require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';
//获取图片相关的数据

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

//获取两值之间的随机数,并向下取正
function getRangeRandom(low,high){
    return Math.ceil(Math.random()*(high-low)+low);
}

/**
 * 获取0~macDeg之间的正负角度
 */

function getRotateDeg(maxDeg) {
    return (Math.random()> 0.5 ? '+':'-') + Math.ceil(Math.random()*maxDeg)
}




class ImgFigure extends React.Component{

    //绑定hanleClick的作用域
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state ={
            isInverse:false
        }
    }

    /**
     * 更改原教程,将isInverse之加载到ImgFigure中,而不是AppComponent组件上,这样可以上一次对该组件的遍历,而只改当前ImgFigure
     */
    inverse(){
            var isInverse = this.state.isInverse;
            isInverse = !isInverse;
            this.setState({
                isInverse:isInverse
            })
        }

    handleClick(e){

        if(this.props.arrange.isCenter) {
            // this.props.inverse();
                this.inverse();
        }else{

            this.props.center();
        }
        e.stopPropagation();
        e.preventDefault();
    }



    render() {

        var styleObj = {};
        if (this.props.arrange.pos) {
            styleObj = this.props.arrange.pos;
        }

        if (this.props.arrange.rotate) {
            styleObj['transform'] = 'rotate(' + this.props.arrange.rotate +'deg)';
        }

        let imgFigureClassName = 'img-figure';
        // imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';
        if (!this.props.arrange.isCenter) {
            styleObj['zIndex'] =101;
            this.state.isInverse = false;
        }else{
            styleObj['zIndex'] =1001;

        }
        imgFigureClassName += this.state.isInverse ? ' is-inverse' : '';


        return(
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
                <img src={this.props.data.imageURL} alt={this.props.data.title} />
                <figcaption className="figcaption">
                    <h2 className="img-title">{this.props.data.title}</h2>
                    <div className="img-back" onClick={this.handleClick}>
                    <p>
                        {this.props.data.desc}
                    </p>
                 </div>
                </figcaption>
            </figure>
        );
    }

}

class ControllerUnit extends React.Component {
    render(){
        return(
            <span className="controller-unit">a</span>
        );
    }
}

class AppComponent extends React.Component {
    constructor(){
        super();
        //绑定resize()
        this.resize = this.resize.bind(this);
        this.Constant ={
            centerPos:{
                left:0,
                right:0
            },
            hPosRange:{ //水平方向图片x的取值范围
                leftSecX:[0,0],
                rightSecX:[0,0],
                y:[0,0]
            },
            vPosRange:{ //垂直方向图片y的取值范围
                x:[0,0],
                topY:[0,0]
            }
        }
        this.state = {
            imgsArrangeArr: [
               /* {
                    pos:{
                     left:'0',
                     top:'0'
                    },
                isCenter:false,     //是否是中心图片
                rotate:0
                }*/
            ]
        }
    };

    /**
     * 取消,不使用
     * 反转图片
     * @param 输入需要翻转图片的index
     * @returns 返回一个真正待被执行的函数
     */
    inverse(imgIndex){
        return function () {
            var imgArr = this.state.imgsArrangeArr;
           imgArr[imgIndex].isInverse = !imgArr[imgIndex].isInverse;
           this.setState({
                imgsArrangeArr:imgArr
            })
        }.bind(this)
    }

    getStageParam() {

    //得到台子的大小
    var stageDom = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDom.scrollWidth,
        stageH = stageDom.scrollHeight,
        halfstageW = Math.ceil(stageW/2),
        halfstageH = Math.ceil(stageH/2)

    //得到一个imgfigure的大小
    var imgFigureDom = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDom.scrollWidth,
        imgH = imgFigureDom.scrollHeight,
        halfImgW = Math.ceil(imgW/2),
        halfImgH = Math.ceil(imgH/2)

    //中心图片的位置点
    this.Constant.centerPos ={
        left:halfstageW - halfImgW,
        top:halfstageH - halfImgH
    }

    //左右侧图片的位置区域
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfstageW - halfImgW*3;
    this.Constant.hPosRange.rightSecX[0] = halfstageW+halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW-halfImgW;

    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH + halfImgH;
    //上侧图片的位置区域
    this.Constant.vPosRange.topY[0] =-halfImgH;
    this.Constant.vPosRange.topY[1] = halfstageH - halfImgH*3;
    this.Constant.vPosRange.x[0] = halfstageW-imgW;
    this.Constant.vPosRange.x[1] = halfstageW;

}

    //重新计算图片排列
    center(imgIndex){
        return function () {
            this.rearrange(imgIndex);
        }.bind(this)
    }

    //浏览器尺寸变化,重新安排图片
    //由于参数没有搞懂,重画时用index=0或者用全局变量
    resize(e){
        //重新计算台子参数,并重新布局图片
        this.getStageParam();
        this.rearrange(0)
    }




    //重新排布图片位置,传中心图片index值
    rearrange(centerIndex) {
        var imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,

            imgsArrangeTopArr = [],
            topImgNum = Math.ceil(Math.random()),//在0,1之间随机

            topImgSpliceIndex = 0,
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

            //首先居中 centerIndex图片
            imgsArrangeCenterArr = {
                pos:centerPos,
                isCenter:true,
                rotate:0
            };



            //取出布局上侧的图片状态信息
            //随机得到图片index
            topImgSpliceIndex = Math.ceil(Math.random()*(imgsArrangeArr.length) - topImgNum);
            imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);


            imgsArrangeTopArr.forEach(
                function (value,index) {
                     imgsArrangeTopArr[index]= {
                         pos: {
                             top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                             left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
                         },
                         isCenter:false,
                         rotate:getRotateDeg(60),
                     }
            });


            //布局左右两侧的图片
            for(var i=0,j=imgsArrangeArr.length,k=j/2;i<j;i++) {
                var hPosRangeLORX = null;
                if (i < k) {
                    hPosRangeLORX = hPosRangeLeftSecX;
                } else {
                    hPosRangeLORX = hPosRangeRightSecX;
                }

                imgsArrangeArr[i] = {
                    pos:{
                        top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                        left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
                    },
                    isCenter:false,
                    rotate:getRotateDeg(60),

                }
            }

             /*   if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
                    imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr);
                }*/

        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
            imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);

        }

                imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr); //将中心上方图片状态加回imgsArrangeArr中

            this.setState({
                imgsArrangeArr:imgsArrangeArr
            });
            }


    //组件加载后,为每张图片计算其位置的范围
    componentDidMount(){

        //监听浏览器窗口变化
        window.addEventListener('resize', this.resize);

      this.getStageParam();
      this.rearrange(0);

    }
    //组件销灭时执行,取消监听,：一定要移除监听器，否则多个组件之间会导致this的指向紊乱！！！
    componentWillUnmount() {
        window.removeEventListener('resize',this.resize);
    }



    render() {


      var controllerUnits = [],imgFigures=[];
      imageDatas.forEach(function (value,index) {
          //初始化
          if (!this.state.imgsArrangeArr[index]) {
              this.state.imgsArrangeArr[index] = {
                  pos: {
                      left: 0,
                      top: 0
                  },
                  isCenter:false,
                  rotate:0,
              }
          }
          imgFigures.push(<ImgFigure key={index} data={value} ref={'imgFigure'+index} arrange={this.state.imgsArrangeArr[index]}  inverse= {this.inverse(index)} center={this.center(index)}/>)
          controllerUnits.push(<ControllerUnit />)
      }.bind(this));

    return (
     /* <div className="index">
          <span>hello world!!!!!!</span>
        <img src={yeomanImage} alt="Yeoman Generator" />

        <div className="notice">Please edit <code>src/components/Main.js</code> to get started!</div>
      </div>*/
    <section className="stage" ref="stage">
        <section className="img-sec">
            {imgFigures}
        </section>
        <nav className="controller-nav">
            {controllerUnits}
        </nav>
    </section>

    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
