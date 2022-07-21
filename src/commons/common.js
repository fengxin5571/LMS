import $ from "jquery";
import {DRAW, WITH_SYSTEMS} from "../config";
import {FormItem, getLoginUser, getToken, Content} from "@ra-lib/admin";
import {FormattedMessage} from "react-intl";
import React from "react";
import {Button, Card, Form, Input, Space, Tag, List, Col, Row, Tree, Tooltip} from "antd";
import {getLange} from "./index";
import moment from "moment";
import BraftEditor from "braft-editor";
import ReactDOMServer from 'react-dom/server';
import {
    MinusCircleOutlined,
    BarsOutlined,
    PlusOutlined,
    StarFilled,
    PaperClipOutlined,
    FolderOpenOutlined,
    FileOutlined,
    DownOutlined
} from "@ant-design/icons";

import SelectTable from "src/components/form/SelectTable";

const {DirectoryTree} = Tree;
/**
 * 表格按钮权限
 * @type {{All: number, CanUpload: number, CanGridAttachment: number, CanPrint: number, CanApprove: number, CanDelete: number, CanUndo: number, CanView: number, CanUploadAttachment: number, CanUV: number, CanAdd: number, CanPrintAll: number, CanCopyRecord: number, CanTransfer: number, CanDownload: number, CanUpdate: number, IncludeArchived: number, CustomerSupport: number, CanFinish: number, CanStart: number, CanCS: number}}
 */
export const BtnFlags = {
    //All: 0xffffffff,
    CanView: 0x1,
    CanAdd: 0x2,
    CanDelete: 0x4,
    CanUpload: 0x8,
    CanDownload: 0x10,
    CanUpdate: 0x20,
    IncludeArchived: 0x40,
    CanUploadAttachment: 0x80,
    CanGridAttachment: 0x100,
    CanCopyRecord: 0x200,
    CanPrint: 0x400,
    CanPrintAll: 0x800,
    CustomerSupport: 0x1000,
    CanUndo: 0x2000,
    CanCS: 0x4000,
    CanUV: 0x8000,
    CanTransfer: 0x10000,
    CanStart: 0x20000,
    CanFinish: 0x40000,
    CanApprove: 0x80000,
};
export const GridStatus = {
    Ready: 0x1,
    Close: 0x2,
    Archived: 0x4,
    Deleted: 0x8,
    Created: 0x10,
    TimeOut: 0x20,
    Invoiced: 0x40,
    Paid: 0x80,
    Overdue: 0x100,
    UnknownRefund: 0x200,
    ReadyToPay: 0x400,
    Rejected: 0x800,
    Agreed: 0x1000,
    Responded: 0x2000,
    Approved: 0x4000,
}
/**
 * 字段权限
 * @type {{view: number, change: number, create: number, readOnly: number}}
 */
export const authority = {
    view: 0x1,
    create: 0x2,
    change: 0x4,
    readOnly: 0x8,
};

/**
 * 转换FormData
 * @param values
 * @returns {FormData}
 */
export function convertToFormData(values) {
    //return qs.stringify(values);
    var formData = new FormData()
    values && Object.entries(values).forEach(entry => {
        var name = "";
        const [key, value] = entry;
        if (value != null) {
            if (Object.prototype.toString.call(value) === '[object Array]') {
                value.forEach((v, index) => {
                    if (Object.prototype.toString.call(v) === '[object Object]') {
                        Object.entries(v).forEach(e => {
                            const [eKey, eValue] = e;
                            if (eValue != null) {
                                name = `${key}[${index}].${eKey}`
                                //console.log(`key=${name},value=${eValue}`)
                                formData.append(name, eValue)
                            }
                        })
                    } else if (v != null) {
                        //console.log(`key=${key},value=${v}`)
                        formData.append(key, v)
                    }
                })
            } else if (Object.prototype.toString.call(value) === '[object Object]') {
                Object.entries(value).forEach(e => {
                    const [eKey, eValue] = e;
                    if (eValue != null) {
                        name = `${key}.${eKey}`
                        //console.log(`key=${name},value=${eValue}`)
                        formData.append(name, eValue)
                    }
                })
            } else {
                //console.log(`key=${key},value=${value}`)
                formData.append(key, value)
            }
        } else {
            //console.log(`key=${key},value=${value}`)
            formData.append(key, value)
        }
    })

    return formData;
}

export function bigCamel(s) {
    var result = "";
    var empties = " \t\r\n"; //记录所有的空白字符串
    for (var i = 0; i < s.length; i++) {
        if (!empties.includes(s[i])) {
            if (empties.includes(s[i - 1]) || i === 0) {
                result += s[i].toUpperCase();
            } else {
                result += s[i];
            }
        }
    }
    return result;
}

/**
 * 处理菜单
 * @param values
 * @returns {*[]}
 */
