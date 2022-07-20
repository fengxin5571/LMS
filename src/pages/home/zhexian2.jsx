
import React, { Component } from 'react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/title';
import 'echarts/lib/component/axis';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/markPoint';
import 'echarts/lib/component/markLine';
import 'echarts/lib/component/timeline';


// 引入图表模块
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/grid'

import { useState, useEffect } from 'react';

const Echartszxt1 = (props) => {
  let [main, setMain] = useState('')
  // console.log(props);

  const option = {

    tooltip: {
      trigger: 'axis',
      formatter: props.getLange(props.loginUser?.id) == "zh_CN" ? '{c} <br />重量(kg)' : '{c} <br />weight(kg)',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    grid: {
      left: "1%",
      // right: "4%",
      // bottom: "3%",
      top: '20%',
      width: "95%",
      height: "65%",
      containLabel: true
    },
    xAxis: {
      type: 'category',
      show: true,
      boundaryGap: false,
      // data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      data: props.timeData,
      // axisLabel: {
      //   interval: 0 //全部显示x轴
      // }
    },
    yAxis: {
      name: props.getLange(props.loginUser?.id) == "zh_CN" ? "单位：kg" : 'Company:kg',
      type: 'value',
      nameLocation: "end",
      // min: 'dataMin',
      // max: 'dataMax',
      nameTextStyle: {
        padding: [0, 40, 0, 0]    // 四个数字分别为上右下左与原位置距离
      }
    },
    series: [
      {
        // data: [1500, 3932, 9201, 5234, 6290, 2330, 6320, 5999, 6000, 10000, 2300, 10000],
        data: props.single,
        smooth: 0.3,
        type: 'line',
        symbol: 'none',
        color: '#6599FE',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(228, 240, 254)'
            },
            {
              offset: 1,
              color: 'rgb(247, 255, 254)'
            }
          ])
        },

      }
    ]
  };
  useEffect(() => {
    var node = document.getElementById('main3')
    setMain(node)
  }, [])
  if (main !== "") {
    var myChart = echarts.init(main);
    // console.log(myChart);
    myChart.setOption(option);
    window.addEventListener("resize", function () {
      myChart.resize();
    });
  }
  return (
    <div style={{ height: "11vw", width: "100%", position: 'relative', top: '-1.5vw' }} id="main3"></div>
  )
}
export default Echartszxt1;
