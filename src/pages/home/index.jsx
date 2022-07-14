// import {Redirect} from 'react-router-dom';
import { Button, Tabs, Dropdown, Menu, Space, message, Col, Row, Progress, DatePicker, Modal, Select } from 'antd';
import { PageContent } from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import styles from './style.less';
import { DownOutlined, UserOutlined, SwapOutlined, PoundCircleOutlined } from '@ant-design/icons';
import './style.css'
import './iconfont/iconfont.css'
import Echartstest from './bingtu'
import Echartszx from './zhuxingtu'
import Echartszxt from './zhexian'
import Echartszxt1 from './zhexian2'
import moment from 'moment';

import React, { useState } from 'react';

export default config({
  path: '/',
  title: '首页',
})(function Home (props) {
  // 如果其他页面作为首页，直接重定向，config中不要设置title，否则tab页中会多个首页
  // return <Redirect to="/users"/>;
  const { TabPane } = Tabs;
  const onChange = (key) => {
    console.log(key);
  };

  const [status, setStatus] = useState(1);
  const [status1, setStatus1] = useState(0);
  const [num, setNum] = useState(1);
  const { Option } = Select;
  // 票数租户
  const [modalVisible, setModalVisible] = useState(false);
  // 票数用户
  const [modalVisible1, setModalVisible1] = useState(false);
  // 重量租户
  const [modalVisible2, setModalVisible2] = useState(false);
  // 重量用户
  const [modalVisible3, setModalVisible3] = useState(false);

  const { RangePicker } = DatePicker;
  const dateFormat = 'YYYY/MM/DD';

  // 下拉框
  const handleChange = (value) => {
    console.log(value);
  }
  // 下拉框搜索
  const onSearch = (value) => {
    console.log('search:', value);
  };


  // 美元人民币切换
  const changestyle = (e) => {
    if (e.target.innerHTML == '英镑') {
      setStatus(1)
      setStatus1(0)
    } else {
      setStatus(0)
      setStatus1(1)
    }

  }

  // 统计切换
  const changestyle1 = (e, index) => {
    setNum(index)

  }

  // 下拉框租户
  const [items, setItems] = useState(['jack', 'lucy', 'jc', 'jd']);
  // 下拉框用户
  const [items1, setItems1] = useState(['jack1', 'lucy1', 'a1', 'ar', 'q4']);

  return (
    <PageContent className={styles.root}>
      <div className='box column' styles>
        <div className='one_div flex column'>
          <div className='top_div flex '>
            <span className='' style={{ marginLeft: '10px' }}>快捷操作</span>
          </div>
          <div className='bottom_div flex'>
            <div className='div1_ flex'>
              <div className='div2_ flex column' style={{ marginLeft: '32px' }}>
                <div className='circular' style={{ background: '#6A97F7' }}>
                  <i className="iconfont icon-dadanfahuo-ziyoudayin move_icon" ></i>
                </div>
                <p className='p_div'>打单</p>
              </div>
              <div className='div2_ flex column'>
                <div className='circular' style={{ background: '#F7443F' }}>
                  <i className="iconfont icon-fukuan move_icon" ></i>
                </div>
                <p className='p_div'>充值</p>
              </div>
              <div className='div2_ flex column'>
                <div className='circular' style={{ background: '#FE950C' }}>
                  <i className="iconfont icon-shezhi move_icon" ></i>
                </div>
                <p className='p_div'>设置</p>
              </div>
              <div className='div2_ flex column'>
                <div className='circular' style={{ background: '#03BA05' }}>
                  <i className="iconfont icon-kefu move_icon" ></i>
                </div>
                <p className='p_div'>客服</p>
              </div>
              <div className='div2_ flex column'>
                <div className='circular' style={{ background: '#C7C7C7' }}>
                  <SwapOutlined style={{ fontSize: '2vw', color: '#fff', position: 'relative', top: '0.8vw' }} />
                </div>
                <p className='p_div'>切换账号</p>
              </div>
            </div>
            <div className='div1_'></div>
          </div>
        </div>
        <div className='two_div '>
          <div className='two_top_div'>
            <RangePicker bordered={false} defaultValue={[moment('2021/01/06', dateFormat), moment('2021/03/06', dateFormat)]}
              format={dateFormat} style={{ width: '14vw', fontSize: '0.5vw' }} />
          </div>
          <div className='flex zydq'>
            <div className='div_ flex column neirong piaoshu'>
              <div className='tow_top_div flex'>
                <div className='tow_top_div_left' style={{ background: '#E74748' }}>
                  <i className="iconfont icon-fukuan iconfont1 " style={{ fontSize: '1.5vw', paddingLeft: '0.2vw', position: 'relative', top: '-0.2vw' }}></i>
                </div>
                <span className='span_div'>票数</span>
              </div>
              <span className='div_span'>36891111</span>
            </div>
            <div className='div_ flex column neirong zhongliang'>
              <div className='tow_top_div flex'>
                <div className='tow_top_div_left' style={{ background: '#FEA406' }}>
                  <i className="iconfont icon-chengzhongxitong iconfont1 " style={{ fontSize: '1.5vw', paddingLeft: '0.2vw', position: 'relative', top: '-0.2vw' }}></i>
                </div>
                <span className='span_div'>重量</span>
              </div>
              <span className='div_span'>3689</span>
            </div>
            <div className='div_ flex column neirong lirun'>
              <div className='tow_top_div flex'>
                <div className='tow_top_div_left' style={{ background: '#4973DE' }}>
                  {/* <i className="iconfont icon-meiyuan8 iconfont1 " style={{ fontSize: '25px', paddingLeft: '5px' }}></i> */}
                  <PoundCircleOutlined style={{ color: '#fff', fontSize: '1.5vw', paddingLeft: '5px', position: 'relative', top: '15%', textAlign: 'center' }} />
                </div>
                <span className='span_div'>利润</span>
              </div>
              <span className='div_span'>￡{String(3869).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
            <div className='div_ flex column neirong jieyu'>
              <div className='tow_top_div flex'>
                <div className='tow_top_div_left' style={{ background: '#29AA2C' }}>
                  {/* <i className="iconfont icon-qiandai iconfont1 " style={{ fontSize: '25px', paddingLeft: '5px' }}></i> */}
                  <PoundCircleOutlined style={{ color: '#fff', fontSize: '1.5vw', paddingLeft: '5px', position: 'relative', top: '15%', textAlign: 'center' }} />
                </div>
                <span className='span_div'>结余</span>
              </div>
              <span className='div_span'>￡{String(3869).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
            <div className='div_ flex column neirong kefu'>
              <div className='tow_top_div flex'>
                <div className='tow_top_div_left' style={{ background: '#D84FEB' }}>
                  <i className="iconfont icon-shuju iconfont1 " style={{ fontSize: '1.5vw', paddingLeft: '0.2vw', position: 'relative', top: '-0.2vw' }}></i>
                </div>
                <span className='span_div'>客服统计</span>
              </div>
              <div className='twoLines' style={{}}>
                <span className='div_span1 flex1 display_div' style={{}}><span style={{ fontSize: '12px' }}>已处理 </span> 3689111</span>
                <span className='div_span1 flex1 display_div' style={{}}><span style={{ fontSize: '12px', }}>未处理 </span> 3689</span>
              </div>
            </div>
            <div className='div_ flex column neirong hesuan'>
              <div className='tow_top_div flex'>
                <div className='tow_top_div_left' style={{ background: '#6B56D6' }}>
                  <i className="iconfont icon-jianyanyanshou iconfont1 " style={{ fontSize: '1.5vw', paddingLeft: '0.2vw', position: 'relative', top: '-0.2vw' }}></i>
                </div>
                <span className='span_div'>人工核算</span>
              </div>
              <div className='twoLines' style={{}}>
                <span className='div_span1 flex1 display_div' style={{}}><span style={{ fontSize: '12px' }}>已处理 </span> 3689111</span>
                <span className='div_span1 flex1 display_div' style={{}}><span style={{ fontSize: '12px', }}>未处理 </span> 3689</span>
              </div>

            </div>
          </div>
        </div>
        <div className='three_div flex'>
          <div className='left_div flex'>
            <div style={{ paddingLeft: '20px', width: '100%' }}>
              <Tabs defaultActiveKey="1" onChange={onChange}>
                <TabPane tab="票数统计" key="1">
                  <Row>
                    <Col span={12}>
                      <Button type="primary" style={{ height: '1.5vw', background: '#F7A21E', borderRadius: '0.5vw', lineHeight: '0', color: '#fff', borderColor: '#fff', fontSize: '0.7vw' }} onClick={() => setModalVisible2(true)}>
                        <Space>
                          租户
                          <DownOutlined />
                        </Space>
                      </Button>
                      <Modal
                        title="重量租户"
                        centered
                        visible={modalVisible2}
                        onOk={() => setModalVisible2(false)}
                        onCancel={() => setModalVisible2(false)}
                      >
                        <Select

                          defaultValue=""
                          style={{
                            width: '100%',
                          }}
                          onChange={(e) => handleChange(e)}
                          showSearch
                          onSearch={(e) => onSearch(e)}
                        >
                          {items.map(item => (
                            <Option key={item}>{item}</Option>
                          ))}
                        </Select>
                      </Modal>
                      <Button type="primary" style={{ height: '1.5vw', background: '#F7A21E', borderRadius: '0.5vw', lineHeight: '0', color: '#fff', marginLeft: '0.5vw', borderColor: '#fff', fontSize: '0.7vw' }} onClick={() => setModalVisible3(true)}>
                        <Space>
                          用户
                          <DownOutlined />
                        </Space>
                      </Button>
                      <Modal
                        title="重量用户"
                        centered
                        visible={modalVisible3}
                        onOk={() => setModalVisible3(false)}
                        onCancel={() => setModalVisible3(false)}
                      >
                        <Select
                          defaultValue=""
                          style={{
                            width: '100%',
                          }}
                          onChange={(e) => handleChange(e)}
                          showSearch
                          onSearch={(e) => onSearch(e)}
                        >
                          {items1.map(item => (
                            <Option key={item}>{item}</Option>
                          ))}
                        </Select>
                      </Modal>

                    </Col>
                    <Col span={12} className="" >
                      <div className='flex' style={{ width: '100%', textAlign: 'right', height: '100%', marginLeft: '18vw', }}>
                        <span id='d1' className={`zxt_div ${num == 1 ? 'zxt_gb' : ''}`} onClick={(e) => changestyle1(e, 1)}>日统计</span>
                        <div id='d2' className={`zxt_div ${num == 2 ? 'zxt_gb' : ''}`} onClick={(e) => changestyle1(e, 2)}>周统计</div>
                        <div id='d3' className={`zxt_div ${num == 3 ? 'zxt_gb' : ''}`} onClick={(e) => changestyle1(e, 3)}>月统计</div>
                        <div id='d4' className={`zxt_div ${num == 4 ? 'zxt_gb' : ''}`} onClick={(e) => changestyle1(e, 4)}>年统计</div>
                      </div>

                    </Col>
                  </Row>
                  <div className='time_div'>
                    <RangePicker bordered={false} defaultValue={[moment('2021/01/06', dateFormat), moment('2021/03/06', dateFormat)]}
                      format={dateFormat} style={{ width: '12vw', zIndex: '10' }} />
                  </div>
                  {/* <Row> */}
                  <Echartszxt></Echartszxt>
                  {/* </Row> */}

                </TabPane>
                <TabPane tab="重量统计" key="2">
                  <Row>
                    <Col span={12}>
                      <Button type="primary" style={{ height: '1.5vw', background: '#F7A21E', borderRadius: '0.5vw', lineHeight: '0', color: '#fff', borderColor: '#fff', fontSize: '0.7vw' }} onClick={() => setModalVisible2(true)}>
                        <Space>
                          租户
                          <DownOutlined />
                        </Space>
                      </Button>
                      <Modal
                        title="重量租户"
                        centered
                        visible={modalVisible2}
                        onOk={() => setModalVisible2(false)}
                        onCancel={() => setModalVisible2(false)}
                      >
                        <Select

                          defaultValue=""
                          style={{
                            width: '100%',
                          }}
                          onChange={(e) => handleChange(e)}
                          showSearch
                          onSearch={(e) => onSearch(e)}
                        >
                          {items.map(item => (
                            <Option key={item}>{item}</Option>
                          ))}
                        </Select>
                      </Modal>
                      <Button type="primary" style={{ height: '1.5vw', background: '#F7A21E', borderRadius: '0.5vw', lineHeight: '0', color: '#fff', marginLeft: '0.5vw', borderColor: '#fff', fontSize: '0.7vw' }} onClick={() => setModalVisible3(true)}>
                        <Space>
                          用户
                          <DownOutlined />
                        </Space>
                      </Button>
                      <Modal
                        title="重量用户"
                        centered
                        visible={modalVisible3}
                        onOk={() => setModalVisible3(false)}
                        onCancel={() => setModalVisible3(false)}
                      >
                        <Select
                          defaultValue=""
                          style={{
                            width: '100%',
                          }}
                          onChange={(e) => handleChange(e)}
                          showSearch
                          onSearch={(e) => onSearch(e)}
                        >
                          {items1.map(item => (
                            <Option key={item}>{item}</Option>
                          ))}
                        </Select>
                      </Modal>

                    </Col>
                    <Col span={12} className="" >
                      <div className='flex' style={{ width: '100%', textAlign: 'right', height: '100%', marginLeft: '18vw' }}>
                        <div id='d1' className={`zxt_div ${num == 1 ? 'zxt_gb' : ''}`} onClick={(e) => changestyle1(e, 1)}>日统计</div>
                        <div id='d2' className={`zxt_div ${num == 2 ? 'zxt_gb' : ''}`} onClick={(e) => changestyle1(e, 2)}>周统计</div>
                        <div id='d3' className={`zxt_div ${num == 3 ? 'zxt_gb' : ''}`} onClick={(e) => changestyle1(e, 3)}>月统计</div>
                        <div id='d4' className={`zxt_div ${num == 4 ? 'zxt_gb' : ''}`} onClick={(e) => changestyle1(e, 4)}>年统计</div>
                      </div>

                    </Col>
                  </Row>
                  <div className='time_div'>
                    <RangePicker bordered={false} defaultValue={[moment('2021/01/06', dateFormat), moment('2021/03/06', dateFormat)]}
                      format={dateFormat} style={{ width: '12vw', zIndex: '10' }} />
                  </div>
                  {/* <Row> */}
                  <Echartszxt1></Echartszxt1>
                  {/* </Row> */}
                </TabPane>
              </Tabs>
            </div>

          </div>
          <div className='right_div'>
            <div className='flex' style={{ width: '100%', height: '60px', flex: '1' }}>
              <div className='right_div_top flex column'></div>
              <span className='lrtj'>利润统计</span>
              <div className='company flex' style={{ width: '30%', marginLeft: '40%', height: '100%' }}>
                <div className={status == 0 ? 'ziti_div' : 'ziti_gb'} onClick={changestyle}>英镑</div>
                <div className={status1 == 0 ? 'ziti_div' : 'ziti_gb'} onClick={changestyle} style={{ marginLeft: '1vw' }}>人民币</div>

              </div>
            </div>
            <div className='time1_div'>
              <RangePicker bordered={false} defaultValue={[moment('2021/01/06', dateFormat), moment('2021/03/06', dateFormat)]}
                format={dateFormat} style={{ width: '11.5vw', zIndex: '10' }} />
            </div>
            <Echartszx></Echartszx>
          </div>

        </div>
        <div className='four_div flex'>
          <div className='left_div flex'>
            <div className='four_left_div'>
              <div className='' style={{
                width: '100%',
                height: '2.5vw'
              }}>
                <table></table>
                <div className='four_top_left_div'></div>
                <span className='four_span'>金额统计</span>
              </div>
              <div className='four_bottom_left_div'>
                <div className='content_div'>
                  <p className='monery_p'>￡568970.368</p>
                  <p className='result'>
                    {/* <i className="iconfont icon-meiyuan8  " style={{ fontSize: '25px', paddingLeft: '5px', color: '#2BB33A' }}></i> */}
                    <PoundCircleOutlined style={{ fontSize: '1.5vw', paddingRight: '0.5vw', paddingTop: '0.5vw', color: '#2BB33A' }} />
                    总数</p>
                </div>
                {/* <div className='' style={{ background: 'red', width: '200px', height: '300px' }}> */}

                {/* </div> */}
              </div>



            </div>
            <div className='four_right_div' style={{ width: '100%', height: '100%', padding: '20px' }}>
              <div className='four_top_time'>
                <RangePicker bordered={false} defaultValue={[moment('2021/01/06', dateFormat), moment('2021/03/06', dateFormat)]}
                  format={dateFormat} style={{ width: '11.5vw' }} />
              </div>
              <div style={{ height: '80%' }}>
                <div className='flex column flex1 jdt' >
                  <Row style={{ height: '100%' }}>
                    <Col span={1} >
                      {/* <i className="iconfont icon-meiyuan8" style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }}></i> */}
                      <PoundCircleOutlined style={{ fontSize: '1vw', position: 'relative', top: '0.7vw', color: '#F2F3F5' }} />
                    </Col>
                    <Col span={23}>
                      <Row style={{ width: '100%' }}>
                        <Col span={12}>
                          <div style={{}}>
                            <span style={{ fontSize: '0.9vw', fontWeight: 'bold' }}>已开票&nbsp;</span><span>未支付&nbsp;</span><span>25%</span>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'right', fontSize: '0.8vw', fontWeight: 'bold' }}>
                            ￡<span>{String(6859.23).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Progress percent={85} style={{ width: '98%' }} showInfo={false} />
                      </Row>
                    </Col>
                  </Row>
                </div>
                <div className='flex column flex1 jdt' >
                  <Row style={{ height: '100%' }}>
                    <Col span={1} >
                      {/* <i className="iconfont icon-meiyuan8" style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }}></i> */}
                      <PoundCircleOutlined style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }} />
                    </Col>
                    <Col span={23}>
                      <Row style={{ width: '100%' }}>
                        <Col span={12}>
                          <div style={{}}>
                            <span style={{ fontSize: '0.9vw', fontWeight: 'bold' }}>已开票&nbsp;</span><span>未支付&nbsp;</span><span>25%</span>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'right', fontSize: '0.8vw', fontWeight: 'bold' }}>
                            ￡<span>{String(6859.23).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Progress percent={85} style={{ width: '98%' }} showInfo={false} />
                      </Row>
                    </Col>
                  </Row>
                </div>
                <div className='flex column flex1 jdt' >
                  <Row style={{ height: '100%' }}>
                    <Col span={1} >
                      {/* <i className="iconfont icon-meiyuan8" style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }}></i> */}
                      <PoundCircleOutlined style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }} />
                    </Col>
                    <Col span={23}>
                      <Row style={{ width: '100%' }}>
                        <Col span={12}>
                          <div style={{}}>
                            <span style={{ fontSize: '0.9vw', fontWeight: 'bold' }}>已开票&nbsp;</span><span>未支付&nbsp;</span><span>25%</span>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'right', fontSize: '0.8vw', fontWeight: 'bold' }}>
                            ￡<span>{String(6859.23).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Progress percent={85} style={{ width: '98%' }} showInfo={false} />
                      </Row>
                    </Col>
                  </Row>
                </div>
                <div className='flex column flex1 jdt' >
                  <Row style={{ height: '100%' }}>
                    <Col span={1} >
                      {/* <i className="iconfont icon-meiyuan8" style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }}></i> */}
                      <PoundCircleOutlined style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }} />
                    </Col>
                    <Col span={23}>
                      <Row style={{ width: '100%' }}>
                        <Col span={12}>
                          <div style={{}}>
                            <span style={{ fontSize: '0.9vw', fontWeight: 'bold' }}>余额</span>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: 'red' }}>
                            ￡<span>
                              {String(-2568.36).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            </span>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Progress percent={40} status="exception" style={{ width: '98%' }} showInfo={false} />
                      </Row>
                    </Col>

                  </Row>
                </div>
              </div>


            </div>
          </div>
          <div className='right_div'>
            <div className='flex' style={{ width: '100%', height: '2vw', flex: '1' }}>
              <div className='four_right_top flex column' ></div>
              <span className='jytj'>结余统计</span>
              <div className='time2_div'>
                <RangePicker bordered={false} defaultValue={[moment('2021/01/06', dateFormat), moment('2021/03/06', dateFormat)]}
                  format={dateFormat} style={{ width: '11.5vw' }} />
              </div>
            </div>
            <Echartstest></Echartstest>
          </div>

        </div>
      </div>

      {/* <h1>首页</h1> */}
      {/* {process.env.REACT_APP_MOCK ? (
        <Button
          onClick={async () => {
            await props.ajax.post('/initDB', null, { successTip: '数据库重置成功！' });
            setTimeout(() => window.location.reload(), 2000);
          }}
        >
          重置数据库
        </Button>
      ) : null} */}
    </PageContent >
  );
});