export function formatLmsMenus(values) {
    const menus = [];
    const homeBtnMenus = [];
    Object.keys(values).forEach(key => {
        let menu = null;
        //如果是顶级菜单
        if (values[key].ParentName === "/") {
            //如果是菜单目录
            if (values[key].ActionType === 2) {
                menu = {
                    'id': parseInt(key) + 1,
                    'type': 1,
                    'title': <FormattedMessage id={values[key].Name}/>,
                    'sourceTitle': values[key].Name,
                    "history": "Global",
                    'order': values[key].DisplayOrder,
                    'UiRouter': values[key].UiRouter,
                    'ActionType': values[key].ActionType,
                    'Access': values[key].Access,
                    'ActionHttpMethod': values[key].ActionHttpMethod
                };
            } else {
                menu = {
                    'id': parseInt(key) + 1,
                    'type': 1,
                    'title': <FormattedMessage id={values[key].Name}/>,
                    'sourceTitle': values[key].Name,
                    "history": "Global",
                    'order': values[key].DisplayOrder,
                    'UiRouter': values[key].UiRouter,
                    'ActionType': values[key].ActionType,
                    'Access': values[key].Access,
                    'ActionHttpMethod': values[key].ActionHttpMethod,
                    //"path": "/" + bigCamel(values[key].Name),
                    "path": values[key].Name == "BusinessManagement" ? "/BusinessManagement" : (values[key].Name == "/" ? "/" : "/Dynamic/" + values[key].Name.replace(new RegExp(/( )/g), "_")),
                };
            }

        } else {//子级菜单
            if (values[key].ActionType === 2) {
                menu = {
                    'id': parseInt(key) + 1,
                    'type': 1,
                    'title': <FormattedMessage id={values[key].Name}/>,
                    'sourceTitle': values[key].Name,
                    "history": "Global",
                    'order': values[key].DisplayOrder,
                    'parentId': values[key].ParentName,
                    'UiRouter': values[key].UiRouter,
                    'Access': values[key].Access,
                    'ActionType': values[key].ActionType,
                    'ActionHttpMethod': values[key].ActionHttpMethod
                };
                if (values[key].Name == "/") {
                    menu.path = "/";
                }
            } else {
                menu = {
                    'id': parseInt(key) + 1,
                    'type': 1,
                    'title': <FormattedMessage id={values[key].Name}/>,
                    'sourceTitle': values[key].Name,
                    "history": "Global",
                    'order': values[key].DisplayOrder,
                    'parentId': values[key].ParentName,
                    'UiRouter': values[key].UiRouter,
                    'ActionType': values[key].Name == "BusinessManagement" ? 0 : values[key].ActionType,
                    'Access': values[key].Access,
                    'ActionHttpMethod': values[key].ActionHttpMethod,
                    //'path': values[key].UiRouter ? values[key].UiRouter : bigCamel(values[key].Name)
                    //"path": "/" + bigCamel(values[key].Name),
                    "path": values[key].Name == "BusinessManagement" ? "/BusinessManagement" : (values[key].Name == "/" ? "/" : "/Dynamic/" + values[key].Name.replace(new RegExp(/( )/g), "_")),
                };
            }

        }
        menus[key] = menu;
    })
    Object.keys(menus).forEach(key => {
        if (menus[key].parentId !== undefined) {
            let findIndex = menus.findIndex(item => item.sourceTitle === menus[key].parentId);
            if (findIndex > -1) {
                menus[key].parentId = menus[findIndex].id;
            }

        }
    });
    return menus;
}

/**
 * 表格配置
 * @param dbGridName
 */
export function asyncConfigData(dbGridName) {
    $.ajax({
        type: "POST",
        url: "/api/DbGrid/Config",
        async: false,
        data: {DbGridName: dbGridName, draw: DRAW, Customised: true},
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", "Bearer " + getToken());
        },
        success: function (res) {
            const loginUser = getLoginUser();
            window.sessionStorage.setItem(dbGridName + '-config-' + loginUser?.id, JSON.stringify(res.data));
        }
    })
}

/**
 * 处理表格字段
 * @param columns
 * @returns {{table_colums: *[], search_colums: *[], api_colums: *[]}}
 */
export function handleGridDataTypeColumn(columns, isModalVisible, setIsModalVisible, setSubTableHeader, setSubTable, setModalTitle, setSubTableType, setIsListVisible) {

    let table_colums = [];
    let table_children_colums = [];
    let api_colums = [];
    let search_colums = [];
    let form_colums = [];
    Object.values(columns).forEach(value => {
        if (value.type == 15 || value.type == 16 || value.type == 17 || value.type == 18 || value.type == 19 || value.type == 20 || value.type == 26 || value.type == 27 || value.type == 28) {
            if (value.options == undefined) {
                return;
            }
        }
        if ((value.access & authority.view) > 0) {
            //不显示在表格字段的类型
            if (value.type != 24 && value.type != 25 && value.type != 28) {
                let width = value.type == 1 || value.type == 11 || value.type == 12 ? 100 : 200;

                //封装表格字段集合
                let table_column = {
                    key: value.name,
                    title: <FormattedMessage id={value.header} defaultMessage={value.header}/>,
                    dataIndex: value.name,
                    width: width,
                    align: "center",
                    ellipsis: {
                        showTitle: false,
                    },
                    render: function (text, record, index) {
                        return renderTableColumns(value, text, record, index, isModalVisible, setIsModalVisible, setSubTableHeader, setSubTable, setModalTitle, setSubTableType, setIsListVisible);
                    }
                };
                //设置排序字段
                if (value.type == 11 || value.type == 6 || value.type == 7) {
                    table_column.sorter = true;
                }

                table_colums.push(table_column);
            }
            let api_column = {
                name: value.name,
                searchable: true
            };
            api_colums.push(api_column);
            //page api集合
            if (value.searchable) {
                //封装查询框字段集合
                let search_column = {
                    ...value,
                    label: <FormattedMessage id={value.header} defaultMessage=""/>,
                    text: value.header,
                    name: value.name,
                    type: value.type,

                };
                search_colums.push(search_column);
            }
        }
        //判断是否有创建、修改权限
        if ((value.access & authority.view) > 0 || (value.access & authority.create) > 0 || (value.access & authority.change) > 0) {
            if (value.type != 25) {
                let form_column = {
                    label: <FormattedMessage id={value.header} defaultMessage=""/>,
                    text: value.header,
                    name: value.name,
                    type: parseInt(value.type),
                    form_type: (value.access & authority.view) > 0 ? 1 : ((value.access & authority.create) > 0 ? 2 : 3),//表单权限1查看、2创建;3修改
                    ...value
                };
                if (value.type == 24 && form_column.ColumnConfigs == undefined) {
                    form_column.ColumnConfigs = [];
                }
                form_colums.push(form_column);
            }
        }
    });
    return {
        table_colums: table_colums,
        api_colums: api_colums,
        search_colums: search_colums,
        form_colums: form_colums,
        table_children_colums: table_children_colums,
    };
}

