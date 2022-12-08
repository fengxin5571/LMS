import React, {useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef} from 'react';
import {
    Button,
    Form,
    Space,
    ConfigProvider,
    Modal,
    Upload,
    Col,
    Row,
    Dropdown,
    Menu,
    Popconfirm,
    Card,
    Switch
} from 'antd';
import {
    PageContent,
    QueryBar,
    FormItem,
    Table,
    Pagination,
    Operator,
    ToolBar,
    getLoginUser,
    Content,
} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import {DRAW} from 'src/config';
import EditModal from 'src/components/edit/EditModal';
import {
    handleGridDataTypeColumn,
    BtnFlags,
    asyncConfigData,
    convertToFormData,
    GetDateNow,
    formatPrice, openWin, GridStatus
} from "src/commons/common";
import {getLange, setLange} from 'src/commons';
import {FormattedMessage, IntlProvider, addLocaleDate} from 'react-intl'; /* react-intl imports */
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import {useLocation, useHistory, useParams} from "react-router-dom";
import TableModal from "src/pages/GridTools/TableModal";
import TableList from "src/pages/GridTools/TableList";
import {confirm} from '@ra-lib/components';
import {
    UploadOutlined,
    PlusOutlined,
    DownloadOutlined,
    PrinterOutlined,
    DeleteOutlined,
    FileSearchOutlined,
    EllipsisOutlined,
    BlockOutlined,
    EditOutlined,
    UserAddOutlined,
    PoweroffOutlined,
    PlayCircleOutlined,
    PaperClipOutlined,
    UndoOutlined,
    PayCircleOutlined,
    SnippetsOutlined,
    CopyOutlined
} from "@ant-design/icons";
import FileModal from "../../components/form/FileModal";
import CreateModal from "../../components/PaymentToSuppliers/CreateModal";
import {Viewer, Worker} from '@phuocng/react-pdf-viewer';

