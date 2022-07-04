import React, {Component} from 'react'
import {Row, Col, Modal, Table, Upload, Button, Breadcrumb, Progress, message, Form} from 'antd'
import {HomeOutlined, UploadOutlined, FolderOpenOutlined, DeleteOutlined} from '@ant-design/icons';
import {FormattedMessage} from "react-intl";
import {Content, FormItem, getLoginUser} from "@ra-lib/admin";
import {getLange} from "../../commons";

export default class FileManagerTable extends Component {
    createFolder = React.createRef();
    state = {
        path: ['/'],
        handlePath: [],
        tableData: [],
        loading: false,
        percent: 0,
        processVisible: false,
        visible: false,
        loginUser: getLoginUser(),
        fileList: null,
    }
    /**
     * 创建目录
     */
    handleSubmit = () => {
        let creatFolderName = this.createFolder.current.getFieldValue('fileName');
        if (!creatFolderName) return;
        const {path} = this.state;
        if (this.props.fileType == 1) { // 添加
            var handlePath = "";
            var flag = false;
            path.map((item) => {
                handlePath = handlePath + item + (item == "/" ? "" : "/")
            });
            let tableData = window.sessionStorage.getItem("fileManager-local-" + this.props.uploadItemName + "-" + this.state.loginUser?.id);
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
            window.sessionStorage.setItem("fileManager-local-" + this.props.uploadItemName + "-" + this.state.loginUser?.id, JSON.stringify(tableData));
        } else if (this.props.fileType == 2 || this.props.fileType == 3) {

        }
        this.getData(path);
    }

    /**
     * 封装上传数据
     * @returns {[{test: number}]}
     */


    /**
     * 显示创建目录弹窗
     * @param path
     */
    onCreateFolder = path => {
        this.setState({
            visible: true,
        });
    }
    /**
     * 面包屑打开目录
     * @param e
     * @param name
     */
    onClickPathFolder = (e, name) => {
        e.preventDefault();
        const {path} = this.state;
        const newPath = path.slice(0, path.indexOf(name) + 1);
        this.setState({
            path: newPath
        }, function () {
            this.getData(this.state.path);
        })
    }
    /**
     * 打开目录
     * @param name
     */
    onOpenFolder = name => {
        const _this = this;
        const {path} = _this.state;
        _this.setState({
            path: path.concat(name)
        }, function () {
            _this.getData(_this.state.path);
        })


    }
    onDownloadFile = record => {
        const {path} = this.state;
        var iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.style.height = 0;
        iframe.src = `/api/file/object/?name=${record.name}&path=${JSON.stringify(path)}&x-token=${localStorage.token}`;
        document.body.appendChild(iframe);
        setTimeout(function () {
            iframe.remove();
        }, 5 * 60 * 1000);
    }
    /**
     * 删除目录或文件
     * @param record
     */
    onDeleteFile = record => {
        const {path} = this.state;
        const _this = this;
        var handlePath = "";
        path.map((item) => {
            handlePath = handlePath + item + (item == "/" ? "" : "/")
        });
        let tableData;
        Modal.confirm({
            title: getLange(_this.state.loginUser?.id) == "zh_CN" ? "您确定删除" + record.FileName + "吗？" : "Are you sure you want to delete " + record.FileName + "?",
            onOk() {
                if (_this.props.fileType == 1) { //添加
                    tableData = window.sessionStorage.getItem("fileManager-local-" + _this.props.uploadItemName + "-" + _this.state.loginUser?.id);
                    tableData = JSON.parse(tableData);
                    tableData.forEach((item, k) => {
                        if (item.FileName == record.FileName) {
                            tableData.splice(k, 1);
                            tableData.map((v, index) => {
                                if (v.Path.search(handlePath + record.FileName) >= 0) {
                                    tableData.splice(index, 1);
                                }
                            });
                        }
                    });

                } else if (_this.props.fileType == 2 || _this.props.fileType == 3) {

                }
                window.sessionStorage.setItem("fileManager-local-" + _this.props.uploadItemName + "-" + _this.state.loginUser?.id, JSON.stringify(tableData));
                _this.getData(path);
                // http
                //     .delete(`/api/file/object/?name=${record.name}&path=${JSON.stringify(path)}`)
                //     .then(res => {
                //         message.success(`删除${record.name}成功`);
                //         _this.getData(path);
                //     })
                //     .catch(error => {
                //         console.log(error);
                //     });
            },
            onCancel() {
                message.error(getLange(_this.state.loginUser?.id) == "zh_CN" ? `删除文件${record.FileName}被取消` : `Deleting the file${record.FileName}was canceled`);
            },
        });
    }

