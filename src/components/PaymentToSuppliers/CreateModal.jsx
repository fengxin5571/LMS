import React, {useCallback, useEffect, useState, useRef} from 'react';
// 引入编辑器组件
import BraftEditor, {EditorState} from 'braft-editor'
// 引入编辑器样式
import 'braft-editor/dist/index.css'
import {Card, Form, ConfigProvider, Row, Col, Menu, Modal, Dropdown, Space} from 'antd';
import {ModalContent, FormItem, Content, useDebounceValidator, getLoginUser, Table, Pagination} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import {WITH_SYSTEMS, DRAW} from 'src/config';
import {convertToFormData, formatPrice, handleFormItem} from "src/commons/common";
import {FormattedMessage, IntlProvider} from 'react-intl'
import {getLange} from "src/commons";
import FileModal from "../form/FileModal";
import {BlockOutlined, CodeSandboxOutlined, EllipsisOutlined} from "@ant-design/icons";
import {value} from "lodash/seq";

export default config({
    modal: {
        title: (props) => (<FormattedMessage id={props.dbGridName}/>),
        width: '85%',
        top: 50,

    },
})(function Edit(props) {
    const loginUser = getLoginUser();
    const {onOk, formColums, antLocale, locale, includes, dbGridName} = props;
    const [loadRecord, setloadRecord] = useState();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [fileType, setFileType] = useState(0);
    const [refreshLoad, setRefreshLoad] = useState(false);
    const [modalTitle, setModalTitle] = useState();
    const [form] = Form.useForm();
    const [colLayout, setColLayout] = useState({span: 24});
    const [formViewUploadData, setFormViewUploadData] = useState({WithChildrenAttachments: []});
    const [viewFilePath, setViewFilePath] = useState([]);
    const [viewFile, setViewFile] = useState([]);
    const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null));
    const [uploadItemName, setUploadItemName] = useState();
    const [treeData, setTreeData] = useState([]);
    const [optionsSup, setOptionsSup] = useState([]);
    const [bankAccountOption, setBankAccountOption] = useState([]);
    const [supplierId, setSupplierId] = useState(0);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [dataSource, setDataSource] = useState([]);
    const [total, setTotal] = useState(0);
    const [selectedRowKeysCreate, setSelectedRowKeysCreate] = useState([]);
    const [selectedRowsCreate, setSelectedRowsCreate] = useState();
    const [totalBalance, setTotalBalance] = useState(0);
    const [splitVisible, setSplitVisible] = useState(false);
    const [record, setRecord] = useState({});
    const [balanceForm] = Form.useForm();
    const fileModal = useRef();
    useEffect(async () => {
        formColums.forEach((item) => {
            if (item.type == 28) {
                setColLayout({xs: {span: 24}, sm: {span: 14}});
            }
            if (item.name == 'SupplierId') { // 获取供应商列表
                item.options.map(item => {
                    item.label = item.name;
                })
                setOptionsSup(item.options);
            }
        });
        //获取银行账号列表
        TransferableBankAccounts();
    }, [treeData]);
    useEffect(async () => {
        let params = {
            draw: DRAW,
            pageNum,
            pageSize,
            length: pageSize,
            DisableStatus: false,
            start: pageNum == 1 ? 0 : (pageNum - 1) * pageSize,
            grid: 'Supplier Invoices',
            columns: [
                {
                    name: 'Id',
                    searchable: false
                },
                {
                    name: 'Balance',
                    searchable: true
                },
                {
                    name: 'Name',
                    searchable: true
                },
                {
                    name: 'OriginInvoiceId',
                    searchable: false
                },
                {
                    name: 'FullBalance',
                    searchable: false
                },

            ],
            advancedSearchFormData: [
                {
                    name: 'Status',
                    min: 1,
                    max: 1,
                },
                {
                    name: 'SupplierId',
                    min: supplierId,
                    max: supplierId,
                }
            ],
        };
        if (supplierId != 0) {
            const res = await props.ajax.post("/DbGrid/Page", convertToFormData(params), {
                errorModal: {
                    okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"),
                    width: "70%"
                }
            });
            setTotalBalance(res?.balance || 0);
            setTotal(res?.recordsTotal || 0);
            setDataSource(res?.data || []);
        }

    }, [supplierId, pageNum, pageSize, splitVisible]);
    useEffect(async () => {
        form.setFieldsValue({supplierInvoices: selectedRowKeysCreate})
    }, [selectedRowKeysCreate]);

    const {run: createOperation} = props.ajax.usePost('/DbGrid/Create', null, {
        setLoading,
        successTip: getLange(loginUser?.id) == "zh_CN" ? "创建成功！" : "Created Successfully",
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
    });
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
            item.value = item.id
        })
        setBankAccountOption(result);
    }
    /**
     * 供应商下拉事件
     * @param value
     */
    const supplierChanage = (value) => {
        setSupplierId(value);
    }
    /**
     * 表格checkbox多选
     * @type {{onChange: rowSelection.onChange, selectedRowKeys: *[]}}
     */
    const rowSelectionCreate = {
        selectedRowKeysCreate,
        onChange: (selectedRowKeys1, selectedRows1) => {
            setSelectedRowKeysCreate(selectedRowKeys1);
            setSelectedRowsCreate(selectedRows1);
        },
    };

    /**
     * 拆分
     * @returns {Promise<void>}
     */
    const dbGridSplit = useCallback(async (record) => {
        if (!(record?.Id)) return;
        let NewBalance = balanceForm.getFieldValue('NewBalance');
        if (!NewBalance) return;
        const res = await props.ajax.post('DbGrid/BalanceSplit', convertToFormData({
            DbGridName: 'Supplier Invoices',
            draw: DRAW,
            Id: record?.Id,
            NewBalance: NewBalance
        }), {
            successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!",
            errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"}
        });
        window.sessionStorage.removeItem(dbGridName + '-config-' + loginUser?.id)

    }, []);
    /**
     * 表单提交
     * @type {(function(*): Promise<void>)|*}
     */
    const handleSubmit = useCallback(
        async (values) => {
            console.log(values);
            let totalBalance = 0;
            let WithChildrenSupplierInvoices = [];
            values.supplierInvoices.map(item => {
                totalBalance = totalBalance + item.Balance;
                WithChildrenSupplierInvoices.push({Id: item.Id})
            })
            if (values.Balance != totalBalance) {
                Modal.error({
                    title: getLange(loginUser?.id) == "zh_CN" ? '温馨提示' : 'Kind tips',
                    content: getLange(loginUser?.id) == "zh_CN" ? '额度和选择的发票额度不一致' : 'The quota is inconsistent with the selected invoice quota',
                });
                return;
            }
            var params = {
                DbGridName: 'Supplier Invoices',
                draw: DRAW,
                Balance: values.Balance,
                Description: values.Description != undefined ? values.Description : '',
                SupplierId: values.SupplierId,
                BankAccountId: values.BankAccountId,
                WithChildrenSupplierInvoices: WithChildrenSupplierInvoices
            };
            console.log(params);
            const formData = convertToFormData(params);
            await createOperation(formData);
            onOk();
        },
        [createOperation, onOk],
    );
    const layout = {labelCol: {style: {width: '100%', height: '30px', textAlign: "left"},}};
    return (
        <IntlProvider messages={locale} locale={"en"}>
            <ConfigProvider locale={antLocale}>
                <Form form={form} name={props.dbGridName} onFinish={handleSubmit}
                      initialValues={{enabled: true}}>
                    <ModalContent
                        loading={loading}
                        okText={<FormattedMessage id="Save"/>}
                        okHtmlType="submit"
                        cancelText={<FormattedMessage id="Reset"/>}
                        onCancel={() => form.resetFields()}
                        footer={null}
                    >
                        <Content fitHeight otherHeight={200} style={{backgroundColor: "#f0f2f5"}}>
                            <Card title={<><span style={{color: "#1890ff", fontSize: 18}}><CodeSandboxOutlined/> </span>
                                <FormattedMessage id="BasicInformation"/></>}
                            >
                                <Content otherHeight={0}>
                                    <FormItem hidden name="supplierInvoices"/>
                                    <Row gutter={17}>
                                        <Col span={7} style={{marginRight: "2rem"}}>
                                            <FormItem
                                                header={<div><FormattedMessage id="Balance"/></div>}
                                                label={<div><FormattedMessage id="Balance"/></div>}
                                                name="Balance"
                                                type={'number'}
                                                min={1}
                                                placeholder={"Balance"}
                                                required={true}
                                                rules={[{
                                                    required: true,
                                                    message: <FormattedMessage id="RulesRequiredMsg" values={{
                                                        name: <FormattedMessage id="Balance"/>
                                                    }}/>
                                                }]}
                                            >
                                            </FormItem>
                                        </Col>
                                        <Col span={7} style={{marginRight: "2rem"}}>
                                            <FormItem
                                                header={<div><FormattedMessage id="Supplier"/></div>}
                                                label={<div><FormattedMessage id="Supplier"/></div>}
                                                placeholder="Supplier"
                                                name="SupplierId"
                                                required
                                                options={optionsSup}
                                                onChange={supplierChanage}
                                                rules={[{
                                                    required: true,
                                                    message: <FormattedMessage id="RulesRequiredMsg" values={{
                                                        name: <FormattedMessage id="Supplier"/>
                                                    }}/>
                                                }]}
                                            >
                                            </FormItem>
                                        </Col>
                                        <Col span={7} style={{marginRight: "2rem"}}>
                                            <FormItem
                                                header={<div><FormattedMessage id="Banks"/></div>}
                                                label={<div><FormattedMessage id="Banks"/></div>}
                                                placeholder="BankAccount"
                                                name="BankAccountId"
                                                required
                                                options={bankAccountOption}
                                                rules={[{
                                                    required: true,
                                                    message: <FormattedMessage id="RulesRequiredMsg" values={{
                                                        name: <FormattedMessage id="Banks"/>
                                                    }}/>
                                                }]}
                                            >
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    <Row gutter={17}>
                                        <Col span={22} style={{marginRight: "2rem"}}>
                                            <FormItem
                                                header={<div><FormattedMessage id="Description"/></div>}
                                                label={<div><FormattedMessage id="Description"/></div>}
                                                name="Description"
                                                type={'textarea'}
                                                placeholder={"Description"}
                                                maxLength={250}
                                                rows={4}
                                            >
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </Content>
                            </Card>
                            <Card title={<><span style={{color: "#1890ff", fontSize: 18}}><CodeSandboxOutlined/> </span>
                                <FormattedMessage id="SupplierInvoice"/></>}
                            >
                                <Content otherHeight={0}>
                                    <Row style={{marginBottom: 15}}>
                                        <Col>
                                                <span style={{fontSize: 18, fontWeight: "bold"}}><FormattedMessage
                                                    id="FullBalance"/>： <span
                                                    style={{color: "#FF6060"}}>£ {formatPrice(totalBalance)}</span></span>
                                        </Col>
                                    </Row>
                                    <Table
                                        columns={[
                                            {
                                                key: 'Id',
                                                title: <FormattedMessage id='Id' defaultMessage="Id"/>,
                                                dataIndex: 'Id',
                                                width: 100,
                                                align: "center",
                                            },
                                            {
                                                key: 'Name',
                                                title: <FormattedMessage id='InvoiceNo' defaultMessage="InvoiceNo"/>,
                                                dataIndex: 'Name',
                                                width: 100,
                                                align: "center",
                                            },
                                            {
                                                key: 'Balance',
                                                title: <FormattedMessage id='Balance' defaultMessage="Balance"/>,
                                                dataIndex: 'Balance',
                                                width: 100,
                                                align: "center",
                                            },
                                            {
                                                key: 'FullBalance',
                                                title: <FormattedMessage id='FullBalance'
                                                                         defaultMessage="FullBalance"/>,
                                                dataIndex: 'FullBalance',
                                                width: 100,
                                                align: "center",
                                            },
                                            {
                                                key: 'OriginInvoiceId',
                                                title: <FormattedMessage id='OriginInvoiceId'
                                                                         defaultMessage="OriginInvoiceId"/>,
                                                dataIndex: 'OriginInvoiceId',
                                                width: 100,
                                                align: "center",
                                            },
                                            {
                                                title: <FormattedMessage id="Operation"/>,
                                                key: 'operator',
                                                width: getLange(loginUser?.id) == "zh_CN" ? 80 : 100,
                                                fixed: 'right',
                                                align: "center",
                                                render: (value, record) => {
                                                    const serverMenu = (
                                                        <Menu>
                                                            <Menu.Item
                                                                icon={<BlockOutlined/>}
                                                                style={{color: "#FFBF10"}}
                                                                onClick={() => setRecord(record) || setSplitVisible(true)}
                                                            >
                                                                <FormattedMessage
                                                                    id="Split" defaultMessage="Split"/>
                                                            </Menu.Item>
                                                        </Menu>
                                                    )
                                                    return (
                                                        <>
                                                            <Dropdown overlay={serverMenu} placement="bottomRight">
                                                                <a onClick={(e) => e.preventDefault()}>
                                                                    <Space>
                                                                        <EllipsisOutlined style={{
                                                                            fontSize: "1.5rem",
                                                                            fontWeight: "bold"
                                                                        }}/>
                                                                    </Space>
                                                                </a>
                                                            </Dropdown>
                                                        </>
                                                    );
                                                }
                                            }

                                        ]}
                                        pageNum={pageNum}
                                        pageSize={pageSize}
                                        fitHeight
                                        dataSource={dataSource}
                                        rowKey={record => record}
                                        rowSelection={rowSelectionCreate}
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
                                </Content>
                            </Card>

                        </Content>
                    </ModalContent>
                    <Modal
                        visible={splitVisible}
                        onCancel={() => setSplitVisible(false)}
                        onOk={() => setSplitVisible(false) || dbGridSplit(record) || balanceForm.resetFields()}
                    >
                        <Form autoComplete="off" style={{paddingTop: 30}} form={balanceForm}>
                            <FormItem type="number" placeholder="NewBalance" name="NewBalance" required
                                      min={1}
                                      label={<FormattedMessage id="NewBalance"/>}>
                            </FormItem>
                        </Form>
                    </Modal>
                    <FileModal
                        visible={isModalVisible}
                        title={modalTitle}
                        onOk={() => {
                            setIsModalVisible(false);
                            //获取附件管理子组件文件封装数据
                            var handleUploadData = fileModal.current.onHandleUploadFile;
                            var handleUploadFile = fileModal.current.onUploadFile;
                            console.log(handleUploadData);
                            console.log(handleUploadFile);
                            var onPath = fileModal.current.onPath;
                            if (fileType == 1) {
                                if (handleUploadData.WithChildrenAttachments.length > 0 && handleUploadFile.length > 0) {
                                    setTimeout(() => {
                                        const formatData = {};
                                        formatData[uploadItemName] = handleUploadData;
                                        console.log(formatData);
                                        form.setFieldsValue(formatData);
                                        form.setFieldsValue({Files: handleUploadFile});
                                    }, 0);
                                }
                                setFormViewUploadData(handleUploadData);
                                setViewFilePath(onPath);
                                setViewFile(handleUploadFile);
                            } else if (fileType == 3) {
                                // setTimeout(async () => {
                                //     var folderName = '';
                                //     handleUploadData.WithChildrenAttachments.map(item => {
                                //         if (item.IsDirectory == false) {
                                //             folderName = item.FolderName
                                //         }
                                //     });
                                //     if (folderName && handleUploadFile.length > 0) {
                                //         handleUploadFile.map((file) => {
                                //             var fileName = "";
                                //             fileName = folderName + file.name;
                                //             var formData = convertToFormData({
                                //                 DbGridName: props.dbGridName,
                                //                 Id: record?.Id,
                                //                 draw: DRAW,
                                //                 FolderName: folderName,
                                //                 FileName: fileName
                                //             });
                                //             formData.append("Files", file);
                                //             setTimeout(async () => {
                                //                 await props.ajax.post('DbGrid/UploadAttachment', formData);
                                //             }, 0)
                                //
                                //         });
                                //
                                //     }
                                //
                                //
                                // }, 0);
                                setRefreshLoad(true);
                                setFormViewUploadData(handleUploadData);

                            }
                        }}
                        onCancel={() => setIsModalVisible(false) || window.sessionStorage.removeItem("fileManager-local-" + loginUser?.id)}
                        fileType={fileType}
                        dbGridName={props.dbGridName}
                        record={loadRecord}
                        isEdit={false}
                        isDetail={false}
                        cRef={fileModal}
                        uploadItemName={uploadItemName}
                        viewFilePath={viewFilePath}
                        viewFile={viewFile}
                        antLocale={antLocale}
                    />
                </Form>
            </ConfigProvider>
        </IntlProvider>
    );

});
