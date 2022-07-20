import React, {useState, useEffect, useCallback} from 'react';
import {convertToFormData} from "src/commons/common";
import {Helmet} from 'react-helmet';
import {Button, Form} from 'antd';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {FormItem, setLoginUser} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import {locationHref, toHome, setLange, getLange} from 'src/commons';
import {Logo, Proxy} from 'src/components';
import {IS_DEV, IS_TEST, IS_PREVIEW} from 'src/config';
import {FormattedMessage, IntlProvider} from 'react-intl'; /* react-intl imports */
import s from './style.less';
// 开发模式 默认填充的用户名密码
const formValues = {
    UserName: 'admin',
    Password: '1234aZ!',
    TenantName: 'FirstAgent',
    CompanyName: 'AGENT\'S CUSTOMER',
};
export default config({
    path: '/login',
    auth: false,
    layout: false,
})(function Login(props) {
    const [message, setMessage] = useState();
    const [display, setDisplay] = useState("none")
    const [isMount, setIsMount] = useState(false);
    const [form] = Form.useForm();
    const login = props.ajax.usePost('/Account/Login');
    const getToken = props.ajax.useGet('/Api/Token/GetToken');
    const changeLanguage = props.ajax.usePost('Setting/ChangeLanguage');
    const [lang, setLang] = useState('zh_CN')
    const [locale, setLocale] = useState()
    const [loginType, setLoginType] = useState(1);

    //跳转到注册页
    async function handleRegister() {
        let lastHref = '/register';
        locationHref(lastHref);
    }

    useEffect(async () => {
        // 开发时默认填入数据
        if (IS_DEV || IS_TEST || IS_PREVIEW) {
            form.setFieldsValue(formValues);
        }
        const resp = await fetch(`./lang/${lang}.json`)
        const data = await resp.json();
        setLocale(data);
        setTimeout(() => setIsMount(true), 300);
    }, [form, loginType, lang]);
    //切换显示登陆身份
    const handleChange = value => {
        if (value == 1) {
            setDisplay("none");
        } else if (value == 2 || value == 3) {
            setDisplay("block");
        }
        setLoginType(value);
    }
    const handleLangChange = useCallback(value => {
        setLang(value);
    }, [lang]);
    //提交表单
    const handleSubmit = useCallback(
        (values) => {
            if (login.loading) return;
            const params = {
                UserName: values.UserName,
                Password: values.Password,
                RememberMe: true,
                TestHarness: false,
            };

            //如果是租户或是公司用户
            if (values.LoginType == 2 || values.LoginType == 3) {
                params.TenantName = values.TenantName;
                //params.CompanyName = values.CompanyName;
            }
            const formData = convertToFormData(params);
            //调用登录接口
            login
                .run(formData, {errorTip: false})
                .then((res) => {
                    //处理登录后的用户信息
                    const loginUser = {
                        'id': res.UserId,
                        'name': res.UserName,
                        'token': res.Token,
                        'CompanyId': res.CompanyId,
                        'DepartmentRole': res.DepartmentRole,
                        'TenantId': res.TenantId,
                        'Menus': res.Menus,
                    };
                    const homeApiMenus = res.Menus.filter(item => item.ActionType == 1 && item.Name != "BusinessManagement");
                    window.sessionStorage.setItem('homeApiMenus-' + res.UserId, JSON.stringify(homeApiMenus || []));
                    const homeQuickMenus = res.Menus.filter(item => item.ActionType != 1 && item.Shortcut);
                    window.sessionStorage.setItem('homeQuickMenus-' + res.UserId, JSON.stringify(homeQuickMenus || []));
                    //获取token
                    getToken
                        .run(params, {errorTip: false})
                        .then((res) => {
                            console.log(res);
                            loginUser.token = res.Token;
                            setLoginUser(loginUser);
                            setLange(loginUser.id, values.Lang == undefined ? 'zh_CN' : values.Lang);
                            changeLanguage.run(convertToFormData({language: values.Lang == undefined ? 'zh-Hans' : (values.Lang == "zh_CN" ? "zh-Hans" : "en")}), {errorTip: false})
                            toHome();
                        })
                        .catch((err) => {
                            console.error(err);
                            setMessage(err.response?.data?.message || lang == "zh_CN" ? '用户名或密码错误' : "Wrong user name or password");
                        });


                })
                .catch((err) => {
                    console.error(err);
                    setMessage(err.response?.data?.message || lang == "zh_CN" ? '用户名或密码错误' : "Wrong user name or password");
                });
        },
        [login, getToken],
    );

    const formItemClass = [s.formItem, {[s.active]: isMount}];
    return (
        <IntlProvider messages={locale}>
            <div className={s.root}>
                <Helmet title="欢迎登录"/>
                <div className={s.logo}>
                    <Logo/>
                </div>
                <Proxy className={s.proxy}/>
                <div className={s.box}>
                    <Form form={form} name="login" onFinish={handleSubmit}>
                        <div className={formItemClass}>
                            <h1 className={s.header}>
                                <FormattedMessage id="WelcomeSysTem" defaultMessage=""/>
                            </h1>
                        </div>
                        <div className={formItemClass}>
                            <FormItem noStyle shouldUpdate style={{marginBottom: 0}}>
                                <Button className={s.submitBtn} onClick={handleRegister}>
                                    <FormattedMessage id="RegisterUser" defaultMessage=""/>
                                </Button>
                            </FormItem>
                        </div>
                        <div className={formItemClass}>
                            <FormItem name="Lang" placeholder="请选择语言" prefix={<UserOutlined/>} defaultValue="zh_CN"
                                      onChange={handleLangChange}
                                      options={[
                                          {value: 'zh_CN', label: '中文'},
                                          {value: 'en_US', label: 'english'},
                                      ]}/>
                        </div>
                        <div className={formItemClass}>
                            <FormItem name="LoginType"
                                      placeholder={<FormattedMessage id="SelectIdentity" defaultMessage=""/>}
                                      prefix={<UserOutlined/>} defaultValue="1"
                                      onChange={handleChange}
                                      options={[
                                          {value: '1', label: <FormattedMessage id="AdminIdentity" defaultMessage=""/>},
                                          {
                                              value: '2',
                                              label: <FormattedMessage id="TenantIdentity" defaultMessage=""/>
                                          },
                                          {
                                              value: '3',
                                              label: <FormattedMessage id="CompanyIdentity" defaultMessage=""/>
                                          },
                                      ]}/>
                        </div>
                        <div className={formItemClass}>
                            <FormItem
                                name="UserName"
                                allowClear
                                autoFocus
                                prefix={<UserOutlined/>}
                                placeholder="UserName"
                                rules={
                                    [{
                                        required: true,
                                        message: <FormattedMessage id="PlaceholderUserName" defaultMessage=""/>
                                    }]}
                            />
                        </div>
                        <div className={formItemClass} style={{display: display}}>

                            <FormItem
                                name="TenantName"
                                prefix={<UserOutlined/>}
                                placeholder="TenantName"
                                rules={[{
                                    required: display != "none" ? true : false,
                                    message: <FormattedMessage id="PlaceholderTenantName" defaultMessage=""/>
                                }]}
                            />
                        </div>
                        <div className={formItemClass}>
                            <div className={formItemClass}>
                                <FormItem
                                    type="password"
                                    name="Password"
                                    prefix={<LockOutlined/>}
                                    placeholder="Password"
                                    rules={[{
                                        required: true,
                                        message: <FormattedMessage id="PasswordMsg" defaultMessage=""/>
                                    }]}
                                />
                            </div>
                        </div>
                        <div className={formItemClass}>
                            <FormItem noStyle shouldUpdate style={{marginBottom: 0}}>
                                {() => (
                                    <Button
                                        className={s.submitBtn}
                                        loading={login.loading}
                                        type="primary"
                                        htmlType="submit"
                                        disabled={
                                            // 用户没有操作过，或者没有setFieldsValue
                                            //!form.isFieldsTouched(true) ||
                                            // 表单中存在错误
                                            form.getFieldsError().filter(({errors}) => errors.length).length
                                        }
                                    >
                                        <FormattedMessage id="Login" defaultMessage=""/>
                                    </Button>
                                )}
                            </FormItem>

                        </div>

                    </Form>
                    <div className={s.errorTip}>{message}</div>
                </div>
            </div>
        </IntlProvider>
    );
});
