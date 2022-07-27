import theme from 'src/theme.less';
import {DownOutlined, BlockOutlined,SwapOutlined} from '@ant-design/icons';
import {Dropdown, Menu} from 'antd';
import {useState} from 'react';
import {getLange, setLange} from "../../commons";
import {getLoginUser} from "@ra-lib/admin";
import {convertToFormData} from "../../commons/common";
import {usePost} from "../../commons/ajax";

export default function Lanage(props) {

    const {className} = props;
    const loginUser = getLoginUser();
    const [selectedKeys, setSelectedKeys] = useState([getLange(loginUser?.id)]);
    const LanageConfig = [{name: "中文", key: "zh_CN"}, {name: "English", key: "en_US"}];
    const {run} = usePost("/Setting/ChangeLanguage");
    const serverMenu = (
        <Menu selectedKeys={selectedKeys}>
            {LanageConfig
                .map((item) => {
                    const {key, name} = item;
                    return (
                        <Menu.Item
                            key={key}
                            icon={<BlockOutlined/>}
                            onClick={() => {
                                setSelectedKeys([key]);
                                setLange(loginUser?.id, key);
                                run(convertToFormData(
                                    {language: key == "zh_CN" ? "zh-Hans" : "en"}
                                )).then((res)=>{
                                    if(res==true){
                                        window.location.reload();
                                    }
                                });
                            }}
                        >
                            {name}
                        </Menu.Item>
                    );
                })}
        </Menu>
    );

    return (
        <Dropdown overlay={serverMenu}>
            <div className={className} style={{width: 130}}>
                <div
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                       // border: '1px solid ' + theme.primaryColor,
                        color: theme.primaryColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <SwapOutlined />
                </div>

                <span style={{marginLeft: 4, marginRight: 4}}>
                    <span style={{color: theme.primaryColor}}>
                        {LanageConfig.find((item) => selectedKeys?.includes(item.key))?.name}
                    </span>
                </span>

                <DownOutlined/>
            </div>
        </Dropdown>
    );
}
