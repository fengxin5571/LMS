import {notification, Modal, List, Typography} from 'antd';
import {getLange, toLogin} from './index';
import {getLoginUser} from "@ra-lib/admin";
import {formatDate} from "./common";

const lang = getLange(getLoginUser()?.id);
const ERROR_SERVER = lang == "zh_CN" ? '系统开小差了，请稍后再试或联系管理员！' : 'The system has deserted, please try again later or contact the administrator';
const ERROR_NOT_FOUND = lang == "zh_CN" ? '您访问的资源不存在！' : 'The resource you are accessing does not exist';
const ERROR_FORBIDDEN = lang == "zh_CN" ? '您无权访问！' : 'You do not have access';
const ERROR_UNKNOWN = lang == "zh_CN" ? '未知错误' : 'Unknown mistake';
const TIP_TITLE = lang == "zh_CN" ? '温馨提示' : 'Kind tips';
const TIP = lang == "zh_CN" ? '失败' : 'Fail';

function getErrorTip(error, tip, options) {

    if (tip && tip !== true) return tip;
    // http 状态码相关
    if (error?.response) {
        const {status} = error.response;
        //if (status === 401) return toLogin();
        if (status === 403) return ERROR_FORBIDDEN;
        //if (status === 404) return ERROR_NOT_FOUND;
        //if (status >= 500) return ERROR_SERVER;
    }

    // 后端自定义信息
    const data = error?.response?.data || error;
    const {errorModal} = options;
    const errorJson = JSON.parse(window.sessionStorage.getItem("error-json-" + getLoginUser()?.id) ? window.sessionStorage.getItem("error-json-" + getLoginUser()?.id) : []);
    if (errorModal) {
        let errorResponse = errorJson.ErrorCodes.find(c => c.Name == data.ErrorCode);
        let errorData = [
            {
                lable: lang == "zh_CN" ? '信息' : 'Msg',
                text: errorResponse != undefined ? errorResponse.Value : ERROR_UNKNOWN + "   " + data.SecondLine
            },
            {lable: lang == "zh_CN" ? '错误文件' : 'FileName', text: data.FileName},
            {lable: lang == "zh_CN" ? '错误行数' : 'LineNumber', text: data.LineNumber},
        ]
        return <List
            dataSource={errorData}
            renderItem={(item) => (
                <List.Item>
                    <Typography.Text mark>[{item.lable}]</Typography.Text> {item.text}
                </List.Item>
            )}
        />

    } else {
        if (errorJson) {
            let errorResponse = errorJson.ErrorCodes.find(c => c.Name == data.ErrorCode);
            if (errorResponse != undefined) {
                let content = <span>{errorResponse.Value}</span>;
                return content;
            }

        }
    }

    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.msg) return data.msg;
    return ERROR_UNKNOWN;
}

export default function handleError({error, tip, options = {}}) {
    const description = getErrorTip(error, tip, options);
    const {errorModal} = options;
    if (!description && !errorModal) return;
    const data = error?.response?.data || error;
    // 避免卡顿
    setTimeout(() => {
        // 弹框提示
        if (errorModal) {
            // 详细配置
            if (typeof errorModal === 'object') {
                return Modal.error({
                    title: TIP_TITLE + " " + (data?.EventTime ? formatDate(Date.parse(data?.EventTime)) : ''),
                    content: description,
                    ...errorModal,
                });
            }

            return Modal.error({
                title: TIP_TITLE,
                content: description,
            });
        }

        // 右上角滑出提示
        notification.error({
            message: TIP,
            description,
            duration: 2,
        });
    });
}
