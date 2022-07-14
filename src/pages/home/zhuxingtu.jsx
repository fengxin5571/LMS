import echarts from 'echarts/lib/echarts';
//导入柱形图
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/markPoint'
import 'echarts/lib/component/grid'

import { useState, useEffect } from 'react';


const Echartszx = (props) => {
  let [main, setMain] = useState('')
  let data1 = [1000, 1500, 2000, 3000, -500, -1000]

  const option = {
    tooltip: {
      trigger: 'axis',
      // formatter: '$ \n{c}',
      formatter: function name (params) {
        console.log(params[0].value);
        return '￡' + String(params[0].value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      },
    },

    xAxis: {
      axisLabel: {
        //x轴文字的配置
        show: true,
        interval: 0,//使x轴文字显示全
        formatter: function (value) {
          let valueTxt = '';
          if (value.length > 2) {
            valueTxt = value.substring(0, 2) + '...';
          }
          else {
            valueTxt = value;
          }
          return valueTxt;
        }
      },
      fontSize: '16px',
      data: ['中外运敦豪', '联邦快递', 'TNT', '欧商宝', '美国', '德国本土DHL'],


    },
    yAxis: {
      name: "单位：英镑",
      type: 'value',
      nameLocation: "end",
      nameTextStyle: {
        padding: [0, 20, 20, 0]    // 四个数字分别为上右下左与原位置距离
      }
    },
    series: [
      {
        // name: '$',
        type: 'bar',
        barWidth: '15',
        // 在这里对data进行自定义配置即可
        data: data1.map(item => {
          // console.log(item, 'item')
          return {
            value: item,

            itemStyle: {
              normal: {
                barBorderRadius: item > 0 ? [5, 5, 0, 0] : [0, 0, 5, 5], // 动态设置柱状图圆角
                color: item > 0 ? '#10C248' : '#FCC561'

              }
            }
          }
        })
      }
    ]
  };
  useEffect(() => {
    var node = document.getElementById('main1')
    setMain(node)
  }, [])
  if (main !== "") {
    var myChart = echarts.init(main);
    myChart.setOption(option);
    window.addEventListener("resize", function () {
      myChart.resize();
    });
  }
  return (
    <div style={{ width: '100%', height: '13vw', paddingLeft: '1vw', position: 'relative', bottom: '1.5vw' }} id="main1"></div>
  )
}
export default Echartszx;

