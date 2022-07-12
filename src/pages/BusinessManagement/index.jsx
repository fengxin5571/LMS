import config from 'src/commons/config-hoc';
import {IntlProvider, FormattedMessage} from "react-intl";
import React, {useCallback, useEffect, useState} from "react";
import {ConfigProvider, Tabs, List, Button, Modal, Form, Row, Col} from "antd";
import {Content, FormItem, getLoginUser, PageContent} from "@ra-lib/admin";
import {getLange} from "../../commons";
import zhCN from "antd/lib/locale/zh_CN";
import enUS from "antd/lib/locale/en_US";
import {convertToFormData, BtnFlags, GridStatus} from "src/commons/common";

const {TabPane} = Tabs;
export default config({
    path: '/BusinessManagement',
})(function BusinessManagement(props) {
    const loginUser = getLoginUser();
    const [lang, setLang] = useState(getLange(loginUser?.id));
    const [locale, setLocale] = useState();
    const [antLocale, setAntLocale] = useState();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [visible, setVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [btnFlagsOptions, setBtnFlagsOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [dataGridType, setDataGridType] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [dbgridForm] = Form.useForm();
    useEffect(async () => {
        const resp = await fetch(`./lang/${lang}.json`)
        const data = await resp.json();
        let items = [];
        let options = [];
        let statusOptions = [];
        let selectOptions = [];
        const localization = await fetch(`./lang/${lang}_Localization.json`);
        const errorJson = await localization.json();
        window.sessionStorage.setItem("error-json-" + loginUser?.id, JSON.stringify(errorJson));
        if (lang == "zh_CN") {
            setAntLocale(zhCN);
        } else {
            setAntLocale(enUS);
        }
        const res = await props.ajax.get("/Setting/LoadAllGrids", {}, {setLoading});
        res.forEach((item) => {
            if (item?.Grids) {
                items = items.concat(item?.Grids);
            }
            if (item?.DataGridType) {
                selectOptions.push({label: item.DataGridType, value: item.DataGridType});
            }
        });
        for (const resKey in BtnFlags) {
            options.push({label: resKey, value: BtnFlags[resKey]});
        }
        for (const resKey in GridStatus) {
            statusOptions.push({label: resKey, value: GridStatus[resKey]});
        }
        setDataGridType(selectOptions);
        setBtnFlagsOptions(options);
        setStatusOptions(statusOptions);
        setDataSource(items);
        setLocale(data);

    }, [lang, refresh, isEdit]);
    const GetGrid = useCallback(async (dbgridName, type) => {
        if (type == 1) {
            let checkedFlags = [];
            let checkedStatus = [];
            let visableStatus = [];
            const res = await props.ajax.get(`Setting/GetGrid?gridName=` + dbgridName, {}, {});
            checkedFlags = btnFlagsOptions.filter(item => (res.Flags & item.value) > 0)?.map(item => item.value);
            checkedStatus = statusOptions.filter(item => (res.Status & item.value) > 0)?.map(item => item.value);
            visableStatus = statusOptions.filter(item => (res.VisableStatus & item.value) > 0)?.map(item => item.value);
            const values = {
                Id: res?.Id,
                DbGridName: res?.DbGridName,
                DbGridNameCn: res?.DbGridNameCn,
                DisableGridNameFilter: res?.DisableGridNameFilter,
                GridReadonly: res?.GridReadonly,
                Flags: checkedFlags,
                Status: checkedStatus,
                VisableStatus: visableStatus
            }
            console.log(values);
            dbgridForm.setFieldsValue(values);
        } else if (type == 2) {
            await props.ajax.post(`/Setting/RemoveGrid`, convertToFormData({
                gridName: dbgridName
            }), {
                successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!"
            });
            setRefresh(true);
        }
    }, [btnFlagsOptions, statusOptions]);

    const UpdateGrid = useCallback(async () => {
        const flags = dbgridForm.getFieldValue("Flags") || [];
        const visableStatus = dbgridForm.getFieldValue("VisableStatus") || [];
        const status = dbgridForm.getFieldValue("Status") || [];
        let sumFlags = 0;
        let sumVisableStatus = 0;
        let sumStatus = 0;
        flags.map(item => sumFlags = sumFlags | item.toString(10));
        visableStatus.map(item => sumVisableStatus = sumVisableStatus | item.toString(10));
        status.map(item => sumStatus = sumStatus | item.toString(10));
        const params = {
            DbGridName: dbgridForm.getFieldValue("DbGridName"),
            DbGridNameCn: dbgridForm.getFieldValue("DbGridNameCn"),
            Flags: sumFlags,
            DisableGridNameFilter: dbgridForm.getFieldValue("DisableGridNameFilter") == undefined ? false : dbgridForm.getFieldValue("DisableGridNameFilter"),
            VisableStatus: sumVisableStatus,
            GridReadonly: dbgridForm.getFieldValue("GridReadonly") == undefined ? false : dbgridForm.getFieldValue("GridReadonly"),
            Status: sumStatus,
            DataGridType: dbgridForm.getFieldValue("DataGridType")
        }
        if (isEdit) { //编辑
            params.Id = dbgridForm.getFieldValue('Id');
            await props.ajax.post(`Setting/UpdateGrid`, convertToFormData(params), {
                successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!"
            });
        } else {

            await props.ajax.post(`/Setting/AddGrid`, convertToFormData(params), {
                successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!"
            })
        }
        setRefresh(true);
        const name = dbgridForm.getFieldValue('DbGridName')
        dbgridForm.resetFields();
        window.sessionStorage.removeItem(name + '-config-' + loginUser?.id);
    }, [isEdit]);
    const onChange = (key) => {
        console.log(key);
    };
    const layout = {labelCol: {flex: '10rem'}};
    return (
        <IntlProvider locale="en" messages={locale}>
            <ConfigProvider locale={antLocale}>
                <PageContent fitHeight loading={loading}>
                    <Tabs defaultActiveKey="1" onChange={onChange}>
                        <TabPane tab={<FormattedMessage id="BusinessManagement"/>} key="1">
                            <Content otherHeight={50} fitHeight style={{paddingLeft: 20}} >
                                <List
                                    header={
                                        <>
                                            <Row>
                                                <Col flex="14rem">
                                                    <div style={{fontWeight: "bold"}}><FormattedMessage
                                                        id="TableConfiguration"/></div>
                                                </Col>
                                                <Col flex="auto">
                                                    <Button type="primary" style={{float: "right"}}
                                                            onClick={() => setVisible(true) || setIsEdit(false) || setRefresh(false)}><FormattedMessage
                                                        id="Create"/></Button>
                                                </Col>
                                            </Row>


                                        </>
                                    }
                                    dataSource={dataSource}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[<Button type="primary"
                                                              onClick={() => setVisible(true) || setIsEdit(true) || setRefresh(false) || GetGrid(item.Name, 1)}><FormattedMessage
                                                id="Settings"/></Button>, <Button type="primary" style={{
                                                background: "#FF6060",
                                                borderColor: '#FF6060'
                                            }}
                                                                                  onClick={() => setIsEdit(false) || setRefresh(false) || GetGrid(item.Name, 2)}><FormattedMessage
                                                id="Delete"/></Button>]}>
                                            {getLange(loginUser?.id) == "zh_CN" ? item.CnName : item.Name}
                                        </List.Item>
                                    )}

                                />
                                <Modal
                                    visible={visible}
                                    width="70%"
                                    onCancel={() => setVisible(false)}
                                    onOk={() => setVisible(false) || UpdateGrid()}
                                >
                                    <Content fitHeight otherHeight={250} style={{padding: 10, top: 20}}>
                                        <Form autoComplete="off" form={dbgridForm}>
                                            {isEdit ? <FormItem hidden name="Id"/> : null}
                                            <FormItem
                                                {...layout}
                                                label={<FormattedMessage id='DbGridName'/>}
                                                placeholder="DbGridName"
                                                required
                                                name="DbGridName" disabled={isEdit}/>
                                            <FormItem
                                                {...layout}
                                                label={<FormattedMessage id='DbGridNameCn'/>}
                                                placeholder="DbGridNameCn"
                                                required
                                                name="DbGridNameCn" disabled={isEdit}/>
                                            {!isEdit ? <FormItem
                                                {...layout}
                                                label={<FormattedMessage id='DataGridType'/>}
                                                placeholder="DataGridType"
                                                required
                                                name="DataGridType" options={dataGridType}/> : null}
                                            <FormItem
                                                {...layout}
                                                type="checkbox-group" label='Flags' name="Flags"
                                                options={btnFlagsOptions}/>
                                            <FormItem
                                                {...layout}
                                                type="checkbox-group" label='VisableStatus' name="VisableStatus"
                                                options={statusOptions}/>
                                            <FormItem
                                                {...layout}
                                                type="checkbox-group" label='Status' name="Status"
                                                options={statusOptions}/>
                                            <FormItem
                                                {...layout}
                                                type="switch"
                                                label={<FormattedMessage id='DisableGridNameFilter'/>}
                                                name="DisableGridNameFilter"
                                            />
                                            <FormItem
                                                {...layout}
                                                type="switch" label={<FormattedMessage id='GridReadonly'/>}
                                                name="GridReadonly"
                                            />

                                        </Form>
                                    </Content>
                                </Modal>
                            </Content>
                        </TabPane>
                        <TabPane tab="Tab 2" key="2">
                            Content of Tab Pane 2
                        </TabPane>
                        <TabPane tab="Tab 3" key="3">
                            Content of Tab Pane 3
                        </TabPane>
                    </Tabs>
                </PageContent>
            </ConfigProvider>
        </IntlProvider>
    );
});