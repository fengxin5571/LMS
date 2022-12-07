import React, {Component, useRef} from 'react';
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

import {useState, useEffect} from 'react';
import {getLange} from "../../commons";

const Echartszxt = (props) => {
    const containerRef = useRef(null);
    const option = {

        tooltip: {
            trigger: 'axis',
            formatter: props.getLange(props.loginUser?.id) == "zh_CN" ? '{c} <br />票数(单)' : '{c} <br />Number of votes(single)',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            },

        },
        grid: {
            // left: "2%",
            right: "2%",
            // bottom: "3%",
            top: '14%',
            width: "95%",
            height: "80%",
            // padding: '20px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: props.timeData,
            formatter: function (value) {
                // console.log(value);
                let valueTxt = '';
                if (value.length > 5) {
                    valueTxt = value.substring(0, 5) + '...';
                } else {
                    valueTxt = value;
                }
                return valueTxt;
            }
        },
        yAxis: {
            name: props.getLange(props.loginUser?.id) == "zh_CN" ? "单位：单" : 'Company:single',
            type: 'value',
            nameLocation: "end",
            nameTextStyle: {
                padding: [0, 40, 0, 0]    // 四个数字分别为上右下左与原位置距离
            }
        },
        series: [
            {
                // data: [1500, 9320, 4901, 6934, 2290, 6330, 8320, 5999, 6000, 10000, 2300, 10000],
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
        <div style={{height: "15.5vw", width: "100%", position: 'relative',}} id="main2" ref={containerRef}></div>
    )
}
export default Echartszxt;
