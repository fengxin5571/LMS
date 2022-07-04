import React, {useEffect, useState} from 'react';
import config from 'src/commons/config-hoc';
import {ModalContent} from '@ra-lib/admin';
import {Card, List} from 'antd';
import {CheckCircleOutlined} from '@ant-design/icons';
export default config({
    modal: {
        title: '弹框标题',
        width: '70%',
    },
})(props => {
    const {onOk, onCancel, subTableHeader, subTable, subTableType} = props;
    const [columns, setColumns] = useState([]);
    const [dataSource, setDataSource] = useState([])
    useEffect(async () => {
        let columns = [];
        let dataSource = [];
        if (subTableType == 1) {//
            let data = [
                {
                    title: 'Title 1',
                },
                {
                    title: 'Title 2',
                },
                {
                    title: 'Title 3',
                },
                {
                    title: 'Title 4',
                },
                {
                    title: 'Title 5',
                },
                {
                    title: 'Title 6',
                },
                {
                    title: 'Title 6',
                },
                {
                    title: 'Title 6',
                },
            ];
            setDataSource(data);
        }

    }, []);
    console.log(dataSource);
    return (

        <ModalContent
            onOk={onOk}
            onCancel={onCancel}
            footer={true}
        >
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 4,
                    lg: 4,
                    xl: 6,
                    xxl: 3,
                }}
                dataSource={dataSource}
                renderItem={(item) => (
                    <List.Item>
                        <Card title={item.title}><span ><CheckCircleOutlined style={{width:"6rem",fontSize:"2rem",color: '#389e0d'}}/></span></Card>
                    </List.Item>
                )}
            />
        </ModalContent>


    );
});