/**
 * 时间转化
 * @param timestamp
 * @returns {string}
 */
export function formatDate(timestamp) {
    if (!timestamp) return;
    let date = new Date(timestamp);
    let formatData = date.getFullYear() +
        "-" + date.getDate() +
        "-" + (date.getMonth() + 1) +
        " " + date.getHours() +
        ":" + date.getMinutes() +
        ":" + date.getSeconds();
    return formatData;
}

/**
 * 动态渲染表格字段
 * @param column
 * @param text
 * @param record
 * @param index
 * @param isModalVisible
 * @param setIsModalVisible
 * @param setSubTableHeader
 * @param setSubTable
 * @param setModalTitle
 * @param setSubTableType
 * @param setIsListVisible
 * @returns {JSX.Element|string|string|*}
 */
export function renderTableColumns(column, text, record, index, isModalVisible, setIsModalVisible, setSubTableHeader, setSubTable, setModalTitle, setSubTableType, setIsListVisible) {
    switch (column.type) {
        case 1: //boolean 类型
            var color = text ? 'green' : 'red';
            return (
                <Tag color={color} key={text}>
                    <FormattedMessage id={text ? "True" : "False"} defaultMessage={text ? "True" : "False"}/>
                </Tag>
            );
            break;
        case 6://日期时间
        case 7://日期
            return formatDate(Date.parse(text));
            break;
        case 21://json子表格
            return (
                <>
                    <Button type="primary" onClick={() => {
                        setSubTableType(1);
                        setIsModalVisible(true);
                        setSubTableHeader(column.subcolumns);
                        setSubTable(text);
                        setModalTitle(<FormattedMessage id={column.header}/>);
                    }}>
                        <FormattedMessage id="ClickView" defaultMessage="ClickView"/>
                    </Button>
                </>
            );
            break;
        case 15:
        case 17:
        case 20:
            var item = (column.options == undefined ? [] : column.options).find((item) => item.value == text);
            const name = item?.name ? item?.name : "";
            return name == "" ? "" : <FormattedMessage id={name}/>
            break;
        case 16:
        case 18:
        case 19:
        case 26://Enum
            var item = (column.options == undefined ? [] : column.options).find((item) => item.value == text);
            return item?.name;
            break;
        case 27://带null  Enum
            var find_item = [{
                value: "null",
                label: getLange(getLoginUser()?.id) == "zh_CN" ? "空" : "Null"
            }].concat(column.options).find((item) => item.value == text);
            return find_item?.name;
            break;
        case 28://字符串列表
            return (
                <>
                    <Button type="primary" onClick={() => {
                        setSubTableType(1);
                        setIsListVisible(true);
                        setSubTableHeader(column.options == undefined ? [] : column.options);
                        setSubTable(text);
                        setModalTitle(<FormattedMessage id={column.header}/>);
                    }}>
                        <FormattedMessage id="ClickView"/>
                    </Button>
                </>
            );
            break;
        default:
            if (text?.length > 20) {
                return (
                    <Tooltip placement="topLeft" title={text}>
                        {text}
                    </Tooltip>
                );
            } else {
                return text;
            }

    }
}

/**
 * 动态处理form字段
 * @param formColums
 * @param isEdit
 * @param isDetail
 * @param layout
 * @param loginUser
 * @param editorState
 * @param filter_type
 * @param style_object
 * @param locale
 * @param field
 * @returns {*}
 */
