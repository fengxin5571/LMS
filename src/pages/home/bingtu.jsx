import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend'
import 'echarts/lib/chart/pie';
import "echarts/lib/component/legendScroll";
import { useState, useEffect } from 'react';

const Echartstest = (props) => {
  let [main, setMain] = useState('')
  let data1 = [
    { value: 335, name: '租户' },
    { value: 310, name: '用户' },
  ]
  const option = {
    tooltip: {
      // trigger: 'item',
      formatter: '{b} : {d}%'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      // left: 10,
      right: 10,
      top: 20,
      bottom: 20,
      formatter: function (name) {
        let num
        let bfb
        let total = 0
        for (let i = 0; i < data1.length; i++) {
          total += data1[i].value
          if (data1[i].name == name) {
            name = data1[i].name
            num = data1[i].value
            bfb = `{d}%`
          }
        }
        let p = (((num / total).toFixed(4)) * 100) + '%'
        let arr = [name, num, p]
        return arr.join('　　')
      }

    },

    color: ['#5C7BD9', '#91CC75'],
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: '55%',
        center: ['30%', '60%'],
        data: data1,
        label: {
          show: false,
          // position: 'center'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }
    ]
  };
  useEffect(() => {
    var node = document.getElementById('main')
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
    <div style={{ height: "10vw", width: "100%", marginTop: '2vw' }} id="main"></div>
  )
}
export default Echartstest;

