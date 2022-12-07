import echarts from 'echarts/lib/echarts';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend'
import 'echarts/lib/chart/pie';
import "echarts/lib/component/legendScroll";
import {useState, useEffect, useRef} from 'react';
import {getLange} from "../../commons";

const Echartstest = (props) => {
    const containerRef = useRef(null);
    let arr = []
    for (let key in props.balance) {
        // console.log(key);
        arr.push({
            value: props.balance[key], // value字段
            name: key   // name 字段
        })
    }
    // console.log(arr);
    let data1 = arr
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
                let p = (total ? (((num / total).toFixed(4)) * 100) : 0) + '%'
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
        var myChart = echarts.init(containerRef.current);
        if (props.loading) {
            myChart.showLoading('default', {
                color: '#6599FE',
                text: getLange(props.loginUser?.id) == "zh_CN" ? "载入中" : "loading"
            });
        } else {
            myChart.hideLoading();
        }
        myChart.setOption(option);
        window.addEventListener("resize", function () {
            myChart.resize();
        });
    }, [containerRef, props.loading])

    return (
        <div style={{height: "10vw", width: "100%", marginTop: '2vw'}} id="main" ref={containerRef}></div>
    )
}
export default Echartstest;

