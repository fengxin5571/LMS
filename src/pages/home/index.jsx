import {
    Tabs,
    Col,
    Row,
    Progress,
    DatePicker,
    Modal,
    ConfigProvider,
    Form
} from 'antd';
import {PageContent, getLoginUser, FormItem, setLoginUser, Content} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import styles from './style.less';
import {SwapOutlined, PoundCircleOutlined} from '@ant-design/icons';
import './style.css'
import './iconfont/iconfont.css'
import Echartstest from './bingtu'
import Echartszx from './zhuxingtu'
import Echartszxt from './zhexian'
import Echartszxt1 from './zhexian2'
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import {FormattedMessage, IntlProvider} from 'react-intl';
import {convertToFormData, publics, publics1} from "src/commons/common";
import {getLange, setLange} from 'src/commons';
import {DRAW} from 'src/config';

import React, {useState, useEffect, useMemo} from 'react';

export default config({
    path: '/',
})(function Home(props) {
    // 如果其他页面作为首页，直接重定向，config中不要设置title，否则tab页中会多个首页
    const {TabPane} = Tabs;
    const loginUser = getLoginUser();
    const [tabSwitch, setTabSwitch] = useState('1')
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
    //租户下拉选项
    const [tenantOptions, setTenantOptions] = useState([{
        label: getLange(props.loginUser?.id) == "zh_CN" ? "控制台" : "Console",
        value: null
    }]);
    //租户下拉默认选项
    const [defaultTenantValue, setDefaultTenantValue] = useState(null);
    //公司下拉默认选项
    const [defaultCompanyValue, setDefaultCompanyValue] = useState(null);
    //是否禁用下拉
    const [disabledSelect, setDisabledSelect] = useState(false);
    //公司下拉选项集合
    const [companyOptions, setCompanyOptions] = useState([{
        label: getLange(props.loginUser?.id) == "zh_CN" ? "控制台" : "Console",
        value: null
    }]);
    //票数、重量时间范围筛选
    const [frequency, setFrequency] = useState('Daily');
    //票数、重量开始时间
    const [startDate, setStartDate] = useState(null);
    //票数、重量结束时间
    const [completionDate, setCompletionDate] = useState(null);
    //利润统计开始时间
    const [profitSummaryStartDate, setProfitSummaryStartDate] = useState(null);
    //利润统计结束时间
    const [profitSummaryCompletionDate, setProfitSummaryCompletionDate] = useState(null);
    //金额统计开始时间
    const [invoiceSummaryStartDate, setInvoiceSummaryStartDate] = useState(null);
    //金额统计结束时间
    const [invoiceSummaryCompletionDate, setInvoiceSummaryCompletionDate] = useState(null);
    //结余统计开始时间
    const [departmentBalanceStartDate, setDepartmentBalanceStartDate] = useState(null);
    //结余统计结束时间
    const [departmentBalanceCompletionDate, setDepartmentBalanceCompletionDate] = useState(null);
    //首页摘要开始时间
    const [homeSummaryStartDate, setHomeSummaryStartDate] = useState(null);
    //首页摘要结束时间
    const [homeSummaryCompletionDate, setHomeSummaryCompletionDate] = useState(null);

    //切换账号下拉表单
    const [form] = Form.useForm();
    //票数、重量下拉表单
    const [lineForm] = Form.useForm();
    //票数、重量下拉公司选中id
    const [lineCompanyId, setLineCompanyId] = useState(null);
    //票数、重量下拉租户选中id
    const [lineTenantId, setLineTenantId] = useState(null);
    // 随机生成颜色
    const [randomRgbColor, setRandomRgbColor] = useState(['#6599FE', '#F94242', '#FE9200', '#01BB00', '#FFB6C1', '	#40E0D0'])
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
    const [votesControl, setVotesControl] = useState(0)
    const [weightControl, setWeightControl] = useState(0)
    const [profiControl, setProfiControl] = useState(0)
    const [balancesControl, setBalancesControl] = useState(0)
    const [customerControl, setCustomerControl] = useState(0)
    const [workControl, setWorkControl] = useState(0)
    const [profitX, setProfitX] = useState([])
    const [profitY, setProfitY] = useState([])
    const [locale, setLocale] = useState();
    const [antLocale, setAntLocale] = useState()
    const [lang, setLang] = useState(getLange(loginUser?.id))
    const [subscript, setSubscript] = useState()
    const {RangePicker} = DatePicker;
    const dateFormat = 'YYYY/MM/DD';
    const [loading, setLoading] = useState(false);
    const [profitLoading, setProfitLoading] = useState(false);
    const [departmentBalanceLoading, setDepartmentBalanceLoading] = useState(false);
    const [homeSummaryLoading, setHomeSummaryLoading] = useState(false);
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
    /**
     * 票数/重量统计切换
     * @param key
     * @returns {Promise<void>}
     */
    const onChange = (key) => {
        setTabSwitch(key);
    };
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
        var result = [];
        if ((loginUser.CompanyId == null && loginUser.TenantId == null) || loginUser.TenantId && loginUser.CompanyId == null) {//主机用户、租户用户
            const res = await props.ajax.get('/Proj/GetCmpTenantList', null, {
                errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
            })
            result = res;
            //租户用户查找到自己的租户
            let findTenant = res.find(item => item.TenantId == loginUser.TenantId);
            setDefaultTenantValue(findTenant != undefined ? findTenant.TenantId : null);
            result.map(item => {
                item.label = item.TenantName;
                item.value = item.TenantId
            })
            //联动组合查找到的公司
            const companyList = result.filter(item => item.TenantId == (findTenant != undefined ? findTenant.TenantId : null))?.pop()?.CmpList || [];
            if (companyList.length > 0) {
                companyList.map(item => {
                    item.label = item.CompanyName;
                    item.value = item.CompanyId;
                    item.tenantId = loginUser.TenantId;
                });
                var concatOptions = companyOptions.concat(companyList);
            } else {
                var companys = [];
                result.map(item => {
                    item.CmpList.map(sub => {
                        companys.push({
                            label: sub.CompanyName,
                            value: sub.CompanyId,
                            tenantId: item.TenantId,
                        })
                    });
                });
                var concatOptions = companyOptions.concat(companys);
            }
            setCompanyOptions(concatOptions)
        } else if (loginUser.CompanyId) { //公司用户
            setDisabledSelect(true);
            setLineCompanyId(loginUser.CompanyId);
            setLineTenantId(loginUser.TenantId);
        }
        var concatOptions = tenantOptions.concat(result);
        setTenantOptions(concatOptions);
        setDefaultCompanyValue(null);
    }, []);

    /**
     * 租户、公司联动
     * @param value
     */
    const handleTenantChange = (value, option) => {
        lineForm.setFieldsValue({CompanyId: null})
        if (value) {
            var companyList = tenantOptions.filter(item => item.TenantId == value)?.pop()?.CmpList || [];
            companyList.map(item => {
                item.label = item.CompanyName;
                item.value = item.CompanyId
                item.tenantId = value;
            });
        } else {
            var companyList = [];
            tenantOptions.map(item => {
                item?.CmpList?.map(sub => {
                    companyList.push({
                        label: sub.CompanyName,
                        value: sub.CompanyId,
                        tenantId: item.TenantId,
                    })
                });
            });
        }
        var options = [{
            label: getLange(props.loginUser?.id) == "zh_CN" ? "控制台" : "Console",
            value: null
        }]
        setCompanyOptions(companyList.length == 0 ? options : companyList);
        setLineTenantId(value);
    };
    /**
     * 切换账号组合、公司联动
     * @param value
     */
    const swithAccountTenantChange = (value) => {
        form.setFieldsValue({CompanyId: null})
        if (value) {
            var companyList = tenantOptions.filter(item => item.TenantId == value)?.pop()?.CmpList || [];
            companyList.map(item => {
                item.label = item.CompanyName;
                item.value = item.CompanyId
                item.tenantId = value;
            });
        } else {
            var companyList = [];
            tenantOptions.map(item => {
                item?.CmpList?.map(sub => {
                    companyList.push({
                        label: sub.CompanyName,
                        value: sub.CompanyId,
                        tenantId: item.TenantId,
                    })
                });
            });
        }
        var options = [{
            label: getLange(props.loginUser?.id) == "zh_CN" ? "控制台" : "Console",
            value: null
        }]
        setCompanyOptions(companyList.length == 0 ? options : companyList);
    }
    /**
     * 图表公司下拉框change事件
     * @param value
     */
    const lineHandleCompanyChange = (value) => {
        lineForm.setFieldsValue({TenantId: null})
        var findTenant = companyOptions.filter(item => item.value == value).pop() || null;
        setLineTenantId(findTenant?.tenantId || null);
        lineForm.setFieldsValue({TenantId: findTenant?.tenantId || null})
        setLineCompanyId(value);
    }
    /**
     * 切换账号公司下拉框change事件
     * @param value
     */
    const switchAccountCompanyChange = (value) => {
        form.setFieldsValue({TenantId: null})
        var findTenant = companyOptions.filter(item => item.value == value).pop() || null;
        form.setFieldsValue({TenantId: findTenant?.tenantId || null})

    }
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

    //票数、重量统计参数
    const statisticsParams = useMemo(() => {
        return {
            DbGridName: 'Shipment Orders',
            X: 'ShipmentDate',
            draw: DRAW,
            Calculation: 'Count',
            Frequency: frequency,
            StartDate: startDate,
            CompletionDate: completionDate,
            TenantId: lineTenantId,
            CompanyId: lineCompanyId,
            Y: tabSwitch == 2 ? "DeclaredWeight" : null,
        };
    }, [frequency, completionDate, lineTenantId, lineCompanyId, tabSwitch]);

    //票数/重量统计
    const {data: {dataSource} = {}} = props.ajax.usePost('DbGrid/Statistics', statisticsParams, [statisticsParams], {
        headers: {'Content-Type': 'multipart/form-data'},
        setLoading,
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
        formatResult: (res) => {
            return {
                dataSource: res?.data || [],
            };
        },
    });
    /**
     * 填充票数、重量图表
     */
    useEffect(() => {
        if (dataSource != undefined) {
            if (tabSwitch == 1) { //票数统计
                setTimeData(dataSource.X);
                setSingle(dataSource.Y);
            } else if (tabSwitch == 2) { //重量统计
                setTimeData1(dataSource.X)
                dataSource.Y = dataSource.Y.map(item => {
                    var num = item.trim();
                    var ss = num.toString();
                    if (ss.length == 0) {
                        return "0";
                    }
                    return ss.replace(/,/g, "");
                })
                setSingle1(dataSource.Y)
            }
        }
    }, [dataSource]);
    /**
     * 利润统计参数
     * @type {{StartDate: unknown, CompletionDate: unknown}}
     */
    const profitSummaryParams = useMemo(() => {
        return {
            StartDate: profitSummaryStartDate,
            CompletionDate: profitSummaryCompletionDate,
        }
    }, [profitSummaryCompletionDate]);
    /**
     * 利润统计
     */
    const {data: {profitDataSource} = {}} = props.ajax.usePost('Proj/ProfitSummary', profitSummaryParams, [profitSummaryParams], {
        headers: {'Content-Type': 'multipart/form-data'},
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
        formatResult: (res) => {
            return {
                profitDataSource: res || [],
            };
        },
        setLoading: (res) => {
            setProfitLoading(res);
        }
    });
    /**
     * 填充利润统计图表
     */
    useEffect(() => {
        if (profitDataSource != undefined) {
            setProfitX(profitDataSource.X || []);
            setProfitY(profitDataSource.Y || []);
        }
    }, [profitDataSource]);
    /**
     * 金额统计参数
     * @type {{StartDate: unknown, TenantId: unknown, CompanyId: unknown, CompletionDate: unknown}}
     */
    const invoiceSummaryParams = useMemo(() => {
        return {
            TenantId: loginUser?.TenantId,
            CompanyId: loginUser?.CompanyId,
            StartDate: invoiceSummaryStartDate,
            CompletionDate: invoiceSummaryCompletionDate,

        }
    }, [invoiceSummaryCompletionDate]);
    /**
     * 金额统计
     */
    const {data: {invoiceSummaryDataSource} = {}} = props.ajax.usePost('Proj/InvoiceSummary', invoiceSummaryParams, [invoiceSummaryParams], {
        headers: {'Content-Type': 'multipart/form-data'},
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
        formatResult: (res) => {
            return {
                invoiceSummaryDataSource: res || [],
            };
        },
    });
    /**
     *  填充金额统计图表
     */
    useEffect(() => {
        if (invoiceSummaryDataSource != undefined) {
            setMoney(invoiceSummaryDataSource)
        }
    });
    /**
     * 结余统计参数
     * @type {{StartDate: unknown, CompletionDate: unknown}}
     */
    const departmentBalanceParams = useMemo(() => {
        return {
            StartDate: departmentBalanceStartDate,
            CompletionDate: departmentBalanceCompletionDate,
        };
    }, [departmentBalanceCompletionDate]);

    /**
     * 结余统计
     */
    const {data: {departmentBalanceDataSource} = {}} = props.ajax.usePost('Proj/DepartmentBalance', departmentBalanceParams, [departmentBalanceParams], {
        headers: {'Content-Type': 'multipart/form-data'},
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
        formatResult: (res) => {
            return {
                departmentBalanceDataSource: res || {China: 0, UK: 0},
            };
        },
        setLoading: (res) => {
            setDepartmentBalanceLoading(res);
        }
    });
    /**
     * 填充结余统计图表
     */
    useEffect(() => {
        if (departmentBalanceDataSource != undefined) {
            setPieChart(departmentBalanceDataSource);
        }
    });
    /**
     * 首页摘要参数
     * @type {{StartDate: unknown, TenantId: any, CompanyId: any, CompletionDate: unknown}}
     */
    const homeSummaryParams = useMemo(() => {
        return {
            StartDate: homeSummaryStartDate,
            CompletionDate: homeSummaryCompletionDate,
            TenantId: loginUser.TenantId,
            CompanyId: loginUser.CompanyId,
        };
    }, [homeSummaryCompletionDate]);

    /**
     * 首页摘要
     */
    const {data: {homeSummaryDataSource} = {}} = props.ajax.usePost('/Proj/Summary', homeSummaryParams, [homeSummaryParams], {
        headers: {'Content-Type': 'multipart/form-data'},
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
        formatResult: (res) => {
            return {
                homeSummaryDataSource: res || {},
            };
        },
        setLoading: (res) => {
            setHomeSummaryLoading(res);
        }
    });
    useEffect(() => {
        if (homeSummaryDataSource != undefined) {
            // 票数
            const a = homeSummaryDataSource.Shipments?.Printed + homeSummaryDataSource.Shipments?.NotScanned + homeSummaryDataSource.Shipments?.Closed
            const judge = homeSummaryDataSource.Shipments == null;
            publics(judge, setVotesNum, a, setVotesControl)

            // 重量
            const b = homeSummaryDataSource.Weight?.DeclaredWeight + homeSummaryDataSource.Weight?.ScannedWeight + homeSummaryDataSource.Weight?.ScannedDecalredWeight
            const judge1 = homeSummaryDataSource.Weight == null;
            publics(judge1, setWeightNum, b, setWeightControl)
            // 利润
            const c = homeSummaryDataSource?.Profit?.Value
            const judge2 = homeSummaryDataSource.Profit == null;
            publics(judge2, setProfitNum, c, setProfiControl)
            // 结余
            const d = homeSummaryDataSource?.TotalCredit?.Value
            const judge3 = homeSummaryDataSource.TotalCredit == null;
            publics(judge3, setProfitNum, d, setBalancesControl)

            // 客服统计
            // 未处理
            const e = homeSummaryDataSource.CustomerSupportCases?.InProgress + homeSummaryDataSource.CustomerSupportCases?.WaitApproval || 0
            // 未处理
            const f = homeSummaryDataSource.CustomerSupportCases?.Closed || 0

            const judge4 = homeSummaryDataSource.CustomerSupportCases == null;
            publics1(judge4, setProcessedNum, e, setCustomerControl, setNotprocessedNum, f)
            // 人工核算
            const g = homeSummaryDataSource.WorkRequests?.InProgress + homeSummaryDataSource.WorkRequests?.WaitApproval || 0
            // 未处理
            const h = homeSummaryDataSource.WorkRequests?.Closed || 0
            const judge5 = homeSummaryDataSource.WorkRequests == null;
            publics1(judge5, setProcessedNum1, g, setWorkControl, setNotprocessedNum1, h)
        }
    });
    // 票数、重量选择日期
    const handelTime = (date, dateString) => {
        var startDate = dateString[0] || "";
        var endDate = dateString[1] || "";
        if (startDate && !endDate) {
            return;
        }
        setStartDate(startDate);
        setCompletionDate(endDate);

    }
    //利润统计时间
    const handelProfitSummaryTime = (date, dateString) => {
        var startDate = dateString[0] || "";
        var endDate = dateString[1] || "";
        if (startDate && !endDate) {
            return;
        }
        setProfitSummaryStartDate(startDate);
        setProfitSummaryCompletionDate(endDate);

    }
    //金额统计时间
    const handelInvoiceSummaryTime = (date, dateString) => {
        var startDate = dateString[0] || "";
        var endDate = dateString[1] || "";
        if (startDate && !endDate) {
            return;
        }
        setInvoiceSummaryStartDate(startDate);
        setInvoiceSummaryCompletionDate(endDate);

    };
    //结余统计时间
    const handelDepartmentBalanceTime = (date, dateString) => {
        var startDate = dateString[0] || "";
        var endDate = dateString[1] || "";
        if (startDate && !endDate) {
            return;
        }
        setDepartmentBalanceStartDate(startDate);
        setDepartmentBalanceCompletionDate(endDate);

    }
    //首页摘要时间
    const handelHomeSummaryTime = (date, dateString) => {
        var startDate = dateString[0] || "";
        var endDate = dateString[1] || "";
        if (startDate && !endDate) {
            return;
        }
        setHomeSummaryStartDate(startDate);
        setHomeSummaryCompletionDate(endDate);

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
                                defaultValue={defaultTenantValue}
                                options={tenantOptions}
                                onChange={swithAccountTenantChange}
                            />
                            <FormItem
                                label={<FormattedMessage id="CompanyId"/>}
                                defaultValue={defaultCompanyValue}
                                name="CompanyId"
                                placeholder="CompanyId"
                                options={companyOptions}
                                onChange={switchAccountCompanyChange}
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
                                                        {React.createElement(require('@ant-design/icons')[item.Icon || "BlockOutlined"], {
                                                            style: {
                                                                fontSize: '2vw',
                                                                color: '#fff',
                                                                position: 'relative',
                                                                top: '1vw'
                                                            }
                                                        })}
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
                                                     onClick={() => props.history.push(item.Name == "BusinessManagement" ? "/BusinessManagement" : (item.Name == "/" ? "/" : "/Dynamic/" + item.Name.replace(new RegExp(/( )/g), "_")))}>
                                                    <div className='circular'
                                                         style={{background: randomRgbColor[randomNum1[k]]}}>
                                                        {React.createElement(require('@ant-design/icons')[item.Icon || "BlockOutlined"], {
                                                            style: {
                                                                fontSize: '2vw',
                                                                color: '#fff',
                                                                position: 'relative',
                                                                top: '1vw'
                                                            }
                                                        })}
                                                    </div>
                                                    <p className='p_div'><FormattedMessage id={item.Name}/></p>
                                                </div>
                                            </>
                                        )
                                    })}
                                    {!disabledSelect ? <div className='div2_ flex column' style={{marginLeft: '1.5vw'}}>
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
                                            {getLange(props.loginUser?.id) == "zh_CN" ? "切换账号" : "Switch account"}
                                        </p>
                                    </div> : null}

                                </div>
                            </div>
                        </div>
                        <div className={["two_div"]}>
                            <div className='two_top_div'>
                                <RangePicker bordered={false} onCalendarChange={handelHomeSummaryTime}
                                             format={dateFormat}
                                             style={{width: '14vw', fontSize: '0.5vw', marginBottom: 10}}/>
                            </div>
                            <div className='flex zydq'>
                                <Content
                                    className={['div_ flex column neirong piaoshu', votesControl == 1 ? 'hide' : '']}
                                    loading={homeSummaryLoading}>
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
                                </Content>
                                <Content
                                    className={['div_ flex column neirong zhongliang', weightControl == 1 ? 'hide' : '']}
                                    loading={homeSummaryLoading}>
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
                                </Content>
                                <Content
                                    className={['div_ flex column neirong lirun', profiControl == 1 ? 'hide' : '']}
                                    loading={homeSummaryLoading}>
                                    <div className='tow_top_div flex'>
                                        <div className='tow_top_div_left' style={{background: '#4973DE'}}>
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
                                </Content>
                                <Content
                                    className={['div_ flex column neirong jieyu', balancesControl == 1 ? 'hide' : '']}
                                    loading={homeSummaryLoading}>
                                    <div className='tow_top_div flex'>
                                        <div className='tow_top_div_left' style={{background: '#29AA2C'}}>
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
                                </Content>
                                <Content
                                    className={['div_ flex column neirong kefu', customerControl == 1 ? 'hide' : '']}
                                    loading={homeSummaryLoading}>
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
                                </Content>
                                <Content
                                    className={['div_ flex column neirong hesuan', workControl == 1 ? 'hide' : '']}
                                    loading={homeSummaryLoading}>
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

                                </Content>
                            </div>
                        </div>
                        <div className='divVad three_div flex'>
                            <div className={['divVad left_div flex',]}>
                                <div style={{paddingLeft: '20px', width: '100%'}}>
                                    <Tabs defaultActiveKey="1" onChange={onChange}>
                                        <TabPane
                                            tab={getLange(loginUser?.id) == "zh_CN" ? "票数统计" : "Statistics of votes"}
                                            key="1">
                                            <Row>
                                                <Col span={12}>
                                                    <Form form={lineForm} layout={'inline'}>
                                                        <FormItem
                                                            label={<FormattedMessage id="TenantId"/>}
                                                            style={{width: '12rem'}}
                                                            name="TenantId"
                                                            placeholder="TenantId"
                                                            defaultValue={defaultTenantValue}
                                                            disabled={disabledSelect}
                                                            options={tenantOptions}
                                                            onChange={handleTenantChange}
                                                        />
                                                        <FormItem
                                                            key={"votes_CompanyId"}
                                                            style={{width: '12rem'}}
                                                            label={<FormattedMessage id="CompanyId"/>}
                                                            defaultValue={defaultCompanyValue}
                                                            name="CompanyId"
                                                            placeholder="CompanyId"
                                                            disabled={disabledSelect}
                                                            options={companyOptions}
                                                            onChange={lineHandleCompanyChange}
                                                        />
                                                    </Form>
                                                </Col>
                                                <Col span={12} className="">
                                                    <div
                                                        className={['move  flex', 'move3']}
                                                        style={{}}>
                                                        <span id='d1'
                                                              className={['zxt_div', frequency == 'Daily' ? "zxt_gb" : ""]}
                                                              onClick={() => setFrequency('Daily')}>{getLange(loginUser?.id) == "zh_CN" ? '日统计' : 'Daily'}</span>
                                                        <div id='d2'
                                                             className={['zxt_div', frequency == 'Weekly' ? "zxt_gb" : ""]}
                                                             onClick={() => setFrequency('Weekly')}>{getLange(loginUser?.id) == "zh_CN" ? '周统计' : 'Weekly'}</div>
                                                        <div id='d3'
                                                             className={['zxt_div', frequency == 'Monthly' ? "zxt_gb" : ""]}
                                                             onClick={() => setFrequency('Monthly')}>{getLange(loginUser?.id) == "zh_CN" ? '月统计' : 'Monthly'}</div>
                                                        <div id='d4'
                                                             className={['zxt_div', frequency == 'Yearly' ? "zxt_gb" : ""]}
                                                             onClick={() => setFrequency('Yearly')}>{getLange(loginUser?.id) == "zh_CN" ? '年统计' : 'Yearly'}</div>
                                                    </div>

                                                </Col>
                                            </Row>
                                            <div className='time_div'>
                                                <RangePicker bordered={false} onCalendarChange={handelTime}
                                                             format={dateFormat} style={{width: '12vw', zIndex: '10'}}/>
                                            </div>
                                            <Echartszxt timeData={timeData} single={single} getLange={getLange}
                                                        loginUser={loginUser} loading={loading}></Echartszxt>

                                        </TabPane>
                                        <TabPane
                                            tab={getLange(loginUser?.id) == "zh_CN" ? "重量统计" : "Weight statistics"}
                                            key="2">
                                            <Row>
                                                <Col span={12}>
                                                    <Form form={lineForm} layout={'inline'}>
                                                        <FormItem
                                                            label={<FormattedMessage id="TenantId"/>}
                                                            style={{width: '12rem'}}
                                                            name="TenantId"
                                                            placeholder="TenantId"
                                                            defaultValue={defaultTenantValue}
                                                            options={tenantOptions}
                                                            disabled={disabledSelect}
                                                            onChange={handleTenantChange}
                                                        />
                                                        <FormItem
                                                            key={"weight_CompanyId"}
                                                            style={{width: '12rem'}}
                                                            label={<FormattedMessage id="CompanyId"/>}
                                                            defaultValue={defaultCompanyValue}
                                                            name="CompanyId"
                                                            placeholder="CompanyId"
                                                            disabled={disabledSelect}
                                                            options={companyOptions}
                                                            onChange={lineHandleCompanyChange}
                                                        />
                                                    </Form>
                                                </Col>
                                                <Col span={12} className="">
                                                    <div
                                                        className={['move flex', 'move3']}
                                                        style={{}}>
                            <span id='d1'
                                  className={['zxt_div', frequency == 'Daily' ? "zxt_gb" : ""]}
                                  onClick={() => setFrequency('Daily')}>{getLange(loginUser?.id) == "zh_CN" ? '日统计' : 'Daily'}</span>
                                                        <div id='d2'
                                                             className={['zxt_div', frequency == 'Weekly' ? "zxt_gb" : ""]}
                                                             onClick={() => setFrequency('Weekly')}>{getLange(loginUser?.id) == "zh_CN" ? '周统计' : 'Weekly'}</div>
                                                        <div id='d3'
                                                             className={['zxt_div', frequency == 'Monthly' ? "zxt_gb" : ""]}
                                                             onClick={() => setFrequency('Monthly')}>{getLange(loginUser?.id) == "zh_CN" ? '月统计' : 'Monthly'}</div>
                                                        <div id='d4'
                                                             className={['zxt_div', frequency == 'Yearly' ? "zxt_gb" : ""]}
                                                             onClick={() => setFrequency('Yearly')}>{getLange(loginUser?.id) == "zh_CN" ? '年统计' : 'Yearly'}</div>
                                                    </div>

                                                </Col>
                                            </Row>
                                            <div className='time_div'>
                                                <RangePicker bordered={false} onCalendarChange={handelTime}
                                                             format={dateFormat} style={{width: '12vw', zIndex: '10'}}/>
                                            </div>
                                            <Echartszxt1 timeData={timeData1} single={single1} getLange={getLange}
                                                         loginUser={loginUser} loading={loading}></Echartszxt1>
                                        </TabPane>
                                    </Tabs>
                                </div>

                            </div>
                            <div
                                className={['divVad a ', 'right_div']}>
                                <div className='flex' style={{width: '100%', height: '60px', flex: '1'}}>
                                    <div className='right_div_top flex column'></div>
                                    <span
                                        className='lrtj'>{getLange(loginUser?.id) == "zh_CN" ? '利润统计' : 'Profit statistics'}</span>

                                </div>
                                <div className='time1_div'>
                                    <RangePicker bordered={false} onCalendarChange={handelProfitSummaryTime}
                                                 format={dateFormat} style={{width: '12.5vw', zIndex: '10'}}/>
                                </div>
                                <Echartszx getLange={getLange} loginUser={loginUser} profitX={profitX}
                                           profitY={profitY} loading={profitLoading}></Echartszx>
                            </div>

                        </div>
                        <div className='divVad four_div flex'>
                            <div className={['left_div flex']}>
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
                                                <PoundCircleOutlined style={{
                                                    fontSize: '1.5vw',
                                                    paddingRight: '0.5vw',
                                                    paddingTop: '0.5vw',
                                                    color: '#2BB33A'
                                                }}/>
                                                {getLange(loginUser?.id) == "zh_CN" ? '总数' : 'total'}</p>
                                        </div>
                                    </div>


                                </div>
                                <div className='four_right_div'
                                     style={{width: '100%', height: '100%', padding: '20px'}}>
                                    <div className='four_top_time'>
                                        <RangePicker bordered={false} onCalendarChange={handelInvoiceSummaryTime}
                                                     format={dateFormat} style={{width: '12.5vw'}}/>
                                    </div>
                                    <div style={{height: '80%'}}>
                                        <div className='flex column flex1 jdt'>
                                            <Row style={{height: '100%'}}>
                                                <Col span={1}>
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
                                                                ￡<span>{String(money.Invoiced == undefined ? '0' : money.Invoiced).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Progress percent={85} style={{width: '98%'}}
                                                                  showInfo={false}/>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className='flex column flex1 jdt'>
                                            <Row style={{height: '100%'}}>
                                                <Col span={1}>
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
                                                                ￡<span>{String(money.InvoicePaid == undefined ? '0' : money.InvoicePaid).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Progress percent={85} style={{width: '98%'}}
                                                                  showInfo={false}/>
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
                                                                ￡<span>{String(money.SupplierUnInvoiced == undefined ? '0' : money.SupplierUnInvoiced).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Progress percent={85} style={{width: '98%'}}
                                                                  showInfo={false}/>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className='flex column flex1 jdt'>
                                            <Row style={{height: '100%'}}>
                                                <Col span={1}>
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
                                  {String(money.RemainingCredit == undefined ? '0' : money.RemainingCredit).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                </span>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Progress percent={40} status="exception"
                                                                  style={{width: '98%'}}
                                                                  showInfo={false}/>
                                                    </Row>
                                                </Col>

                                            </Row>
                                        </div>
                                    </div>


                                </div>
                            </div>
                            <div className={['divVad a ', 'right_div']}>
                                <div className='flex' style={{width: '100%', height: '2vw', flex: '1'}}>
                                    <div className='four_right_top flex column'></div>
                                    <span
                                        className='jytj'>{getLange(loginUser?.id) == "zh_CN" ? '结余统计' : 'Balance statistics'}</span>
                                    <div className='time2_div'>
                                        <RangePicker bordered={false} onCalendarChange={handelDepartmentBalanceTime}
                                                     format={dateFormat} style={{width: '12.5vw'}}/>
                                    </div>
                                </div>
                                <Echartstest balance={pieChart} loading={departmentBalanceLoading}></Echartstest>
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
