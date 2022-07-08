import config from 'src/commons/config-hoc';
import {IntlProvider, FormattedMessage} from "react-intl";
import React, {useCallback, useEffect, useState} from "react";
import {ConfigProvider, Tabs, List, Button, Modal, Form, Switch} from "antd";
import {Content, FormItem, getLoginUser, PageContent} from "@ra-lib/admin";
import {getLange} from "../../commons";
import zhCN from "antd/lib/locale/zh_CN";
import enUS from "antd/lib/locale/en_US";
import {DbGridNames} from "../../commons/dbgridconfig";
import {convertToFormData} from "src/commons/common";

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
    const [dbgridForm] = Form.useForm();
    useEffect(async () => {
        const resp = await fetch(`./lang/${lang}.json`)
        const data = await resp.json();
        let items = [];
        const localization = await fetch(`./lang/${lang}_Localization.json`);
        const errorJson = await localization.json();
        window.sessionStorage.setItem("error-json-" + loginUser?.id, JSON.stringify(errorJson));
        if (lang == "zh_CN") {
            setAntLocale(zhCN);
        } else {
            setAntLocale(enUS);
        }
        for (const JsonKey in DbGridNames) {
            if (JsonKey.search("_Cn") == -1) {
                items.push(DbGridNames[JsonKey]);

            }

        }
        setDataSource(items);
        setLocale(data);

    }, [lang]);
    const GetGrid = useCallback(async (dbgridName) => {
        const res = await props.ajax.get(`Setting/GetGrid?gridName=` + dbgridName, {}, {
            //successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!"
        });
        dbgridForm.setFieldsValue(res);
        console.log(res);
    }, []);

    const UpdateGrid = useCallback(async () => {
        console.log(dbgridForm.getFieldsValue(true));
        const name=dbgridForm.getFieldValue('DbGridName')
        await props.ajax.post(`Setting/UpdateGrid`, convertToFormData(dbgridForm.getFieldsValue(true)), {
            successTip: getLange(loginUser?.id) == "zh_CN" ? "操作成功" : "Operation successful!"
        });
        window.sessionStorage.removeItem(name + '-config-' + loginUser?.id);
    }, []);
    const onChange = (key) => {
        console.log(key);
    };
    return (
        <IntlProvider locale="en" messages={locale}>
            <ConfigProvider locale={antLocale}>
                <PageContent fitHeight loading={loading}>
                    <Tabs defaultActiveKey="1" onChange={onChange}>
                        <TabPane tab={<FormattedMessage id="BusinessManagement"/>} key="1">
                            <Content otherHeight={50} fitHeight style={{paddingLeft: 20}}>
                                <List
                                    header={<div style={{fontWeight: "bold"}}><FormattedMessage
                                        id="TableConfiguration"/></div>}
                                    dataSource={dataSource}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[<Button type="primary"
                                                              onClick={() => setVisible(true) || GetGrid(item)}><FormattedMessage
                                                id="Settings"/></Button>]}>
                                            {item}
                                        </List.Item>
                                    )}
                                />
                                <Modal
                                    visible={visible}
                                    onCancel={() => setVisible(false)}
                                    onOk={() => setVisible(false) || UpdateGrid()}
                                >
                                    <Content fitHeight otherHeight={200} style={{padding: 10, top: 20}}>
                                        <Form autoComplete="off" form={dbgridForm}>
                                            <FormItem hidden name="Id"/>
                                            <FormItem label={<FormattedMessage id='DbGridName'/>}
                                                      placeholder="DbGridName"
                                                      name="DbGridName" disabled={true}/>
                                            <FormItem label={<FormattedMessage id='DbGridNameCn'/>}
                                                      placeholder="DbGridNameCn"
                                                      name="DbGridNameCn" disabled={true}/>
                                            <FormItem type="switch"
                                                      label={<FormattedMessage id='DisableGridNameFilter'/>}
                                                      name="DisableGridNameFilter"
                                            />
                                            <FormItem type="switch" label={<FormattedMessage id='GridReadonly'/>}
                                                      name="GridReadonly"
                                            />
                                            <FormItem label='Flags' name="Flags"/>
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