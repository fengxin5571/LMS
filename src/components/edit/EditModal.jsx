import React, {useCallback, useEffect, useState, useRef, useImperativeHandle} from 'react';
// 引入编辑器组件
import BraftEditor, {EditorState} from 'braft-editor'
// 引入编辑器样式
import 'braft-editor/dist/index.css'
import {Card, Form, ConfigProvider, Row, Col, Button, Modal, Space} from 'antd';
import {
    ModalContent,
    FormItem,
    Content,
    useDebounceValidator,
    Table,
    getLoginUser,
    QueryBar,
    Pagination
} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import {WITH_SYSTEMS, DRAW} from 'src/config';
import {authority, BtnFlags, convertToFormData, GetDateNow, handleFormItem, openWin} from "src/commons/common";
import {FormattedMessage, IntlProvider} from 'react-intl'
import {getLange} from "src/commons";
import FileModal from "../form/FileModal";
import {CodeSandboxOutlined} from "@ant-design/icons";

export default config({
    modal: {
        title: (props) => (<FormattedMessage id={props.dbGridName}/>),
        //width: '85%',
        top: 50,
        fullScreen:true
    },
})(function Edit(props) {
    const loginUser = getLoginUser();
    const {
        record,
        isEdit,
        onOk,
        formColums,
        formAddressColums,
        antLocale,
        locale,
        includes,
        isDetail,
        resBtnFlags
    } = props;
    const [loadRecord, setloadRecord] = useState();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [fileType, setFileType] = useState(0);
    const [refreshLoad, setRefreshLoad] = useState(false);
    const [modalTitle, setModalTitle] = useState();
    const [form] = Form.useForm();
    const [tableSearchForm] = Form.useForm();
    const [colLayout, setColLayout] = useState({span: 24});
    const [formViewUploadData, setFormViewUploadData] = useState({WithChildrenAttachments: []});
    const [viewFilePath, setViewFilePath] = useState([]);
    const [viewFile, setViewFile] = useState([]);
    const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null));
    const [uploadItemName, setUploadItemName] = useState();
    const [treeData, setTreeData] = useState([]);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [dataSource, setDataSource] = useState([]);
    const [conditions, setConditions] = useState({});
    const [total, setTotal] = useState(0);
    const [selectedRowKeysSearch, setSelectedRowKeysSearch] = useState([]);
    const [selectedRowsSearch, setSelectedRowsSearch] = useState();
    const [searchRecord, setSearchRecord] = useState({});
    const [addressTypeColums, setAddressTypeColums] = useState([]);
    const [currentAddress, setCurrentAddress] = useState('');
    const [oldAddress, setOldAddress] = useState([]);
    const [searchAddressTable, setSearchAddressTable] = useState('');
    const [shipmentDate, setShipmentDate] = useState();
    const [companyId, setCompanyId] = useState();
    const [tenantId, setTenantId] = useState();
    const [pickupOptions, setPickupOptions] = useState([]);
    const fileModal = useRef();
    const addressTypeColumsRef = useRef();
    const pickupRef = useRef();
    const pickupColumsRef = useRef();
    useEffect(async () => {
        var addressTypecolums = [];
        var pickupColums = [];
        formColums.forEach((item) => {

            if (item.type == 28) {
                setColLayout({xs: {span: 24}, sm: {span: 14}});
            }
            //获取地址类型字段名
            if (item.type == 31) {
                addressTypecolums.push(item.name);
            }
            //取货emum类型
            if (item.type == 32) {
                pickupRef.current = true;
                pickupColums.push(item.name)
            }
        });
        setAddressTypeColums([...addressTypecolums]);
        addressTypeColumsRef.current = [...addressTypecolums];
        pickupColumsRef.current = [...pickupColums];
    }, [isDetail, isEdit, treeData]);
    useEffect(async () => {
        let advancedSearchFormData = [];
        if (conditions.Name != undefined && conditions.Name) {
            advancedSearchFormData.push({
                name: 'Name',
                min: conditions.Name,
                max: conditions.Name,
            })
        }
        if (conditions.ContactName != undefined && conditions.ContactName) {
            advancedSearchFormData.push({
                name: 'ContactName',
                min: conditions.ContactName,
                max: conditions.ContactName,
            })
        }
        if (conditions.ContactCompanyName != undefined && conditions.ContactCompanyName) {
            advancedSearchFormData.push({
                name: 'ContactCompanyName',
                min: conditions.ContactCompanyName,
                max: conditions.ContactCompanyName,
            })
        }
        if (conditions.AddressLine1 != undefined && conditions.AddressLine1) {
            advancedSearchFormData.push({
                name: 'AddressLine1',
                min: conditions.AddressLine1,
                max: conditions.AddressLine1,
            })
        }
        if (conditions.AddressLine2 != undefined && conditions.AddressLine2) {
            advancedSearchFormData.push({
                name: 'AddressLine2',
                min: conditions.AddressLine2,
                max: conditions.AddressLine2,
            })
        }
        if (conditions.AddressLine3 != undefined && conditions.AddressLine3) {
            advancedSearchFormData.push({
                name: 'AddressLine3',
                min: conditions.AddressLine3,
                max: conditions.AddressLine3,
            })
        }
        if (conditions.PostCode != undefined && conditions.PostCode) {
            advancedSearchFormData.push({
                name: 'PostCode',
                min: conditions.PostCode,
                max: conditions.PostCode,
            })
        }
        if (conditions.Email != undefined && conditions.Email) {
            advancedSearchFormData.push({
                name: 'Email',
                min: conditions.Email,
                max: conditions.Email,
            })
        }
        if (conditions.Phone != undefined && conditions.Phone) {
            advancedSearchFormData.push({
                name: 'Phone',
                min: conditions.Phone,
                max: conditions.Phone,
            })
        }
        if (conditions.Mobile != undefined && conditions.Mobile) {
            advancedSearchFormData.push({
                name: 'Mobile',
                min: conditions.Mobile,
                max: conditions.Mobile,
            })
        }
        if (conditions.City != undefined && conditions.City) {
            advancedSearchFormData.push({
                name: 'City',
                min: conditions.City,
                max: conditions.City,
            })
        }
        if (conditions.CityDistrict != undefined && conditions.CityDistrict) {
            advancedSearchFormData.push({
                name: 'CityDistrict',
                min: conditions.CityDistrict,
                max: conditions.CityDistrict,
            })
        }
        if (conditions.BuildingName != undefined && conditions.BuildingName) {
            advancedSearchFormData.push({
                name: 'BuildingName',
                min: conditions.BuildingName,
                max: conditions.BuildingName,
            })
        }
        let params = {
            draw: DRAW,
            pageNum,
            pageSize,
            length: pageSize,
            start: pageNum == 1 ? 0 : (pageNum - 1) * pageSize,
            grid: searchAddressTable,
            DisableStatus: false,
            order: [
                {
                    column: 'Id',
                    dir: 'asc'
                }
            ],
            advancedSearchFormData: advancedSearchFormData,
        };
        if (addressModalVisible == true) {
            const res = await props.ajax.post("/DbGrid/Page", convertToFormData(params), {
                errorModal: {
                    okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"),
                    width: "70%"
                }
            });
            setTotal(res?.recordsTotal || 0);
            setDataSource(res?.data || []);
        }
        console.log(params);
    }, [addressModalVisible, conditions, pageNum]);
    useEffect(async () => {
        if (shipmentDate && pickupRef.current) {
            var params = {
                DbGridName: props.dbGridName,
                ShipmentDate: shipmentDate,
            }
            if (companyId) {
                params['CompanyId'] = companyId;
            }
            if (tenantId) {
                params['TenantId'] = tenantId;
            }
            const res = await props.ajax.post("/Proj/GetPickupList", convertToFormData(params), {
                errorModal: {
                    okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"),
                    width: "70%"
                }
            });
            res.sort((a, b) => {
                return b.Id - a.Id;
            });
            if (pickupColumsRef.current != undefined) {
                pickupColumsRef.current.map(item => {
                    var params = {};
                    params[item] = res[0]?.Id || '';
                    form.setFieldsValue(params)
                });
            }

            setPickupOptions(res);
        }

    }, [shipmentDate, companyId, tenantId]);
    useImperativeHandle(props.childRef, () => ({
        //暴露给父组件的方法
        form: form,
        setShipmentDate: (time) => {
            setShipmentDate(time)
        }
    }));
    // 获取详情 data为表单回显数据
    props.ajax.usePost('/DbGrid/Load', convertToFormData({
        DbGridName: props.dbGridName,
        Id: record?.Id,
        draw: DRAW,
        Includes: includes,
    }), [refreshLoad], {
        setLoading,
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
        mountFire: isEdit || isDetail, // 组件didMount时，只有编辑时才触发请求
        formatResult: (res) => {
            if (!res) return;
            const values = {
                ...res.data,
            };
            Object.keys(values).forEach(key => {
                addressTypeColumsRef.current.map(item => {
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
            console.log(values)
            form.setFieldsValue(values);
            if (pickupRef.current) {
                if (values?.ShipmentDate != undefined) {
                    setShipmentDate(values.ShipmentDate);
                }
                if (values?.TenantId != undefined) {
                    setTenantId(values.TenantId);
                }
                if (values?.CompanyId != undefined) {
                    setCompanyId(values.CompanyId);
                }
            }
            setloadRecord(values);
        },
    });
    /**
     * 地址表格单选
     * @type {{onChange: rowSelection.onChange, selectedRowKeys: *[]}}
     */
    const rowSelectionSearch = {
        setSelectedRowKeysSearch,
        onChange: (selectedRowKeys1, selectedRows1) => {
            setSelectedRowKeysSearch(selectedRowKeys1);
            setSelectedRowsSearch(selectedRows1);
        },
    };
    /**
     * 回填地址
     * @param values
     * @returns {Promise<void>}
     */
    const fillAddress = async (values) => {
        console.log(values);
        var oldAddress = [];
        if (values == undefined || values.length == 0) {
            return;
        }
        var params = {};
        params[currentAddress + '-Id'] = values[0].Id;
        params[currentAddress + '-ContactName'] = values[0].ContactName;
        params[currentAddress + '-ContactCompanyName'] = values[0].ContactCompanyName;
        params[currentAddress + '-AddressLine1'] = values[0].AddressLine1;
        params[currentAddress + '-AddressLine2'] = values[0].AddressLine2;
        params[currentAddress + '-AddressLine3'] = values[0].AddressLine3;
        params[currentAddress + '-PostCode'] = values[0].PostCode;
        params[currentAddress + '-Country'] = values[0].Country;
        params[currentAddress + '-Email'] = values[0].Email;
        params[currentAddress + '-Phone'] = values[0].Phone;
        params[currentAddress + '-Mobile'] = values[0].Mobile;
        params[currentAddress + '-CityDistrict'] = values[0].CityDistrict;
        params[currentAddress + '-City'] = values[0].City;
        if (values[0].VatNumber != undefined) {
            params[currentAddress + '-VatNumber'] = values[0].VatNumber;
        }
        if (values[0].EORI != undefined) {
            params[currentAddress + '-EORI'] = values[0].EORI;
        }
        if (values[0].TaxCode != undefined) {
            params[currentAddress + '-TaxCode'] = values[0].TaxCode;
        }
        addressTypeColums.map(item => {
            oldAddress.push({
                'key': searchAddressTable,
                'value': params
            })
        });
        form.setFieldsValue(params);
        setOldAddress([...oldAddress]);
    }

    /**
     * 添加hook
     */
    const {run: createOperation} = props.ajax.usePost('/DbGrid/Create', null, {
        setLoading,
        successTip: getLange(loginUser?.id) == "zh_CN" ? "创建成功！" : "Created Successfully",
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
    });
    /**
     * 直接打印添加
     */
    const {run: createPrintDirectly} = props.ajax.usePost('/DbGrid/PrintDirectly', null, {
        setLoading,
        responseType: "blob",
        successTip: getLange(loginUser?.id) == "zh_CN" ? "创建成功！" : "Created Successfully",
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
    });
    // 直接打印更新请求
    const {run: updatePrintDirectly} = props.ajax.usePost('DbGrid/PrintDirectly', null, {
        setLoading,
        responseType: "blob",
        successTip: getLange(loginUser?.id) == "zh_CN" ? "修改成功！" : "Modified Successfully",
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
    });
    // 更新请求
    const {run: updateOperation} = props.ajax.usePost('DbGrid/Update', null, {
        setLoading,
        successTip: getLange(loginUser?.id) == "zh_CN" ? "修改成功！" : "Modified Successfully",
        errorModal: {okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"), width: "70%"},
    });
    const {run: fetchRoleByName} = props.ajax.useGet('/role/getOneRole');
    const handleSubmit = useCallback(
        async (values) => {
            var Files = [];
            var subParams = [];
            const params = {
                DbGridName: props.dbGridName,
                draw: DRAW,
                Includes: includes,
            };
            console.log(addressTypeColumsRef.current);
            addressTypeColumsRef.current.map(() => {
                subParams.push({});
            })
            Object.keys(values).forEach(key => {
                //处理不是文件流的数据
                if (values[key] instanceof Object && key != "Files") {
                    values[key] = JSON.stringify(values[key]);
                }
                if (isEdit && key == "AttachmentMap") {
                    values[key] = null;
                }
                //如果是富文本
                if (values[key] instanceof EditorState) {
                    values[key] = values[key].toHTML();
                }
                //判断是否有值
                if (values[key] != undefined) {
                    params[key] = values[key];
                }
                if (key == "Files" && values[key] != undefined) {
                    Files = values[key];
                }
                addressTypeColumsRef.current.map((item, index) => {
                    if (key.indexOf(item + "-") != -1) {
                        var ind = key.indexOf(item + "-");
                        var colum = key.substring(ind + (item + "-").length);
                        subParams[index][colum] = values[key];
                        delete params[key];
                    }

                });
            });
            if (Files.length > 0) {
                delete params.Files;
                delete params[Files];
            }
            if (params?.DirectPrinting != undefined) {
                delete params["DirectPrinting"];
            }
            addressTypeColumsRef.current.map((item, index) => {
                if (JSON.stringify(subParams[index]) != "{}") {
                    params[item] = JSON.stringify(subParams[index]);
                }
            });
            console.log(values);
            const formData = convertToFormData(params);
            Files.forEach((file) => {
                formData.append("Files", file);
            });
            if (isEdit) {
                if (values.DirectPrinting == true) {
                    //直接打印添加
                    const res = await updatePrintDirectly(formData);
                    let blob = new Blob([res]);
                    let name = props.dbGridName + "-" + GetDateNow() + '.pdf';
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
                } else {
                    //编辑操作
                    await updateOperation(formData);
                }

            } else {
                if (values.DirectPrinting == true) {
                    //直接打印添加
                    const res = await createPrintDirectly(formData);
                    let blob = new Blob([res]);
                    let name = props.dbGridName + "-" + GetDateNow() + '.pdf';
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
                } else {
                    //添加操作
                    await createOperation(formData);
                }

            }
            if (fileType == 1) {
                window.sessionStorage.removeItem("fileManager-local-" + uploadItemName.toString() + "-" + loginUser?.id);
                setFormViewUploadData([]);
                setViewFilePath([]);
                setViewFile([]);
            }
            onOk();
        },
        [isEdit, updateOperation, isDetail, createOperation, onOk],
    );

    // 验证
    const checkName = useDebounceValidator(async (rule, value) => {
        if (!value) return;
        const systemId = form.getFieldValue('systemId');
        const role = await fetchRoleByName({name: value, systemId});
        if (!role) return;
        const id = form.getFieldValue('id');
        if (isEdit && role.id !== id && role.name === value) throw Error('角色名不能重复！');
        if (!isEdit && role.name === value) throw Error('角色名不能重复！');
    });

    const layout = {labelCol: {style: {width: '100%', height: '30px', textAlign: "left"},}};
    return (
        <IntlProvider messages={locale} locale={"en"}>
            <ConfigProvider locale={antLocale}>
                <Form form={form} name={props.dbGridName + "Edit"} onFinish={handleSubmit}
                      initialValues={{enabled: true}}>
                    <ModalContent
                        loading={loading}
                        okText={<FormattedMessage id="Save"/>}
                        okHtmlType="submit"
                        cancelText={<FormattedMessage id="Reset"/>}
                        onCancel={() => form.resetFields()}
                        footer={isDetail ? true : null}
                        fitHeight
                    >
                        <Content  style={{backgroundColor: "#f0f2f5"}}>
                            {isEdit ? <FormItem hidden name="Id" value={record?.Id}/> : null}

                            <Card title={<><span style={{color: "#1890ff", fontSize: 18}}><CodeSandboxOutlined/> </span>
                                <FormattedMessage id="BasicInformation"/>
                                {isDetail == false && ((resBtnFlags & BtnFlags.CanPrintAll) > 0 || (resBtnFlags & BtnFlags.CanPrint) > 0) ?
                                    <Row gutter={10} style={{float: "right", paddingRight: "10px"}}>
                                        <FormItem
                                            label={<FormattedMessage id="Direct Printing"
                                                                     defaultMessage="Direct Printing"/>}
                                            name={'DirectPrinting'}
                                            disabled={isDetail}
                                            type={'switch'}
                                        />
                                    </Row>

                                    : null}
                            </>

                            }
                                  bodyStyle={{padding: 10}} style={{marginTop: 10}}
                            >
                                <Content otherHeight={0}>
                                    <Row gutter={16}>
                                        {
                                            handleFormItem(setShipmentDate, setCompanyId, setTenantId, pickupOptions, form, props, treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, formColums, isEdit, isDetail, layout, loginUser, editorState, [28, 21, 24, 29, 31], {}, locale)
                                        }

                                    </Row>
                                </Content>
                            </Card>

                            {formAddressColums.map(item => {
                                return (
                                    <Card
                                        title={<><span style={{color: "#1890ff", fontSize: 18}}><CodeSandboxOutlined/> </span>
                                            {item.label} </>}
                                        style={{marginTop: 10}} extra={
                                        <Button type="primary" onClick={() => {
                                            setAddressModalVisible(true);
                                            setSearchAddressTable(item.related);
                                            setCurrentAddress(item.name);
                                        }}
                                                disabled={isDetail}
                                        >
                                            <FormattedMessage id="SearchAddress"/>
                                        </Button>
                                    }
                                    >
                                        <Content otherHeight={0}>
                                            <Row gutter={16}>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="ContactName"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'ContactName'}
                                                        name={item.name + '-' + 'ContactName'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="ContactCompanyName"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'ContactCompanyName'}
                                                        name={item.name + '-' + 'ContactCompanyName'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="AddressLine1"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'AddressLine1'}
                                                        name={item.name + '-' + 'AddressLine1'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="AddressLine2"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'AddressLine2'}
                                                        name={item.name + '-' + 'AddressLine2'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="AddressLine3"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'AddressLine3'}
                                                        name={item.name + '-' + 'AddressLine3'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="PostCode"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'PostCode'}
                                                        name={item.name + '-' + 'PostCode'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="Email"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'Email'}
                                                        name={item.name + '-' + 'Email'}
                                                        type="email"
                                                        rules={[
                                                            {
                                                                pattern: new RegExp(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, "g"),
                                                                message: <FormattedMessage id="RulesEmailMsg"/>
                                                            }
                                                        ]}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="Phone"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'Phone'}
                                                        name={item.name + '-' + 'Phone'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="Mobile"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'Mobile'}
                                                        name={item.name + '-' + 'Mobile'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>

                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="City"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'City'}
                                                        name={item.name + '-' + 'City'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="CityDistrict"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'CityDistrict'}
                                                        name={item.name + '-' + 'CityDistrict'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                <Col span={4} style={{marginRight: "2rem"}}>
                                                    <FormItem
                                                        {...layout}
                                                        label={<FormattedMessage id="BuildingName"
                                                                                 defaultMessage=""/>}
                                                        placeholder={isDetail ? "" : 'BuildingName'}
                                                        name={item.name + '-' + 'BuildingName'}
                                                        disabled={isDetail}
                                                    />
                                                </Col>
                                                {item.ColumnConfigs.map(subItem => {
                                                    if (subItem.name == "Country") {
                                                        var options = subItem.options || [];
                                                        return (
                                                            <Col span={4} style={{marginRight: "2rem"}}>
                                                                <FormItem
                                                                    {...layout}
                                                                    label={<FormattedMessage id={subItem.header}
                                                                                             defaultMessage=""/>}
                                                                    placeholder={isDetail ? "" : subItem.header}
                                                                    name={item.name + '-' + 'Country'}
                                                                    type={"select"}
                                                                    options={options.map(sub => {
                                                                        return {
                                                                            value: parseFloat(sub.value).toString() == "NaN" ? sub.value : parseInt(sub.value),
                                                                            label: sub.name
                                                                        }
                                                                    })}
                                                                    disabled={isDetail}
                                                                />
                                                            </Col>
                                                        )
                                                    }
                                                    if (subItem.name == 'VatNumber' || subItem.name == 'EORI' || subItem.name == 'TaxCode') {
                                                        if ((!isEdit && !isDetail) && !((subItem.access & authority.create) > 0)) {
                                                            return;
                                                        } else if (isEdit && !((subItem.access & authority.change) > 0)) {
                                                            return;
                                                        } else if (isDetail && !((subItem.access & authority.view) > 0)) {
                                                            return;
                                                        }
                                                        return (
                                                            <Col span={4} style={{marginRight: "2rem"}}>
                                                                <FormItem
                                                                    {...layout}
                                                                    label={<FormattedMessage id={subItem.header}
                                                                                             defaultMessage=""/>}
                                                                    placeholder={isDetail ? "" : subItem.header}
                                                                    disabled={isDetail}
                                                                />
                                                            </Col>
                                                        )
                                                    }

                                                })}
                                            </Row>
                                        </Content>
                                    </Card>
                                )
                            })}

                            {handleFormItem(setShipmentDate, setCompanyId, setTenantId, pickupOptions, form, props, treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, formColums, isEdit, isDetail, layout, loginUser, editorState, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32], {
                                fitHeight: false,
                                otherHeight: 0
                            }, locale)}

                            {handleFormItem(setShipmentDate, setCompanyId, setTenantId, pickupOptions, form, props, treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, formColums, isEdit, isDetail, layout, loginUser, editorState, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32], {
                                fitHeight: false,
                                otherHeight: 0
                            }, locale)}
                            {handleFormItem(setShipmentDate, setCompanyId, setTenantId, pickupOptions, form, props, treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, formColums, isEdit, isDetail, layout, loginUser, editorState, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30, 31, 32], {
                                fitHeight: false,
                                otherHeight: 0
                            }, locale)}

                        </Content>

                    </ModalContent>
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
                                                DbGridName: props.dbGridName,
                                                Id: record?.Id,
                                                draw: DRAW,
                                                FolderName: folderName,
                                                FileName: fileName
                                            });
                                            formData.append("Files", file);
                                            setTimeout(async () => {
                                                await props.ajax.post('DbGrid/UploadAttachment', formData);
                                            }, 0)

                                        });

                                    }


                                }, 0);
                                setRefreshLoad(true);
                                setFormViewUploadData(handleUploadData);

                            }
                        }}
                        onCancel={() => setIsModalVisible(false) || window.sessionStorage.removeItem("fileManager-local-" + loginUser?.id)}
                        fileType={fileType}
                        dbGridName={props.dbGridName}
                        record={loadRecord}
                        isEdit={isEdit}
                        isDetail={isDetail}
                        cRef={fileModal}
                        uploadItemName={uploadItemName}
                        viewFilePath={viewFilePath}
                        viewFile={viewFile}
                        antLocale={antLocale}
                    />
                </Form>
                <Modal
                    width={"75%"}
                    visible={addressModalVisible}
                    onOk={() => setAddressModalVisible(false) || fillAddress(selectedRowKeysSearch)}
                    onCancel={() => setAddressModalVisible(false) || setPageNum(1)}
                >
                    <Content otherHeight={200}>
                        <QueryBar>
                            <Form
                                layout="inline"
                                form={tableSearchForm}
                                initialValues={{position: '01'}}
                                onFinish={(values) => setPageNum(1) || setConditions(values)}
                                onValuesChange={(changedValues, allValues) => setPageNum(1) || setConditions(allValues)}
                            >
                                <Row style={{marginBottom: 15, marginTop: 15}}>
                                    <FormItem
                                        label={<FormattedMessage id={"Name"}/>}
                                        name={"Name"}
                                        allowClear
                                        placeholder={'Name'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"ContactName"}/>}
                                        name={"ContactName"}
                                        allowClear
                                        placeholder={'ContactName'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"ContactCompanyName"}/>}
                                        name={"ContactCompanyName"}
                                        allowClear
                                        placeholder={'ContactCompanyName'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"AddressLine1"}/>}
                                        name={"AddressLine1"}
                                        allowClear
                                        placeholder={'AddressLine1'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"AddressLine2"}/>}
                                        name={"AddressLine2"}
                                        allowClear
                                        placeholder={'AddressLine2'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"AddressLine3"}/>}
                                        name={"AddressLine3"}
                                        allowClear
                                        placeholder={'AddressLine3'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"PostCode"}/>}
                                        name={"PostCode"}
                                        allowClear
                                        placeholder={'PostCode'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"Email"}/>}
                                        name={"Email"}
                                        allowClear
                                        placeholder={'Email'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"Phone"}/>}
                                        name={"Phone"}
                                        allowClear
                                        placeholder={'Phone'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"Mobile"}/>}
                                        name={"Mobile"}
                                        allowClear
                                        placeholder={'Mobile'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"City"}/>}
                                        name={"City"}
                                        allowClear
                                        placeholder={'City'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"CityDistrict"}/>}
                                        name={"CityDistrict"}
                                        allowClear
                                        placeholder={'CityDistrict'}
                                    />
                                    <FormItem
                                        label={<FormattedMessage id={"BuildingName"}/>}
                                        name={"BuildingName"}
                                        allowClear
                                        placeholder={'BuildingName'}
                                    />
                                    <FormItem>
                                        <Space>
                                            <Button type="primary" htmlType="submit">
                                                <FormattedMessage id="Search"/>
                                            </Button>
                                            <Button onClick={() => tableSearchForm.resetFields() || setConditions({})}>
                                                <FormattedMessage
                                                    id="Reset"/></Button>
                                        </Space>
                                    </FormItem>
                                </Row>
                            </Form>
                        </QueryBar>
                        <Table
                            onRow={record => {
                                return {
                                    onDoubleClick: (e) => e.stopPropagation() || setAddressModalVisible(false) || fillAddress([record]),
                                };
                            }}
                            columns={[
                                {
                                    key: 'Id',
                                    title: <FormattedMessage id='Id' defaultMessage="Id"/>,
                                    dataIndex: 'Id',
                                    width: 100,
                                    fixed: 'left',
                                    align: "center",
                                },
                                {
                                    key: 'ContactName',
                                    title: <FormattedMessage id='ContactName' defaultMessage="ContactName"/>,
                                    dataIndex: 'ContactName',
                                    width: 250,
                                    align: "center",
                                },
                                {
                                    key: 'ContactCompanyName',
                                    title: <FormattedMessage id='ContactCompanyName'
                                                             defaultMessage="ContactCompanyName"/>,
                                    dataIndex: 'ContactCompanyName',
                                    width: 300,
                                    align: "center",
                                },
                                {
                                    key: 'AddressLine1',
                                    title: <FormattedMessage id='AddressLine1' defaultMessage="AddressLine1"/>,
                                    dataIndex: 'AddressLine1',
                                    width: 300,
                                    align: "center",
                                },
                                {
                                    key: 'AddressLine2',
                                    title: <FormattedMessage id='AddressLine2' defaultMessage="AddressLine2"/>,
                                    dataIndex: 'AddressLine2',
                                    width: 300,
                                    align: "center",
                                },
                                {
                                    key: 'AddressLine3',
                                    title: <FormattedMessage id='AddressLine3' defaultMessage="AddressLine3"/>,
                                    dataIndex: 'AddressLine3',
                                    width: 300,
                                    align: "center",
                                },
                                {
                                    key: 'PostCode',
                                    title: <FormattedMessage id='PostCode' defaultMessage="PostCode"/>,
                                    dataIndex: 'PostCode',
                                    width: 150,
                                    align: "center",
                                },
                                {
                                    key: 'Country',
                                    title: <FormattedMessage id='Country' defaultMessage="Country"/>,
                                    dataIndex: 'Country',
                                    width: 150,
                                    align: "center",
                                },
                                {
                                    key: 'Email',
                                    title: <FormattedMessage id='Email' defaultMessage="Email"/>,
                                    dataIndex: 'Email',
                                    width: 200,
                                    align: "center",
                                },
                                {
                                    key: 'Phone',
                                    title: <FormattedMessage id='Phone' defaultMessage="Phone"/>,
                                    dataIndex: 'Phone',
                                    width: 200,
                                    align: "center",
                                },
                                {
                                    key: 'Mobile',
                                    title: <FormattedMessage id='Mobile' defaultMessage="Mobile"/>,
                                    dataIndex: 'Mobile',
                                    width: 200,
                                    align: "center",
                                },
                                {
                                    key: 'City',
                                    title: <FormattedMessage id='City' defaultMessage="City"/>,
                                    dataIndex: 'City',
                                    width: 200,
                                    align: "center",
                                },
                                {
                                    key: 'CityDistrict',
                                    title: <FormattedMessage id='CityDistrict' defaultMessage="CityDistrict"/>,
                                    dataIndex: 'CityDistrict',
                                    width: 200,
                                    align: "center",
                                },
                                {
                                    key: 'BuildingName',
                                    title: <FormattedMessage id='BuildingName' defaultMessage="BuildingName"/>,
                                    dataIndex: 'BuildingName',
                                    width: 300,
                                    align: "center",
                                },
                            ]}
                            scroll={{
                                x: 1300,
                            }}
                            pageNum={pageNum}
                            pageSize={pageSize}
                            fitHeight
                            dataSource={dataSource}
                            rowKey={searchRecord => searchRecord}
                            rowSelection={{
                                type: 'radio',
                                ...rowSelectionSearch
                            }}
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
                </Modal>
            </ConfigProvider>
        </IntlProvider>
    );

});
