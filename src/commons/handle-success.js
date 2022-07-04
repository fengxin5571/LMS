import {notification, Modal} from 'antd';
import {getLange} from "./index";
import {getLoginUser} from "@ra-lib/admin";

const lang = getLange(getLoginUser()?.id);
const TIP_TITLE = lang == "zh_CN" ? '温馨提示' : "Kind tips";
const TIP = lang == "zh_CN" ? '成功' : "Success";

export default function handleSuccess({tip, options = {}}) {
    const {successModal} = options;

    if (!tip && !successModal) return;

    // 避免卡顿
    setTimeout(() => {
        // 弹框方式显示提示
        if (successModal) {
            // 详细配置
            if (typeof successModal === 'object') {
                return Modal.success({
                    title: TIP_TITLE,
                    content: tip,
                    ...successModal,
                });
            }

            return Modal.success({
                title: TIP_TITLE,
                content: successModal,
            });
        }

        notification.success({
            message: TIP,
            description: tip,
            duration: 2,
        });
    });
}
