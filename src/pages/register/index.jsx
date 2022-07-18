import React, {useState, useEffect, useCallback} from 'react';
import {Helmet} from 'react-helmet';
import {Button, Form} from 'antd';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {FormItem, setLoginUser} from '@ra-lib/admin';
import config from 'src/commons/config-hoc';
import {locationHref, toHome} from 'src/commons';
import {Logo, Proxy} from 'src/components';
import {IS_DEV, IS_TEST, IS_PREVIEW} from 'src/config';
import s from './style.less';
import {convertToFormData} from "../../commons/common";
import {FormattedMessage, IntlProvider} from "react-intl";

// 开发模式 默认填充的用户名密码
const formValues = {
    UserName: 'firstUser',
    Password: '1234aZ!',
    TenantName: 'FirstAgent',
    CompanyName: 'AGENT\'S CUSTOMER',
    Email: 'dfsfd@dfdfdf.com'
};

export default config({
    path: '/register',
    auth: false,
    layout: false,
})(function Register(props) {
    const [message, setMessage] = useState();
    const [isMount, setIsMount] = useState(false);
    const [form] = Form.useForm();
    const register = props.ajax.usePost('/Account/RegisterUser');
    const login = props.ajax.usePost('/Account/Login');
    const getToken = props.ajax.useGet('/Api/Token/GetToken');
    const [lang, setLang] = useState('zh_CN')
    const [locale, setLocale] = useState()
    const handleSubmit = useCallback(
        (values) => {
            if (register.loading) return;
            const params = {
                'UserName': values.UserName,
                'Password': values.Password,
                'TenantName': values.TenantName,
                'CompanyName': values.CompanyName,
                'Email': values.Email,
                'RememberMe': false
            };
            const formData = convertToFormData(params);
            register
                .run(formData, {errorTip: false})
                .then((res) => {
                    //处理登录的数据
                    const loginFormData = convertToFormData({
                        'UserName': res.UserName,
                        'Password': values.Password,
                        'TenantName': values.TenantName,
                    });
                    login.run(loginFormData, {errorTip: false}).then((res) => {
                        console.log(res);
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
                        const homeApiMenus = res.Menus.filter(item => item.ActionType == 1);
                        window.sessionStorage.setItem('homeApiMenus-' + res.UserId, JSON.stringify(homeApiMenus || []));
                        //获取token
                        getToken
                            .run(params, {errorTip: false})
                            .then((res) => {
                                console.log(res);
                                loginUser.token = res.Token;
                                setLoginUser(loginUser);
                                toHome();
                            })
                            .catch((err) => {
                                console.error(err);
                                setMessage(err.response?.data?.message || lang == "zh_CN" ? '用户名或密码错误' : "Wrong user name or password");
                            });
                    }).catch((err) => {
                        console.error(err);
                        setMessage(err.response?.data?.message || lang == "zh_CN" ? '注册失败' : "registration failed");
                    });
                })
                .catch((err) => {
                    console.error(err);
                    setMessage(err.response?.data?.message || lang == "zh_CN" ? '注册失败' : "registration failed");
                });
        },
        [register, login, getToken],
    );
    const handleLangChange = value => {
        setLang(value);
    }

    //跳转到登录
    async function handleLogin() {
        let lastHref = '/login';
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
    }, [form, lang]);

    const formItemClass = [s.formItem, {[s.active]: isMount}];

    return (
        <IntlProvider messages={locale}>
            <div className={s.root}>
                <Helmet title="注册用户"/>
                <div className={s.logo}>
                    <Logo/>
                </div>
                <Proxy className={s.proxy}/>
                <div className={s.box}>
                    <Form form={form} name="login" onFinish={handleSubmit}>
                        <div className={formItemClass}>
                            <h1 className={s.header}><FormattedMessage id="RegisterUser"/></h1>
                        </div>
                        <div className={formItemClass}>
                            <FormItem noStyle shouldUpdate style={{marginBottom: 0}}>
                                <Button className={s.submitBtn} onClick={handleLogin}><FormattedMessage
                                    id="LoginSystem"/></Button>
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
                            <FormItem
                                name="UserName"
                                allowClear
                                autoFocus
                                prefix={<UserOutlined/>}
                                placeholder="UserName"
                                rules={[{
                                    required: true,
                                    message: <FormattedMessage id="PlaceholderUserName" defaultMessage=""/>
                                }]}
                            />
                        </div>
                        <div className={formItemClass}>
                            <FormItem
                                name="TenantName"
                                allowClear
                                autoFocus
                                prefix={<UserOutlined/>}
                                placeholder="TenantName"
                                rules={[{
                                    required: true,
                                    message: <FormattedMessage id="PlaceholderTenantName" defaultMessage=""/>
                                }]}
                            />
                        </div>
                        <div className={formItemClass}>
                            <FormItem
                                name="Email"
                                allowClear
                                autoFocus
                                prefix={<UserOutlined/>}
                                placeholder="Email"
                                rules={[{
                                    required: true,
                                    message: lang == "zh_CN" ? '请输入邮箱！' : "Please Enter The Email"
                                }, ({getFieldValue}) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        if ((/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value))) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error(lang == "zh_CN" ? "请输入正确的邮箱" : "Please enter the correct mailbox"));
                                    },
                                }),]}
                            />
                        </div>
                        <div className={formItemClass}>
                            <FormItem
                                name="CompanyName"
                                allowClear
                                autoFocus
                                prefix={<UserOutlined/>}
                                placeholder="CompanyName"
                                rules={[{
                                    required: true,
                                    message: <FormattedMessage id="PlaceholderCompanyName" defaultMessage=""/>
                                }, {}]}
                            />

                        </div>
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
                        <div className={formItemClass}>
                            <FormItem noStyle shouldUpdate style={{marginBottom: 0}}>
                                {() => (
                                    <Button
                                        className={s.submitBtn}
                                        loading={register.loading}
                                        type="primary"
                                        htmlType="submit"
                                        disabled={
                                            // 用户没有操作过，或者没有setFieldsValue
                                            //!form.isFieldsTouched(true) ||
                                            // 表单中存在错误
                                            form.getFieldsError().filter(({errors}) => errors.length).length
                                        }
                                    >
                                        <FormattedMessage id="Register"/>
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
