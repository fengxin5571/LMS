// import {Redirect} from 'react-router-dom';
import {
    Button,
    Tabs,
    Dropdown,
    Menu,
    Space,
    message,
    Col,
    Row,
    Progress,
    DatePicker,
    Modal,
    Select,
    ConfigProvider,
    Spin, Form
} from 'antd';
import {PageContent, getLoginUser, FormItem, setLoginUser,} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import styles from './style.less';
import {DownOutlined, UserOutlined, SwapOutlined, PoundCircleOutlined, LoadingOutlined} from '@ant-design/icons';
import './style.css'
import './iconfont/iconfont.css'
import Echartstest from './bingtu'
import Echartszx from './zhuxingtu'
import Echartszxt from './zhexian'
import Echartszxt1 from './zhexian2'
import moment from 'moment';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import {FormattedMessage, IntlProvider} from 'react-intl';
import {convertToFormData} from "src/commons/common";
import {getLange, setLange} from 'src/commons';
import {DRAW} from 'src/config';

import React, {useState, useEffect} from 'react';
import {number} from 'echarts/lib/export';

export default config({
    path: '/',
    title: '首页',
})(function Home(props) {
    // 如果其他页面作为首页，直接重定向，config中不要设置title，否则tab页中会多个首页
    // return <Redirect to="/users"/>;
    const {TabPane} = Tabs;
    const loginUser = getLoginUser();
    const [numkey, setNumkey] = useState('1')
    const [timeData, setTimeData] = useState([]);
    const [single, setSingle] = useState([]);
    const [timeData1, setTimeData1] = useState([]);
    const [single1, setSingle1] = useState([]);
    const [pieChart, setPieChart] = useState({});
    //首页api按钮 fx
    const [homeApiMenus] = useState(JSON.parse(window.sessionStorage.getItem('homeApiMenus-' + loginUser?.id)) || []);
    //首页quick按钮 fx
    const [homeQuickMenus] = useState(JSON.parse(window.sessionStorage.getItem('homeQuickMenus-' + loginUser?.id)) || [])
    const [changeAccountVisible, setChangeAccountVisible] = useState(false);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [form] = Form.useForm();
    // 下拉框租户
    const [items, setItems] = useState([]);
    // 下拉框用户
    const [items1, setItems1] = useState([]);

    // 随机生成颜色
    const [randomRgbColor, setRandomRgbColor] = useState(['#6599FE', '#F94242', '#FE9200', '#01BB00', '#FFB6C1', '	#40E0D0'])
    /**
     * 随机颜色apibtn fx
     */
    const [randomNum] = useState(() => {
        var map = [];
        homeApiMenus.map((item, key) => {
            map.push(Math.floor(Math.random() * 5))
        });
        return map;
    })
    /**
     * 随机颜色quickbtn fx
     */
    const [randomNum1] = useState(() => {
        var map = [];
        homeQuickMenus.map((item, key) => {
            map.push(Math.floor(Math.random() * 5))
        });
        return map;
    });
    const [subscript, setSubscript] = useState()
    const onChange = async (key) => {
        // console.log(key);
        setNumkey(key)
    };
    const [status, setStatus] = useState('pound');
    // const [status1, setStatus1] = useState(0);
    const [num, setNum] = useState('Weekly');
    const [num1, setNum1] = useState('Weekly');
    const {Option} = Select;
    const [locale, setLocale] = useState();
    const [antLocale, setAntLocale] = useState()
    // 票数租户
    const [modalVisible, setModalVisible] = useState(false);
    // 票数用户
    const [modalVisible1, setModalVisible1] = useState(false);
    // 重量租户
    const [modalVisible2, setModalVisible2] = useState(false);
    // 重量用户
    const [modalVisible3, setModalVisible3] = useState(false);


    const [lang, setLang] = useState(getLange(loginUser?.id))

    const {RangePicker} = DatePicker;
    const dateFormat = 'YYYY/MM/DD';

    // 下拉框
    const handleChange = (value) => {
        // console.log(value);
        const companyList = items.filter(item => item.TenantId == value)?.pop()?.CmpList || [];
        // console.log(companyList);
        setItems1(companyList)
    }
    // 下拉框搜索
    const onSearch = (value) => {
        // console.log('search:', value);
    };

    const [starttime, setSatrttime] = useState(new Date())
    const [starttime1, setSatrttime1] = useState(new Date())
    // 金额统计
    const [money, setMoney] = useState({})
    // 票数
    const [votesNum, setVotesNum] = useState(0)
    // 重量
    const [weightNum, setWeightNum] = useState(0)
    // 利润
    const [profitNum, setProfitNum] = useState(0)
    // 结余
    const [balanceNum, setBalanceNum] = useState(0)
    // 客服统计
    // 未处理
    const [processedNum, setProcessedNum] = useState(0)
    // 未处理
    const [notprocessedNum, setNotprocessedNum] = useState(0)
    // 人工核算
    const [processedNum1, setProcessedNum1] = useState(0)
    // 未处理
    const [notprocessedNum1, setNotprocessedNum1] = useState(0)
    /**
     * 页面双语、错误弹窗处理 fx
     */
    useEffect(async () => {
        const resp = await fetch(window.location.origin + `/lang/${lang}.json`)
        const data = await resp.json();
        const localization = await fetch(window.location.origin + `/lang/${lang}_Localization.json`);
        const errorJson = await localization.json();
        setAntLocale(lang == "zh_CN" ? zhCN : enUS);
        window.sessionStorage.setItem("error-json-" + loginUser?.id, JSON.stringify(errorJson));
        setLocale(data);
        setSubscript(randomNum[Math.floor(Math.random() * randomNum.length)])
    }, [lang]);
    /**
     * 获取租户、公司 fx
     */
    useEffect(async () => {
        const res = await props.ajax.get('/Proj/GetCmpTenantList', null, {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        res.map(item => {
            item.label = item.TenantName;
            item.value = item.TenantId
        })
        res.unshift({label: getLange(props.loginUser?.id) == "zh_CN" ? "控制台" : "Console", value: null});
        setTenantOptions(res);
    }, []);

    /**
     * 租户、公司联动fx
     * @param value
     */
    const handleTenantChange = (value) => {
        form.setFieldsValue({CompanyId: null});
        const companyList = tenantOptions.filter(item => item.TenantId == value)?.pop()?.CmpList || [];
        companyList.map(item => {
            item.label = item.CompanyName;
            item.value = item.CompanyId
        });
        companyList.unshift({label: getLange(props.loginUser?.id) == "zh_CN" ? "控制台" : "Console", value: null})
        setCompanyOptions(companyList)
    };
    /**
     * 切换账号 fx
     * @returns {Promise<void>}
     */
    const handleChangeAccount = async () => {
        const values = form.getFieldsValue(true);
        if (JSON.stringify(values) === '{}') return;
        const res = await props.ajax.post('Account/LoginAs', convertToFormData(values), {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        //处理登录后的用户信息
        const LoginUser = {
            'id': res.UserId,
            'name': res.UserName,
            'token': loginUser?.token,
            'CompanyId': res.CompanyId,
            'DepartmentRole': res.DepartmentRole,
            'TenantId': res.TenantId,
            'Menus': res.Menus,
        };
        console.log(LoginUser);
        window.sessionStorage.clear();
        window.sessionStorage.setItem('last-href', window.location.href);
        setLoginUser(LoginUser);
        setLange(LoginUser.id, lang);
        const homeApiMenus = res.Menus.filter(item => item.ActionType == 1 && item.Name != "BusinessManagement");
        window.sessionStorage.setItem('homeApiMenus-' + res.UserId, JSON.stringify(homeApiMenus || []));
        const homeQuickMenus = res.Menus.filter(item => item.ActionType != 1 && item.Shortcut);
        window.sessionStorage.setItem('homeQuickMenus-' + res.UserId, JSON.stringify(homeQuickMenus || []));
        window.location.reload();
    }
    useEffect(async () => {
        // starttime.
        // setNum()

        // 票数统计
        const votes = await props.ajax.post("DbGrid/Statistics", convertToFormData({
            'DbGridName': 'Shipment Orders',
            'X': 'ShipmentDate',
            'draw': DRAW,
            'Frequency': 'Weekly',
            'Calculation': 'Count',

        }), {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        // console.log(votes);
        setTimeData(votes.data.X)
        setSingle(votes.data.Y)

        // 重量统计
        const weightres = await props.ajax.post("DbGrid/Statistics", convertToFormData({
            'DbGridName': 'Shipment Orders',
            'X': 'ShipmentDate',
            'draw': DRAW,
            'Frequency': num1,
            'Calculation': 'Sum',
            'Y': 'DeclaredWeight'
        }), {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        // console.log(weightres);
        setTimeData1(weightres.data.X)

        weightres.data.Y = weightres.data.Y.map(item => {
            // console.log(item);
            var num = item.trim();
            var ss = num.toString();
            if (ss.length == 0) {
                return "0";
            }
            return ss.replace(/,/g, "");
        })
        setSingle1(weightres.data.Y)


        // 租户
        const tenant = await props.ajax.get("Proj/GetCmpTenantList", {}, {});
        // console.log(tenant);
        setItems(tenant)
        // sessionStorage.setItem('username', 'uiu');


        // 金额统计
        const amount = await props.ajax.post("Proj/InvoiceSummary", convertToFormData({}), {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        // console.log(amount);
        setMoney(amount)


        // 结余统计
        const balance = await props.ajax.post("Proj/DepartmentBalance", convertToFormData({}), {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        setPieChart(balance)


        // 统计
        const statistics = await props.ajax.post("Proj/Summary", convertToFormData({}), {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        // 票数
        const a = statistics.Shipments.Printed + statistics.Shipments.NotScanned + statistics.Shipments.Closed
        setVotesNum(a)
        // 重量
        const b = statistics.Weight.DeclaredWeight + statistics.Weight.ScannedWeight + statistics.Weight.ScannedDecalredWeight
        setWeightNum(b)
        // 利润
        const c = statistics.Profit.Value
        setProfitNum(c)
        // 结余
        const d = statistics.TotalCredit.Value
        setBalanceNum(d)
        // 客服统计
        // 未处理
        const e = statistics.CustomerSupportCases.InProgress + statistics.CustomerSupportCases.WaitApproval
        setProcessedNum(e)
        // 未处理
        const f = statistics.CustomerSupportCases.Closed
        setNotprocessedNum(f)
        // 人工核算
        const g = statistics.WorkRequests.InProgress + statistics.WorkRequests.WaitApproval
        setProcessedNum1(g)
        // 未处理
        const h = statistics.WorkRequests.Closed
        setNotprocessedNum1(h)


    }, [setTimeData, setSingle, setTimeData1, setSingle, setMoney, setPieChart])

    const [modanum, setModanum] = useState(0)
    const handleModal = () => {
        const jurisdiction = JSON.parse(sessionStorage.getItem('react-admin_login_user'))
        if (jurisdiction.CompanyId == null && jurisdiction.TenantId == null) {
            setModalVisible(true)
        } else {
            setModalVisible(false)
        }
    }
    const confirmButton = () => {
        setModalVisible(false)
        // setModanum(1)
    }
    const handleModal1 = () => {
        const jurisdiction = JSON.parse(sessionStorage.getItem('react-admin_login_user'))
        if (jurisdiction.CompanyId == null && jurisdiction.TenantId == null) {
            setModalVisible1(true)
        } else {
            setModalVisible1(false)
        }
    }

    const confirmButton1 = () => {
        setModalVisible1(false)
        // setModanum(0)
    }

    // 美元人民币切换
    const changestyle = (e, index) => {
        // console.log(e, index);
        setStatus(index)

    }

    // 票数统计切换
    const changestyle1 = async (e, index) => {
        // console.log(index);
        const votes = await props.ajax.post("DbGrid/Statistics", convertToFormData({
            'DbGridName': 'Shipment Orders',
            'X': 'ShipmentDate',
            'draw': DRAW,
            'Frequency': index,
            'Calculation': 'Count',

        }), {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        // console.log(votes);
        setTimeData(votes.data.X)
        setSingle(votes.data.Y)
        setNum(index)

    }

    // 重量统计切换
    const changestyle2 = async (e, index) => {
        // console.log(index);
        const weightres = await props.ajax.post("DbGrid/Statistics", convertToFormData({
            'DbGridName': 'Shipment Orders',
            'X': 'ShipmentDate',
            'draw': DRAW,
            'Frequency': index,
            'Calculation': 'Sum',
            'Y': 'DeclaredWeight'
        }), {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        // console.log(weightres);
        setTimeData1(weightres.data.X)
        weightres.data.Y = weightres.data.Y.map(item => {
            // console.log(item);
            var num = item.trim();
            var ss = num.toString();
            if (ss.length == 0) {
                return "0";
            }
            return ss.replace(/,/g, "");
        })
        setSingle1(weightres.data.Y)
        setNum1(index)
    }


    const handelTime = async (date, dateString, info) => {
        // console.log(date, dateString, info);
        var startDate = ''
        var endDate = ''
        if (numkey == '1') {
            startDate = dateString[0];
            endDate = dateString[1];
        } else {
            // console.log('2');
            startDate = dateString[0];
            endDate = dateString[1];
        }

        // console.log(startDate, endDate);

        if (info.range == 'end') {
            const start = startDate.split("/")
            var startDate1 = ''
            if (start[1] < 10 && start[2] < 10) {
                startDate1 = start[0] + '年' + start[1][1] + '月' + start[2][1] + '日'
            } else if (start[1] < 10) {
                startDate1 = start[0] + '年' + start[1][1] + '月' + start[2] + '日'
            } else if (start[2] < 10) {
                startDate1 = start[0] + '年' + start[1] + '月' + start[2][1] + '日'
            } else {
                startDate1 = start[0] + '年' + start[1] + '月' + start[2] + '日'
            }
            const end = endDate.split("/")
            var endDate1 = ''
            // console.log(end[2]);
            if (end[1] < 10 && end[2] < 10) {
                endDate1 = end[0] + '年' + end[1][1] + '月' + end[2][1] + '日'
            } else if (end[1] < 10) {
                endDate1 = end[0] + '年' + end[1][1] + '月' + end[2] + '日'
            } else if (end[2] < 10) {
                endDate1 = end[0] + '年' + end[1] + '月' + end[2][1] + '日'
            } else {
                endDate1 = end[0] + '年' + end[1] + '月' + end[2] + '日'
            }

            if (numkey == '1') {
                const res = await props.ajax.post("DbGrid/Statistics", convertToFormData({
                    'DbGridName': 'Shipment Orders',
                    'X': 'ShipmentDate',
                    'draw': DRAW,
                    'Frequency': 'Daily',
                    'Calculation': 'Count',

                }), {
                    errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
                })
                // console.log(res.data);
                const b = res.data.X.indexOf(startDate1)
                const c = res.data.X.indexOf(endDate1)
                const d = res.data.X.slice(b, c)
                const e = res.data.Y.slice(b, c)

                setTimeData(d)
                setSingle(e)
                setNum('Daily')
            } else {
                // console.log(123);
                const res = await props.ajax.post("DbGrid/Statistics", convertToFormData({
                    'DbGridName': 'Shipment Orders',
                    'X': 'ShipmentDate',
                    'draw': DRAW,
                    'Frequency': 'Daily',
                    'Calculation': 'Sum',
                    'Y': 'DeclaredWeight'
                }), {
                    errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
                })
                // console.log(res.data);
                const b = res.data.X.indexOf(startDate1)
                const c = res.data.X.indexOf(endDate1)
                const d = res.data.X.slice(b, c)
                const e = res.data.Y.slice(b, c)

                setTimeData1(d)
                setSingle1(e)
                setNum1('Daily')
            }

        }
    }


    return (
        <IntlProvider locale="en" messages={locale}>
            <ConfigProvider locale={antLocale}>
                <PageContent className={styles.root}>
                    <Modal
                        visible={changeAccountVisible}
                        title={<FormattedMessage id="SwitchAccount"/>}
                        onCancel={() => setChangeAccountVisible(false)}
                        onOk={() => setChangeAccountVisible(false) || handleChangeAccount()}
                    >
                        <Form form={form}>
                            <FormItem
                                label={<FormattedMessage id="TenantId"/>}
                                name="TenantId"
                                placeholder="TenantId"
                                options={tenantOptions}
                                onChange={handleTenantChange}
                            />
                            <FormItem
                                label={<FormattedMessage id="CompanyId"/>}
                                name="CompanyId"
                                placeholder="CompanyId"
                                options={companyOptions}
                            />
                        </Form>
                    </Modal>
                    <div className='box column' styles>
                        <div className='one_div flex column'>
                            <div className='top_div flex '>
                <span className=''
                      style={{marginLeft: '10px'}}>{getLange(props.loginUser?.id) == "zh_CN" ? "快捷操作" : "Shortcut"}</span>
                            </div>
                            <div className='bottom_div flex'>
                                <div className='div1_ flex'>
                                    {homeApiMenus.map((item, k) => {
                                        // console.log(randomRgbColor[key]);
                                        const {run: ajaxHomeBtn} = item.ActionHttpMethod == 1 ? props.ajax.useGet(item.UiRouter, null) : (item.ActionHttpMethod == 2 ? props.ajax.usePost(item.UiRouter, null) : props.ajax.useDel(item.UiRouter, null));
                                        const handleHomeBtn = async () => {
                                            await ajaxHomeBtn(null, {
                                                successTip: getLange(props.loginUser?.id) == "zh_CN" ? "操作成功" : "Operator Successfully",
                                                errorModal: {
                                                    okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"),
                                                    width: "70%"
                                                },
                                            });
                                        }
                                        return (
                                            <>
                                                <div className='div2_ flex column' style={{marginLeft: '32px'}}
                                                     onClick={() => handleHomeBtn()}>
                                                    <div className='circular'
                                                         style={{background: randomRgbColor[randomNum[k]]}}>
                                                        {React.createElement(require('@ant-design/icons')[item.Icon||"BlockOutlined"],{style:{
                                                                fontSize: '2vw',
                                                                color: '#fff',
                                                                position: 'relative',
                                                                top: '1vw'
                                                            }})}
                                                    </div>
                                                    <p className='p_div'><FormattedMessage id={item.Name}/></p>
                                                </div>
                                            </>
                                        )
                                    })}
                                    {homeQuickMenus.map((item, k) => {
                                        return (
                                            <>
                                                <div className='div2_ flex column' style={{marginLeft: '32px'}}
                                                     onClick={()=>props.history.push(item.Name == "BusinessManagement" ? "/BusinessManagement" : (item.Name == "/" ? "/" : "/Dynamic/" + item.Name.replace(new RegExp(/( )/g), "_")))}>
                                                    <div className='circular'
                                                         style={{background: randomRgbColor[randomNum1[k]]}}>
                                                        {React.createElement(require('@ant-design/icons')[item.Icon||"BlockOutlined"],{style:{
                                                                fontSize: '2vw',
                                                                color: '#fff',
                                                                position: 'relative',
                                                                top: '1vw'
                                                            }})}
                                                    </div>
                                                    <p className='p_div'><FormattedMessage id={item.Name}/></p>
                                                </div>
                                            </>
                                        )
                                    })}
                                    <div className='div2_ flex column' style={{marginLeft: '1.5vw'}}>
                                        <div className='circular' style={{background: '#C7C7C7'}}
                                             onClick={() => setChangeAccountVisible(true)}>
                                            <SwapOutlined style={{
                                                fontSize: '2vw',
                                                color: '#fff',
                                                position: 'relative',
                                                top: '1vw'
                                            }}/>
                                        </div>
                                        <p className='p_div'>
                                            {getLange(props.loginUser?.id) == "zh_CN" ? "切换账号" : "Switch account"}</p>
                                    </div>
                                </div>
                                {/* <div className='div1_'></div> */}
                            </div>
                        </div>
                        <div className='two_div '>
                            <div className='two_top_div'>
                                <RangePicker bordered={false}
                                             format={dateFormat} style={{width: '14vw', fontSize: '0.5vw'}}/>
                            </div>
                            <div className='flex zydq'>
                                <div className='div_ flex column neirong piaoshu'>
                                    <div className='tow_top_div flex'>
                                        <div className='tow_top_div_left' style={{background: '#E74748'}}>
                                            <i className="iconfont icon-fukuan iconfont1 " style={{
                                                fontSize: '1.5vw',
                                                paddingLeft: '0.2vw',
                                                position: 'relative',
                                                top: '-0.2vw'
                                            }}></i>
                                        </div>
                                        <span
                                            className='span_div'>{getLange(props.loginUser?.id) == "zh_CN" ? "票数" : "Number of votes"}</span>
                                    </div>
                                    <span className='div_span'>{votesNum}</span>
                                </div>
                                <div className='div_ flex column neirong zhongliang'>
                                    <div className='tow_top_div flex'>
                                        <div className='tow_top_div_left' style={{background: '#FEA406'}}>
                                            <i className="iconfont icon-chengzhongxitong iconfont1 " style={{
                                                fontSize: '1.5vw',
                                                paddingLeft: '0.2vw',
                                                position: 'relative',
                                                top: '-0.2vw'
                                            }}></i>
                                        </div>
                                        <span
                                            className='span_div'>{getLange(props.loginUser?.id) == "zh_CN" ? "重量" : "weight"}</span>
                                    </div>
                                    <span className='div_span'>{weightNum}</span>
                                </div>
                                <div className='div_ flex column neirong lirun'>
                                    <div className='tow_top_div flex'>
                                        <div className='tow_top_div_left' style={{background: '#4973DE'}}>
                                            {/* <i className="iconfont icon-meiyuan8 iconfont1 " style={{ fontSize: '25px', paddingLeft: '5px' }}></i> */}
                                            <PoundCircleOutlined style={{
                                                color: '#fff',
                                                fontSize: '1.5vw',
                                                paddingLeft: '5px',
                                                position: 'relative',
                                                top: '15%',
                                                textAlign: 'center'
                                            }}/>
                                        </div>
                                        <span
                                            className='span_div'>{getLange(props.loginUser?.id) == "zh_CN" ? "利润" : "profit"}</span>
                                    </div>
                                    <span
                                        className='div_span'>￡{String(profitNum).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                                </div>
                                <div className='div_ flex column neirong jieyu'>
                                    <div className='tow_top_div flex'>
                                        <div className='tow_top_div_left' style={{background: '#29AA2C'}}>
                                            {/* <i className="iconfont icon-qiandai iconfont1 " style={{ fontSize: '25px', paddingLeft: '5px' }}></i> */}
                                            <PoundCircleOutlined style={{
                                                color: '#fff',
                                                fontSize: '1.5vw',
                                                paddingLeft: '5px',
                                                position: 'relative',
                                                top: '15%',
                                                textAlign: 'center'
                                            }}/>
                                        </div>
                                        <span
                                            className='span_div'>{getLange(props.loginUser?.id) == "zh_CN" ? "结余" : "balance"}</span>
                                    </div>
                                    <span
                                        className='div_span'>￡{String(balanceNum).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                                </div>
                                <div className='div_ flex column neirong kefu'>
                                    <div className='tow_top_div flex'>
                                        <div className='tow_top_div_left' style={{background: '#D84FEB'}}>
                                            <i className="iconfont icon-shuju iconfont1 " style={{
                                                fontSize: '1.5vw',
                                                paddingLeft: '0.2vw',
                                                position: 'relative',
                                                top: '-0.2vw'
                                            }}></i>
                                        </div>
                                        <span
                                            className='span_div'>{getLange(props.loginUser?.id) == "zh_CN" ? "客服统计" : "Customer service statistics"}</span>
                                    </div>
                                    <div className='twoLines' style={{}}>
                    <span className='div_span1 flex1 display_div' style={{}}><span
                        style={{fontSize: '12px'}}>{getLange(props.loginUser?.id) == "zh_CN" ? "已处理" : "Processed"} </span> {processedNum}</span>
                                        <span className='div_span1 flex1 display_div' style={{}}><span
                                            style={{fontSize: '12px',}}>{getLange(props.loginUser?.id) == "zh_CN" ? "未处理" : "Not processed"} </span> {notprocessedNum}</span>
                                    </div>
                                </div>
                                <div className='div_ flex column neirong hesuan'>
                                    <div className='tow_top_div flex'>
                                        <div className='tow_top_div_left' style={{background: '#6B56D6'}}>
                                            <i className="iconfont icon-jianyanyanshou iconfont1 " style={{
                                                fontSize: '1.5vw',
                                                paddingLeft: '0.2vw',
                                                position: 'relative',
                                                top: '-0.2vw'
                                            }}></i>
                                        </div>
                                        <span
                                            className='span_div'>{getLange(props.loginUser?.id) == "zh_CN" ? "人工核算" : "Manual accounting"}</span>
                                    </div>
                                    <div className='twoLines' style={{}}>
                    <span className='div_span1 flex1 display_div' style={{}}><span
                        style={{fontSize: '12px'}}>{getLange(props.loginUser?.id) == "zh_CN" ? "已处理" : "Processed"} </span> {processedNum1}</span>
                                        <span className='div_span1 flex1 display_div' style={{}}><span
                                            style={{fontSize: '12px',}}>{getLange(props.loginUser?.id) == "zh_CN" ? "未处理" : "Not processed"} </span> {notprocessedNum1}</span>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className='divVad three_div flex'>
                            <div className='divVad left_div flex'>
                                <div style={{paddingLeft: '20px', width: '100%'}}>
                                    <Tabs defaultActiveKey="1" onChange={onChange}>
                                        <TabPane
                                            tab={getLange(loginUser?.id) == "zh_CN" ? "票数统计" : "Statistics of votes"}
                                            key="1">
                                            <Row>
                                                <Col span={12}>
                                                    <Button type="primary" style={{
                                                        height: '1.5vw',
                                                        background: '#F7A21E',
                                                        borderRadius: '0.5vw',
                                                        lineHeight: '0',
                                                        color: '#fff',
                                                        borderColor: '#fff',
                                                        fontSize: '0.7vw'
                                                    }} onClick={(e) => handleModal(e)}>
                                                        <Space>
                                                            {getLange(loginUser?.id) == "zh_CN" ? '租户' : 'tenant'}
                                                            <DownOutlined/>
                                                        </Space>
                                                    </Button>
                                                    <Modal
                                                        title={getLange(loginUser?.id) == "zh_CN" ? '租户' : "tenant"}
                                                        centered
                                                        visible={modalVisible}
                                                        onOk={() => setModalVisible(false)}
                                                        onCancel={(e) => confirmButton(e)}
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
                                                                // console.log(item)
                                                                <Option key={item.TenantId}>{item.TenantName}</Option>
                                                            ))}
                                                        </Select>
                                                    </Modal>
                                                    <Button type="primary" style={{
                                                        height: '1.5vw',
                                                        background: '#F7A21E',
                                                        borderRadius: '0.5vw',
                                                        lineHeight: '0',
                                                        color: '#fff',
                                                        marginLeft: '0.5vw',
                                                        borderColor: '#fff',
                                                        fontSize: '0.7vw'
                                                    }} onClick={(e) => handleModal1(e)}>
                                                        <Space>
                                                            {getLange(loginUser?.id) == "zh_CN" ? '公司' : 'company'}
                                                            <DownOutlined/>
                                                        </Space>
                                                    </Button>
                                                    <Modal
                                                        title={getLange(loginUser?.id) == "zh_CN" ? '公司' : "company"}
                                                        centered
                                                        visible={modalVisible1}
                                                        onOk={() => setModalVisible1(false)}
                                                        onCancel={(e) => confirmButton1(e)}
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
                                                                // console.log(item)
                                                                <Option key={item.CompanyId}>{item.CompanyName}</Option>
                                                            ))}
                                                        </Select>
                                                    </Modal>

                                                </Col>
                                                <Col span={12} className="">
                                                    <div className='move flex' style={{
                                                        width: '100%',
                                                        textAlign: 'right',
                                                        height: '100%',
                                                        marginLeft: '30%',
                                                    }}>
                            <span id='d1'
                                  className={`zxt_div ${num == 'Daily' ? 'zxt_gb' : ''}`}
                                  onClick={(e) => changestyle1(e, 'Daily')}>{getLange(loginUser?.id) == "zh_CN" ? '日统计' : 'Daily'}</span>
                                                        <div id='d2'
                                                             className={`zxt_div ${num == 'Weekly' ? 'zxt_gb' : ''}`}
                                                             onClick={(e) => changestyle1(e, 'Weekly')}>{getLange(loginUser?.id) == "zh_CN" ? '周统计' : 'Weekly'}</div>
                                                        <div id='d3'
                                                             className={`zxt_div ${num == 'Monthly' ? 'zxt_gb' : ''}`}
                                                             onClick={(e) => changestyle1(e, 'Monthly')}>{getLange(loginUser?.id) == "zh_CN" ? '月统计' : 'Monthly'}</div>
                                                        <div id='d4'
                                                             className={`zxt_div ${num == 'Yearly' ? 'zxt_gb' : ''}`}
                                                             onClick={(e) => changestyle1(e, 'Yearly')}>{getLange(loginUser?.id) == "zh_CN" ? '年统计' : 'Yearly'}</div>
                                                    </div>

                                                </Col>
                                            </Row>
                                            <div className='time_div'>
                                                <RangePicker bordered={false} onCalendarChange={handelTime}
                                                             format={dateFormat} style={{width: '12vw', zIndex: '10'}}/>
                                                {/* <RangePicker bordered={false} onCalendarChange={handelTime} defaultValue={[moment(new Date(), dateFormat), moment(new Date(), dateFormat)]}
                        format={dateFormat} style={{ width: '12vw', zIndex: '10' }} /> */}
                                            </div>
                                            {/* <Row> */}
                                            <Echartszxt timeData={timeData} single={single} getLange={getLange}
                                                        loginUser={loginUser}></Echartszxt>
                                            {/* </Row> */}

                                        </TabPane>
                                        <TabPane tab={getLange(loginUser?.id) == "zh_CN" ? "重量统计" : "Weight statistics"}
                                                 key="2">
                                            <Row>
                                                <Col span={12}>
                                                    <Button type="primary" style={{
                                                        height: '1.5vw',
                                                        background: '#F7A21E',
                                                        borderRadius: '0.5vw',
                                                        lineHeight: '0',
                                                        color: '#fff',
                                                        borderColor: '#fff',
                                                        fontSize: '0.7vw'
                                                    }} onClick={(e) => handleModal(e)}>
                                                        <Space>
                                                            {getLange(loginUser?.id) == "zh_CN" ? '租户' : 'tenant'}

                                                            <DownOutlined/>
                                                        </Space>
                                                    </Button>
                                                    <Modal
                                                        title={getLange(loginUser?.id) == "zh_CN" ? '租户' : "tenant"}

                                                        centered
                                                        visible={modalVisible2}
                                                        onOk={() => setModalVisible(false)}
                                                        onCancel={(e) => confirmButton(e)}
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
                                                                // console.log(item)
                                                                <Option key={item.TenantId}>{item.TenantName}</Option>
                                                            ))}
                                                        </Select>
                                                    </Modal>
                                                    <Button type="primary" style={{
                                                        height: '1.5vw',
                                                        background: '#F7A21E',
                                                        borderRadius: '0.5vw',
                                                        lineHeight: '0',
                                                        color: '#fff',
                                                        marginLeft: '0.5vw',
                                                        borderColor: '#fff',
                                                        fontSize: '0.7vw'
                                                    }} onClick={(e) => handleModal1(e)}>
                                                        <Space>
                                                            {getLange(loginUser?.id) == "zh_CN" ? '公司' : 'company'}
                                                            <DownOutlined/>
                                                        </Space>
                                                    </Button>
                                                    <Modal
                                                        title={getLange(loginUser?.id) == "zh_CN" ? '公司' : "company"}
                                                        centered
                                                        visible={modalVisible3}
                                                        onOk={() => setModalVisible1(false)}
                                                        onCancel={(e) => confirmButton1(e)}
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
                                                                <Option key={item.CompanyId}>{item.CompanyName}</Option>
                                                            ))}
                                                        </Select>
                                                    </Modal>

                                                </Col>
                                                <Col span={12} className="">
                                                    <div className='move flex' style={{
                                                        width: '100%',
                                                        textAlign: 'right',
                                                        height: '100%',
                                                        marginLeft: '30%'
                                                    }}>
                            <span id='d1'
                                  className={`zxt_div ${num1 == 'Daily' ? 'zxt_gb' : ''}`}
                                  onClick={(e) => changestyle2(e, 'Daily')}>{getLange(loginUser?.id) == "zh_CN" ? '日统计' : 'Daily'}</span>
                                                        <div id='d2'
                                                             className={`zxt_div ${num1 == 'Weekly' ? 'zxt_gb' : ''}`}
                                                             onClick={(e) => changestyle2(e, 'Weekly')}>{getLange(loginUser?.id) == "zh_CN" ? '周统计' : 'Weekly'}</div>
                                                        <div id='d3'
                                                             className={`zxt_div ${num1 == 'Monthly' ? 'zxt_gb' : ''}`}
                                                             onClick={(e) => changestyle2(e, 'Monthly')}>{getLange(loginUser?.id) == "zh_CN" ? '月统计' : 'Monthly'}</div>
                                                        <div id='d4'
                                                             className={`zxt_div ${num1 == 'Yearly' ? 'zxt_gb' : ''}`}
                                                             onClick={(e) => changestyle2(e, 'Yearly')}>{getLange(loginUser?.id) == "zh_CN" ? '年统计' : 'Yearly'}</div>
                                                    </div>

                                                </Col>
                                            </Row>
                                            <div className='time_div'>
                                                <RangePicker bordered={false} onCalendarChange={handelTime}
                                                             format={dateFormat} style={{width: '12vw', zIndex: '10'}}/>
                                            </div>
                                            {/* <Row> */}
                                            <Echartszxt1 timeData={timeData1} single={single1} getLange={getLange}
                                                         loginUser={loginUser}></Echartszxt1>
                                            {/* </Row> */}
                                        </TabPane>
                                    </Tabs>
                                </div>

                            </div>
                            <div className='divVad a right_div'>
                                <div className='flex' style={{width: '100%', height: '60px', flex: '1'}}>
                                    <div className='right_div_top flex column'></div>
                                    <span
                                        className='lrtj'>{getLange(loginUser?.id) == "zh_CN" ? '利润统计' : 'Profit statistics'}</span>
                                    <div className='company flex' style={{}}>
                                        <div className={`zxt_div ${status == 'pound' ? 'ziti_gb' : ''}`}
                                             onClick={(e) => changestyle(e, 'pound')}>{getLange(loginUser?.id) == "zh_CN" ? '英镑' : 'pound'}</div>
                                        <div className={`zxt_div ${status == 'RMB' ? 'ziti_gb' : ''}`}
                                             onClick={(e) => changestyle(e, 'RMB')}
                                             style={{marginLeft: '1vw'}}>{getLange(loginUser?.id) == "zh_CN" ? '人民币' : 'RMB'}</div>

                                    </div>
                                </div>
                                <div className='time1_div'>
                                    <RangePicker bordered={false}
                                                 format={dateFormat} style={{width: '11.5vw', zIndex: '10'}}/>
                                </div>
                                <Echartszx getLange={getLange} loginUser={loginUser}></Echartszx>
                            </div>

                        </div>
                        <div className='divVad four_div flex'>
                            <div className=' left_div flex'>
                                <div className='four_left_div'>
                                    <div className='' style={{
                                        width: '100%',
                                        height: '2.5vw'
                                    }}>
                                        <table></table>
                                        <div className='four_top_left_div'></div>
                                        <span
                                            className='four_span'>{getLange(loginUser?.id) == "zh_CN" ? '金额统计' : 'Amount statistics'}</span>
                                    </div>
                                    <div className='four_bottom_left_div'>
                                        <div className='content_div'>
                                            <p className='monery_p'>￡{money.TotalCredit}</p>
                                            <p className='result'>
                                                {/* <i className="iconfont icon-meiyuan8  " style={{ fontSize: '25px', paddingLeft: '5px', color: '#2BB33A' }}></i> */}
                                                <PoundCircleOutlined style={{
                                                    fontSize: '1.5vw',
                                                    paddingRight: '0.5vw',
                                                    paddingTop: '0.5vw',
                                                    color: '#2BB33A'
                                                }}/>
                                                {getLange(loginUser?.id) == "zh_CN" ? '总数' : 'total'}</p>
                                        </div>
                                        {/* <div className='' style={{ background: 'red', width: '200px', height: '300px' }}> */}

                                        {/* </div> */}
                                    </div>


                                </div>
                                <div className='four_right_div'
                                     style={{width: '100%', height: '100%', padding: '20px'}}>
                                    <div className='four_top_time'>
                                        <RangePicker bordered={false}
                                                     format={dateFormat} style={{width: '11.5vw'}}/>
                                    </div>
                                    <div style={{height: '80%'}}>
                                        <div className='flex column flex1 jdt'>
                                            <Row style={{height: '100%'}}>
                                                <Col span={1}>
                                                    {/* <i className="iconfont icon-meiyuan8" style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }}></i> */}
                                                    <PoundCircleOutlined style={{
                                                        fontSize: '1vw',
                                                        position: 'relative',
                                                        top: '0.7vw',
                                                        color: '#F2F3F5'
                                                    }}/>
                                                </Col>
                                                <Col span={23}>
                                                    <Row style={{width: '100%'}}>
                                                        <Col span={12}>
                                                            <div style={{}}>
                                <span style={{
                                    fontSize: '0.9vw',
                                    fontWeight: 'bold'
                                }}>{getLange(loginUser?.id) == "zh_CN" ? '已开票' : 'Invoiced'}&nbsp;</span><span>{getLange(loginUser?.id) == "zh_CN" ? '未支付' : 'Unpaid'}&nbsp;</span><span>25%</span>
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{
                                                                textAlign: 'right',
                                                                fontSize: '0.8vw',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                ￡<span>{String(money.Invoiced).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Progress percent={85} style={{width: '98%'}} showInfo={false}/>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className='flex column flex1 jdt'>
                                            <Row style={{height: '100%'}}>
                                                <Col span={1}>
                                                    {/* <i className="iconfont icon-meiyuan8" style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }}></i> */}
                                                    <PoundCircleOutlined style={{
                                                        fontSize: '20px',
                                                        position: 'relative',
                                                        top: '8px',
                                                        color: '#F2F3F5'
                                                    }}/>
                                                </Col>
                                                <Col span={23}>
                                                    <Row style={{width: '100%'}}>
                                                        <Col span={12}>
                                                            <div style={{}}>
                                <span style={{
                                    fontSize: '0.9vw',
                                    fontWeight: 'bold'
                                }}>{getLange(loginUser?.id) == "zh_CN" ? '已开票' : 'Invoiced'}&nbsp;</span><span>{getLange(loginUser?.id) == "zh_CN" ? '已支付' : 'Paid'}&nbsp;</span><span>25%</span>
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{
                                                                textAlign: 'right',
                                                                fontSize: '0.8vw',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                ￡<span>{String(money.InvoicePaid).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Progress percent={85} style={{width: '98%'}} showInfo={false}/>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className='flex column flex1 jdt'>
                                            <Row style={{height: '100%'}}>
                                                <Col span={1}>
                                                    {/* <i className="iconfont icon-meiyuan8" style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }}></i> */}
                                                    <PoundCircleOutlined style={{
                                                        fontSize: '20px',
                                                        position: 'relative',
                                                        top: '8px',
                                                        color: '#F2F3F5'
                                                    }}/>
                                                </Col>
                                                <Col span={23}>
                                                    <Row style={{width: '100%'}}>
                                                        <Col span={12}>
                                                            <div style={{}}>
                                <span style={{
                                    fontSize: '0.9vw',
                                    fontWeight: 'bold'
                                }}>{getLange(loginUser?.id) == "zh_CN" ? '未开票' : 'Not invoiced'}&nbsp;</span><span>{getLange(loginUser?.id) == "zh_CN" ? '未支付' : 'Unpaid'}&nbsp;</span><span>25%</span>
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{
                                                                textAlign: 'right',
                                                                fontSize: '0.8vw',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                ￡<span>{String(money.SupplierUnInvoiced).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Progress percent={85} style={{width: '98%'}} showInfo={false}/>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className='flex column flex1 jdt'>
                                            <Row style={{height: '100%'}}>
                                                <Col span={1}>
                                                    {/* <i className="iconfont icon-meiyuan8" style={{ fontSize: '20px', position: 'relative', top: '8px', color: '#F2F3F5' }}></i> */}
                                                    <PoundCircleOutlined style={{
                                                        fontSize: '20px',
                                                        position: 'relative',
                                                        top: '8px',
                                                        color: '#F2F3F5'
                                                    }}/>
                                                </Col>
                                                <Col span={23}>
                                                    <Row style={{width: '100%'}}>
                                                        <Col span={12}>
                                                            <div style={{}}>
                                <span style={{
                                    fontSize: '0.9vw',
                                    fontWeight: 'bold'
                                }}>{getLange(loginUser?.id) == "zh_CN" ? '余额' : 'balance'}</span>
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{
                                                                textAlign: 'right',
                                                                fontSize: '16px',
                                                                fontWeight: 'bold',
                                                                color: 'red'
                                                            }}>
                                                                ￡<span>
                                  {String(money.RemainingCredit).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                </span>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Progress percent={40} status="exception" style={{width: '98%'}}
                                                                  showInfo={false}/>
                                                    </Row>
                                                </Col>

                                            </Row>
                                        </div>
                                    </div>


                                </div>
                            </div>
                            <div className='divVad a right_div'>
                                <div className='flex' style={{width: '100%', height: '2vw', flex: '1'}}>
                                    <div className='four_right_top flex column'></div>
                                    <span
                                        className='jytj'>{getLange(loginUser?.id) == "zh_CN" ? '结余统计' : 'Balance statistics'}</span>
                                    <div className='time2_div'>
                                        <RangePicker bordered={false}
                                                     format={dateFormat} style={{width: '11.5vw'}}/>
                                    </div>
                                </div>
                                <Echartstest balance={pieChart}></Echartstest>
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
                </PageContent>
            </ConfigProvider>
        </IntlProvider>
    );

});
