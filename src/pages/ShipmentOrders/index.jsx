import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {Button, Form, Space, ConfigProvider, Modal, Upload} from 'antd';
import {
    PageContent,
    QueryBar,
    FormItem,
    Table,
    Pagination,
    Operator,
    ToolBar,
    getLoginUser,
    Content
} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import {DRAW} from 'src/config';
import EditModal from 'src/components/edit/EditModal';
import {handleGridDataTypeColumn, BtnFlags, asyncConfigData, convertToFormData, GetDateNow} from "src/commons/common";
import {getLange} from 'src/commons';
import {FormattedMessage, IntlProvider} from 'react-intl'; /* react-intl imports */
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import {useLocation} from "react-router-dom";
import {DbGridNames} from "src/commons/dbgridconfig";
import TableModal from "src/pages/GridTools/TableModal";
import TableList from "src/pages/GridTools/TableList";
import {UploadOutlined} from "@ant-design/icons";

export default config({
    path: '/ShipmentOrders',
})(function ShipmentOrders(props) {
    const dbGridName = DbGridNames.ShipmentOrders;
    let resault;
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
    const [fileList, setFileList] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState();
    const [btnDisabled, setBtnDisabled] = useState({
        print: true,
        printAll: true,
        start: true,
        finish: true,
        approve: true
    });
    const [form] = Form.useForm();
    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }
    // console.log(useQuery().get("Access"));
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
        setLocale(data)
    }, [lang, fileList]);
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
        //获取表格配置信息
        asyncConfigData(dbGridName);
        resault = JSON.parse(window.sessionStorage.getItem(dbGridName + '-config-' + loginUser?.id));
        //处理表格显示的字段
        const resColums = handleGridDataTypeColumn(resault.ColumnConfigs, isModalVisible, setIsModalVisible, setSubTableHeader, setSubTable, setModalTitle, setSubTableType, setIsListVisible);
        console.log(resColums);
        let apiIncludes = resault.Includes.map((item) => item.Name);
        setIncludes(apiIncludes);
        resColums.table_colums.push({
            title: <FormattedMessage id="Operation"/>,
            key: 'operator',
            width: 250,
            fixed: 'right',
            render: (value, record) => {
                const id = record.Id;
                const name = record.Name
                const items = [];
                //判断是否有查看权限
                if ((resault.BtnFlags & BtnFlags.CanView) > 0) {
                    items.push({
                        label: <FormattedMessage id="View"/>,
                        onClick: () => setRecord({
                            ...record,
                            isDetail: true
                        }) || setVisible(true) || setIsDetail(true) || setIsEdit(false),
                    });
                }
                //判断是否有编辑权限
                if ((resault.BtnFlags & BtnFlags.CanUpload) > 0) {
                    items.push({
                        label: <FormattedMessage id="Edit"/>,
                        onClick: () => setRecord(record) || setVisible(true) || setIsDetail(false) || setIsEdit(true),
                    });
                }
                //判断是否有删除权限
                if ((resault.BtnFlags & BtnFlags.CanDelete) > 0) {
                    items.push({
                        label: <FormattedMessage id="Delete"/>,
                        color: 'red',
                        confirm: {
                            title: <FormattedMessage id="DeleteConfirmMsg" values={{name: `${name}`}}/>,
                            onConfirm: () => handleDelete(id),
                        },
                    });
                }
                return <Operator items={items}/>;
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
    // // 使用现有查询条件，重新发起请求
    const refreshSearch = useCallback(() => {
        setConditions(form.getFieldsValue());
    }, [form]);
    // 获取列表
    const {data: {dataSource, total} = {}} = props.ajax.usePost('DbGrid/Page', params, [params], {
        headers: {'Content-Type': 'multipart/form-data'},
        setLoading,
        formatResult: (res) => {
            return {
                dataSource: res?.data || [],
                total: res?.recordsTotal || 0,
            };
        },
    });
    const handleDelete = useCallback(
        async (id) => {
            await props.ajax.post(`DbGrid/Delete`, {
                "DbGridName": dbGridName,
                'Id': id,
                "Permanent": true,
                "draw": DRAW
            }, {
                headers: {'Content-Type': 'multipart/form-data'},
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
            AdvancedSearch: JSON.stringify(searchFormData)
        }), {responseType: "blob"});
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
        const res = await props.ajax.post('DbGrid/Upload', formData);
        setFileList([]);
    };
    const queryItem = {
        style: {width: 160},
    };
    const rowSelection = {
        type: 'radio',
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
            console.log(selectedRowKeys);
            console.log(selectedRows);
            if (selectedRowKeys.length > 0) {
                btnDisabled.print = false;
                setBtnDisabled(btnDisabled)
            }
        },
    };
    const dbGridStart = async () => {

    };
    /**
     * 打印选中记录
     * @returns {Promise<void>}
     */
    const dbGridPrint = async () => {
        if (selectedRowKeys.length == 0) return;
        const res = await props.ajax.post('DbGrid/PrintSelected', convertToFormData({
            DbGridName: dbGridName,
            draw: DRAW,
            Id: selectedRowKeys[0],
        }), {responseType: "blob"});
        let blob = new Blob([res]);
        let name = dbGridName + "-" + GetDateNow() + '.pdf';
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
     * 打印全部
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
    }
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
                                {searchColumns.map((item, k) => {
                                    if (item.type == 27) {//带null的Enum
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
                                                label: getLange(loginUser?.id) == "zh_CN" ? "空" : "Null"
                                            }].concat(item.options.map(item => {
                                                return {value: item.value, label: item.name}
                                            }))}
                                        />)
                                    } else if (item.type == 15 || item.type == 17 || item.type == 20) {//Enum要翻译
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
                    <ToolBar>

                        {
                            (resBtnFlags & BtnFlags.CanAdd) > 0 ?
                                <Button type="primary"
                                        onClick={() => setRecord(null) || setVisible(true) || setIsCreate(true) || setIsDetail(false) || setIsEdit(false)}>
                                    <FormattedMessage id="Create" defaultMessage=""/>
                                </Button> : null
                        }
                        {
                            (resBtnFlags & BtnFlags.CanDownload) > 0 ?
                                <Button type="primary"
                                        onClick={() => dbGridDownload()}>
                                    <FormattedMessage id="GridFlags_CanDownload" defaultMessage="Download"/>
                                </Button>
                                : null
                        }
                        {
                            ((resBtnFlags & BtnFlags.CanUpload) > 0) ?
                                <Button type="primary"
                                        onClick={() => setUploadVisible(true)}>
                                    <FormattedMessage id="GridFlags_CanUpload" defaultMessage="Upload"/>
                                </Button>
                                : null
                        }
                        {
                            (resBtnFlags & BtnFlags.CanPrint) > 0 ?
                                <Button type="primary"
                                        onClick={() => dbGridPrint()}
                                        disabled={btnDisabled.print}
                                >
                                    <FormattedMessage id="GridFlags_CanPrint" defaultMessage="Print"/>
                                </Button>
                                : null

                        }
                        {
                            (resBtnFlags & BtnFlags.CanPrintAll) > 0 ?
                                <Button type="primary"
                                        onClick={() => dbGridPrintAll()}>
                                    <FormattedMessage id="GridFlags_CanPrintAll" defaultMessage="PrintAll"/>
                                </Button>
                                : null
                        }
                        {
                            (resBtnFlags & BtnFlags.CanStart) > 0 ?
                                <Button type="primary"
                                        onClick="">
                                    <FormattedMessage id="GridFlags_CanStart" defaultMessage=""/>
                                </Button>
                                : null
                        }
                    </ToolBar>
                    <Table
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
                </PageContent>
            </ConfigProvider>
        </IntlProvider>
    );
});