    getData = async (path) => {
        this.setState({
            loading: true
        })
        var handlePath = "";
        path.map((item) => {
            handlePath = handlePath + item + (item == "/" ? "" : "/")
        });
        let tableData = [];
        if (this.props.fileType == 1) { //如果是添加
            let localData = window.sessionStorage.getItem("fileManager-local-" + this.props.uploadItemName + "-" + this.state.loginUser?.id);
            localData = localData ? JSON.parse(localData) : [];
            localData.forEach((item) => {
                if (item.Path == handlePath) {
                    tableData.push({FileName: item.FileName, IsDirectory: item.IsDirectory});
                }
            });
        } else if (this.props.fileType == 2 || this.props.fileType == 3) { //如果是查看、编辑

        }
        this.setState({tableData: tableData, loading: false})
        // http
        //     .post("/api/file/", JSON.stringify({ path }))
        //     .then(res => {
        //         let tableData = [];
        //         let tableData_D = [];
        //         let tableData_Other = [];
        //
        //         res.sort((a, b) => {
        //             if (a.name > b.name) {
        //                 return -1;
        //             } else if (a.name < b.name) {
        //                 return 1;
        //             } else {
        //                 return 0;
        //             }
        //         })
        //
        //         for (let i = 0; i < res.length; i++) {
        //             if (res[i].kind === "d") {
        //                 tableData_D.unshift({
        //                     id: i,
        //                     name: res[i].name,
        //                     size: res[i].size,
        //                     date: res[i].date,
        //                     kind: res[i].kind,
        //                     code: res[i].code
        //                 })
        //             } else {
        //                 tableData_Other.unshift({
        //                     id: i,
        //                     name: res[i].name,
        //                     size: res[i].size,
        //                     date: res[i].date,
        //                     kind: res[i].kind,
        //                     code: res[i].code
        //                 })
        //             }
        //         }
        //
        //         tableData = tableData_D.concat(tableData_Other);
        //
        //         this.setState({
        //             tableData,
        //             loading: false
        //         })
        //     })
        //     .catch(error => {
        //         console.log(error);
        //         this.setState({
        //             loading: false
        //         })
        //     });
    }

    componentDidMount() {
        (async () => {
            await this.getData(this.state.path);
        })();

    }

    componentWillUpdate() {
        let uploadJson = []
        let handlepath = "";
        let allpath = "";
        this.state.path.map((item, i) => {
            allpath = allpath + item + (item == "/" ? "" : "/");
            if (i > 0) {
                handlepath = handlepath + this.state.path[i - 1] + (this.state.path[i - 1] == "/" ? "" : "/")
                uploadJson.push({
                    IsDirectory: true,
                    FileName: item,
                    FolderName: handlepath,
                })
            }
        });
        // console.log(this.state.fileList?.name)
        if (this.state.fileList) {
            uploadJson.push({
                IsDirectory: false,
                FolderName: allpath,
                FileName: this.state.fileList?.name
            })
        }
        console.log(uploadJson);
        window.sessionStorage.setItem("state-path-" + this.state.loginUser?.id, JSON.stringify(uploadJson));
    }