export default config({
    path: "/Dynamic/:dbGridName",
})(function Dynamic(props) {
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }
    const location = useLocation();
    const name = useParams()?.dbGridName.replace(new RegExp(/(_)/g), " ");
    let resault = null;
    const loginUser = getLoginUser();
    const [lang, setLang] = useState(getLange(loginUser?.id))
    const [modalTitle, setModalTitle] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [isDetail, setIsDetail] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isListVisible, setIsListVisible] = useState(false);
    const [subTableType, setSubTableType] = useState(1);
    const [subTableHeader, setSubTableHeader] = useState({});
    const [subTable, setSubTable] = useState({});
    const [locale, setLocale] = useState();
    const [antLocale, setAntLocale] = useState();
    const [loading, setLoading] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [conditions, setConditions] = useState({});
    const [visible, setVisible] = useState(false);
    const [isCreate, setIsCreate] = useState(false);
    const [record, setRecord] = useState(null);
    const [tableColumns, setTableColumns] = useState([]);
    const [searchColumns, setSearchColumns] = useState([]);
    const [formColumns, setFormColumns] = useState([]);
    const [resBtnFlags, setResBtnFlags] = useState();
    const [order, setOrder] = useState(null);
    const [includes, setIncludes] = useState();
    const [searchFormData, setSearchFormData] = useState([]);
    const [uploadVisible, setUploadVisible] = useState(false);
    const [splitVisible, setSplitVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState();
    const [btnDisabled, setBtnDisabled] = useState(true);
    const [dbGridName, setDbGridName] = useState(name);
    const [balance, setBalance] = useState(9999.99);
    const [fileModaVisible, setFileModaVisible] = useState(false);
    const [form] = Form.useForm();
    const [balanceForm] = Form.useForm();
    const [transferForm] = Form.useForm();
    const [uploadItemName, setUploadItemName] = useState();
    const [viewFilePath, setViewFilePath] = useState([]);
    const [viewFile, setViewFile] = useState([]);
    const [disableStatus, setDisableStatus] = useState(false);
    const [transferVisible, setTransferVisible] = useState(false);
    const [bankAccountOption, setBankAccountOption] = useState([]);
    const [gridClassName, setGridClassName] = useState('');
    const [formAddressColumns, setFormAddressColumns] = useState([]);
    const [pdfBlob, setPdfBlob] = useState("");
    const [pdfVisible, setPdfVisible] = useState(false);
    const fileModal = useRef();
    const childForm = useRef();
    useEffect(async () => {
        const resp = await fetch(window.location.origin + `/lang/${lang}.json`)
        const data = await resp.json();
        const localization = await fetch(window.location.origin + `/lang/${lang}_Localization.json`);
        const errorJson = await localization.json();
        window.sessionStorage.setItem("error-json-" + loginUser?.id, JSON.stringify(errorJson));
        setAntLocale(lang == "zh_CN" ? zhCN : enUS);
        setBtnDisabled(selectedRowKeys.length > 0 ? false : true);
        setLocale(data);
    }, [lang, fileList, selectedRowKeys, isEdit, isDetail]);
    useEffect(() => {
        //地址变更时初始化相关参数
        setPageNum(1);
        setPageSize(20);
        setConditions({});
        setOrder(null);
        form.resetFields();
    }, [location]);
    //表格排序
    const handleTableChange = (newPagination, filters, sorter) => {
        setOrder([
            {
                column: sorter.field,
                dir: sorter.order == "ascend" ? "asc" : "desc"
            }
        ])
    };
    const params = useMemo(() => {
        setDbGridName(name);
        //获取表格配置信息
        asyncConfigData(dbGridName);
        resault = JSON.parse(window.sessionStorage.getItem(dbGridName + '-config-' + loginUser?.id));
        if (resault == null) return;
        //处理表格显示的字段
        const resColums = handleGridDataTypeColumn(resault.ColumnConfigs, isModalVisible, setIsModalVisible, setSubTableHeader, setSubTable, setModalTitle, setSubTableType, setIsListVisible);
        setBalance(resault.Balance);
        setGridClassName(resault?.GridClassName != undefined ? resault?.GridClassName : '');
        let apiIncludes = resault.Includes.map((item) => item.Name);
        setIncludes(apiIncludes);
        resColums.table_colums.push({
            title: <FormattedMessage id="Operation"/>,
            key: 'operator',
            width: getLange(loginUser?.id) == "zh_CN" ? 80 : 100,
            fixed: 'right',
            align: "center",
            render: (value, record) => {
                const id = record.Id;
                const name = record.Name
                const items = [];
                const serverMenu = (
                    <Menu>
                        {((resault.BtnFlags & BtnFlags.CanView) > 0) ? <Menu.Item
                            icon={<FileSearchOutlined/>}
                            style={{color: "#1991FF"}}
                            onClick={() => setRecord({
                                ...record,
                                isDetail: true
                            }) || setVisible(true) || setIsDetail(true) || setIsEdit(false)}
                        >
                            <FormattedMessage id="View"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanUpdate) > 0 && gridClassName != 'PaymentToSuppliersClassName') ?
                            <Menu.Item
                                icon={<EditOutlined/>}
                                style={{color: "#FF9F54"}}
                                onClick={() => setRecord(record) || setVisible(true) || setIsDetail(false) || setIsEdit(true)}
                            >
                                <FormattedMessage id="Edit"/>
                            </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanPrint) > 0) ? <Menu.Item
                            icon={<PrinterOutlined/>}
                            style={{color: "#47BC69"}}
                            onClick={() => dbGridPrint(id)}
                        >
                            <FormattedMessage
                                id="GridFlags_CanPrint" defaultMessage="Print"/>
                        </Menu.Item> : null}
                        {(resault.Balance != 9999.99 && resault.Balance != 0 && gridClassName != 'PaymentToSuppliersClassName') ?
                            <Menu.Item
                                icon={<BlockOutlined/>}
                                style={{color: "#FFBF10"}}
                                onClick={() => setRecord(record) || setSplitVisible(true)}
                            >
                                <FormattedMessage
                                    id="Split" defaultMessage="Split"/>
                            </Menu.Item> : null}

                        {((resault.BtnFlags & BtnFlags.CanApprove) > 0) ? <Menu.Item
                            icon={<UserAddOutlined/>}
                            style={{color: "#CDCDCD"}}
                            onClick={() => dbGridApprove(record?.Id)}
                            disabled={record?.ApprovedByUserId != undefined && !record?.ApprovedByUserId && record?.Status == 16 ? false : true}
                        >
                            <FormattedMessage
                                id="GridFlags_CanApprove"
                                defaultMessage="Approve"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanUndo) > 0) ? <Menu.Item
                            icon={<UndoOutlined/>}
                            style={{color: "#bafc03"}}
                            onClick={() => dbGridRecovery(record?.Id)}
                            disabled={record?.Status != undefined && (record?.Status & 0x8000) != 0 ? true : false}
                        >
                            <FormattedMessage
                                id="GridFlags_CanUndo"
                                defaultMessage="Recovery"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanStart) > 0) ? <Menu.Item
                            icon={<PlayCircleOutlined/>}
                            style={{color: "#3CC9C1"}}
                            onClick={() => dbGridStart(record?.Id)}
                            disabled={record?.ApprovedByUserId != undefined && record?.ApprovedByUserId && record?.Status == 16384 && (!record?.StartTime || !record?.StartDate) ? false : true}
                        >
                            <FormattedMessage id="GridFlags_CanStart" defaultMessage="Start"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanFinish) > 0) ? <Menu.Item
                            icon={<PoweroffOutlined/>}
                            style={{color: "#23B258"}}
                            onClick={() => dbGridFinish(record?.Id)}
                            disabled={record?.ApprovedByUserId != undefined && record?.ApprovedByUserId && record?.Status == 16384 && (record?.StartTime || record?.StartDate) ? false : true}
                        >
                            <FormattedMessage id="GridFlags_CanFinish" defaultMessage="Finish"/>
                        </Menu.Item> : null}

                        {((resault.BtnFlags & BtnFlags.CanCopyRecord) > 0) ? <Menu.Item
                            icon={<CopyOutlined/>}
                            style={{color: "#8E44AD"}}
                            onClick={() => setRecord(null) || setVisible(true) || setIsCreate(true) || setIsDetail(false) || setIsEdit(false) || handleCopy(id, includes)}
                        >
                            <FormattedMessage id="GridFlags_CanCopyRecord"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanDelete) > 0) && (record.Access & GridStatus.Deleted > 0) ?
                            <Menu.Item
                                icon={<DeleteOutlined/>}
                                style={{color: "#FF6565"}}
                                onClick={() => handleDelete(id, record?.Name)}
                            >
                                <FormattedMessage id="Delete"/>
                            </Menu.Item> : null}
                    </Menu>
                )
                return (
                    <>
                        <Dropdown overlay={serverMenu} placement="bottomRight">
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    <EllipsisOutlined style={{fontSize: "1.5rem", fontWeight: "bold"}}/>
                                </Space>
                            </a>
                        </Dropdown>
                    </>
                );
            },
        });
        setResBtnFlags(resault.BtnFlags);
        setTableColumns(resColums.table_colums);
        setSearchColumns(resColums.search_colums);
        setFormColumns(resColums.form_colums);
        var addressColumns = resColums.form_colums.filter(item => item.type == 31);
        setFormAddressColumns(addressColumns);
        let searchData = [];
        let globalSearch = null;
        Object.keys(conditions).forEach(key => {
            if (conditions[key] !== undefined) {
                if (conditions[key] instanceof Array) {
                    searchData.push({name: key, min: conditions[key][0], max: conditions[key][1]});
                } else if (key == "search") {
                    globalSearch = {
                        value: conditions[key],
                        regex: false
                    }
                } else {
                    searchData.push({name: key, min: conditions[key], max: conditions[key]});
                }
            }
        });
        setSearchFormData(searchData);
        return {
            ...conditions,
            pageNum,
            pageSize,
            order: order,
            length: pageSize,
            start: pageNum == 1 ? 0 : (pageNum - 1) * pageSize,
            grid: dbGridName,
            columns: resColums.api_colums,
            advancedSearchFormData: searchData,
            DisableStatus: disableStatus,
            search: globalSearch,
        };

    }, [location, conditions, pageNum, pageSize, order, disableStatus]);
    // 使用现有查询条件，重新发起请求
    const refreshSearch = useCallback(() => {
        setConditions(form.getFieldsValue());
    }, [form]);
    // 获取列表
    const {data: {dataSource, total} = {}} = props.ajax.usePost('DbGrid/Page', params, [params], {
        headers: {'Content-Type': 'multipart/form-data'},
        setLoading,
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
        formatResult: (res) => {
            return {
                dataSource: res?.data || [],
                total: res?.recordsTotal || 0,
                balance: res?.Balance || 9999.99
            };
        },
    });
    /**
     * 复制
     * @type {(function(*): Promise<void>)|*}
     */
    const handleCopy = async (id, includesList) => {
        const res = await props.ajax.post(`/DbGrid/Copy`, {
            DbGridName: dbGridName,
            Id: id,
            draw: DRAW,
            Includes: includesList,
        }, {
            headers: {'Content-Type': 'multipart/form-data'},
            setLoading,
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},

        });
        var addressTypecolums = [];
        var pickupColums = [];

        formColumns.map((item) => {
            //获取地址类型字段名
            if (item.type == 31) {
                addressTypecolums.push(item.name);
            }
            //取货emum类型
            if (item.type == 32) {
                pickupColums.push(item.name)
            }
        });
        const values = {
            ...res.data,
        };
        var shipmentDate = values?.ShipmentDate || '';
        var companyId = values?.CompanyId || '';
        var tenantId = values?.TenantId || '';
        //判断发货地址是否有值并且有32类型的字段
        if (shipmentDate && pickupColums) {
            //调用子组件的方法
            childForm.current.setShipmentDate(shipmentDate);
        }
        Object.keys(values).forEach(key => {
            addressTypecolums.map(item => {
                if (item == key) {
                    values[item + '-Id'] = values[key].Id;
                    values[item + '-ContactName'] = values[key].ContactName;
                    values[item + '-ContactCompanyName'] = values[key].ContactCompanyName;
                    values[item + '-AddressLine1'] = values[key].AddressLine1;
                    values[item + '-AddressLine2'] = values[key].AddressLine2;
                    values[item + '-AddressLine3'] = values[key].AddressLine3;
                    values[item + '-PostCode'] = values[key].PostCode;
                    values[item + '-Country'] = values[key].Country;
                    values[item + '-Email'] = values[key].Email;
                    values[item + '-Phone'] = values[key].Phone;
                    values[item + '-Mobile'] = values[key].Mobile;
                    values[item + '-CityDistrict'] = values[key].CityDistrict;
                    values[item + '-City'] = values[key].City;
                    if (values[key].VatNumber != undefined) {
                        values[item + '-VatNumber'] = values[key].VatNumber;
                    }
                    if (values[key].EORI != undefined) {
                        values[item + '-EORI'] = values[key].EORI;
                    }
                    if (values[key].TaxCode != undefined) {
                        values[item + '-TaxCode'] = values[key].TaxCode;
                    }
                }
            });
        });
        console.log(values);
        childForm.current.form.setFieldsValue(values);
    }
    /**
     * 删除
     * @type {(function(*, *): Promise<void>)|*}
     */
    const handleDelete = useCallback(
        async (id, name) => {
            await confirm({
                title: getLange(loginUser?.id) == "zh_CN" ? "提示" : "Tips",
                content: getLange(loginUser?.id) == "zh_CN" ? "您确定删除「" + name || id + "」吗？" : "Are you sure you want to delete [{" + name + "}]?",

            });
            await props.ajax.post(`DbGrid/Delete`, {
                "DbGridName": dbGridName,
                'Id': id,
                "Permanent": true,
                "draw": DRAW
            }, {
                headers: {'Content-Type': 'multipart/form-data'},
                errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
                setLoading, successTip: getLange(loginUser?.id) == "zh_CN" ? "删除成功" : "Deletion succeeded!"
            });
            // 触发列表更新
            refreshSearch();
        },
        [refreshSearch],
    );
    /**
     * 批量删除
     * @type {(function(): Promise<void>)|*}
     */
    const handleDeleteBatch = useCallback(
        async (ids) => {
            await props.ajax.post(`DbGrid/Delete`, {
                "DbGridName": dbGridName,
                'Id': ids,
                "Permanent": true,
                "draw": DRAW
            }, {
                headers: {'Content-Type': 'multipart/form-data'},
                errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
                setLoading, successTip: getLange(loginUser?.id) == "zh_CN" ? "删除成功" : "Deletion succeeded!"
            });
            // 触发列表更新
            refreshSearch();
        },
        [refreshSearch],
    );
    /**
     * 下载
     * @returns {Promise<void>}
     */
    const dbGridDownload = async () => {
        const res = await props.ajax.post('DbGrid/Download', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            AdvancedSearch: JSON.stringify(searchFormData),
            order: order
        }), {
            responseType: "blob",
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        let blob = new Blob([res]);
        let name = dbGridName + "-" + GetDateNow() + '.csv';
        if (typeof window.navigator.msSaveBlob !== "undefined") {
            // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
            window.navigator.msSaveBlob(blob, decodeURI(name));
        } else {
            // 创建新的URL并指向File对象或者Blob对象的地址
            const blobURL = window.URL.createObjectURL(blob);
            // 创建a标签，用于跳转至下载链接
            const tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", decodeURI(name));
            // 兼容：某些浏览器不支持HTML5的download属性
            if (typeof tempLink.download === "undefined") {
                tempLink.setAttribute("target", "_blank");
            }
            // 挂载a标签
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            // 释放blob URL地址
            window.URL.revokeObjectURL(blobURL);
        }
    };
    /**
     * 批量打单
     * @returns {Promise<void>}
     */
    const batchPrint = async () => {
        var formartName = dbGridName.replace(new RegExp(/( )/g), "")
        const res = await props.ajax.post('/DbGrid/DownloadFile', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            fileName: "BatchPrintTemplate.zip",
        }), {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        var byteString = atob(res.File.Content); //base64 解码
        var arrayBuffer = new ArrayBuffer(byteString.length); //创建缓冲数组
        var intArray = new Uint8Array(arrayBuffer); //创建视图
        for (var i = 0; i < byteString.length; i++) {
            intArray[i] = byteString.charCodeAt(i);
        }
        let blob = new Blob([intArray], {type: "application/zip"});
        let name = res.File.FileName;
        if (typeof window.navigator.msSaveBlob !== "undefined") {
            // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
            window.navigator.msSaveBlob(blob, decodeURI(name));
        } else {
            // 创建新的URL并指向File对象或者Blob对象的地址
            const blobURL = window.URL.createObjectURL(blob);
            // 创建a标签，用于跳转至下载链接
            const tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", decodeURI(name));
            // 兼容：某些浏览器不支持HTML5的download属性
            if (typeof tempLink.download === "undefined") {
                tempLink.setAttribute("target", "_blank");
            }
            // 挂载a标签
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            // 释放blob URL地址
            window.URL.revokeObjectURL(blobURL);
        }
    };
    /**
     * 上载数据
     * @returns {Promise<void>}
     */
    const dbGridUpload = async () => {
        if (fileList.length == 0) return;
        let formData = convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
        });
        fileList.forEach((file) => {
            formData.append("Files", file);
        });
        const res = await props.ajax.post('DbGrid/Upload', formData, {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        setFileList([]);
        //触发列表更新
        refreshSearch();
    }
    const queryItem = {
        style: {width: 160},
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys1, selectedRows1) => {
            setSelectedRowKeys(selectedRowKeys1);
            setSelectedRows(selectedRows1);
        },
    };
    /**
     * 获取银行账号列表
     * @returns {Promise<void>}
     * @constructor
     */
    const TransferableBankAccounts = async () => {
        var result = [];
        const res = await props.ajax.get('/Proj/TransferableBankAccounts', null, {
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        })
        result = res;
        result.map(item => {
            item.label = item.bankName;
            item.value = item.gridName
        })
        setBankAccountOption(result);
    }

    /**
     * 拆分
     * @returns {Promise<void>}
     */
    const dbGridSplit = useCallback(async (record) => {
        if (!(record?.Id)) return;
        let NewBalance = balanceForm.getFieldValue('NewBalance');
        if (!NewBalance) return;
        const res = await props.ajax.post('DbGrid/BalanceSplit', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            Id: record?.Id,
            NewBalance: NewBalance
        }), {
            successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!",
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        window.sessionStorage.removeItem(dbGridName + '-config-' + loginUser?.id)
        //触发列表更新
        refreshSearch();
    }, [refreshSearch]);
    /**
     * 恢复
     * @type {(function(*): Promise<void>)|*}
     */
    const dbGridRecovery = useCallback(
        async (Id) => {
            await props.ajax.post(`/Setting/RestoreChange`, convertToFormData({
                Id: Id,
            }), {
                successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!",
                errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
            });
            //触发列表更新
            refreshSearch();
        }, [refreshSearch]
    );
    /**
     * 工作授权
     * @type {(function(*=): Promise<void>)|*}
     */
    const dbGridApprove = useCallback(
        async (Id) => {
            await props.ajax.post(`DbGrid/Approve`, convertToFormData({
                DbGridName: dbGridName,
                Id: Id,
                draw: DRAW
            }), {
                successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!",
                errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
            });
            //触发列表更新
            refreshSearch();
        }, [refreshSearch]
    );
    /**
     * 工作开始
     * @type {(function(*=): Promise<void>)|*}
     */
    const dbGridStart = useCallback(
        async (Id) => {
            await props.ajax.post(`DbGrid/Start`, convertToFormData({
                DbGridName: dbGridName,
                Id: Id,
                draw: DRAW
            }), {
                successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!",
                errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
            });
            //触发列表更新
            refreshSearch();
        }, [refreshSearch]);
    /**
     * 工作结束
     * @type {(function(*=): Promise<void>)|*}
     */
    const dbGridFinish = useCallback(async (Id) => {
        await props.ajax.post(`DbGrid/Finish`, convertToFormData({
            DbGridName: dbGridName,
            Id: Id,
            draw: DRAW
        }), {
            successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!",
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        //触发列表更新
        refreshSearch();
    }, [refreshSearch]);
    /**
     * 转账
     * @type {(function(): Promise<void>)|*}
     */
    const dbTransfer = useCallback(async () => {
        let toBankAccount = transferForm.getFieldValue('ToBankAccount');
        let balance = transferForm.getFieldValue('Balance');
        console.log(toBankAccount);
        if (toBankAccount == undefined || toBankAccount == "" || balance == undefined || balance <= 0) {
            return;
        }
        await props.ajax.post(`/DbGrid/Transfer`, convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            to: toBankAccount,
            Balance: balance
        }), {
            successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!",
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        //触发列表更新
        refreshSearch();
        transferForm.resetFields()

    }, [refreshSearch]);
    /**
     * 打印选中记录
     * @returns {Promise<void>}
     */
    const dbGridPrint = async (Id) => {
        const res = await props.ajax.post('DbGrid/PrintSelected', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            Id: Id,
        }), {
            responseType: "blob",
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        let blob = new Blob([res]);
        let name = dbGridName + "-" + GetDateNow() + '.pdf';
        let reader = new FileReader();
        reader.readAsDataURL(blob); // 转换为base64，可以直接放入a标签href
        reader.addEventListener("load", function () {
            let base64 = reader.result
            let url = base64.split(',')[1];
            let pdfWindow = openWin('', '', 900, 600);
            pdfWindow.document.write("<iframe width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(url) + "'></iframe>");
            pdfWindow.document.title = name
            pdfWindow.document.close();
        });
        // if (typeof window.navigator.msSaveBlob !== "undefined") {
        //     // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
        //     window.navigator.msSaveBlob(blob, decodeURI(name));
        // } else {
        //     // 创建新的URL并指向File对象或者Blob对象的地址
        //     const blobURL = window.URL.createObjectURL(blob);
        //     // 创建a标签，用于跳转至下载链接
        //     const tempLink = document.createElement("a");
        //     tempLink.style.display = "none";
        //     tempLink.href = blobURL;
        //     tempLink.setAttribute("download", decodeURI(name));
        //     // 兼容：某些浏览器不支持HTML5的download属性
        //     if (typeof tempLink.download === "undefined") {
        //         tempLink.setAttribute("target", "_blank");
        //     }
        //     // 挂载a标签
        //     document.body.appendChild(tempLink);
        //     tempLink.click();
        //     document.body.removeChild(tempLink);
        //     // 释放blob URL地址
        //     window.URL.revokeObjectURL(blobURL);
        // }
    };
    /**
     * 打印全部
     * @returns {Promise<void>}
     */
    const dbGridPrintAll = async () => {
        const res = await props.ajax.post('DbGrid/PrintAll', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
        }), {
            responseType: "blob",
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        let blob = new Blob([res], {type: 'application/pdf'});
        let reader = new FileReader();
        let name = dbGridName + "-" + GetDateNow() + '.pdf';
        reader.readAsDataURL(blob); // 转换为base64，可以直接放入a标签href
        reader.addEventListener("load", function () {
            let base64 = reader.result
            let url = base64.split(',')[1];
            let pdfWindow = openWin('', '23232', 900, 600);
            pdfWindow.document.write("<iframe width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(url) + "'></iframe>");
            pdfWindow.document.title = name
            pdfWindow.document.close();
        });

        // if (typeof window.navigator.msSaveBlob !== "undefined") {
        //     // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
        //     window.navigator.msSaveBlob(blob, decodeURI(name));
        // } else {
        //     创建新的URL并指向File对象或者Blob对象的地址
        //     const blobURL = window.URL.createObjectURL(blob);
        //
        //
        //     let url = window.URL.createObjectURL(new Blob([res], { type: 'application/pdf' }))//获得一个pdf的url对象
        //     openWin(url,name,900,600)
        //     URL.revokeObjectURL(url) //释放内存
        //     // 创建a标签，用于跳转至下载链接
        //     const tempLink = document.createElement("a");
        //     tempLink.style.display = "none";
        //     tempLink.href = blobURL;
        //     tempLink.setAttribute("download", decodeURI(name));
        //     // 兼容：某些浏览器不支持HTML5的download属性
        //     if (typeof tempLink.download === "undefined") {
        //         tempLink.setAttribute("target", "_blank");
        //     }
        //     // 挂载a标签
        //     document.body.appendChild(tempLink);
        //     tempLink.click();
        //     document.body.removeChild(tempLink);
        //     // 释放blob URL地址
        //     window.URL.revokeObjectURL(blobURL);blobURL
        // }
    }
    /**
     * 打印未打印
     * @returns {Promise<void>}
     */
    const dbGridPrintAllUnprinted = async () => {
        const res = await props.ajax.post('DbGrid/PrintAll', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            UnprintedOnly: true
        }), {
            responseType: "blob",
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        let blob = new Blob([res], {type: 'application/pdf'});
        let reader = new FileReader();
        let name = dbGridName + "-" + GetDateNow() + '.pdf';
        reader.readAsDataURL(blob); // 转换为base64，可以直接放入a标签href
        reader.addEventListener("load", function () {
            let base64 = reader.result
            let url = base64.split(',')[1];
            let pdfWindow = openWin('', '23232', 900, 600);
            pdfWindow.document.write("<iframe width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(url) + "'></iframe>");
            pdfWindow.document.title = name
            pdfWindow.document.close();
        });

        // if (typeof window.navigator.msSaveBlob !== "undefined") {
        //     // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
        //     window.navigator.msSaveBlob(blob, decodeURI(name));
        // } else {
        //     创建新的URL并指向File对象或者Blob对象的地址
        //     const blobURL = window.URL.createObjectURL(blob);
        //
        //
        //     let url = window.URL.createObjectURL(new Blob([res], { type: 'application/pdf' }))//获得一个pdf的url对象
        //     openWin(url,name,900,600)
        //     URL.revokeObjectURL(url) //释放内存
        //     // 创建a标签，用于跳转至下载链接
        //     const tempLink = document.createElement("a");
        //     tempLink.style.display = "none";
        //     tempLink.href = blobURL;
        //     tempLink.setAttribute("download", decodeURI(name));
        //     // 兼容：某些浏览器不支持HTML5的download属性
        //     if (typeof tempLink.download === "undefined") {
        //         tempLink.setAttribute("target", "_blank");
        //     }
        //     // 挂载a标签
        //     document.body.appendChild(tempLink);
        //     tempLink.click();
        //     document.body.removeChild(tempLink);
        //     // 释放blob URL地址
        //     window.URL.revokeObjectURL(blobURL);blobURL
        // }
    }
    /**
     * 删除未打印
     * @type {(function(): Promise<void>)|*}
     */
    const dbGridDeleteUnprinted = useCallback(async () => {
        const res = await props.ajax.post('DbGrid/DeleteUnprinted', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
        }), {
            successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!",
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        //触发列表更新
        refreshSearch();
    }, [refreshSearch])
    /**
     * 读取表格附件
     * @type {(function(): Promise<void>)|*}
     */
    const loadGridAttachment = useCallback(async () => {
        const res = props.ajax.post("DbGrid/Attachments", convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            Id: 0,
            FolderName: '/'
        }), {errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}});


    }, []);
    /**
     * 上传配置
     * @type {{onRemove: uploadConfig.onRemove, fileList: *[], beforeUpload: (function(*): boolean)}}
     */
    const uploadConfig = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false;
        },
        fileList,
    };
    return (
        <IntlProvider locale="en" messages={locale}>
            <ConfigProvider locale={antLocale}>
                <PageContent fitHeight loading={loading}>
                    <QueryBar collapsedTips={[<FormattedMessage id="QueryBarCollapsedTips"/>,
                        <FormattedMessage id="QueryBarExpandedTips"/>]}>
                        {collapsed => (
                            <Form
                                name={dbGridName}
                                layout="inline"
                                form={form}
                                initialValues={{position: '01'}}
                                onFinish={(values) => setPageNum(1) || setConditions(values)}
                            >
                                <Row style={{marginBottom: 15, marginTop: 15}}>
                                    <FormItem
                                        hidden={false}
                                        {...queryItem}
                                        label={getLange(loginUser?.id) == "zh_CN" ? "全局搜索" : "Global search"}
                                        labelCol={{style: {width: 223}}}
                                        name={'search'}
                                        allowClear
                                        placeholder={getLange(loginUser?.id) == "zh_CN" ? "全局搜索" : "Global search"}
                                    />
                                    {searchColumns.map((item, k) => {
                                        if (item.type == 27) {//带null的Enum
                                            return (
                                                <FormItem
                                                    hidden={k < 3 ? false : collapsed}
                                                    {...queryItem}
                                                    label={item.label}
                                                    labelCol={{style: {width: 223}}}
                                                    name={item.name}
                                                    allowClear
                                                    key={item.text}
                                                    placeholder={item.text}
                                                    options={[{
                                                        value: "null",
                                                        label: getLange(loginUser?.id) == "zh_CN" ? "空" : "Null"
                                                    }].concat(item.options.map(item => {
                                                        return {value: item.value, label: item.name}
                                                    }))}
                                                />
                                            )
                                        } else if (item.type == 15 || item.type == 17 || item.type == 20) {//Enum要翻译
                                            return (
                                                <FormItem
                                                    hidden={k < 3 ? false : collapsed}
                                                    {...queryItem}
                                                    key={item.text}
                                                    label={item.label}
                                                    labelCol={{style: {width: 223}}}
                                                    name={item.name}
                                                    allowClear
                                                    placeholder={item.text}
                                                    options={item.options.map(item => {
                                                        return {
                                                            value: item.value,
                                                            label: <FormattedMessage id={item.name}/>
                                                        }
                                                    })}
                                                />
                                            )
                                        } else if (item.type == 16 || item.type == 18 || item.type == 19 || item.type == 26 || item.type == 28) { //Enum
                                            return (
                                                <FormItem
                                                    hidden={k < 3 ? false : collapsed}
                                                    {...queryItem}
                                                    key={item.text}
                                                    label={item.label}
                                                    labelCol={{style: {width: 223}}}
                                                    name={item.name}
                                                    allowClear
                                                    placeholder={item.text}
                                                    options={item.options.map(item => {
                                                        return {value: item.value, label: item.name}
                                                    })}
                                                />
                                            )
                                        } else if (item.type == 6 || item.type == 7) { //日期时间、日期
                                            return (
                                                <FormItem
                                                    hidden={k < 3 ? false : collapsed}
                                                    {...queryItem}
                                                    key={item.text}
                                                    type="date-range"
                                                    showTime
                                                    label={item.label} labelCol={{style: {width: 223}}}
                                                    placeholder={[getLange(loginUser?.id) == "zh_CN" ? "开始" : "Begin", getLange(loginUser?.id) == "zh_CN" ? "结束" : "End"]}
                                                    name={item.name}
                                                    dateFormat={"YYYY-MM-DD HH:mm:ss"}
                                                    value=""/>
                                            );
                                        } else if (item.type == 1) {//boolean类型
                                            return (
                                                <FormItem
                                                    hidden={k < 3 ? false : collapsed}
                                                    {...queryItem}
                                                    key={item.text}
                                                    type="select"
                                                    label={item.label} labelCol={{style: {width: 223}}}
                                                    placeholder={item.text} name={item.name}
                                                    options={[
                                                        {value: true, label: <FormattedMessage id="True"/>},
                                                        {value: false, label: <FormattedMessage id="False"/>}
                                                    ]}
                                                    value=""/>);
                                        } else {
                                            return (
                                                <FormItem
                                                    hidden={k < 3 ? false : collapsed}
                                                    {...queryItem}
                                                    key={item.text}
                                                    label={item.label} labelCol={{style: {width: 223}}}
                                                    placeholder={item.text} name={item.name}
                                                    value=""/>);
                                        }
                                    })}
                                </Row>
                                <Row style={{marginBottom: 15, width: "100%"}}>
                                    <Col></Col>
                                    <Col flex="auto" offset={21}>
                                        <FormItem>
                                            <Space>
                                                <Button type="primary" htmlType="submit">
                                                    <FormattedMessage id="Search"/>
                                                </Button>
                                                <Button onClick={() => form.resetFields() || refreshSearch()}>
                                                    <FormattedMessage
                                                        id="Reset"/></Button>
                                            </Space>
                                        </FormItem>
                                    </Col>
                                </Row>
                            </Form>
                        )}

                    </QueryBar>
                    <Row style={{marginBottom: 15}}>
                        <Col>
                            {balance != undefined && balance != 9999.99 ?
                                <span style={{fontSize: 18, fontWeight: "bold"}}><FormattedMessage
                                    id="FullBalance"/>： <span
                                    style={{color: "#FF6060"}}>£ {formatPrice(balance)}</span></span> : null}
                        </Col>
                        <Col flex="auto">
                            {
                                (resBtnFlags & BtnFlags.CanDelete) > 0 ?
                                    <Button size="small" type="primary" style={!btnDisabled ? {
                                        float: "right",
                                        marginRight: 10,
                                        background: "#FF6060",
                                        borderColor: '#FF6060'
                                    } : {float: "right", marginRight: 10}}
                                            onClick={() => handleDeleteBatch(selectedRowKeys)}
                                            disabled={btnDisabled}>
                                        <DeleteOutlined/> <FormattedMessage id="Delete" defaultMessage=""/>
                                    </Button>
                                    : null
                            }
                            {
                                (resBtnFlags & BtnFlags.CanGridAttachment) > 0 ?
                                    <Button size="small" type="primary" style={{
                                        float: "right",
                                        marginRight: 10,
                                        background: "#FDBE80",
                                        borderColor: '#FDBE80'
                                    }}
                                            onClick={() => setFileModaVisible(true)}>
                                        <PaperClipOutlined/> <FormattedMessage
                                        id="GridFlags_CanGridAttachment"
                                        defaultMessage="Grid Attachment"/>
                                    </Button>
                                    : null

                            }
                            {
                                (resBtnFlags & BtnFlags.CanPrintAll) > 0 ?
                                    <Button size="small" type="primary" style={{
                                        float: "right",
                                        marginRight: 10,
                                        background: "#47BC69",
                                        borderColor: '#47BC69'
                                    }}
                                            onClick={() => dbGridPrintAll()}>
                                        <PrinterOutlined/> <FormattedMessage id="GridFlags_CanPrintAll"
                                                                             defaultMessage="PrintAll"/>
                                    </Button>

                                    : null
                            }
                            {
                                (resBtnFlags & BtnFlags.CanPrintAll) > 0 || (resBtnFlags & BtnFlags.CanPrint) > 0 ?
                                    <Button size="small" type="primary" style={{
                                        float: "right",
                                        marginRight: 10,
                                        background: "#FF6060",
                                        borderColor: '#FF6060'
                                    }}
                                            onClick={() => dbGridDeleteUnprinted()}>
                                        <PrinterOutlined/> <FormattedMessage id="GridFlags_DeleteUnprinted"
                                                                             defaultMessage="DeleteUnprinted"/>
                                    </Button>

                                    : null
                            }
                            {
                                (resBtnFlags & BtnFlags.CanPrintAll) > 0 || (resBtnFlags & BtnFlags.CanPrint) > 0 ?
                                    <Button size="small" type="primary" style={{
                                        float: "right",
                                        marginRight: 10,
                                        background: "rgb(80, 193, 233)",
                                        borderColor: 'rgb(80, 193, 233)'
                                    }}
                                            onClick={() => dbGridPrintAllUnprinted()}>
                                        <PrinterOutlined/> <FormattedMessage id="GridFlags_Unprinted"
                                                                             defaultMessage="Print Unprinted"/>
                                    </Button>

                                    : null
                            }
                            {
                                (resBtnFlags & BtnFlags.CanTransfer) > 0 ?
                                    <Button size="small" type="primary" style={{
                                        float: "right",
                                        marginRight: 10,
                                        background: "#FFBF10",
                                        borderColor: '#FFBF10'
                                    }}
                                            onClick={() => setTransferVisible(true) || setRecord(record) || TransferableBankAccounts()}>
                                        <PayCircleOutlined/> <FormattedMessage id="GridFlags_CanTransfer"
                                                                               defaultMessage="Transfer"/>
                                    </Button>

                                    : null
                            }
                            {
                                ((resBtnFlags & BtnFlags.CanUpload) > 0) ?
                                    <Button size="small" type="primary" style={{
                                        float: "right",
                                        marginRight: 10,
                                        background: "#3ABFB7",
                                        borderColor: '#3ABFB7'
                                    }}
                                            onClick={() => setUploadVisible(true)}>
                                        <UploadOutlined/> <FormattedMessage id="GridFlags_CanUpload"
                                                                            defaultMessage="Upload"/>
                                    </Button>

                                    : null
                            }
                            {
                                (resBtnFlags & BtnFlags.CanDownload) > 0 ?
                                    <Button size="small" type="primary" style={{
                                        float: "right",
                                        marginRight: 10,
                                        background: "#FF9F54",
                                        borderColor: '#FF9F54'
                                    }}
                                            onClick={() => dbGridDownload()}>
                                        <DownloadOutlined/> <FormattedMessage id="GridFlags_CanDownload"
                                                                              defaultMessage="Download"/>
                                    </Button>

                                    : null
                            }
                            {
                                (resBtnFlags & BtnFlags.CanAdd) > 0 ?
                                    <Button size="small" type="primary"
                                            style={{float: "right", marginRight: 10}}
                                            onClick={() => setRecord(null) || setVisible(true) || setIsCreate(true) || setIsDetail(false) || setIsEdit(false)}>
                                        <PlusOutlined/> <FormattedMessage id="Create" defaultMessage=""/>
                                    </Button>
                                    : null
                            }
                            {
                                gridClassName == "ShippingLabelAccountClassName" ?
                                    <Button size="small" type="primary"
                                            style={{
                                                float: "right", marginRight: 10, background: "#FF9F54",
                                                borderColor: '#FF9F54'
                                            }}
                                            onClick={() => batchPrint()}>
                                        <SnippetsOutlined/> <FormattedMessage id="GridFlags_BatchPrinting"
                                                                              defaultMessage="Batch Printing"/>
                                    </Button>
                                    : null
                            }
                            {(resBtnFlags & BtnFlags.IncludeArchived) > 0 ?
                                <Switch style={{
                                    float: "right",
                                    marginRight: 10,
                                }} onChange={(checked) => setDisableStatus(checked)}/>
                                : null}


                        </Col>
                    </Row>
                    <ToolBar>
                    </ToolBar>
                    <Table
                        onRow={record => {
                            return {
                                onDoubleClick: (e) => e.stopPropagation() || setRecord({
                                    ...record,
                                    isDetail: true
                                }) || setVisible(true) || setIsDetail(true) || setIsEdit(false),
                            };
                        }}
                        rowSelection={rowSelection}
                        pageNum={pageNum}
                        pageSize={pageSize}
                        fitHeight
                        dataSource={dataSource}
                        columns={tableColumns}
                        rowKey={record => record.Id}
                        onChange={handleTableChange}
                    />
                    <Pagination
                        total={total}
                        pageNum={pageNum}
                        pageSize={pageSize}
                        onPageNumChange={setPageNum}
                        showTotal={(t) => <FormattedMessage id="Pagination" values={{total: t}}
                                                            defaultMessage=""/>}
                        onPageSizeChange={(pageSize) => setPageNum(1) || setPageSize(pageSize)}
                    />
                    {gridClassName != 'PaymentToSuppliersClassName' ? <EditModal
                        visible={visible}
                        dbGridName={dbGridName}
                        record={record}
                        isEdit={isEdit}
                        isCreate={isCreate}
                        formColums={formColumns}
                        formAddressColums={formAddressColumns}
                        antLocale={antLocale}
                        locale={locale}
                        onOk={() => setVisible(false) || refreshSearch()}
                        onCancel={() => setVisible(false)}
                        includes={includes}
                        isDetail={isDetail}
                        resBtnFlags={resBtnFlags}
                        childRef={childForm}
                    /> : null}

                    {gridClassName == 'PaymentToSuppliersClassName' ? <CreateModal
                        visible={visible}
                        dbGridName={dbGridName}
                        formColums={formColumns}
                        antLocale={antLocale}
                        locale={locale}
                        onOk={() => setVisible(false) || refreshSearch()}
                        onCancel={() => setVisible(false)}
                    /> : null}

                    <TableModal
                        visible={isModalVisible}
                        title={modalTitle}
                        onOk={() => {
                        }}
                        onCancel={() => setIsModalVisible(false)}
                        subTableHeader={subTableHeader}
                        subTable={subTable}
                        dbGridName={dbGridName}
                        subTableType={subTableType}
                    />
                    <TableList
                        visible={isListVisible}
                        title={modalTitle}
                        onOk={() => {
                        }}
                        onCancel={() => setIsListVisible(false)}
                        dbGridName={dbGridName}
                        subTableHeader={subTableHeader}
                        subTable={subTable}
                        subTableType={subTableType}
                    />
                    <Modal
                        visible={uploadVisible}
                        onCancel={() => setUploadVisible(false)}
                        onOk={() => setUploadVisible(false) || dbGridUpload()}
                        title={<FormattedMessage id="GridFlags_CanUpload"
                                                 defaultMessage="Upload"/>}
                    >
                        <Content style={{padding: 20}}>
                            <Form autoComplete="off" style={{paddingTop: 30}}>
                                <FormItem label={<FormattedMessage id="GridFlags_CanUploadAttachment"/>}>
                                    <Upload {...uploadConfig} multiple>
                                        <Button type="primary" icon={<UploadOutlined/>}>
                                            <FormattedMessage id="UploadFile"/>
                                        </Button>
                                    </Upload>
                                </FormItem>
                            </Form>
                        </Content>
                    </Modal>
                    <Modal
                        visible={splitVisible}
                        onCancel={() => setSplitVisible(false)}
                        onOk={() => setSplitVisible(false) || (record) || balanceForm.resetFields()}
                    >
                        <Form autoComplete="off" style={{paddingTop: 30}} form={balanceForm}>
                            <FormItem type="number" placeholder="NewBalance" name="NewBalance" required
                                      min={1}
                                      label={<FormattedMessage id="NewBalance"/>}>
                            </FormItem>
                        </Form>
                    </Modal>
                    <Modal
                        visible={transferVisible}
                        onCancel={() => setTransferVisible(false)}
                        onOk={() => setTransferVisible(false) || dbTransfer() || transferForm.resetFields()}
                    >
                        <Form autoComplete="off" style={{paddingTop: 30}} form={transferForm}>
                            <FormItem placeholder="ToBankAccount" name="ToBankAccount" required
                                      min={1}
                                      label={<FormattedMessage id="Banks"/>}
                                      options={bankAccountOption}
                            >
                            </FormItem>
                            <FormItem type="number" placeholder="Balance" name="Balance" required
                                      min={1}
                                      label={<FormattedMessage id="Balance"/>}>
                            </FormItem>
                        </Form>
                    </Modal>
                    <FileModal
                        visible={fileModaVisible}
                        title={<><FormattedMessage id="GridFlags_CanGridAttachment"
                                                   defaultMessage="Grid Attachment"/> - <FormattedMessage
                            id={dbGridName}/></>}
                        onOk={() => {
                            setFileModaVisible(false);
                            //获取附件管理子组件文件封装数据
                            var handleUploadData = fileModal.current.onHandleUploadFile;
                            var handleUploadFile = fileModal.current.onUploadFile;
                            console.log(handleUploadData);
                            console.log(handleUploadFile);
                            var onPath = fileModal.current.onPath;
                            setTimeout(async () => {
                                var folderName = '';
                                handleUploadData.WithChildrenAttachments.map(item => {
                                    if (item.IsDirectory == false) {
                                        folderName = item.FolderName
                                    }
                                });
                                if (folderName && handleUploadFile.length > 0) {
                                    handleUploadFile.map((file) => {
                                        var fileName = "";
                                        fileName = folderName + file.name;
                                        var formData = convertToFormData({
                                            DbGridName: dbGridName,
                                            Id: 0,
                                            draw: DRAW,
                                            FolderName: folderName,
                                            FileName: fileName
                                        }, {
                                            errorModal: {
                                                okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"),
                                                width: "70%"
                                            },
                                        });
                                        formData.append("Files", file);
                                        setTimeout(async () => {
                                            await props.ajax.post('DbGrid/UploadAttachment', formData);
                                        }, 0)

                                    });

                                }
                            }, 0);
                        }}
                        onCancel={() => setFileModaVisible(false)}
                        fileType={4}
                        dbGridName={dbGridName}
                        record={{}}
                        cRef={fileModal}
                        uploadItemName={uploadItemName}
                        viewFilePath={viewFilePath}
                        viewFile={viewFile}
                        antLocale={antLocale}
                    />


                </PageContent>
            </ConfigProvider>
        </IntlProvider>
    );
});
