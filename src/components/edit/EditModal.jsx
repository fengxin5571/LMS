import React, {useCallback, useEffect, useState, useRef} from 'react';
// 引入编辑器组件
import BraftEditor, {EditorState} from 'braft-editor'
// 引入编辑器样式
import 'braft-editor/dist/index.css'
import {Card, Form, ConfigProvider, Row} from 'antd';
import {ModalContent, FormItem, Content, useDebounceValidator, getLoginUser} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import {WITH_SYSTEMS, DRAW} from 'src/config';
import {convertToFormData, handleFormItem} from "src/commons/common";
import {FormattedMessage, IntlProvider} from 'react-intl'
import {getLange} from "src/commons";
import FileModal from "../form/FileModal";
import {CodeSandboxOutlined} from "@ant-design/icons";

export default config({
    modal: {
        title: (props) => (<FormattedMessage id={props.dbGridName}/>),
        width: '85%',
        top: 50,

    },
})(function Edit(props) {
    const loginUser = getLoginUser();
    const {record, isEdit, onOk, formColums, antLocale, locale, includes, isDetail} = props;
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
    const fileModal = useRef();
    useEffect(async () => {
        formColums.forEach((item) => {
            if (item.type == 28) {
                setColLayout({xs: {span: 24}, sm: {span: 14}});
            }
        });
    }, [isDetail, isEdit,treeData]);
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
            form.setFieldsValue(values);
            setloadRecord(values);
        },
    });
    const {run: createOperation} = props.ajax.usePost('/DbGrid/Create', null, {
        setLoading,
        successTip: getLange(loginUser?.id) == "zh_CN" ? "创建成功！" : "Created Successfully",
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
            const params = {
                DbGridName: props.dbGridName,
                draw: DRAW,
                Includes: includes,
            };
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

            });
            if (Files.length > 0) {
                delete params.Files;
                delete params[Files];
            }
            const formData = convertToFormData(params);
            Files.forEach((file) => {
                formData.append("Files", file);
            });
            if (isEdit) {
                //编辑操作
                await updateOperation(formData);
            } else {
                //添加操作
                await createOperation(formData);
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
                    >
                        <Content fitHeight otherHeight={200} style={{backgroundColor: "#f0f2f5"}}>
                            {isEdit ? <FormItem hidden name="Id" value={record?.Id}/> : null}
                            <Card title={<><span style={{color: "#1890ff", fontSize: 18}}><CodeSandboxOutlined/> </span>
                                <FormattedMessage id="BasicInformation"/></>}
                            >
                                <Content otherHeight={0}>
                                    <Row gutter={16}>
                                        {
                                            handleFormItem(form,props, treeData, setTreeData,setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, formColums, isEdit, isDetail, layout, loginUser, editorState, [28, 21, 24, 29], {}, locale)
                                        }
                                    </Row>
                                </Content>
                            </Card>

                            {handleFormItem(form,props, treeData, setTreeData,setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, formColums, isEdit, isDetail, layout, loginUser, editorState, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30], {
                                fitHeight: false,
                                otherHeight: 0
                            }, locale)}

                            {handleFormItem(form,props,treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, formColums, isEdit, isDetail, layout, loginUser, editorState, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 25, 26, 27, 28, 29, 30], {
                                fitHeight: false,
                                otherHeight: 0
                            }, locale)}
                            {handleFormItem(form,props,treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, formColums, isEdit, isDetail, layout, loginUser, editorState, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30], {
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
            </ConfigProvider>
        </IntlProvider>
    );

});