    render() {
        const {path} = this.state;
        const _this = this;

        const uploadConfig = {
            name: 'fileManagerFile',
            beforeUpload(info) {
                _this.setState({fileList: info})
                // if (info.fileList.length > 0) {
                //     _this.setState({file: info})
                // } else {
                //     _this.setState({file: null})
                // }
                return false;
            },
            onRemove(info) {
                _this.setState({fileList: null})
            },
            onChange(info) {
                _this.setState({fileList: info.file})
                info.file.status = 'done'
                // if (info.fileList.length > 0) {
                //     _this.setState({file: info})
                // } else {
                //     _this.setState({file: null})
                // }
                // if (info.file.status !== 'uploading') {
                //
                // }
                // if (info.file.status === 'uploading') {
                //     _this.setState({
                //         processVisible: true,
                //         percent: Math.floor(info.file.percent)
                //     })
                // }
                // if (info.file.status === 'done') {
                //     message.success(`${info.file.name}上传成功`);
                //     _this.getData(_this.state.path);
                //     _this.setState({
                //         processVisible: false,
                //         percent: 0
                //     })
                // } else if (info.file.status === 'error') {
                //     message.error(`${info.file.name}${info.file.response}`);
                //     _this.setState({
                //         processVisible: false,
                //         percent: 0
                //     })
                // }
            },
        };

        return (
            <React.Fragment>
                <Row style={{marginBottom: 15}}>
                    <Col span={17}>
                        <Breadcrumb style={{"padding-left": '20px'}}>
                            {
                                path.length === 1 ?
                                    path.map((v, i) => (
                                        <Breadcrumb.Item key={v} href="" onClick={e => this.onClickPathFolder(e, v)}>
                                            <HomeOutlined/>
                                        </Breadcrumb.Item>)) :
                                    path.map((v, i) => {
                                        if (i === 0) {
                                            return (
                                                <Breadcrumb.Item key={v} href=""
                                                                 onClick={e => this.onClickPathFolder(e, v)}>
                                                    <HomeOutlined/>
                                                </Breadcrumb.Item>
                                            );
                                        } else {
                                            return (
                                                <Breadcrumb.Item key={v} href=""
                                                                 onClick={e => this.onClickPathFolder(e, v)}>
                                                    <span>{v}</span>
                                                </Breadcrumb.Item>
                                            );
                                        }
                                    })
                            }
                        </Breadcrumb>
                    </Col>
                    <Col span={5}>
                        <Upload {...uploadConfig} >
                            <Button type="primary" icon={<UploadOutlined/>}>
                                <FormattedMessage id="UploadFile"/>
                            </Button>
                        </Upload>
                    </Col>
                    <Col span={2} style={{textAlign: 'right'}}>
                        <Button type="primary" onClick={() => this.onCreateFolder(this.state.path)}>
                            <FormattedMessage id="CreateFileFolder"/>
                        </Button>
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        {this.state.processVisible ? <Progress percent={this.state.percent}/> : <></>}
                    </Col>
                </Row>
                <Content otherHeight={150} fitHeight>
                    <Table
                        rowKey="Id"
                        loading={this.state.loading}
                        dataSource={this.state.tableData}
                        pagination={false}
                        className="fileManagerTable"
                        scroll={{y: document.documentElement.clientHeight - 190}}
                    >
                        <Table.Column
                            title={<FormattedMessage id="Name"/>}
                            dataIndex="FileName"
                            key="FileName"
                            render={(text, record) => (
                                record.IsDirectory == true ?
                                    <Button type="link" onClick={() => this.onOpenFolder(text)}
                                            title={text}>
                                        <FolderOpenOutlined/>
                                        {text.length > 30 ? text.substring(0, 19) + "..." : text}
                                    </Button> : text
                            )}
                        />
                        <Table.Column
                            title={<FormattedMessage id="Operation"/>}
                            render={(text, record) => (<>
                                {record.IsDirectory == false ? <>
                                    <Button type="link" icon="download" title="下载"
                                            onClick={() => this.onDownloadFile(text)}></Button>
                                    <Button type="link"
                                            title={getLange(this.state.loginUser?.id) == "zh_CN" ? "删除！" : "Delete"}
                                            onClick={() => this.onDeleteFile(text)}
                                            style={{color: '#FF0000'}}><DeleteOutlined/></Button></> : <>
                                    <Button type="link"
                                            title={getLange(this.state.loginUser?.id) == "zh_CN" ? "删除！" : "Delete"}
                                            onClick={() => this.onDeleteFile(text)}
                                            style={{color: '#FF0000'}}><DeleteOutlined/></Button>
                                </>}
                            </>)}
                            width={100}
                        />
                    </Table>
                </Content>
                <Modal
                    visible={this.state.visible}
                    top={50}
                    onOk={() => {
                        this.setState({visible: false}) || this.handleSubmit() || _this.createFolder.current.resetFields()
                    }}
                    onCancel={() => this.setState({visible: false})}
                >
                    <Content otherHeight={600} fitHeight style={{padding: 20}}>
                        <Form name="createFolder" ref={_this.createFolder}>
                            <FormItem name="fileName" label={<FormattedMessage id="UploadFolderName"/>}
                                      placeholder="Folder Name" noSpace/>
                        </Form>
                    </Content>
                </Modal>
            </React.Fragment>
        )
    }
}