export function handleFormItem(form, props, treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, formColums, isEdit, isDetail, layout, loginUser, editorState, filter_type = [], style_object = {}, locale, is_style = false, field) {
    {
        formColums.sort((a, b) => {
            var order = [10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 27, 26, 28, 29, 21, 24, 25];
            return order.indexOf(a.type) - order.indexOf(b.type);
        });
        var elementItem = formColums.map((item, index) => {
                const find = filter_type.findIndex((element) => element == item.type)
                if (!(find < 0)) {
                    return;
                }
                if ((!isEdit && !isDetail) && !((item.access & authority.create) > 0)) {
                    return;
                } else if (isEdit && !((item.access & authority.change) > 0)) {
                    return;
                } else if (isDetail && !((item.access & authority.view) > 0)) {
                    return;
                }
                let required = false;
                let rules = [];
                if (item.min != undefined || item.max != undefined) {
                    required = true;
                    rules.push({
                        required: true,
                        message: <FormattedMessage id="RulesRequiredMsg"
                                                   values={{name: item.header}}/>
                    })
                }
                if (item.type == 1) { //boolean 类型
                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="select"
                                required={required}
                                disabled={isDetail}
                                placeholder={item.header}
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                options={[
                                    {value: true, label: <FormattedMessage id="True"/>},
                                    {value: false, label: <FormattedMessage id="False"/>}
                                ]}
                                rules={rules}
                            />
                        </Col>
                    );
                } else if (item.type == 2) { // 整数
                    if (item.min != undefined) {
                        rules.push({
                            validator: (rule, value, callback) => {
                                let minPrice = item.min;
                                if (value < minPrice) {
                                    callback(<FormattedMessage id="RulesNumberMinMsg"
                                                               values={{
                                                                   name: item.header,
                                                                   num: item.min
                                                               }}/>);
                                } else {
                                    callback();
                                }
                            },
                        },)
                    }
                    if (item.max != undefined) {
                        rules.push({
                            validator: (rule, value, callback) => {
                                let maxPrice = item.max;
                                if (value > maxPrice) {
                                    callback(<FormattedMessage id="RulesNumberMaxMsg"
                                                               values={{
                                                                   name: item.header,
                                                                   num: item.max
                                                               }}/>);
                                } else {
                                    callback();
                                }
                            },
                        })
                    }
                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="number"
                                required={required}
                                disabled={isDetail}
                                stringMode
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                placeholder={item.header}
                                rules={rules}
                            />
                        </Col>
                    );
                } else if (item.type == 4) { //浮点
                    if (item.min != undefined) {
                        rules.push({
                            validator: (rule, value, callback) => {
                                let minPrice = item.min;
                                if (value < minPrice) {
                                    callback(<FormattedMessage id="RulesNumberMinMsg"
                                                               values={{
                                                                   name: item.header,
                                                                   num: item.min
                                                               }}/>);
                                } else {
                                    callback();
                                }
                            },
                        },)
                    }
                    if (item.max != undefined) {
                        rules.push({
                            validator: (rule, value, callback) => {
                                let maxPrice = item.max;
                                if (value > maxPrice) {
                                    callback(<FormattedMessage id="RulesNumberMaxMsg"
                                                               values={{
                                                                   name: item.header,
                                                                   num: item.max
                                                               }}/>);
                                } else {
                                    callback();
                                }
                            },
                        })
                    }
                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="number"
                                required={required}
                                disabled={isDetail}
                                stringMode
                                step="0.1"
                                style={is_style ? {width: '11rem'} : {width: "13rem"}}
                                placeholder={item.header}
                                rules={rules}
                            />
                        </Col>
                    );
                } else if (item.type == 5) { //邮箱
                    if (item.min != undefined) {
                        rules.push({
                            min: item.min,
                            message: <FormattedMessage id="RulesMinMsg" values={{
                                name: item.header,
                                num: item.min
                            }}/>
                        })
                    }
                    if (item.max != undefined) {
                        rules.push({
                            max: item.max,
                            message: <FormattedMessage id="RulesMaxMsg" values={{
                                name: item.header,
                                num: item.max
                            }}/>
                        })
                    }
                    rules.push({
                        pattern: new RegExp(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, "g"),
                        message: <FormattedMessage id="RulesEmailMsg"/>
                    })
                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="email"
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                required={required}
                                disabled={isDetail}
                                placeholder={item.header}
                                rules={rules}

                            />
                        </Col>
                    );
                } else if (item.type == 6) { //日期时间
                    var disabledRangeDate;
                    if (item.min != undefined || item.max != undefined) {
                        disabledRangeDate = current => {
                            const begin = current < moment().subtract((parseInt(item.min) + 1), 'day');
                            const end = current > moment().add(item.max, 'd');
                            return begin || end
                        }
                    }
                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="date"
                                required={required}
                                disabled={isDetail}
                                showTime
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                dateFormat={"YYYY-MM-DD HH:mm:ss"}
                                placeholder={item.header}
                                rules={rules}
                                disabledDate={disabledRangeDate}
                            />
                        </Col>
                    );
                } else if (item.type == 7) {//日期
                    var disabledRangeDate;
                    if (item.min != undefined || item.max != undefined) {
                        disabledRangeDate = current => {
                            const begin = current < moment().subtract((parseInt(item.min) + 1), 'day');
                            const end = current > moment().add(item.max, 'd');
                            return begin || end
                        }
                    }
                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="date"
                                required={required}
                                disabled={isDetail}
                                dateFormat={"YYYY-MM-DD HH:mm:ss"}
                                placeholder={item.header}
                                rules={rules}
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                disabledDate={disabledRangeDate}
                            />
                        </Col>
                    );
                } else if (item.type == 9) { //文本
                    return (
                        <Col span={is_style ? 24 : 4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                width={"100%"}
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="textarea"
                                required={required}
                                disabled={isDetail}
                                maxLength={250}
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                placeholder={item.header}
                                rules={rules}
                            />
                        </Col>
                    );
                } else if (item.type == 14) { //富文本
                    return (
                        <FormItem {...layout}
                                  label={item.label}
                                  name={item.name}>
                            <BraftEditor value={editorState}/>
                        </FormItem>
                    );
                } else if (item.type == 15 || item.type == 17 || item.type == 20) { //Enum 要翻译

                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="select"
                                required={required}
                                disabled={isDetail}
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                placeholder={item.header}
                                options={item.options.map(item => {
                                    return {
                                        value: parseFloat(item.value).toString() == "NaN" ? item.value : parseInt(item.value),
                                        label: <FormattedMessage id={item.name}/>
                                    }
                                })}
                                rules={rules}
                            />
                        </Col>
                    );
                } else if (item.type == 23) { //密码
                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                required={required}
                                disabled={isDetail}
                                noSpace
                                type="password"
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                placeholder={item.header}
                                rules={rules}
                            />
                        </Col>
                    )
                } else if (item.type == 16 || item.type == 18 || item.type == 19 || item.type == 26) { //Enum
                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="select"
                                required={required}
                                disabled={isDetail}
                                placeholder={item.header}
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                options={item.options.map(item => {
                                    return {
                                        value: parseFloat(item.value).toString() == "NaN" ? item.value : parseInt(item.value),
                                        label: item.name
                                    }
                                })}
                                rules={rules}
                            />
                        </Col>
                    );
                } else if (item.type == 21) { //json子表格
                    let formartColumns = [];
                    item.subcolumns.map(subItem => {
                        if ((!isEdit && !isDetail) && !((subItem.access & authority.create) > 0)) {
                            return;
                        } else if (isEdit && !((subItem.access & authority.change) > 0)) {
                            return;
                        } else if (isDetail && !((subItem.access & authority.view) > 0)) {
                            return;
                        }
                        formartColumns.push(subItem);
                    });
                    if (!is_style) {
                        return (
                            <Card
                                title={<><span style={{color: "#1890ff", fontSize: 18}}><BarsOutlined/> </span>
                                    <FormattedMessage
                                        id={item.header}/></>}
                                bodyStyle={{padding: 10}} style={{marginTop: 10}}
                            >
                                <Form.List name={field != undefined ? [field?.name, item.name] : item.name}>
                                    {(fields, {add, remove}) => (
                                        <>
                                            <Content style={{overflowY: 'auto', marginBottom: 10}}>
                                                <Space
                                                    style={{
                                                        display: 'flex',
                                                        marginBottom: 12,
                                                        paddingBottom: "5",
                                                        textAlign: "center",
                                                        lineHeight: 3,
                                                        fontWeight: "bold"
                                                    }}
                                                    direction="horizontal"
                                                >
                                                    {formartColumns.map(sub => (
                                                        <div style={{width: '11rem',}}><FormattedMessage id={sub.header}/>
                                                        </div>
                                                    ))}
                                                </Space>
                                                {console.log(item.ColumnConfigs)}
                                                {fields.map((subfield) => (
                                                    <Space
                                                        key={subfield.key}
                                                        style={{
                                                            display: 'flex',
                                                            paddingBottom: "5"
                                                        }}
                                                        direction="horizontal"
                                                    >
                                                        {handleFormItem(form, props, treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, item.subcolumns, isEdit, isDetail, layout, loginUser, editorState, [], style_object, locale, true, subfield)}
                                                        {!isDetail ? <Button type="primary" size="small" style={{
                                                                background: "#FF6060",
                                                                borderColor: '#FF6060',
                                                                marginBottom: 24,
                                                            }} onClick={() => remove(subfield.name)}><FormattedMessage
                                                                id="Delete"/></Button>
                                                            : null}

                                                    </Space>
                                                ))}
                                            </Content>
                                            <Form.Item>

                                                <Button type="dashed" onClick={() => add()}
                                                        disabled={isDetail}
                                                        block icon={<PlusOutlined/>}>
                                                    <FormattedMessage id="Create"/>
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Card>
                        );
                    } else {
                        return (
                            <Card
                                title={<><span
                                    style={{color: "#1890ff", fontSize: 18}}><BarsOutlined/> </span><FormattedMessage
                                    id={item.header}/></>}
                                bodyStyle={{padding: 10}} style={{marginTop: 10}}>
                                <Form.List name={field != undefined ? [field?.name, item.name] : item.name}>
                                    {(fields, {add, remove}) => (
                                        <>
                                            {fields.map((subfield) => (
                                                <Space
                                                    key={subfield.key}
                                                    style={{
                                                        display: 'flex',
                                                        marginBottom: 8,
                                                    }}
                                                    align="baseline"
                                                >

                                                    {handleFormItem(form, props, treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, item.subcolumns, isEdit, isDetail, layout, loginUser, editorState, [], style_object, locale, true, subfield)}
                                                    {!isDetail ? <Button type="primary" size="small" style={{
                                                            background: "#FF6060",
                                                            borderColor: '#FF6060',
                                                            marginBottom: 24,
                                                        }} onClick={() => remove(subfield.name)}><FormattedMessage
                                                            id="Delete"/></Button>
                                                        : null}
                                                </Space>
                                            ))}
                                            <Form.Item>
                                                <Button type="dashed" onClick={() => add()}
                                                        disabled={isDetail}
                                                        block icon={<PlusOutlined/>}>
                                                    <FormattedMessage id="Create"/>
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Card>
                        );
                    }
                } else if (item.type == 24) { //关联字段
                    let formartColumns = [];
                    item.ColumnConfigs.sort((a, b) => {
                        var order = [10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 27, 26, 28, 29, 21, 24, 25];
                        return order.indexOf(a.type) - order.indexOf(b.type);
                    });
                    item.ColumnConfigs.map(subItem => {
                        if ((!isEdit && !isDetail) && !((subItem.access & authority.create) > 0)) {
                            return;
                        } else if (isEdit && !((subItem.access & authority.change) > 0)) {
                            return;
                        } else if (isDetail && !((subItem.access & authority.view) > 0)) {
                            return;
                        }
                        formartColumns.push(subItem);
                    });
                    if (!is_style) {
                        return (
                            <Card
                                title={<><span style={{color: "#1890ff", fontSize: 18}}><BarsOutlined/> </span>
                                    <FormattedMessage
                                        id={item.header}/></>}
                                bodyStyle={{padding: 10}} style={{marginTop: 10}}
                            >
                                <Form.List name={field != undefined ? [field?.name, item.name] : item.name}>
                                    {(fields, {add, remove}) => (
                                        <>
                                            <Content style={{overflowY: 'auto', marginBottom: 10}}>
                                                <Space
                                                    style={{
                                                        display: 'flex',
                                                        marginBottom: 12,
                                                        paddingBottom: "5",
                                                        textAlign: "center",
                                                        lineHeight: 3,
                                                        fontWeight: "bold"
                                                    }}
                                                    direction="horizontal"
                                                >
                                                    {formartColumns.map(sub => (
                                                        <div style={{width: '11rem',}}><FormattedMessage id={sub.header}/>
                                                        </div>
                                                    ))}
                                                </Space>
                                                {console.log(item.ColumnConfigs)}
                                                {fields.map((subfield) => (
                                                    <Space
                                                        key={subfield.key}
                                                        style={{
                                                            display: 'flex',
                                                            paddingBottom: "5"
                                                        }}
                                                        direction="horizontal"
                                                    >
                                                        {handleFormItem(form, props, treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, item.ColumnConfigs, isEdit, isDetail, layout, loginUser, editorState, [], style_object, locale, true, subfield)}
                                                        {!isDetail ? <Button type="primary" size="small" style={{
                                                                background: "#FF6060",
                                                                borderColor: '#FF6060',
                                                                marginBottom: 24,
                                                            }} onClick={() => remove(subfield.name)}><FormattedMessage
                                                                id="Delete"/></Button>
                                                            : null}

                                                    </Space>
                                                ))}
                                            </Content>
                                            <Form.Item>

                                                <Button type="dashed" onClick={() => add()}
                                                        disabled={isDetail ? true : (item.related_type == 1 ? (fields.length > 1 ? true : false) : false)}
                                                        block icon={<PlusOutlined/>}>
                                                    <FormattedMessage id="Create"/>
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Card>
                        );
                    } else { //子表格里的字段
                        return (
                            <Card
                                title={<><span style={{color: "#1890ff", fontSize: 18}}><BarsOutlined/></span>
                                    <FormattedMessage
                                        id={item.header}/></>}
                                bodyStyle={{padding: 10}} style={{marginTop: 10}}
                            >
                                <Form.List name={field != undefined ? [field?.name, item.name] : item.name}>
                                    {(fields, {add, remove}) => (
                                        <>
                                            {fields.map((subfield) => (
                                                <Space
                                                    key={subfield.key}
                                                    wrap
                                                    style={{
                                                        display: 'flex',
                                                        marginBottom: 8,
                                                    }}
                                                    direction="horizontal"
                                                >
                                                    {handleFormItem(form, props, treeData, setTreeData, setRefreshLoad, setUploadItemName, setIsModalVisible, setFileType, setModalTitle, formViewUploadData, setFormViewUploadData, setViewFilePath, setViewFile, viewFilePath, item.ColumnConfigs, isEdit, isDetail, layout, loginUser, editorState, [], style_object, locale, true, subfield)}
                                                    {!isDetail ? <Button type="primary" size="small" style={{
                                                            background: "#FF6060",
                                                            borderColor: '#FF6060',
                                                            marginBottom: 24,
                                                        }} onClick={() => remove(subfield.name)}><FormattedMessage
                                                            id="Delete"/></Button>
                                                        : null}

                                                </Space>
                                            ))}
                                            <Form.Item>

                                                <Button type="dashed" onClick={() => add()}
                                                        disabled={isDetail ? true : (item.related_type == 1 ? (fields.length > 1 ? true : false) : false)}
                                                        block icon={<PlusOutlined/>}>
                                                    <FormattedMessage id="Create"/>
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Card>
                        );
                    }

                } else if (item.type == 27) { //带null的Enum
                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                type="select"
                                required={required}
                                disabled={isDetail}
                                placeholder={item.header}
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                options={[{
                                    value: "null",
                                    label: getLange(loginUser?.id) == "zh_CN" ? "空" : "Null"
                                }].concat(item.options.map(item => {
                                    return {value: item.value, label: item.name}
                                }))}
                                rules={rules}
                            />
                        </Col>
                    );
                } else if (item.type == 28) { //字符串列表
                    return (
                        <Card title={<>{required ? <span style={{color: "#ff4d4f"}}>*</span> :
                            <span style={{color: "#1890ff", fontSize: 18}}><BarsOutlined/></span>} <FormattedMessage
                            id={item.header}/></>}
                              bodyStyle={{padding: 0}} style={{marginTop: 10}}>
                            <FormItem shouldUpdate noStyle>
                                {({getFieldValue}) => {
                                    const systemId = getFieldValue('systemId');
                                    return (
                                        <FormItem {...layout} name={item.name}>
                                            <SelectTable
                                                topId={WITH_SYSTEMS ? systemId : undefined}
                                                fitHeight={style_object?.fitHeight}
                                                otherHeight={style_object?.otherHeight}
                                                locale={locale}
                                                loginUser={loginUser}
                                                isDetail={isDetail}
                                                options={item.options}
                                            />
                                        </FormItem>
                                    );
                                }}
                            </FormItem>
                        </Card>
                    )
                } else if (item.type == 29) { //文件管理器
                    var fileType;
                    var filePaths = [];
                    var viewFilePath = [];
                    if (!isEdit && !isDetail) { //如果是添加
                        filePaths = (formViewUploadData?.WithChildrenAttachments).filter(v => (v.IsDirectory == false));
                        fileType = 1;
                    } else if (isEdit) {//如果是编辑
                        fileType = 3;
                        if (formViewUploadData?.WithChildrenAttachments.length > 0) {
                            var loadFilePaths = formViewUploadData?.WithChildrenAttachments;
                        } else {
                            var loadFilePaths = form.getFieldValue(item.name) ? form.getFieldValue(item.name)?.WithChildrenAttachments || [] : [];
                        }
                        filePaths = loadFilePaths.filter(v => (v.IsDirectory == false));
                    } else if (isDetail) { // 如果是查看
                        fileType = 2;
                        var loadFilePaths = form.getFieldValue(item.name) ? form.getFieldValue(item.name)?.WithChildrenAttachments || [] : [];
                        filePaths = loadFilePaths.filter(v => (v.IsDirectory == false));
                        loadFilePaths.map((item, k) => {
                            item.key = item.Id;
                            item.title = item.FileName;
                            item.icon = item.IsDirectory ? <FolderOpenOutlined/> : <FileOutlined/>;
                            item.IsDirectory = item.IsDirectory;
                            item.FolderName = item.FolderName;
                            item.isLeaf = !item.IsDirectory;
                        });
                        treeData.concat(loadFilePaths);
                        var updateTreeData = (list, key, children) =>
                            list.map((node) => {
                                if (node.key == key) {
                                    return {...node, children};
                                }

                                if (node.children) {
                                    return {...node, children: updateTreeData(node.children, key, children)};
                                }
                                return node;
                            });

                    }
                    if (is_style) { //如果是子表格中的字段
                        return (
                            <>
                                <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                                    <FormItem {...layout}
                                              label={item.label}
                                    >
                                        <Button type="primary" onClick={() => {
                                            setUploadItemName(item.name);
                                            setFileType(fileType);
                                            setIsModalVisible(true);
                                            if (fileType == 3) {
                                                setRefreshLoad(false);
                                            }
                                            setModalTitle(<FormattedMessage id={item.header}/>);
                                        }} disabled={isDetail}>
                                            <FormattedMessage id="ClickFileView"/>
                                        </Button>
                                        <List
                                            size="small"
                                            header={<div><FormattedMessage id="AttachmentList"/></div>}
                                            bordered
                                            dataSource={filePaths}
                                            renderItem={(item) => <List.Item><PaperClipOutlined
                                                style={{paddingRight: "15px"}}/>{item?.FolderName || ''}{item.FileName}
                                            </List.Item>}
                                            style={{display: filePaths.length > 0 ? "block" : "none", marginTop: "20px"}}
                                        />
                                    </FormItem>
                                    <FormItem name={item.name} hidden></FormItem>
                                    <FormItem name="Files" hidden></FormItem>
                                </Col>
                            </>
                        );
                    } else {
                        return (
                            <>
                                <Card title={<><span style={{color: "#1890ff", fontSize: 18}}><PaperClipOutlined/> </span>
                                    <FormattedMessage id={item.header}/></>}
                                      style={{marginTop: 10}} extra={
                                    <Button type="primary" onClick={() => {
                                        setUploadItemName(item.name);
                                        setFileType(fileType);
                                        setIsModalVisible(true);
                                        if (fileType == 3) {
                                            setRefreshLoad(false);
                                        }
                                        setModalTitle(<FormattedMessage id={item.header}/>);
                                    }} disabled={isDetail}>
                                        <FormattedMessage id="ClickFileView"/>
                                    </Button>
                                }>
                                    {fileType == 1 || fileType == 3 ?
                                        <>
                                            <FormItem {...layout}>
                                                <List
                                                    size="small"
                                                    header={<div><FormattedMessage id="AttachmentList"/></div>}
                                                    bordered
                                                    dataSource={filePaths}
                                                    renderItem={(item) => <List.Item><PaperClipOutlined
                                                        style={{paddingRight: "15px"}}/>{item?.FolderName || ''}{item.FileName}
                                                    </List.Item>}
                                                    style={{
                                                        display: filePaths.length > 0 ? "block" : "none",
                                                        marginTop: "20px"
                                                    }}
                                                />
                                            </FormItem>
                                            <FormItem name={item.name} hidden></FormItem>
                                            <FormItem name="Files" hidden></FormItem>
                                        </> : (loadFilePaths.length > 0 ? <>
                                            <FormItem {...layout} name={item.name}>
                                                <DirectoryTree
                                                    selectedKeys={[]}
                                                    treeData={treeData.length > 0 ? treeData : loadFilePaths}
                                                    loadData={async (treeNode) => {
                                                        console.log(treeNode);
                                                        if (treeNode.IsDirectory) {
                                                            const res = await props.ajax.post('DbGrid/Attachments', convertToFormData({
                                                                DbGridName: props.dbGridName,
                                                                Id: form.getFieldValue("Id"),
                                                                draw: DRAW,
                                                                FolderName: treeNode.FolderName + treeNode.FileName + "/"
                                                            }), {
                                                                errorModal: {
                                                                    okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"),
                                                                    width: "70%"
                                                                },
                                                            })
                                                            const children = res.WithChildrenAttachments || [];
                                                            children.map(item => {
                                                                item.key = item.Id;
                                                                item.title = item.FileName;
                                                                item.icon = item.IsDirectory ? <FolderOpenOutlined/> :
                                                                    <FileOutlined/>;
                                                                item.isLeaf = !item.IsDirectory;
                                                            })
                                                            if (children.length > 0) {
                                                                var t = updateTreeData(loadFilePaths, treeNode.key, children);
                                                                console.log(t);
                                                                setTreeData(t);
                                                            }
                                                        }
                                                    }}
                                                    onSelect={async (selectedKeys, info,) => {
                                                        console.log(info.node);
                                                        if (info.node.IsDirectory) return;
                                                        const res = await props.ajax.post('DbGrid/DownloadAttachment', convertToFormData({
                                                            DbGridName: props.dbGridName,
                                                            Id: form.getFieldValue("Id"),
                                                            draw: DRAW,
                                                            FolderName: info.node.FolderName,
                                                            FileName: info.node.FileName
                                                        }), {
                                                            responseType: "blob",
                                                            errorModal: {
                                                                okText: (getLange(props.loginUser?.id) == "zh_CN" ? "取消" : "Cancel"),
                                                                width: "70%"
                                                            },
                                                        });
                                                        let blob = new Blob([res]);
                                                        if (typeof window.navigator.msSaveBlob !== "undefined") {
                                                            // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
                                                            window.navigator.msSaveBlob(blob, decodeURI(info.node.FileName));
                                                        } else {
                                                            // 创建新的URL并指向File对象或者Blob对象的地址
                                                            const blobURL = window.URL.createObjectURL(blob);
                                                            // 创建a标签，用于跳转至下载链接
                                                            const tempLink = document.createElement("a");
                                                            tempLink.style.display = "none";
                                                            tempLink.href = blobURL;
                                                            tempLink.setAttribute("download", decodeURI(info.node.FileName));
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
                                                    }}
                                                />
                                            </FormItem>
                                        </> : null)}

                                </Card>
                            </>
                        );
                    }

                } else {
                    if (item.min != undefined) {
                        rules.push({
                            min: item.min,
                            message: <FormattedMessage id="RulesMinMsg" values={{
                                name: item.header,
                                num: item.min
                            }}/>
                        })
                    }
                    if (item.max != undefined) {
                        rules.push({
                            max: item.max,
                            message: <FormattedMessage id="RulesMaxMsg" values={{
                                name: item.header,
                                num: item.max
                            }}/>
                        })
                    }

                    return (
                        <Col span={4} style={!is_style ? {marginRight: "2rem"} : {}}>
                            <FormItem
                                {...layout}
                                label={item.label}
                                name={field != undefined ? [field?.name, item.name] : item.name}
                                fieldKey={field != undefined ? [field?.fieldKey, item.name] : item.name}
                                required={required}
                                disabled={isDetail}
                                placeholder={item.header}
                                style={is_style ? {width: '11rem'} : {width: '13rem'}}
                                rules={rules}
                            />
                        </Col>
                    )

                }
            }
        )
    }
    return elementItem;
}

/**
 * 判断是否是json字符串
 * @param str
 * @returns
    {
                    boolean
                }
 */
export function isJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
}

export function parseJson(jsonObj) {

    // 循环所有键
    for (var key in jsonObj) {
        //如果对象类型为object类型且数组长度大于0 或者 是对象 ，继续递归解析
        var element = jsonObj[key];
        if (typeof (element) == "object" || typeof (element) == "object") {
            parseJson(element);
        } else { //不是对象或数组、直接输出
            //console.log("----eles -->  " + key + ":" + element + " ");
            if (isJSON(element)) {
                element = JSON.parse(element);
            }
            jsonObj[key] = element;
        }

    }
    return jsonObj;
}

export function GetDateNow() {
    // 时间戳
    var time = new Date();
    // 年
    var year = String(time.getFullYear());
    // 月
    var mouth = String(time.getMonth() + 1);
    // 日
    var day = String(time.getDate());
    // 时
    var hours = String(time.getHours());
    if (hours.length < 2) {
        hours = '0' + hours
    }
    // 分
    var minutes = String(time.getMinutes());
    if (minutes.length < 2) {
        minutes = '0' + minutes
    }
    // 秒
    var seconds = String(time.getSeconds());
    if (seconds.length < 2) {
        seconds = '0' + seconds
    }
    var str = year + mouth + day + hours + minutes + seconds
    return str
}

export function formatPrice(price) {
    return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}