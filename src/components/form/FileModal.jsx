import React, {useEffect, useState, useImperativeHandle, useRef} from 'react';
import config from 'src/commons/config-hoc';
import {Content, FormItem, getLoginUser, ModalContent, Table} from '@ra-lib/admin';
import {Breadcrumb, Button, Col, Form, message, Modal, Progress, Row, Upload, List, ConfigProvider} from "antd";
import {
    DeleteOutlined,
    FolderOpenOutlined,
    HomeOutlined,
    UploadOutlined,
    CloudDownloadOutlined
} from "@ant-design/icons";
import {FormattedMessage} from "react-intl";
import {getLange} from "../../commons";
import {convertToFormData} from "src/commons/common";
import {DRAW} from "../../config";

export default config({
    modal: {
        title: '弹框标题',
        width: '75%',
    },
})(props => {
    const {
        onOk,
        onCancel,
        fileType,
        record,
        dbGridName,
        isDetail,
        isEdit,
        uploadItemName,
        viewFilePath,
        antLocale,
        viewFile
    } = props;
    const [dataSource, setDataSource] = useState([]);
    const [path, setPath] = useState(viewFilePath.length > 0 ? viewFilePath : (() => {
        if (fileType == 3) {
            var handldePath = ['/'];
            if (record[uploadItemName]?.WithChildrenAttachments) {
                for (const key in record[uploadItemName]?.WithChildrenAttachments) {
                    var isFile = record[uploadItemName]?.WithChildrenAttachments.filter(v => v.IsDirectory == false);
                    if (isFile.length == 0) {
                        if (record[uploadItemName]?.WithChildrenAttachments[key].IsDirectory == true) {
                            handldePath = [record[uploadItemName]?.WithChildrenAttachments[key].FolderName, record[uploadItemName]?.WithChildrenAttachments[key].FileName];
                            break;
                        }
                    } else {
                        if (record[uploadItemName]?.WithChildrenAttachments[key].IsDirectory == false) {
                            handldePath = [record[uploadItemName]?.WithChildrenAttachments[key].FolderName];
                            break;
                        }
                    }

                }
            } else {
                handldePath = ['/'];
            }
            return handldePath;
        } else {
            return ['/'];
        }
    }));
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState(viewFile.length > 0 ? viewFile : []);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    useImperativeHandle(props.cRef, () => ({
        // onHandleUploadFile 就是暴露给父组件的方法
        onHandleUploadFile: onHandleUploadFile(),
        onUploadFile: fileList,
        onPath: path,
    }));
    useEffect(() => {
        getData(path);
    }, [path]);

    /**
     * 封装上传数据结构
     * @returns {*[]}
     */
    const onHandleUploadFile = () => {
        let uploadJsonData = {WithChildrenAttachments: []};
        if (fileList.length > 0) {
            let uploadJson = []
            let handlepath = "";
            let allpath = "";
            path.map((item, i) => {
                allpath = allpath + item + (item == "/" ? "" : "/");
                if (i > 0) {
                    handlepath = handlepath + path[i - 1] + (path[i - 1] == "/" ? "" : "/")
                    uploadJson.push({
                        IsDirectory: true,
                        FileName: item,
                        FolderName: handlepath,
                    })
                }
            });
            fileList.forEach((file) => {
                uploadJson.push({
                    IsDirectory: false,
                    FolderName: allpath,
                    FileName: file?.name
                })

            });
            uploadJsonData.WithChildrenAttachments = uploadJson;
        }
        return uploadJsonData;
    }
    /**
     * 创建目录
     */
    const handleSubmit = async () => {
        let creatFolderName = form.getFieldValue("fileName");
        if (!creatFolderName) return;
        var handlePath = "";
        var flag = false;
        path.map((item) => {
            handlePath = handlePath + item + (item == "/" ? "" : "/");
        });
        if (fileType == 1) { // 添加
            let tableData = window.sessionStorage.getItem("fileManager-local-" + uploadItemName + "-" + props.loginUser?.id);
            tableData = tableData ? JSON.parse(tableData) : [];
            tableData.forEach((item, k) => {
                if (handlePath == item.Path && item.FileName == creatFolderName) {
                    flag = true;
                    return;
                }
            });
            if (flag) return;
            tableData.push({
                Path: handlePath, FileName: creatFolderName, IsDirectory: true
            });
            window.sessionStorage.setItem("fileManager-local-" + uploadItemName + "-" + props.loginUser?.id, JSON.stringify(tableData));
            setDataSource(tableData);
        } else if (fileType == 2 || fileType == 3) {
            const res = await props.ajax.post('DbGrid/CreateFolder', convertToFormData({
                DbGridName: dbGridName,
                Id: record?.Id,
                draw: DRAW,
                FolderName: handlePath,
                FileName: creatFolderName
            }))
        }
        getData(path);
    }
    /**
     * 面包屑打开目录
     * @param e
     * @param name
     */
    const onClickPathFolder = (e, name) => {
        e.preventDefault();
        const newPath = path.slice(0, path.indexOf(name) + 1);
        setPath(newPath);
    }
    /**
     * 打开目录
     * @param name
     */
    const onOpenFolder = name => {
        setPath(path.concat(name));
    }
    /**
     * 下载文件
     * @param records
     * @returns {Promise<void>}
     */
    const onDownload = async (records) => {
        var handlePath = "";
        path.map((item) => {
            handlePath = handlePath + item + (item == "/" ? "" : "/");
        });
        const res = await props.ajax.post('DbGrid/DownloadAttachment', convertToFormData({
            DbGridName: dbGridName,
            Id: record?.Id,
            draw: DRAW,
            FolderName: handlePath,
            FileName: records?.FileName
        }), {responseType: "blob"});
        let blob = new Blob([res]);
        if (typeof window.navigator.msSaveBlob !== "undefined") {
            // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
            window.navigator.msSaveBlob(blob, decodeURI(records?.FileName));
        } else {
            // 创建新的URL并指向File对象或者Blob对象的地址
            const blobURL = window.URL.createObjectURL(blob);
            // 创建a标签，用于跳转至下载链接
            const tempLink = document.createElement("a");
            tempLink.style.display = "none";
            tempLink.href = blobURL;
            tempLink.setAttribute("download", decodeURI(records?.FileName));
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
        // const aLink = document.createElement('a');
        // document.body.appendChild(aLink);
        // aLink.style.display='none';
        // const objectUrl = window.URL.createObjectURL(res);
        // aLink.href = objectUrl;
        // aLink.download = records?.FileName;
        // aLink.click();
        // document.body.removeChild(aLink);

    }
    /**
     * 删除目录或文件
     * @param records
     */
    const onDeleteFile = async (records) => {
        var handlePath = "";
        path.map((item) => {
            handlePath = handlePath + item + (item == "/" ? "" : "/");
        });
        let tableData;
        Modal.confirm({
            title: getLange(props.loginUser?.id) == "zh_CN" ? "您确定删除" + records.FileName + "吗？" : "Are you sure you want to delete " + records.FileName + "?",
            async onOk() {
                if (fileType == 1) { //添加
                    tableData = window.sessionStorage.getItem("fileManager-local-" + uploadItemName + "-" + props.loginUser?.id);
                    tableData = JSON.parse(tableData);
                    tableData.forEach((item, k) => {
                        if (item.FileName == records.FileName) {
                            tableData.splice(k, 1);
                            tableData.map((v, index) => {
                                if (v.Path.search(handlePath + record.FileName) >= 0) {
                                    tableData.splice(index, 1);
                                }
                            });
                        }
                    });
                    window.sessionStorage.setItem("fileManager-local-" + uploadItemName + "-" + props.loginUser?.id, JSON.stringify(tableData));
                    setDataSource(tableData);
                } else if (fileType == 2 || fileType == 3) {
                    const res = await props.ajax.post('DbGrid/DeleteAttachment', convertToFormData({
                        DbGridName: dbGridName,
                        Id: record?.Id,
                        draw: DRAW,
                        FolderName: handlePath,
                        FileName: records?.FileName
                    }))
                }
                getData(path);
            },
            onCancel() {
                message.error(getLange(props.loginUser?.id) == "zh_CN" ? `删除文件${records.FileName}被取消` : `Deleting the file${records.FileName}was canceled`);
            },
        });
    }
    const getData = async (path) => {
        setLoading(true);
        var handlePath = "";
        path.map((item) => {
            handlePath = handlePath + item + (item == "/" ? "" : "/")
        });
        let tableData = [];
        if (fileType == 1) { //如果是添加
            let localData = window.sessionStorage.getItem("fileManager-local-" + uploadItemName + "-" + props.loginUser?.id);
            localData = localData ? JSON.parse(localData) : [];
            localData.forEach((item, k) => {
                if (item.Path == handlePath) {
                    tableData.push({Id: k, FileName: item.FileName, IsDirectory: item.IsDirectory});
                }
            });
        } else if (fileType == 2 || fileType == 3) { //如果是查看、编辑
            const Id = record?.Id;
            const res = await props.ajax.post('DbGrid/Attachments', convertToFormData({
                DbGridName: dbGridName,
                Id: Id,
                draw: DRAW,
                FolderName: handlePath
            }))
            let localData = res?.WithChildrenAttachments || [];
            localData.forEach((item) => {
                tableData.push({Id: item.Id, FileName: item.FileName, IsDirectory: item.IsDirectory});
            });
        }
        setLoading(false);
        setDataSource(tableData);
    }
    const colums = [{
        title: <FormattedMessage id="Name"/>,
        dataIndex: "FileName",
        key: "FileName",
        render: (text, record) => (
            record.IsDirectory == true ?
                <Button type="link" onClick={() => onOpenFolder(text)}
                        title={text}>
                    <FolderOpenOutlined/>
                    {text.length > 30 ? text.substring(0, 19) + "..." : text}
                </Button> : text
        )
    }, {
        title: <FormattedMessage id="Operation"/>,
        render: (text, record) => (<>
            {record.IsDirectory == false ? <>
                <Button type="link"
                        title={getLange(props.loginUser?.id) == "zh_CN" ? "下载！" : "Download"}
                        onClick={() => {
                            onDownload(text)
                        }}> <CloudDownloadOutlined/></Button>
                <Button type="link"
                        title={getLange(props.loginUser?.id) == "zh_CN" ? "删除！" : "Delete"}
                        onClick={() => {
                            onDeleteFile(text)
                        }}
                        style={{color: '#FF0000'}}><DeleteOutlined/></Button></> : <>
                <Button type="link"
                        title={getLange(props.loginUser?.id) == "zh_CN" ? "删除！" : "Delete"}
                        onClick={() => {
                            onDeleteFile(text)
                        }}
                        style={{color: '#FF0000'}}><DeleteOutlined/></Button>
            </>}
        </>)
    }];
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
        <ConfigProvider locale={antLocale}>
            <ModalContent
                onOk={onOk}
                onCancel={onCancel}
                okText={getLange(props.loginUser?.id) == "zh_CN"?"确定":"Confirm"}
                cancelText={getLange(props.loginUser?.id) == "zh_CN"?"取消":"Cancel"}
            >
                <>
                    <Row style={{marginBottom: 15}}>
                        <Col span={14}>
                            <Breadcrumb style={{"padding-left": '20px'}}>
                                {
                                    path.length === 1 ?
                                        path.map((v, i) => (
                                            <Breadcrumb.Item key={v} href="" onClick={e => onClickPathFolder(e, v)}>
                                                <HomeOutlined/>
                                            </Breadcrumb.Item>)) :
                                        path.map((v, i) => {
                                            if (i === 0) {
                                                return (
                                                    <Breadcrumb.Item key={v} href=""
                                                                     onClick={e => onClickPathFolder(e, v)}>
                                                        <HomeOutlined/>
                                                    </Breadcrumb.Item>
                                                );
                                            } else {
                                                return (
                                                    <Breadcrumb.Item key={v} href=""
                                                                     onClick={e => onClickPathFolder(e, v)}>
                                                        <span>{v}</span>
                                                    </Breadcrumb.Item>
                                                );
                                            }
                                        })
                                }
                            </Breadcrumb>
                        </Col>
                        <Col span={5}>
                            <Upload {...uploadConfig} multiple>
                                <Button type="primary" icon={<UploadOutlined/>}>
                                    <FormattedMessage id="UploadFile"/>
                                </Button>
                            </Upload>
                        </Col>
                        <Col span={5} style={{textAlign: 'right'}}>
                            <Button type="primary" onClick={() => setVisible(true)}>
                                <FormattedMessage id="CreateFileFolder"/>
                            </Button>
                        </Col>
                    </Row>

                    <Row>
                        {/*<Col span={24}>*/}
                        {/*    {this.state.processVisible ? <Progress percent={this.state.percent}/> : <></>}*/}
                        {/*</Col>*/}
                    </Row>
                    <Content otherHeight={150} fitHeight>
                        <Table
                            rowKey="Id"
                            loading={loading}
                            columns={colums}
                            dataSource={dataSource}
                            pagination={false}
                            scroll={{y: document.documentElement.clientHeight - 190}}
                        />
                    </Content>
                    <Modal
                        visible={visible}
                        top={50}
                        onOk={() => {
                            setVisible(false) || handleSubmit() || form.resetFields()
                        }}
                        onCancel={() => setVisible(false)}
                    >
                        <Content otherHeight={600} fitHeight style={{padding: 20}}>
                            <Form autoComplete="off" form={form}>
                                <FormItem name="fileName" label={<FormattedMessage id="UploadFolderName"/>}
                                          placeholder="Folder Name" noSpace/>
                            </Form>
                        </Content>
                    </Modal>
                </>
            </ModalContent>
        </ConfigProvider>
    );
});