import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {Button, Form, Space, ConfigProvider, Modal, Upload, Col, Row, Dropdown, Menu, Popconfirm} from 'antd';
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
    formatPrice
} from "src/commons/common";
import {getLange, setLange} from 'src/commons';
import {FormattedMessage, IntlProvider} from 'react-intl'; /* react-intl imports */
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import {useLocation} from "react-router-dom";
import {DbGridNames} from "src/commons/dbgridconfig";
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
    PlayCircleOutlined
} from "@ant-design/icons";

export default config({
    path: '/Roles',
})(function Roles(props) {
    const dbGridName = DbGridNames.Roles;
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
    const [order, setOrder] = useState();
    const [includes, setIncludes] = useState();
    const [searchFormData, setSearchFormData] = useState([]);
    const [uploadVisible, setUploadVisible] = useState(false);
    const [splitVisible, setSplitVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState();
    const [btnDisabled, setBtnDisabled] = useState(true);
    const [form] = Form.useForm();
    const [balanceForm] = Form.useForm();
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }
    console.log(useQuery().get("Access"));
    useEffect(async () => {
        const resp = await fetch(`./lang/${lang}.json`)
        const data = await resp.json();
        const localization = await fetch(`./lang/${lang}_Localization.json`);
        const errorJson = await localization.json();
        window.sessionStorage.setItem("error-json-" + loginUser?.id, JSON.stringify(errorJson));
        if (lang == "zh_CN") {
            setAntLocale(zhCN);
        } else {
            setAntLocale(enUS);
        }
        setLocale(data);
        if (selectedRowKeys.length > 0) {
            console.log(selectedRowKeys);
            setBtnDisabled(false);
        } else {
            setBtnDisabled(true);
        }

    }, [lang, fileList, selectedRowKeys, isEdit, isDetail]);
    //????????????
    const handleTableChange = (newPagination, filters, sorter) => {
        setOrder([
            {
                column: sorter.field,
                dir: sorter.order == "ascend" ? "asc" : "desc"
            }
        ])
    };
    const params = useMemo(() => {
        resault = JSON.parse(window.sessionStorage.getItem(dbGridName + '-config-' + loginUser?.id));
        if (!resault) {
            //????????????????????????
            asyncConfigData(dbGridName);
            resault = JSON.parse(window.sessionStorage.getItem(dbGridName + '-config-' + loginUser?.id));
        }
        //???????????????????????????
        const resColums = handleGridDataTypeColumn(resault.ColumnConfigs, isModalVisible, setIsModalVisible, setSubTableHeader, setSubTable, setModalTitle, setSubTableType, setIsListVisible);
        console.log(resColums);
        let apiIncludes = resault.Includes.map((item) => item.Name);
        setIncludes(apiIncludes);
        resColums.table_colums.push({
            title: <FormattedMessage id="Operation"/>,
            key: 'operator',
            width: 80,
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
                            style={{color:"#1991FF"}}
                            onClick={() => setRecord({
                                ...record,
                                isDetail: true
                            }) || setVisible(true) || setIsDetail(true) || setIsEdit(false)}
                        >
                            <FormattedMessage id="View"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanUpdate) > 0) ? <Menu.Item
                            icon={<EditOutlined/>}
                            style={{color:"#FF9F54"}}
                            onClick={() => setRecord(record) || setVisible(true) || setIsDetail(false) || setIsEdit(true)}
                        >
                            <FormattedMessage id="Edit"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanPrint) > 0) ? <Menu.Item
                            icon={<PrinterOutlined/>}
                            style={{color:"#47BC69"}}
                            onClick={() => dbGridPrint(id)}
                        >
                            <FormattedMessage
                                id="GridFlags_CanPrint" defaultMessage="Print"/>
                        </Menu.Item> : null}
                        {(resault.Balance != 9999.99 && resault.Balance != 0) ? <Menu.Item
                            icon={<BlockOutlined/>}
                            style={{color:"#FFBF10"}}
                            onClick={() => setSplitVisible(true) || setRecord(record)}
                        >
                            <FormattedMessage
                                id="Split" defaultMessage="Split"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanApprove) > 0) ? <Menu.Item
                            icon={<UserAddOutlined/>}
                            style={{color:"#CDCDCD"}}
                            onClick={() => dbGridApprove(record?.Id)}
                            disabled={record?.ApprovedByUserId != undefined && !record?.ApprovedByUserId && record?.Status == 16 ? false : true}
                        >
                            <FormattedMessage
                                id="GridFlags_CanApprove"
                                defaultMessage="Approve"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanStart) > 0) ? <Menu.Item
                            icon={<PlayCircleOutlined/>}
                            style={{color:"#3CC9C1"}}
                            onClick={() => dbGridStart(record?.Id)}
                            disabled={record?.ApprovedByUserId != undefined && record?.ApprovedByUserId && record?.Status == 16384 && (!record?.StartTime || !record?.StartDate) ? false : true}
                        >
                            <FormattedMessage id="GridFlags_CanStart" defaultMessage="Start"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanFinish) > 0) ? <Menu.Item
                            icon={<PoweroffOutlined/>}
                            style={{color:"#23B258"}}
                            onClick={() => dbGridFinish(record?.Id)}
                            disabled={record?.ApprovedByUserId != undefined && record?.ApprovedByUserId && record?.Status == 16384 && (record?.StartTime || record?.StartDate) ? false : true}
                        >
                            <FormattedMessage id="GridFlags_CanFinish" defaultMessage="Finish"/>
                        </Menu.Item> : null}
                        {((resault.BtnFlags & BtnFlags.CanDelete) > 0) ? <Menu.Item
                            icon={<DeleteOutlined/>}
                            style={{color:"#FF6565"}}
                            onClick={() => handleDelete(id, record?.Name)}
                        >
                            <FormattedMessage id="Delete"/>
                        </Menu.Item> : null}
                    </Menu>
                )
                // //???????????????????????????
                // if ((resault.BtnFlags & BtnFlags.CanDelete) > 0) {
                //     items.push({
                //         label: <FormattedMessage id="Delete"/>,
                //         color: 'red',
                //         confirm: {
                //             title: <FormattedMessage id="DeleteConfirmMsg" values={{name: `${name}`}}/>,
                //             onConfirm: () => handleDelete(id),
                //         },
                //     });
                // }

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
        let searchData = [];
        Object.keys(conditions).forEach(key => {
            if (conditions[key] !== undefined) {
                if (conditions[key] instanceof Array) {
                    searchData.push({name: key, min: conditions[key][0], max: conditions[key][1]});
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
            advancedSearchFormData: searchData
        };

    }, [conditions, pageNum, pageSize, order]);
    // // ?????????????????????????????????????????????
    const refreshSearch = useCallback(() => {
        setConditions(form.getFieldsValue());
    }, [form]);
    // ????????????
    const {data: {dataSource, total, balance} = {}} = props.ajax.usePost('DbGrid/Page', params, [params], {
        headers: {'Content-Type': 'multipart/form-data'},
        setLoading,
        formatResult: (res) => {
            return {
                dataSource: res?.data || [],
                total: res?.recordsTotal || 0,
                balance: res?.Balance || 9999.99
            };
        },
    });
    const handleDelete = useCallback(
        async (id, name) => {
            await confirm({
                title: getLange(loginUser?.id) == "zh_CN" ? "??????" : "Tips",
                content: getLange(loginUser?.id) == "zh_CN" ? "??????????????????" + name + "?????????" : "Are you sure you want to delete [{" + name + "}]?",

            });
            await props.ajax.post(`DbGrid/Delete`, {
                "DbGridName": dbGridName,
                'Id': id,
                "Permanent": true,
                "draw": DRAW
            }, {
                headers: {'Content-Type': 'multipart/form-data'},
                setLoading, successTip: getLange(loginUser?.id) == "zh_CN" ? "????????????" : "Deletion succeeded!"
            });
            // ??????????????????
            refreshSearch();
        },
        [refreshSearch],
    );
    /**
     * ????????????
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
                setLoading, successTip: getLange(loginUser?.id) == "zh_CN" ? "????????????" : "Deletion succeeded!"
            });
            // ??????????????????
            refreshSearch();
        },
        [refreshSearch],
    );
    /**
     * ??????
     * @returns {Promise<void>}
     */
    const dbGridDownload = async () => {
        const res = await props.ajax.post('DbGrid/Download', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            AdvancedSearch: JSON.stringify(searchFormData)
        }), {responseType: "blob"});
        let blob = new Blob([res]);
        let name = dbGridName + "-" + GetDateNow() + '.csv';
        if (typeof window.navigator.msSaveBlob !== "undefined") {
            // ??????IE???window.navigator.msSaveBlob??????????????????????????????
            window.navigator.msSaveBlob(blob, decodeURI(name));
        } else {
            // ????????????URL?????????File????????????Blob???????????????
            const blobURL = window.URL.createObjectURL(blob);
            // ??????a????????????????????????????????????
            const tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", decodeURI(name));
            // ?????????????????????????????????HTML5???download??????
            if (typeof tempLink.download === "undefined") {
                tempLink.setAttribute("target", "_blank");
            }
            // ??????a??????
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            // ??????blob URL??????
            window.URL.revokeObjectURL(blobURL);
        }
    };
    /**
     * ????????????
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
        const res = await props.ajax.post('DbGrid/Upload', formData);
        setFileList([]);
    };
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
     * ??????
     * @returns {Promise<void>}
     */
    const dbGridSplit = async () => {
        if (!(record?.Id)) return;
        let NewBalance = balanceForm.getFieldValue('NewBalance');
        if (!NewBalance) return;
        const res = await props.ajax.post('DbGrid/BalanceSplit', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            Id: record?.Id,
            NewBalance: NewBalance
        }), {successTip: getLange(loginUser?.id) == "zh_CN" ? "????????????" : "Operation successful!"});
    }
    /**
     * ????????????
     * @type {(function(*=): Promise<void>)|*}
     */
    const dbGridApprove = useCallback(
        async (Id) => {
            await props.ajax.post(`DbGrid/Approve`, convertToFormData({
                DbGridName: dbGridName,
                Id: Id,
                draw: DRAW
            }), {
                successTip: getLange(loginUser?.id) == "zh_CN" ? "????????????" : "Operation successful!"
            });
            //??????????????????
            refreshSearch();
        }, [refreshSearch]
    );
    /**
     * ????????????
     * @type {(function(*=): Promise<void>)|*}
     */
    const dbGridStart = useCallback(
        async (Id) => {
            await props.ajax.post(`DbGrid/Start`, convertToFormData({
                DbGridName: dbGridName,
                Id: Id,
                draw: DRAW
            }), {
                successTip: getLange(loginUser?.id) == "zh_CN" ? "????????????" : "Operation successful!"
            });
            //??????????????????
            refreshSearch();
        }, [refreshSearch]);
    /**
     * ????????????
     * @type {(function(*=): Promise<void>)|*}
     */
    const dbGridFinish = useCallback(async (Id) => {
        await props.ajax.post(`DbGrid/Finish`, convertToFormData({
            DbGridName: dbGridName,
            Id: Id,
            draw: DRAW
        }), {
            successTip: getLange(loginUser?.id) == "zh_CN" ? "????????????" : "Operation successful!"
        });
        //??????????????????
        refreshSearch();
    }, [refreshSearch]);
    /**
     * ??????????????????
     * @returns {Promise<void>}
     */
    const dbGridPrint = async (Id) => {
        const res = await props.ajax.post('DbGrid/PrintSelected', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            Id: Id,
        }), {responseType: "blob"});
        let blob = new Blob([res]);
        let name = dbGridName + "-" + GetDateNow() + '.pdf';
        if (typeof window.navigator.msSaveBlob !== "undefined") {
            // ??????IE???window.navigator.msSaveBlob??????????????????????????????
            window.navigator.msSaveBlob(blob, decodeURI(name));
        } else {
            // ????????????URL?????????File????????????Blob???????????????
            const blobURL = window.URL.createObjectURL(blob);
            // ??????a????????????????????????????????????
            const tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", decodeURI(name));
            // ?????????????????????????????????HTML5???download??????
            if (typeof tempLink.download === "undefined") {
                tempLink.setAttribute("target", "_blank");
            }
            // ??????a??????
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            // ??????blob URL??????
            window.URL.revokeObjectURL(blobURL);
        }
    };
    /**
     * ????????????
     * @returns {Promise<void>}
     */
    const dbGridPrintAll = async () => {
        const res = await props.ajax.post('DbGrid/PrintAll', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            UnprintedOnly: false
        }), {responseType: "blob"});
        let blob = new Blob([res]);
        let name = dbGridName + "-" + GetDateNow() + '.pdf';
        if (typeof window.navigator.msSaveBlob !== "undefined") {
            // ??????IE???window.navigator.msSaveBlob??????????????????????????????
            window.navigator.msSaveBlob(blob, decodeURI(name));
        } else {
            // ????????????URL?????????File????????????Blob???????????????
            const blobURL = window.URL.createObjectURL(blob);
            // ??????a????????????????????????????????????
            const tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", decodeURI(name));
            // ?????????????????????????????????HTML5???download??????
            if (typeof tempLink.download === "undefined") {
                tempLink.setAttribute("target", "_blank");
            }
            // ??????a??????
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            // ??????blob URL??????
            window.URL.revokeObjectURL(blobURL);
        }
    }
    /**
     * ????????????
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
                                {searchColumns.map((item, k) => {
                                    if (item.type == 27) {//???null???Enum
                                        return (<FormItem
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
                                                label: getLange(loginUser?.id) == "zh_CN" ? "???" : "Null"
                                            }].concat(item.options.map(item => {
                                                return {value: item.value, label: item.name}
                                            }))}
                                        />)
                                    } else if (item.type == 15 || item.type == 17 || item.type == 20) {//Enum?????????
                                        return (<FormItem
                                            hidden={k < 3 ? false : collapsed}
                                            {...queryItem}
                                            key={item.text}
                                            label={item.label}
                                            labelCol={{style: {width: 223}}}
                                            name={item.name}
                                            allowClear
                                            placeholder={item.text}
                                            options={item.options.map(item => {
                                                return {value: item.value, label: <FormattedMessage id={item.name}/>}
                                            })}
                                        />)
                                    } else if (item.type == 16 || item.type == 18 || item.type == 19 || item.type == 26 || item.type == 28) { //Enum
                                        return (<FormItem
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
                                        />)
                                    } else if (item.type == 6 || item.type == 7) { //?????????????????????
                                        return (
                                            <FormItem
                                                hidden={k < 3 ? false : collapsed}
                                                {...queryItem}
                                                key={item.text}
                                                type="date-range"
                                                showTime
                                                label={item.label} labelCol={{style: {width: 223}}}
                                                placeholder={[getLange(loginUser?.id) == "zh_CN" ? "??????" : "Begin", getLange(loginUser?.id) == "zh_CN" ? "??????" : "End"]}
                                                name={item.name}
                                                dateFormat={"YYYY-MM-DD HH:mm:ss"}
                                                value=""/>
                                        );
                                    } else if (item.type == 1) {//boolean??????
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
                                <FormItem>
                                    <Space>
                                        <Button type="primary" htmlType="submit">
                                            <FormattedMessage id="Search"/>
                                        </Button>
                                        <Button onClick={() => form.resetFields() || refreshSearch()}> <FormattedMessage
                                            id="Reset"/></Button>
                                    </Space>
                                </FormItem>
                            </Form>
                        )}

                    </QueryBar>
                    <Row style={{marginBottom: 15}}>
                        <Col flex="14rem">
                            {balance != undefined && balance != 9999.99 ?
                                <span style={{fontSize: 18, fontWeight: "bold"}}><FormattedMessage
                                    id="FullBalance"/>??? <span style={{color: "#FF6060"}}>$ {formatPrice(balance)}</span></span> : null}
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
                                    <Button size="small" type="primary" style={{float: "right", marginRight: 10}}
                                            onClick={() => setRecord(null) || setVisible(true) || setIsCreate(true) || setIsDetail(false) || setIsEdit(false)}>
                                        <PlusOutlined/> <FormattedMessage id="Create" defaultMessage=""/>
                                    </Button>
                                    : null
                            }


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
                        showTotal={(t) => <FormattedMessage id="Pagination" values={{total: t}} defaultMessage=""/>}
                        onPageSizeChange={(pageSize) => setPageNum(1) || setPageSize(pageSize)}
                    />
                    <EditModal
                        visible={visible}
                        dbGridName={dbGridName}
                        record={record}
                        isEdit={isEdit}
                        isCreate={isCreate}
                        formColums={formColumns}
                        antLocale={antLocale}
                        locale={locale}
                        onOk={() => setVisible(false) || refreshSearch()}
                        onCancel={() => setVisible(false)}
                        includes={includes}
                        isDetail={isDetail}
                    />
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
                        onOk={() => setSplitVisible(false) || dbGridSplit() || balanceForm.resetFields()}
                    >
                        <Form autoComplete="off" style={{paddingTop: 30}} form={balanceForm}>
                            <FormItem type="number" placeholder="NewBalance" name="NewBalance" required min={1}
                                      label={<FormattedMessage id="NewBalance"/>}>
                            </FormItem>
                        </Form>
                    </Modal>
                </PageContent>
            </ConfigProvider>
        </IntlProvider>
    );
});
